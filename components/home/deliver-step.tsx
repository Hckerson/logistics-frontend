"use client";
import { motion, useTransform, type MotionValue } from "motion/react";

interface Props {
    index: number;
    label: string;
    value: string;
    reached: MotionValue<number>;
    reduced: boolean;
}

const DIM = 0.35;

export default function DeliverStep({ index, label, value, reached, reduced }: Props) {
    const opacity = useTransform(reached, (count) => (count > index ? 1 : DIM));

    return (
        <motion.li style={{ opacity: reduced ? 1 : opacity }} className="relative flex flex-col gap-1">
            <span aria-hidden className="bg-accent absolute top-1.5 -left-8 block size-[11px] rounded-full" />
            <span className="text-accent font-mono text-sm tabular-nums">{value}</span>
            <span className="text-text text-lg">{label}</span>
        </motion.li>
    );
}
