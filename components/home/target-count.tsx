"use client";
import { useEffect, useRef } from "react";
import { animate, motion, useInView, useMotionValue, useTransform } from "motion/react";
import { COUNT_SECONDS, REVEAL_EASE } from "@/lib/home/constants";

interface Props {
    value: number;
    unit: string;
}

export default function TargetCount({ value, unit }: Props) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, margin: "-10%" });
    const count = useMotionValue(0);
    const rounded = useTransform(count, (current) => Math.round(current).toString());

    useEffect(() => {
        if (!inView) return;
        const controls = animate(count, value, { duration: COUNT_SECONDS, ease: REVEAL_EASE });
        return () => controls.stop();
    }, [inView, count, value]);

    return (
        <span ref={ref} className="haulr-figure flex items-baseline">
            <motion.span>{rounded}</motion.span>
            <span className="text-text-muted ml-[0.12em] text-[0.35em] tracking-normal">{unit}</span>
        </span>
    );
}
