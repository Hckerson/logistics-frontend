"use client";
import { motion } from "motion/react";
import HeadlightStreak from "@/components/home/headlight-streak";
import { LANE_DRAW_SECONDS, REVEAL_EASE } from "@/lib/home/constants";

interface Props {
    beat: number;
    reduced: boolean;
}

const DOT = "bg-accent block size-2.5 shrink-0 rounded-full";

export default function RecordLink({ beat, reduced }: Props) {
    return (
        <div aria-hidden className="hidden w-24 shrink-0 items-center self-center lg:flex xl:w-36">
            <span className={DOT} />
            <span className="bg-accent/40 relative block h-px flex-1 overflow-x-clip">
                {beat > 0 && !reduced ? (
                    <motion.span
                        key={beat}
                        className="absolute inset-y-0 left-0 w-full"
                        initial={{ x: "100%" }}
                        animate={{ x: "-100%" }}
                        transition={{ duration: LANE_DRAW_SECONDS / 2, ease: REVEAL_EASE }}
                    >
                        <span className="block size-full -scale-x-100">
                            <HeadlightStreak />
                        </span>
                    </motion.span>
                ) : null}
            </span>
            <span className={DOT} />
        </div>
    );
}
