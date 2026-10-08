"use client";
import clsx from "clsx";
import { motion } from "motion/react";
import { DOORS } from "@/lib/data/home/fork";
import { FORK_LANE, LANE_DRAW_SECONDS, REVEAL_EASE, REVEAL_VIEWPORT } from "@/lib/home/constants";
import type { Side } from "@/lib/types";

interface Props {
    side: Side;
}

const { rail, drop, dot, exits } = FORK_LANE;
const percent = (share: number) => `${share * 100}%`;

export default function ForkLane({ side }: Props) {
    const xs = exits[side];
    const lit = DOORS.findIndex((door) => door.side === side);
    const draw = (delay: number) => ({
        initial: { pathLength: 0 },
        whileInView: { pathLength: 1 },
        viewport: REVEAL_VIEWPORT,
        transition: { duration: LANE_DRAW_SECONDS, delay, ease: REVEAL_EASE },
    });

    return (
        <svg aria-hidden className="hidden h-16 w-full overflow-visible lg:block">
            <line x1="0" x2="100%" y1={rail} y2={rail} className="stroke-border-dark" strokeWidth={1} />
            <motion.line key={`trunk-${side}`} x1="100%" x2={percent(xs[lit])} y1={rail} y2={rail} className="stroke-accent" strokeWidth={2} {...draw(0)} />
            {xs.map((x, index) => (
                <g key={`${side}-${DOORS[index].side}`}>
                    <motion.line
                        x1={percent(x)}
                        x2={percent(x)}
                        y1={rail}
                        y2={drop}
                        className={index === lit ? "stroke-accent" : "stroke-border-dark"}
                        strokeWidth={index === lit ? 2 : 1}
                        {...draw(LANE_DRAW_SECONDS * 0.6)}
                    />
                    <circle
                        cx={percent(x)}
                        cy={drop + dot}
                        r={dot}
                        className={clsx(index === lit ? "fill-accent" : "fill-background stroke-border-dark")}
                        strokeWidth={index === lit ? 0 : 2}
                    />
                </g>
            ))}
        </svg>
    );
}
