import { pointAlong } from "@/lib/auth/point-along";
import { TIME_MS } from "@/lib/constants";
import { HUBS } from "@/lib/data/home/hubs";
import { MOCK_FACILITIES } from "@/lib/data/mocks/facilities";
import { MOCK_FREIGHT } from "@/lib/data/mocks/loads";
import { MOCK_TOWNS } from "@/lib/data/mocks/towns";
import { TRACE_STATUSES, TRACKING } from "@/lib/loads/constants";
import { roadRoute } from "@/lib/mocks/road-route";
import type { EtaDto, PositionDto } from "@/lib/contract/schemas";
import type { LonLat, MockLoad, MockTrackSpec } from "@/lib/types";
import { cumulativeMiles, headingFrom, milesApart } from "@/lib/utils/geo";

interface Course {
    path: LonLat[];
    miles: number[];
    stopMiles: number[];
}

const REPORT_MS = MOCK_FREIGHT.reportEveryMinutes * TIME_MS.minute;
const HEADING_LOOKAHEAD_MILES = 1;
const courses = new Map<string, Course>();

const placeOf = (facility: string): LonLat => [MOCK_FACILITIES[facility].longitude, MOCK_FACILITIES[facility].latitude];

const timeOf = (iso: string | null) => (iso ? Date.parse(iso) : null);

const courseOf = (load: MockLoad): Course => {
    const known = courses.get(load.id);
    if (known) return known;

    const legs = load.stops.slice(1).map((stop, index) => roadRoute(placeOf(load.stops[index].facility), placeOf(stop.facility)));
    const path = legs.flatMap((leg, index) => (index === 0 ? leg : leg.slice(1)));
    const stopMiles = legs.reduce((totals, leg) => [...totals, totals[totals.length - 1] + (cumulativeMiles(leg).at(-1) ?? 0)], [0]);
    const course = { path, miles: cumulativeMiles(path), stopMiles };
    courses.set(load.id, course);
    return course;
};

const progressAt = (load: MockLoad, { mph }: MockTrackSpec, { stopMiles }: Course, moment: number) =>
    load.stops.reduce(
        (done, stop, index) => {
            const arrived = timeOf(stop.arrivedAt);
            const departed = timeOf(stop.departedAt);
            if (departed !== null && departed <= moment) {
                const leg = (stopMiles[index + 1] ?? stopMiles[index]) - stopMiles[index];
                const driven = (mph * (moment - departed)) / TIME_MS.hour;
                return { miles: stopMiles[index] + Math.min(driven, leg * MOCK_FREIGHT.progressCap), moving: true };
            }
            return arrived !== null && arrived <= moment ? { miles: stopMiles[index], moving: false } : done;
        },
        { miles: 0, moving: false },
    );

const PLACES = [...HUBS, ...MOCK_TOWNS];

const nearestCity = (point: LonLat) =>
    PLACES.reduce((best, place) => (milesApart([place.lon, place.lat], point) < milesApart([best.lon, best.lat], point) ? place : best)).name;

const reportedAt = ({ silentMinutes }: MockTrackSpec, now: number) =>
    silentMinutes ? now - silentMinutes * TIME_MS.minute : Math.floor(now / REPORT_MS) * REPORT_MS;

const tracked = (load: MockLoad): load is MockLoad & { track: MockTrackSpec } =>
    load.track !== null && TRACE_STATUSES.includes(load.status) && load.stops[0].arrivedAt !== null;

const positionAt = (load: MockLoad, track: MockTrackSpec, moment: number): PositionDto => {
    const course = courseOf(load);
    const { miles, moving } = progressAt(load, track, course, moment);
    const total = course.miles[course.miles.length - 1];
    const point = pointAlong(course.path, course.miles, miles);
    const ahead = pointAlong(course.path, course.miles, Math.min(miles + HEADING_LOOKAHEAD_MILES, total));
    return {
        latitude: point[1],
        longitude: point[0],
        heading: headingFrom(point, ahead),
        speedMph: moving ? track.mph : 0,
        city: nearestCity(point),
        source: track.source,
        recordedAt: new Date(moment).toISOString(),
    };
};

export const latestPosition = (load: MockLoad, now: number): PositionDto | null =>
    tracked(load) ? positionAt(load, load.track, reportedAt(load.track, now)) : null;

export const trackOf = (load: MockLoad, now: number): PositionDto[] => {
    if (!tracked(load)) return [];
    const last = reportedAt(load.track, now);
    const since = Math.max(now - TRACKING.windowHours * TIME_MS.hour, timeOf(load.stops[0].arrivedAt) ?? last);
    const moments: number[] = [];
    for (let moment = last; moment >= since; moment -= REPORT_MS) moments.unshift(moment);
    return moments.map((moment) => positionAt(load, load.track, moment));
};

export const etaOf = (load: MockLoad, now: number): EtaDto | null => {
    const next = load.stops.findIndex((stop) => stop.arrivedAt === null);
    if (!tracked(load) || next <= 0) return null;

    const course = courseOf(load);
    const last = reportedAt(load.track, now);
    const { miles, moving } = progressAt(load, load.track, course, last);
    const from = moving ? last : now;
    const at = from + ((course.stopMiles[next] - miles) / load.track.mph) * TIME_MS.hour;
    return {
        at: new Date(at).toISOString(),
        confidence: load.track.confidence,
        late: at > Date.parse(load.stops[next].windowEnd),
        milesRemaining: Math.round(course.stopMiles[course.stopMiles.length - 1] - miles),
    };
};
