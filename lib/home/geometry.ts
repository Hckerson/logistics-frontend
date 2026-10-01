import type { Point } from "@/lib/types";

export const controlPoint = (from: Point, to: Point, bend: number): Point => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    return {
        x: (from.x + to.x) / 2 - dy * bend,
        y: (from.y + to.y) / 2 + dx * bend,
    };
};

export const pointOnCurve = (from: Point, control: Point, to: Point, t: number): Point => {
    const u = 1 - t;
    return {
        x: u * u * from.x + 2 * u * t * control.x + t * t * to.x,
        y: u * u * from.y + 2 * u * t * control.y + t * t * to.y,
    };
};

export const normalOnCurve = (from: Point, control: Point, to: Point, t: number): Point => {
    const dx = 2 * (1 - t) * (control.x - from.x) + 2 * t * (to.x - control.x);
    const dy = 2 * (1 - t) * (control.y - from.y) + 2 * t * (to.y - control.y);
    const length = Math.hypot(dx, dy) || 1;
    return { x: -dy / length, y: dx / length };
};

export const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
