import type { LonLat } from "@/lib/types";
import { HERO_LANE, HUBS } from "@/lib/data/home/hubs";
import { LANE, SCENES } from "@/lib/home/constants";
import { lerp, ramp, smootherstep } from "@/lib/home/math";

const TRACK_INSET = 0.02;

const positionOf = (code: string): LonLat => {
    const hub = HUBS.find((candidate) => candidate.code === code);
    if (!hub) throw new Error(`Unknown hub ${code}`);
    return [hub.lon, hub.lat];
};

export const LANE_ORIGIN = positionOf(HERO_LANE.from);
export const LANE_DESTINATION = positionOf(HERO_LANE.to);

const CONTROL: LonLat = [
    (LANE_ORIGIN[0] + LANE_DESTINATION[0]) / 2 - (LANE_DESTINATION[1] - LANE_ORIGIN[1]) * LANE.bend,
    (LANE_ORIGIN[1] + LANE_DESTINATION[1]) / 2 + (LANE_DESTINATION[0] - LANE_ORIGIN[0]) * LANE.bend,
];

export const lanePoint = (t: number): LonLat => {
    const u = 1 - t;
    return [
        u * u * LANE_ORIGIN[0] + 2 * u * t * CONTROL[0] + t * t * LANE_DESTINATION[0],
        u * u * LANE_ORIGIN[1] + 2 * u * t * CONTROL[1] + t * t * LANE_DESTINATION[1],
    ];
};

export const laneNormal = (t: number): LonLat => {
    const dx = 2 * (1 - t) * (CONTROL[0] - LANE_ORIGIN[0]) + 2 * t * (LANE_DESTINATION[0] - CONTROL[0]);
    const dy = 2 * (1 - t) * (CONTROL[1] - LANE_ORIGIN[1]) + 2 * t * (LANE_DESTINATION[1] - CONTROL[1]);
    const length = Math.hypot(dx, dy) || 1;
    return [-dy / length, dx / length];
};

export const laneSlice = (from: number, to: number): LonLat[] =>
    Array.from({ length: LANE.samples + 1 }, (_, index) => lanePoint(lerp(from, to, index / LANE.samples)));

export const truckAt = (progress: number) => {
    const linear = ramp(progress, SCENES.track[0] + TRACK_INSET, SCENES.track[1] - TRACK_INSET);
    return lerp(linear, smootherstep(linear), 0.5);
};
