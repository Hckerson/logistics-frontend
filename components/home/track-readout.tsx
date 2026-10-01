"use client";
import { motion, useTransform, type MotionValue } from "motion/react";
import { truckAt } from "@/lib/home/draw-load";
import { lerp } from "@/lib/home/math";

interface Props {
    progress: MotionValue<number>;
    label: string;
    from: number;
    to: number;
    prefix?: string;
    unit: string;
}

export default function TrackReadout({ progress, label, from, to, prefix = "", unit }: Props) {
    const value = useTransform(
        progress,
        (current) => `${prefix}${Math.round(lerp(from, to, truckAt(current)))} ${unit}`,
    );

    return (
        <div className="flex flex-col-reverse justify-end gap-1 pt-3 pr-4">
            <dt className="text-text-muted text-xs sm:text-sm">{label}</dt>
            <dd className="text-text font-mono text-lg tabular-nums sm:text-2xl">
                <motion.span>{value}</motion.span>
            </dd>
        </div>
    );
}
