"use client";
import clsx from "clsx";
import type { ReactNode } from "react";
import { cubicBezier, motion, useTransform, type MotionValue } from "motion/react";
import { REVEAL_EASE, SCENE_FADE } from "@/lib/home/constants";

interface Props {
    progress: MotionValue<number>;
    range: readonly [number, number];
    hold?: "start" | "end";
    reduced: boolean;
    className?: string;
    children: ReactNode;
}

const DRIFT = 28;
const HIDDEN = 0.02;
const EASE = cubicBezier(...REVEAL_EASE);

const keyframes = ([start, end]: readonly [number, number], hold: Props["hold"]) => {
    if (hold === "start") return { input: [end - SCENE_FADE, end], opacity: [1, 0], y: [0, -DRIFT] };
    if (hold === "end") return { input: [start, start + SCENE_FADE], opacity: [0, 1], y: [DRIFT, 0] };
    return {
        input: [start, start + SCENE_FADE, end - SCENE_FADE, end],
        opacity: [0, 1, 1, 0],
        y: [DRIFT, 0, 0, -DRIFT],
    };
};

export default function SceneBlock({ progress, range, hold, reduced, className, children }: Props) {
    const frames = keyframes(range, hold);
    const opacity = useTransform(progress, frames.input, frames.opacity, { ease: EASE });
    const y = useTransform(progress, frames.input, frames.y, { ease: EASE });
    const pointerEvents = useTransform(opacity, (value) => (value > HIDDEN ? "auto" : "none"));

    return (
        <motion.div
            style={reduced ? undefined : { opacity, y, pointerEvents }}
            className={clsx("haulr-shell absolute inset-0 flex motion-reduce:static motion-reduce:py-10", className)}
        >
            {children}
        </motion.div>
    );
}
