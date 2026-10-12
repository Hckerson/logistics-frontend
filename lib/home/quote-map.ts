import type { LonLat, LonLatAlt, NetworkHub, QuoteLane } from "@/lib/types";
import { ARC_PATH } from "@/lib/home/map-constants";
import { lerp } from "@/lib/home/math";
import { NETWORK_HUBS } from "@/lib/home/trips";
import { milesApart } from "@/lib/utils/geo";

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

export const milesBetween = ({ from, to }: QuoteLane) => Math.round(milesApart([from.lon, from.lat], [to.lon, to.lat]));

export function arcPath(from: LonLat, to: LonLat, drawn: number, height: number): LonLatAlt[] {
    const reach = Math.hypot(to[0] - from[0], to[1] - from[1]) * ARC_PATH.metresPerDegree;
    const steps = Math.max(Math.round(ARC_PATH.samples * drawn), 1);
    return Array.from({ length: steps + 1 }, (_, index) => {
        const t = (index / ARC_PATH.samples) * (drawn > 0 ? 1 : 0);
        return [lerp(from[0], to[0], t), lerp(from[1], to[1], t), Math.sin(Math.PI * t) * reach * height];
    });
}
