"use client";
import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { SCROLL_SPRING, TRAIL_RULE } from "@/lib/home/constants";

export default function TrailRule() {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: [...TRAIL_RULE.offset] });
    const sweep = useSpring(scrollYProgress, SCROLL_SPRING);
    const x = useTransform(sweep, [0, 1], [...TRAIL_RULE.travel]);

    return (
        <div ref={ref} aria-hidden className="bg-border relative h-px overflow-x-clip">
            <motion.div style={{ x }} className="absolute inset-y-0 left-0 w-1/3 motion-reduce:hidden">
                <span className="via-accent block h-full bg-linear-to-r from-transparent via-70% to-(--haulr-hot)" />
                <span className="absolute top-1/2 right-0 h-2 w-10 translate-x-1/2 -translate-y-1/2 rounded-full bg-radial from-(--haulr-hot) to-transparent" />
            </motion.div>
        </div>
    );
}
