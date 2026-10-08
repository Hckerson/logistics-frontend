"use client";
import clsx from "clsx";
import { motion } from "motion/react";
import HeadlightStreak from "@/components/home/headlight-streak";
import LaneRule from "@/components/home/lane-rule";
import { LANE_DRAW_SECONDS, REVEAL_EASE } from "@/lib/home/constants";
import type { LaneSample } from "@/lib/types";

interface Props {
    lane: LaneSample;
    featured: boolean;
    order: number;
    shown: boolean;
    reduced: boolean;
}

export const LANE_ROW_GRID =
    "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-6 sm:grid-cols-[minmax(0,2.2fr)_1fr_1fr_1fr_0.7fr]";

const STAGGER = 0.09;
const STRETCH = { fontStretch: "var(--haulr-semi)" };

export default function LaneRow({ lane, featured, order, shown, reduced }: Props) {
    const delay = order * STAGGER;

    return (
        <li className="border-border relative overflow-x-clip border-b">
            <div className="overflow-hidden">
                <motion.div
                    initial={{ y: "100%", opacity: 0 }}
                    animate={shown ? { y: 0, opacity: 1 } : undefined}
                    transition={reduced ? { duration: 0 } : { duration: 0.7, delay, ease: REVEAL_EASE }}
                    className={clsx(LANE_ROW_GRID, featured ? "py-8" : "py-5")}
                >
                    {featured ? (
                        <div className="text-text flex items-center gap-3 sm:gap-6" style={STRETCH}>
                            <span className="text-3xl tracking-tight sm:text-5xl">{lane.from}</span>
                            <LaneRule className="w-10 shrink-0 sm:w-40" />
                            <span className="text-3xl tracking-tight sm:text-5xl">{lane.to}</span>
                        </div>
                    ) : (
                        <p className="text-text text-xl tracking-tight sm:text-2xl" style={STRETCH}>
                            {lane.from} <span className="text-accent">→</span> {lane.to}
                        </p>
                    )}
                    <span className="text-text-secondary hidden text-sm sm:block">{lane.equipment}</span>
                    <span
                        className={clsx(
                            "text-right font-mono tabular-nums sm:text-left",
                            featured ? "text-accent text-2xl sm:text-3xl" : "text-text text-lg",
                        )}
                    >
                        {lane.rate}
                    </span>
                    <span className="text-text-secondary hidden font-mono tabular-nums sm:block">{lane.transit}</span>
                    <span className="text-text-secondary hidden text-right font-mono tabular-nums sm:block">
                        {lane.onTime}
                    </span>
                </motion.div>
            </div>
            {shown && !reduced ? (
                <motion.span
                    aria-hidden
                    className="absolute bottom-0 left-0 h-px w-1/3"
                    initial={{ x: "-130%" }}
                    animate={{ x: "300%" }}
                    transition={{ duration: LANE_DRAW_SECONDS, delay: delay + 0.2, ease: REVEAL_EASE }}
                >
                    <HeadlightStreak />
                </motion.span>
            ) : null}
        </li>
    );
}
