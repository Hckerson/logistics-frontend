import type { NetworkHub, NetworkLane, Point } from "@/lib/types";
import { HERO_LANE, HUBS } from "@/lib/data/home/hubs";
import { CARRIERS, NETWORK, PROJECTION_LAT } from "@/lib/home/constants";
import { controlPoint, distance } from "@/lib/home/geometry";

const SCALE = Math.cos((PROJECTION_LAT * Math.PI) / 180);
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

const raw = HUBS.map((hub) => ({ hub, x: hub.lon * SCALE, y: -hub.lat }));
const minX = Math.min(...raw.map((point) => point.x));
const maxX = Math.max(...raw.map((point) => point.x));
const minY = Math.min(...raw.map((point) => point.y));
const span = maxX - minX;

const placed = raw.map(({ hub, x, y }) => ({
    ...hub,
    x: (x - minX) / span,
    y: (y - minY) / span,
}));

const start = placed.find((hub) => hub.code === HERO_LANE.from) ?? placed[0];
const farthest = Math.max(...placed.map((hub) => distance(hub, start)));

const hubs: NetworkHub[] = placed.map((hub) => ({
    ...hub,
    delay: distance(hub, start) / farthest,
}));

const byCode = (code: string) => {
    const hub = hubs.find((candidate) => candidate.code === code);
    if (!hub) throw new Error(`Unknown hub ${code}`);
    return hub;
};

const origin = byCode(HERO_LANE.from);
const destination = byCode(HERO_LANE.to);

const nearest = (hub: NetworkHub) =>
    hubs
        .filter((candidate) => candidate !== hub)
        .sort((a, b) => distance(a, hub) - distance(b, hub))
        .slice(0, NETWORK.neighbours);

const seen = new Set<string>();

const lanes: NetworkLane[] = hubs.flatMap((hub) =>
    nearest(hub).flatMap((other) => {
        const key = [hub.code, other.code].sort().join("-");
        if (seen.has(key)) return [];
        seen.add(key);
        const midpoint = { x: (hub.x + other.x) / 2, y: (hub.y + other.y) / 2 };
        return [{ from: hub, to: other, delay: distance(midpoint, origin) / farthest }];
    }),
);

const carriers: Point[] = Array.from({ length: CARRIERS.count }, (_, index) => {
    const radius = CARRIERS.spread * Math.sqrt((index + 1) / CARRIERS.count);
    const angle = index * GOLDEN_ANGLE;
    return {
        x: origin.x + Math.cos(angle) * radius,
        y: origin.y + Math.sin(angle) * radius,
    };
});

export const NETWORK_MAP = {
    hubs,
    lanes,
    carriers,
    origin,
    destination,
    control: controlPoint(origin, destination, NETWORK.heroBend),
    width: 1,
    height: Math.max(...hubs.map((hub) => hub.y)),
    center: {
        x: 0.5,
        y: Math.max(...hubs.map((hub) => hub.y)) / 2,
    },
};
