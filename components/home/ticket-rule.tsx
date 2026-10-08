"use client";
import clsx from "clsx";
import { motion } from "motion/react";
import HeadlightStreak from "@/components/home/headlight-streak";
import { LANE_DRAW_SECONDS, REVEAL_EASE } from "@/lib/home/constants";

interface Props {
    from: boolean;
    to: boolean;
    sweep: string | null;
    reduced: boolean;
}

const DOT = "block size-3 shrink-0 rounded-full border-2 transition-colors duration-500";

export default function TicketRule({ from, to, sweep, reduced }: Props) {
    return (
        <div aria-hidden className="flex min-w-12 flex-1 items-center">
            <span className={clsx(DOT, from ? "border-accent bg-accent" : "border-border-dark")} />
            <span className="bg-border-dark relative block h-px flex-1 overflow-x-clip">
                <motion.span
                    className="bg-accent absolute inset-0 origin-left"
                    initial={false}
                    animate={{ scaleX: sweep ? 1 : 0 }}
                    transition={{ duration: LANE_DRAW_SECONDS, ease: REVEAL_EASE }}
                />
                {sweep && !reduced ? (
                    <motion.span
                        key={sweep}
                        className="absolute inset-y-0 left-0 w-1/3"
                        initial={{ x: "-100%" }}
                        animate={{ x: "300%" }}
                        transition={{ duration: LANE_DRAW_SECONDS, ease: REVEAL_EASE }}
                    >
                        <HeadlightStreak />
                    </motion.span>
                ) : null}
            </span>
            <span className={clsx(DOT, to ? "border-accent bg-accent" : "border-border-dark")} />
        </div>
    );
}
