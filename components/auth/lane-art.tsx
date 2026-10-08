"use client";
import { useEffect } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { pointAlong } from "@/lib/auth/point-along";
import { REVEAL_EASE } from "@/lib/home/constants";
import { useReduced } from "@/lib/hooks/use-reduced";

type Point = [number, number];

interface Stop {
    code: string;
    at: Point;
}

interface Props {
    width: number;
    height: number;
    route: string;
    roads: string;
    points: readonly Point[];
    times: readonly number[];
    stops: readonly Stop[];
}

const DRAW = { delay: 0.4, duration: 2.6 } as const;

const share = (value: number, of: number) => `${(value / of) * 100}%`;

export default function LaneArt({ width, height, route, roads, points, times, stops }: Props) {
    const reduced = useReduced();
    const drawn = useMotionValue(0);
    const left = useTransform(drawn, (t) => share(pointAlong(points, times, t)[0], width));
    const top = useTransform(drawn, (t) => share(pointAlong(points, times, t)[1], height));

    useEffect(() => {
        if (reduced) {
            drawn.set(1);
            return;
        }
        const controls = animate(drawn, 1, { ...DRAW, ease: REVEAL_EASE });
        return () => controls.stop();
    }, [drawn, reduced]);

    return (
        <div
            aria-hidden
            className="relative"
            style={{ aspectRatio: `${width} / ${height}`, width: `min(100cqw, ${width / height} * 100cqh)` }}
        >
            <svg viewBox={`0 0 ${width} ${height}`} className="absolute inset-0 size-full overflow-visible">
                <path d={roads} fill="none" className="stroke-border" strokeWidth={1} vectorEffect="non-scaling-stroke" />
                <path
                    d={route}
                    fill="none"
                    className="stroke-border-dark"
                    strokeWidth={2}
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                />
                <motion.path
                    d={route}
                    fill="none"
                    className="stroke-accent drop-shadow-[0_0_6px_var(--colors-accent)]"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    style={{ pathLength: drawn }}
                />
            </svg>
            {stops.map((stop) => (
                <span
                    key={stop.code}
                    className="absolute flex -translate-x-1.5 -translate-y-1/2 items-center gap-2"
                    style={{ left: share(stop.at[0], width), top: share(stop.at[1], height) }}
                >
                    <span className="border-accent bg-background size-3 rounded-full border-2" />
                    <span className="haulr-label text-text-muted">{stop.code}</span>
                </span>
            ))}
            <motion.span
                className="bg-accent/25 absolute grid size-7 -translate-1/2 place-items-center rounded-full"
                style={{ left, top }}
            >
                <span className="size-2.5 rounded-full bg-(--haulr-hot)" />
            </motion.span>
        </div>
    );
}
