"use client";
import type { ReactNode } from "react";
import { motion, useTransform, type MotionValue } from "motion/react";
import { SCENE_FADE } from "@/lib/home/constants";
import type { MapTagId } from "@/lib/types";

interface Props {
    id: MapTagId;
    range: readonly [number, number];
    progress: MotionValue<number>;
    title: string;
    children: ReactNode;
}

export default function MapTag({ id, range: [start, end], progress, title, children }: Props) {
    const opacity = useTransform(progress, [start, start + SCENE_FADE, end - SCENE_FADE, end], [0, 1, 1, 0]);

    return (
        <div data-pin={id} className="absolute top-0 left-0 opacity-0 will-change-transform">
            <motion.div
                style={{ opacity }}
                className="flex -translate-x-1/2 flex-col items-center gap-2 pt-5 lg:-translate-x-full lg:-translate-y-1/2 lg:flex-row-reverse lg:pt-0 lg:pr-5"
            >
                <span className="bg-accent block h-6 w-px lg:h-px lg:w-8" />
                <div className="border-border-dark bg-background/85 flex flex-col gap-1 rounded-sm border px-3 py-2.5">
                    <p className="haulr-label text-text-muted whitespace-nowrap">{title}</p>
                    {children}
                </div>
            </motion.div>
        </div>
    );
}
