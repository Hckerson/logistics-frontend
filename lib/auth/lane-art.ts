import "server-only";
import type { LaneArtData, LanePoint, LonLat } from "@/lib/types";
import roadData from "@/lib/data/home/roads.json";
import { HUBS } from "@/lib/data/home/hubs";
import { LANE_PATH, LANE_TIMES } from "@/lib/home/lane";
import { LANE_GEOMETRY, LANE_STOPS } from "@/lib/auth/constants";

interface Reach {
    lon: number;
    lat: number;
}

const RADIANS = Math.PI / 180;
const { width, pad, margin, field, reach, step, traffic, speed, trail, stagger } = LANE_GEOMETRY;

const lons = LANE_PATH.map(([lon]) => lon);
const lats = LANE_PATH.map(([, lat]) => lat);
const around = ({ lon, lat }: Reach) => ({
    west: Math.min(...lons) - lon,
    east: Math.max(...lons) + lon,
    south: Math.min(...lats) - lat,
    north: Math.max(...lats) + lat,
});
const frame = around(margin);
const extent = around(field);
const squash = Math.cos(((frame.north + frame.south) / 2) * RADIANS);
const scale = (width - pad * 2) / ((frame.east - frame.west) * squash);
const height = pad * 2 + (frame.north - frame.south) * scale;

const project = ([lon, lat]: LonLat): LanePoint => [
    pad + (lon - frame.west) * squash * scale,
    pad + (frame.north - lat) * scale,
];

const inside = ([lon, lat]: LonLat) =>
    lon >= extent.west && lon <= extent.east && lat >= extent.south && lat <= extent.north;

const near = ([x, y]: LanePoint) =>
    x > -width * reach && x < width * (1 + reach) && y > -height * reach && y < height * (1 + reach);

const gap = (a: LanePoint, b: LanePoint) => Math.hypot(a[0] - b[0], a[1] - b[1]);

const lengthOf = (points: LanePoint[]) =>
    points.reduce((total, point, index) => (index === 0 ? 0 : total + gap(points[index - 1], point)), 0);

const pathOf = (points: LanePoint[]) =>
    points.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");

const runs = (road: LonLat[]) =>
    road.reduce<LonLat[][]>(
        (all, point) => {
            if (!inside(point)) return [...all, []];
            all[all.length - 1].push(point);
            return all;
        },
        [[]],
    );

const thin = (points: LanePoint[]) => {
    const kept = [points[0]];
    for (const point of points.slice(1)) if (gap(kept[kept.length - 1], point) >= step) kept.push(point);
    return kept;
};

const RUNS = (roadData as LonLat[][])
    .flatMap(runs)
    .map((run) => thin(run.map(project)))
    .filter((run) => run.length > 1);

const TRAFFIC = RUNS.filter((run) => run.some(near))
    .map((run) => ({ run, length: lengthOf(run) }))
    .sort((a, b) => b.length - a.length)
    .slice(0, traffic)
    .map(({ run, length }, index) => ({
        d: pathOf(run),
        dash: trail / length,
        duration: length / speed,
        delay: -((index * stagger) % 1) * (length / speed),
    }));

const ROUTE = LANE_PATH.map(project);

export const LANE_ART: LaneArtData = {
    width,
    height,
    route: pathOf(ROUTE),
    points: ROUTE,
    times: LANE_TIMES,
    roads: RUNS.map(pathOf).join(" "),
    traffic: TRAFFIC,
    hubs: HUBS.filter((hub) => inside([hub.lon, hub.lat])).map((hub) => ({
        code: hub.code,
        at: project([hub.lon, hub.lat]),
        stop: LANE_STOPS.includes(hub.code),
        major: hub.major,
    })),
};
