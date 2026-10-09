"use client";
import clsx from "clsx";
import { useEffect } from "react";
import { animate, motion, useMotionValue, useTransform, useVelocity } from "motion/react";
import { useAuthSignal } from "@/components/providers/auth-signal-provider";
import { LEG, TRUCK_RUN } from "@/lib/auth/constants";
import { percentOf, pointAlong } from "@/lib/auth/point-along";
import { REVEAL_EASE } from "@/lib/home/constants";
import { useReduced } from "@/lib/hooks/use-reduced";
import type { AuthSignal, LanePoint, LaneTag } from "@/lib/types";

interface Props {
    width: number;
    height: number;
    route: string;
    points: readonly LanePoint[];
    times: readonly number[];
    midway: number;
    tag: LaneTag;
}

const STROKE = { fill: "none", pathLength: 1, strokeLinecap: "round" } as const;
const WAITING: readonly AuthSignal[] = ["origin", "midway", "held"];

const targetFor = (signal: AuthSignal, midway: number, leg: number) => {
    if (signal === "origin") return 0;
    if (signal === "arrived") return 1;
    if (signal === "pending") return midway + (1 - midway) * TRUCK_RUN.creep;
    return midway + (1 - midway) * LEG.truck * leg;
};

export default function LaneTruck({ width, height, route, points, times, midway, tag }: Props) {
    const reduced = useReduced();
    const { signal, leg } = useAuthSignal();
    const progress = useMotionValue(0);
    const speed = useVelocity(progress);
    const glow = useTransform(speed, (value) => Math.min(1, Math.abs(value) * 6));
    const left = useTransform(progress, (t) => percentOf(pointAlong(points, times, t)[0], width));
    const top = useTransform(progress, (t) => percentOf(pointAlong(points, times, t)[1], height));
    const trail = useTransform(progress, (t) => TRUCK_RUN.trail - t);
    const core = useTransform(progress, (t) => TRUCK_RUN.core - t);
    const target = targetFor(signal, midway, leg);
    const past = target > midway;
    const status = signal === "midway" && past ? tag.rolling : tag.status[signal];

    useEffect(() => {
        const creeping = signal === "pending";
        const duration = reduced ? 0 : creeping ? TRUCK_RUN.creepSeconds : Math.abs(target - progress.get()) * TRUCK_RUN.seconds;
        const controls = animate(progress, target, { duration, ease: creeping ? "easeOut" : REVEAL_EASE });
        return () => controls.stop();
    }, [progress, reduced, signal, target]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduced ? 0 : TRUCK_RUN.delay, duration: 0.6 }}
            className="absolute inset-0"
        >
            <motion.svg
                viewBox={`0 0 ${width} ${height}`}
                style={{ opacity: glow }}
                className="absolute inset-0 size-full overflow-visible will-change-transform"
            >
                <motion.path d={route} {...STROKE} strokeWidth={7} strokeDasharray={`${TRUCK_RUN.trail} 2`} strokeDashoffset={trail} className="stroke-accent/30 blur-[3px]" />
                <motion.path d={route} {...STROKE} strokeWidth={2} strokeDasharray={`${TRUCK_RUN.trail} 2`} strokeDashoffset={trail} className="stroke-accent" />
                <motion.path d={route} {...STROKE} strokeWidth={2} strokeDasharray={`${TRUCK_RUN.core} 2`} strokeDashoffset={core} className="stroke-(--haulr-hot)" />
            </motion.svg>
            <motion.div style={{ left, top }} className="absolute size-0">
                <span className="bg-accent/25 absolute grid size-7 -translate-1/2 place-items-center rounded-full">
                    {WAITING.includes(signal) ? <span className="bg-accent/40 absolute inset-0 animate-ping rounded-full" /> : null}
                    <span className="relative size-2.5 rounded-full bg-(--haulr-hot) shadow-[0_0_12px_var(--colors-accent)]" />
                </span>
                <span className={clsx("border-border-dark bg-background/85 absolute hidden flex-col gap-1 rounded-sm border px-3 py-2.5 whitespace-nowrap lg:flex", past ? "top-4 left-4" : "right-4 bottom-4")}>
                    <span className="haulr-label text-text-muted">{tag.title}</span>
                    <span className="text-text text-sm">{tag.route}</span>
                    <span className={clsx("text-xs", signal === "held" ? "text-error" : "text-accent")}>{status}</span>
                </span>
            </motion.div>
        </motion.div>
    );
}
