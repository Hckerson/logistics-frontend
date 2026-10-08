"use client";
import { useEffect } from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { TRUCK_RUN } from "@/lib/auth/constants";
import { percentOf, pointAlong } from "@/lib/auth/point-along";
import { useReduced } from "@/lib/hooks/use-reduced";
import type { LanePoint, LaneTag } from "@/lib/types";

interface Props {
    width: number;
    height: number;
    route: string;
    points: readonly LanePoint[];
    times: readonly number[];
    tag: LaneTag;
}

const STROKE = { fill: "none", pathLength: 1, strokeLinecap: "round" } as const;

export default function LaneTruck({ width, height, route, points, times, tag }: Props) {
    const reduced = useReduced();
    const progress = useMotionValue(0);
    const opacity = useTransform(progress, [...TRUCK_RUN.fade], [0, 1, 1, 0]);
    const left = useTransform(progress, (t) => percentOf(pointAlong(points, times, t)[0], width));
    const top = useTransform(progress, (t) => percentOf(pointAlong(points, times, t)[1], height));
    const trail = useTransform(progress, (t) => TRUCK_RUN.trail - t);
    const core = useTransform(progress, (t) => TRUCK_RUN.core - t);

    useEffect(() => {
        if (reduced) {
            progress.set(TRUCK_RUN.parked);
            return;
        }
        const { duration, delay, repeatDelay } = TRUCK_RUN;
        const controls = animate(progress, [0, 1], { duration, delay, repeatDelay, ease: "linear", repeat: Infinity });
        return () => controls.stop();
    }, [progress, reduced]);

    return (
        <>
            <motion.svg
                viewBox={`0 0 ${width} ${height}`}
                style={{ opacity }}
                className="absolute inset-0 size-full overflow-visible will-change-transform"
            >
                <motion.path d={route} {...STROKE} strokeWidth={7} strokeDasharray={`${TRUCK_RUN.trail} 2`} strokeDashoffset={trail} className="stroke-accent/30 blur-[3px]" />
                <motion.path d={route} {...STROKE} strokeWidth={2} strokeDasharray={`${TRUCK_RUN.trail} 2`} strokeDashoffset={trail} className="stroke-accent" />
                <motion.path d={route} {...STROKE} strokeWidth={2} strokeDasharray={`${TRUCK_RUN.core} 2`} strokeDashoffset={core} className="stroke-(--haulr-hot)" />
            </motion.svg>
            <motion.div style={{ left, top, opacity }} className="absolute size-0">
                <span className="bg-accent/25 absolute grid size-7 -translate-1/2 place-items-center rounded-full">
                    <span className="size-2.5 rounded-full bg-(--haulr-hot) shadow-[0_0_12px_var(--colors-accent)]" />
                </span>
                <span className="border-border-dark bg-background/85 absolute right-4 bottom-4 hidden flex-col lg:flex gap-1 rounded-sm border px-3 py-2.5 whitespace-nowrap">
                    <span className="haulr-label text-accent">{tag.title}</span>
                    <span className="text-text text-sm">{tag.route}</span>
                    <span className="text-text-muted text-xs">{tag.detail}</span>
                </span>
            </motion.div>
        </>
    );
}
