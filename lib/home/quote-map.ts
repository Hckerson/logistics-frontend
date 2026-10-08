import type { FlightView, LonLat, LonLatAlt, NetworkHub, QuoteLane } from "@/lib/types";
import { QUOTE_MAP } from "@/lib/home/map-constants";
import { lerp } from "@/lib/home/math";
import { NETWORK_HUBS } from "@/lib/home/trips";

const EARTH_MILES = 3958.8;
const RADIANS = Math.PI / 180;
const FULL_TURN = 360;

export const hubNamed = (value: string): NetworkHub | undefined => {
    const query = value.trim().toLowerCase();
    if (query === "") return undefined;
    return NETWORK_HUBS.find(
        (hub) => hub.name.toLowerCase() === query || hub.name.toLowerCase().startsWith(`${query},`),
    );
};

export const laneBetween = (origin: string, destination: string): QuoteLane | null => {
    const from = hubNamed(origin);
    const to = hubNamed(destination);
    return from && to && from !== to ? { from, to } : null;
};

export const milesBetween = ({ from, to }: QuoteLane) => {
    const dLat = (to.lat - from.lat) * RADIANS;
    const dLon = (to.lon - from.lon) * RADIANS;
    const chord =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(from.lat * RADIANS) * Math.cos(to.lat * RADIANS) * Math.sin(dLon / 2) ** 2;
    return Math.round(2 * EARTH_MILES * Math.asin(Math.sqrt(chord)));
};

const zoomFor = (span: number, width: number) => Math.log2((width * FULL_TURN) / (QUOTE_MAP.tile * span));

export function quoteView(lane: QuoteLane | null, width: number): FlightView {
    if (!lane) {
        const { longitude, latitude, span, pitch, bearing } = QUOTE_MAP.home;
        return { longitude, latitude, zoom: zoomFor(span, width), pitch, bearing };
    }
    const { from, to } = lane;
    const span =
        Math.max(Math.abs(to.lon - from.lon), Math.abs(to.lat - from.lat) * QUOTE_MAP.lane.latitudeWeight) +
        QUOTE_MAP.lane.margin * 2;
    return {
        longitude: (from.lon + to.lon) / 2,
        latitude: (from.lat + to.lat) / 2,
        zoom: zoomFor(span, width),
        pitch: QUOTE_MAP.lane.pitch,
        bearing: QUOTE_MAP.lane.bearing,
    };
}

export function arcPath(from: LonLat, to: LonLat, drawn: number, height: number): LonLatAlt[] {
    const reach = Math.hypot(to[0] - from[0], to[1] - from[1]) * QUOTE_MAP.metresPerDegree;
    const steps = Math.max(Math.round(QUOTE_MAP.samples * drawn), 1);
    return Array.from({ length: steps + 1 }, (_, index) => {
        const t = (index / QUOTE_MAP.samples) * (drawn > 0 ? 1 : 0);
        return [lerp(from[0], to[0], t), lerp(from[1], to[1], t), Math.sin(Math.PI * t) * reach * height];
    });
}
