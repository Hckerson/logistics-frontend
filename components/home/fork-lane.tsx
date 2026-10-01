"use client";
import { motion } from "motion/react";
import { FORK_LANE, LANE_DRAW_SECONDS, REVEAL_EASE } from "@/lib/home/constants";
import type { Side } from "@/lib/types";

interface Props {
    side: Side;
}

const { width, height, stem, dot, targets } = FORK_LANE;
const MID = width / 2;

const branch = (share: number) => {
    const x = share * width;
    return `M ${MID} 0 V ${stem} C ${MID} ${height * 0.75} ${x} ${height * 0.4} ${x} ${height - dot}`;
};

export default function ForkLane({ side }: Props) {
    return (
        <svg
            aria-hidden
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            className="hidden h-28 w-full overflow-visible lg:block"
        >
            {targets[side].map((share, index) => (
                <g key={index}>
                    <motion.path
                        d={branch(share)}
                        fill="none"
                        className="stroke-accent"
                        strokeWidth={2}
                        initial={{ pathLength: 0 }}
                        whileInView={{ pathLength: 1 }}
                        viewport={{ once: true, margin: "-15%" }}
                        transition={{ duration: LANE_DRAW_SECONDS, ease: REVEAL_EASE }}
                    />
                    <circle cx={share * width} cy={height - dot} r={dot} className="fill-accent" />
                </g>
            ))}
        </svg>
    );
}
