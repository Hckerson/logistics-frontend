import { lerp, ramp } from "@/lib/home/math";

type Point = [number, number];

export function pointAlong(points: readonly Point[], times: readonly number[], t: number): Point {
    let index = 1;
    while (index < times.length - 1 && times[index] < t) index++;
    const share = ramp(t, times[index - 1], times[index]);
    const [from, to] = [points[index - 1], points[index]];
    return [lerp(from[0], to[0], share), lerp(from[1], to[1], share)];
}
