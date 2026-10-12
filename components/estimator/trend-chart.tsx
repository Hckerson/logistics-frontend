"use client";
import { useState, type KeyboardEvent, type PointerEvent } from "react";
import { ESTIMATOR_COPY } from "@/lib/data/quotes/estimator";
import { TREND } from "@/lib/quotes/constants";
import { count, perMileRate, shortDay } from "@/lib/quotes/format";
import { nearestIndex, trendShape } from "@/lib/quotes/trend";
import type { TrendPoint } from "@/lib/types";

interface Props {
    points: readonly TrendPoint[];
    summary: string;
}

const { width, height, pad } = TREND;
const { trend } = ESTIMATOR_COPY;
const STEP: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 };
const AXIS = "text-text-muted font-mono text-[0.625rem] tabular-nums";

export default function TrendChart({ points, summary }: Props) {
    const { plotted, line, area, min, max, step } = trendShape(points);
    const last = plotted.length - 1;
    const [active, setActive] = useState<number | null>(null);
    const focus = plotted[active ?? last];

    const track = (event: PointerEvent<SVGSVGElement>) => {
        const box = event.currentTarget.getBoundingClientRect();
        setActive(nearestIndex(((event.clientX - box.left) / box.width) * width, step, plotted.length));
    };

    const keys = (event: KeyboardEvent<HTMLDivElement>) => {
        const move = STEP[event.key];
        if (!move && event.key !== "Home" && event.key !== "End") return;
        event.preventDefault();
        if (event.key === "Home") return setActive(0);
        if (event.key === "End") return setActive(last);
        setActive((current) => Math.min(last, Math.max(0, (current ?? last) + move)));
    };

    return (
        <div
            tabIndex={0}
            role="group"
            aria-label={summary}
            onKeyDown={keys}
            onBlur={() => setActive(null)}
            className="focus-visible:outline-text flex flex-col gap-3 outline-offset-4 focus-visible:outline-1"
        >
            <p aria-live="polite" className="flex items-baseline gap-3 text-xs">
                <span className="text-text font-mono tabular-nums">{perMileRate(focus.perMile)}</span>
                <span className="text-text-muted">{shortDay(focus.date)}</span>
                <span className="text-text-muted">
                    {count(focus.samples)} {trend.columns.samples.toLowerCase()}
                </span>
            </p>
            <div className="flex gap-3">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="relative h-20">
                        <svg
                            aria-hidden
                            viewBox={`0 0 ${width} ${height}`}
                            preserveAspectRatio="none"
                            onPointerMove={track}
                            onPointerLeave={() => setActive(null)}
                            className="absolute inset-0 size-full touch-none overflow-visible"
                        >
                            <line x1={0} x2={width} y1={pad} y2={pad} className="stroke-border" vectorEffect="non-scaling-stroke" />
                            <line x1={0} x2={width} y1={height - pad} y2={height - pad} className="stroke-border" vectorEffect="non-scaling-stroke" />
                            <path d={area} className="fill-text-secondary/10" />
                            <path
                                d={line}
                                fill="none"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="stroke-text-secondary"
                                vectorEffect="non-scaling-stroke"
                            />
                            {active !== null ? (
                                <line x1={focus.x} x2={focus.x} y1={0} y2={height} className="stroke-text-muted" vectorEffect="non-scaling-stroke" />
                            ) : null}
                        </svg>
                        <span
                            aria-hidden
                            className="pointer-events-none absolute size-2.5 -translate-1/2 rounded-full bg-(--haulr-hot) shadow-[0_0_10px_2px_var(--colors-accent)]"
                            style={{ left: `${(focus.x / width) * 100}%`, top: `${(focus.y / height) * 100}%` }}
                        />
                    </div>
                    <div aria-hidden className={`flex justify-between ${AXIS}`}>
                        <span>{shortDay(points[0].date)}</span>
                        <span>{shortDay(points[last].date)}</span>
                    </div>
                </div>
                <div aria-hidden className={`flex shrink-0 flex-col justify-between pb-4 ${AXIS}`}>
                    <span>{perMileRate(max)}</span>
                    <span>{perMileRate(min)}</span>
                </div>
            </div>
        </div>
    );
}
