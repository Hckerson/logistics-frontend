"use client";
import clsx from "clsx";
import { motion } from "motion/react";
import { LANE_DRAW_SECONDS, LANE_RULE, REVEAL_EASE } from "@/lib/home/constants";

interface Props {
    state?: "moving" | "settled";
    still?: boolean;
    className?: string;
}

const VIEWPORT = { once: true, margin: "-10%" } as const;
const DOT = "bg-accent absolute top-1/2 block size-2.5 -translate-y-1/2 rounded-full";
const BAND = `polygon(${LANE_RULE.load}% 50%, 100% ${LANE_RULE.spread}%, 100% ${100 - LANE_RULE.spread}%)`;

export default function LaneRule({ state = "moving", still = false, className }: Props) {
    const moving = state === "moving";

    return (
        <div aria-hidden className={clsx("relative h-10", className)}>
            {moving ? (
                <motion.span
                    className="bg-accent/20 absolute inset-0 block"
                    style={{ clipPath: BAND }}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={VIEWPORT}
                    transition={{ duration: LANE_DRAW_SECONDS, delay: LANE_DRAW_SECONDS / 2 }}
                />
            ) : null}
            <motion.span
                className="bg-accent absolute inset-x-0 top-1/2 block h-0.5 origin-left -translate-y-1/2"
                initial={still ? false : { scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={VIEWPORT}
                transition={{ duration: LANE_DRAW_SECONDS, ease: REVEAL_EASE }}
            />
            <span className={clsx(DOT, "left-0")} />
            {moving ? (
                <>
                    <span className={clsx(DOT, "-translate-x-1/2")} style={{ left: `${LANE_RULE.load}%` }} />
                    <span className="border-accent bg-background absolute top-1/2 right-0 block size-2.5 -translate-y-1/2 rounded-full border-2" />
                </>
            ) : (
                <span className={clsx(DOT, "right-0")} />
            )}
        </div>
    );
}
