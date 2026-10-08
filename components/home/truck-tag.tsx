"use client";
import type { RefObject } from "react";
import { motion, useTransform, type MotionValue } from "motion/react";
import { HERO_LANE } from "@/lib/data/home/hubs";
import { TRACK_SCENE } from "@/lib/data/home/scenes";
import { SCENE_FADE, SCENES } from "@/lib/home/constants";
import { useTruckReadouts } from "@/lib/hooks/use-truck-readouts";

interface Props {
    tagRef: RefObject<HTMLDivElement | null>;
    progress: MotionValue<number>;
}

const [START, END] = SCENES.eta;

export default function TruckTag({ tagRef, progress }: Props) {
    const { eta, remaining } = useTruckReadouts(progress);
    const opacity = useTransform(progress, [START, START + SCENE_FADE, END - SCENE_FADE, END], [0, 1, 1, 0]);

    return (
        <div ref={tagRef} aria-hidden className="pointer-events-none absolute top-0 left-0 will-change-transform">
            <motion.div
                style={{ opacity }}
                className="flex -translate-x-1/2 flex-col items-center gap-2 pt-5 lg:-translate-x-full lg:-translate-y-1/2 lg:flex-row-reverse lg:pt-0 lg:pr-5"
            >
                <span className="bg-accent block h-6 w-px lg:h-px lg:w-8" />
                <div className="border-border-dark bg-background/85 flex flex-col gap-1 rounded-sm border px-3 py-2.5">
                    <p className="haulr-label text-text-muted">{HERO_LANE.load}</p>
                    <p className="text-text font-mono text-sm whitespace-nowrap tabular-nums">
                        {TRACK_SCENE.readouts.eta.label}{" "}
                        <motion.span className="text-accent">{eta}</motion.span>
                    </p>
                    <p className="text-text-secondary font-mono text-xs whitespace-nowrap tabular-nums">
                        <motion.span>{remaining}</motion.span> {TRACK_SCENE.readouts.remaining.label.toLowerCase()}
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
