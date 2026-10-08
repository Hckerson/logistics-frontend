import type { LonLat, Route } from "@/lib/types";
import { arcPath } from "@/lib/home/quote-map";

export const staticRoutes = (paths: LonLat[][]): Route[] =>
    paths.map((path) => ({ path, timestamps: path.map(() => 0) }));

export function arcRoute(from: LonLat, to: LonLat, drawn: number, height: number): Route {
    const path = arcPath(from, to, drawn, height);
    return { path, timestamps: path.map((_, index) => index / Math.max(path.length - 1, 1)) };
}
