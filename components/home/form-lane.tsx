"use client";
import clsx from "clsx";
import { motion } from "motion/react";
import { LANE_DRAW_SECONDS, REVEAL_EASE } from "@/lib/home/constants";

interface Props {
    origin: boolean;
    destination: boolean;
}

const DOT = "block size-3 shrink-0 rounded-full border-2 border-accent transition-colors duration-500";

export default function FormLane({ origin, destination }: Props) {
    return (
        <div aria-hidden className="flex items-center">
            <span className={clsx(DOT, origin ? "bg-accent" : "bg-transparent")} />
            <span className="bg-border-dark relative block h-0.5 flex-1">
                <motion.span
                    className="bg-accent absolute inset-0 origin-left"
                    initial={false}
                    animate={{ scaleX: origin && destination ? 1 : 0 }}
                    transition={{ duration: LANE_DRAW_SECONDS, ease: REVEAL_EASE }}
                />
            </span>
            <span className={clsx(DOT, destination ? "bg-accent" : "bg-transparent")} />
        </div>
    );
}
