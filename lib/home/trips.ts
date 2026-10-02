import type { HubArc, LonLat, NetworkHub, Trip } from "@/lib/types";
import { HUBS } from "@/lib/data/home/hubs";
import { ARCS, CARRIERS, TRIPS } from "@/lib/home/constants";
import { LANE_ORIGIN } from "@/lib/home/lane";
import { lerp } from "@/lib/home/math";

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const UINT = 4294967296;

const seeded = (seed: number) => {
    let state = seed;
    return () => {
        state = (state + 0x6d2b79f5) | 0;
        let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
        mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
        return ((mixed ^ (mixed >>> 14)) >>> 0) / UINT;
    };
};

const span = (a: LonLat, b: LonLat) => Math.hypot(a[0] - b[0], a[1] - b[1]);

export function buildTrips(roads: LonLat[][]): Trip[] {
    const random = seeded(TRIPS.seed);
    const usable = roads.filter((road) => road.length >= TRIPS.minPoints);
    const total = usable.reduce((sum, road) => sum + road.length, 0);

    const pick = () => {
        let target = random() * total;
        for (const road of usable) {
            target -= road.length;
            if (target <= 0) return road;
        }
        return usable[0];
    };

    return Array.from({ length: TRIPS.count }, () => {
        const road = pick();
        const directed = random() > 0.5 ? road : [...road].reverse();
        const start = Math.floor(random() * (directed.length - TRIPS.minPoints));
        const budget = lerp(TRIPS.duration[0], TRIPS.duration[1], random());
        const departure = random() * (TRIPS.loop - budget);
        const path: LonLat[] = [];
        const timestamps: number[] = [];
        let elapsed = 0;

        for (let index = start; index < directed.length && elapsed <= budget; index++) {
            if (path.length > 0) elapsed += span(directed[index], directed[index - 1]) / TRIPS.speed;
            path.push(directed[index]);
            timestamps.push(departure + elapsed);
        }

        return { path, timestamps, accent: random() < TRIPS.accentShare };
    });
}

export const NETWORK_HUBS: NetworkHub[] = HUBS.map((hub) => ({ ...hub, position: [hub.lon, hub.lat] }));

export const MAJOR_HUBS = NETWORK_HUBS.filter((hub) => hub.major);

export const HUB_ARCS: HubArc[] = (() => {
    const random = seeded(ARCS.seed);
    return Array.from({ length: ARCS.count }, () => {
        const from = NETWORK_HUBS[Math.floor(random() * NETWORK_HUBS.length)];
        const to = NETWORK_HUBS[Math.floor(random() * NETWORK_HUBS.length)];
        return { from: from.position, to: to.position };
    }).filter((arc) => arc.from !== arc.to);
})();

export const CARRIER_POINTS: LonLat[] = Array.from({ length: CARRIERS.count }, (_, index) => {
    const radius = CARRIERS.spread * Math.sqrt((index + 1) / CARRIERS.count);
    const angle = index * GOLDEN_ANGLE;
    return [LANE_ORIGIN[0] + Math.cos(angle) * radius, LANE_ORIGIN[1] + Math.sin(angle) * radius * 0.8];
});
