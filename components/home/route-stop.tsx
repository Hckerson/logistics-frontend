"use client";
import { motion, useTransform, type MotionValue } from "motion/react";

interface Props {
    code: string;
    run: MotionValue<number>;
    reach: number;
}

const BLEND = 0.02;

export default function RouteStop({ code, run, reach }: Props) {
    const lit = useTransform(run, [reach - BLEND, reach + BLEND], [0, 1]);

    return (
        <li className="flex flex-col items-center gap-3 first:items-start last:items-end">
            <span className="bg-background border-border-dark relative block size-3 rounded-full border">
                <motion.span style={{ opacity: lit }} className="absolute -inset-px rounded-full bg-(--haulr-headlight)" />
            </span>
            <span className="haulr-label text-text-muted hidden sm:block">{code}</span>
        </li>
    );
}
