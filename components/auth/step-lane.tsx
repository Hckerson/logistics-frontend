"use client";
import clsx from "clsx";
import { motion } from "motion/react";
import { LANE_STOPS, METER_AT, TRUCK_RUN } from "@/lib/auth/constants";
import { REVEAL_EASE } from "@/lib/home/constants";
import type { AuthSignal } from "@/lib/types";

interface Props {
    signal: AuthSignal;
}

export default function StepLane({ signal }: Props) {
    const at = METER_AT[signal];
    const creeping = signal === "pending";
    const transition = { duration: creeping ? TRUCK_RUN.creepSeconds : 1, ease: creeping ? "easeOut" : REVEAL_EASE } as const;

    return (
        <div aria-hidden className="flex flex-col gap-2">
            <div className="bg-background-muted relative h-1.5 rounded-full">
                <motion.span
                    className={clsx("absolute inset-0 origin-left rounded-full", signal === "held" ? "bg-error" : "bg-accent")}
                    initial={false}
                    animate={{ scaleX: at }}
                    transition={transition}
                />
                <motion.span className="absolute inset-0" initial={false} animate={{ x: `${at * 100}%` }} transition={transition}>
                    <span className="absolute top-1/2 left-0 size-3 -translate-1/2 rounded-full bg-(--haulr-hot) shadow-[0_0_10px_var(--colors-accent)]" />
                </motion.span>
            </div>
            <div className="flex justify-between font-mono text-xs">
                {LANE_STOPS.map((code, index) => (
                    <span
                        key={code}
                        className={clsx(
                            "transition-colors duration-500",
                            at >= index / (LANE_STOPS.length - 1) ? "text-text-secondary" : "text-text-muted",
                        )}
                    >
                        {code}
                    </span>
                ))}
            </div>
        </div>
    );
}
