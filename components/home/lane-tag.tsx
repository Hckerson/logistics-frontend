"use client";
import type { ReactNode, RefObject } from "react";
import { motion, useTransform, type MotionValue } from "motion/react";
import { SCENE_FADE } from "@/lib/home/constants";

interface Props {
    anchor: RefObject<HTMLDivElement | null>;
    progress: MotionValue<number>;
    range: readonly [number, number];
    children: ReactNode;
}

export default function LaneTag({ anchor, progress, range, children }: Props) {
    const [start, end] = range;
    const opacity = useTransform(
        progress,
        [start, start + SCENE_FADE, end - SCENE_FADE, end],
        [0, 1, 1, 0],
    );

    return (
        <div ref={anchor} aria-hidden className="pointer-events-none absolute top-0 left-0 motion-reduce:hidden">
            <motion.div
                style={{ opacity }}
                className="border-border-dark bg-background text-text flex -translate-x-1/2 -translate-y-[calc(100%+1.25rem)] flex-col gap-1 rounded-sm border px-3 py-2 font-mono text-xs whitespace-nowrap shadow-md"
            >
                {children}
            </motion.div>
        </div>
    );
}
