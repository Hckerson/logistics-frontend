import { lerp, ramp } from "@/lib/home/math";
import type { LanePoint } from "@/lib/types";

export function pointAlong(points: readonly LanePoint[], times: readonly number[], t: number): LanePoint {
    let index = 1;
    while (index < times.length - 1 && times[index] < t) index++;
    const share = ramp(t, times[index - 1], times[index]);
    const [from, to] = [points[index - 1], points[index]];
    return [lerp(from[0], to[0], share), lerp(from[1], to[1], share)];
}

export const percentOf = (value: number, of: number) => `${(value / of) * 100}%`;
