"use client";
import { useEffect, useRef } from "react";
import { animate, motion, useInView, useMotionValue, useTransform } from "motion/react";
import HeadlightStreak from "@/components/home/headlight-streak";
import RouteStop from "@/components/home/route-stop";
import { FOOTER_ROUTE, LANE_DRAW_SECONDS, REVEAL_EASE, REVEAL_VIEWPORT } from "@/lib/home/constants";
import { MAJOR_CODES } from "@/lib/home/trips";
import { useReduced } from "@/lib/hooks/use-reduced";

const { from, to, streak } = FOOTER_ROUTE;
const reachOf = (share: number) => (share / streak - 1 - from / 100) / ((to - from) / 100);

export default function FooterRoute() {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, REVEAL_VIEWPORT);
    const reduced = useReduced();
    const run = useMotionValue(0);
    const x = useTransform(run, [0, 1], [`${from}%`, `${to}%`]);

    useEffect(() => {
        if (reduced) {
            run.set(1);
            return;
        }
        if (!inView) return;
        const controls = animate(run, 1, { duration: LANE_DRAW_SECONDS * 2, ease: REVEAL_EASE });
        return () => controls.stop();
    }, [inView, reduced, run]);

    return (
        <div ref={ref} aria-hidden className="relative overflow-x-clip">
            <span className="bg-border absolute inset-x-0 top-1.5 h-px" />
            <motion.span style={{ x, width: `${streak * 100}%` }} className="absolute top-1.5 left-0 h-px">
                <HeadlightStreak />
            </motion.span>
            <ol className="relative flex justify-between">
                {MAJOR_CODES.map((code, index) => (
                    <RouteStop key={code} code={code} run={run} reach={reachOf(index / (MAJOR_CODES.length - 1))} />
                ))}
            </ol>
        </div>
    );
}
