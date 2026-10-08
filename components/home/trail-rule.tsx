"use client";
import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import HeadlightStreak from "@/components/home/headlight-streak";
import { SCROLL_SPRING, TRAIL_RULE } from "@/lib/home/constants";

export default function TrailRule() {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: [...TRAIL_RULE.offset] });
    const sweep = useSpring(scrollYProgress, SCROLL_SPRING);
    const x = useTransform(sweep, [0, 1], [...TRAIL_RULE.travel]);

    return (
        <div ref={ref} aria-hidden className="bg-border relative h-px overflow-x-clip">
            <motion.div style={{ x }} className="absolute inset-y-0 left-0 w-1/3 motion-reduce:hidden">
                <HeadlightStreak />
            </motion.div>
        </div>
    );
}
