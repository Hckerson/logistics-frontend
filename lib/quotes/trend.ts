import { TREND } from "@/lib/quotes/constants";
import type { TrendPoint } from "@/lib/types";

const FLAT = 0.01;

export function trendDirection(points: readonly TrendPoint[]) {
    const first = points[0]?.perMile ?? 0;
    const last = points[points.length - 1]?.perMile ?? 0;
    const change = first ? (last - first) / first : 0;
    const direction = Math.abs(change) < FLAT ? "flat" : change > 0 ? "up" : "down";
    return { direction, change: Math.abs(change) } as const;
}

export function trendShape(points: readonly TrendPoint[]) {
    const { width, height, pad } = TREND;
    const rates = points.map((point) => point.perMile);
    const min = Math.min(...rates);
    const max = Math.max(...rates);
    const span = max - min || 1;
    const step = points.length > 1 ? (width - pad * 2) / (points.length - 1) : 0;
    const plotted = points.map((point, index) => ({
        ...point,
        x: pad + index * step,
        y: pad + (1 - (point.perMile - min) / span) * (height - pad * 2),
    }));
    const line = plotted.map(({ x, y }, index) => `${index ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
    const last = plotted[plotted.length - 1];
    const area = last ? `${line} L${last.x.toFixed(1)} ${height} L${pad} ${height} Z` : "";
    return { plotted, line, area, min, max, step };
}

export const nearestIndex = (x: number, step: number, count: number) =>
    step ? Math.min(count - 1, Math.max(0, Math.round((x - TREND.pad) / step))) : 0;
