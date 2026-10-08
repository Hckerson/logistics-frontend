import type { LonLat, LonLatAlt, NetworkHub, QuoteLane } from "@/lib/types";
import { ARC_PATH } from "@/lib/home/map-constants";
import { lerp } from "@/lib/home/math";
import { NETWORK_HUBS } from "@/lib/home/trips";

const EARTH_MILES = 3958.8;
const RADIANS = Math.PI / 180;

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

export function arcPath(from: LonLat, to: LonLat, drawn: number, height: number): LonLatAlt[] {
    const reach = Math.hypot(to[0] - from[0], to[1] - from[1]) * ARC_PATH.metresPerDegree;
    const steps = Math.max(Math.round(ARC_PATH.samples * drawn), 1);
    return Array.from({ length: steps + 1 }, (_, index) => {
        const t = (index / ARC_PATH.samples) * (drawn > 0 ? 1 : 0);
        return [lerp(from[0], to[0], t), lerp(from[1], to[1], t), Math.sin(Math.PI * t) * reach * height];
    });
}
