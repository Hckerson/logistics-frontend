import type { LonLat } from "@/lib/types";
import route from "@/lib/data/home/lane.json";
import { RIDE } from "@/lib/home/constants";
import { clamp, lerp, ramp, smootherstep } from "@/lib/home/math";

const RADIANS = Math.PI / 180;
const DEGREES = 180 / Math.PI;
const TRACK_INSET = 0.02;

export const LANE_PATH = route as LonLat[];

const span = (a: LonLat, b: LonLat) =>
    Math.hypot((b[0] - a[0]) * Math.cos(((a[1] + b[1]) / 2) * RADIANS), b[1] - a[1]);

const lengths = LANE_PATH.reduce<number[]>(
    (total, point, index) => [...total, index === 0 ? 0 : total[index - 1] + span(LANE_PATH[index - 1], point)],
    [],
);

const LENGTH = lengths[lengths.length - 1];

export const LANE_TIMES = lengths.map((length) => length / LENGTH);

export const LANE_ORIGIN = LANE_PATH[0];
export const LANE_DESTINATION = LANE_PATH[LANE_PATH.length - 1];

export const lanePoint = (t: number): LonLat => {
    const target = clamp(t);
    let index = 1;
    while (index < LANE_TIMES.length - 1 && LANE_TIMES[index] < target) index++;
    const share = ramp(target, LANE_TIMES[index - 1], LANE_TIMES[index]);
    const [from, to] = [LANE_PATH[index - 1], LANE_PATH[index]];
    return [lerp(from[0], to[0], share), lerp(from[1], to[1], share)];
};

const tangent = (t: number, window: number): LonLat => {
    const [ax, ay] = lanePoint(t - window);
    const [bx, by] = lanePoint(t + window);
    return [(bx - ax) * Math.cos(((ay + by) / 2) * RADIANS), by - ay];
};

export const laneHeading = (t: number, window: number) => {
    const [dx, dy] = tangent(t, window);
    return Math.atan2(dx, dy) * DEGREES;
};

export const truckAt = (progress: number) => {
    const linear = ramp(progress, RIDE[0] + TRACK_INSET, RIDE[1] - TRACK_INSET);
    return lerp(linear, smootherstep(linear), 0.5);
};

export const LANE_MIDPOINT = lanePoint(0.5);
