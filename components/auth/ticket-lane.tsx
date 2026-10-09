"use client";
import clsx from "clsx";
import { motion } from "motion/react";
import ScrambleText from "@/components/common/scramble-text";
import { ASSEMBLY, LEG, METER_AT, TRUCK_RUN } from "@/lib/auth/constants";
import { partAt } from "@/lib/auth/entry";
import { AUTH_COPY } from "@/lib/data/auth/shared";
import { REVEAL_EASE } from "@/lib/home/constants";
import type { AuthSignal } from "@/lib/types";

interface Props {
    signal: AuthSignal;
    leg: number;
    delay: number;
}

const { from, to, load } = AUTH_COPY.ticket;
const CODE =
    "haulr-part text-text min-w-[2.4em] text-3xl leading-none font-light tracking-tight font-stretch-(--haulr-wide) [--haulr-part-y:-1rem]";
const STAGGER = 0.12;

export default function TicketLane({ signal, leg, delay }: Props) {
    const waiting = signal === "midway" || signal === "held";
    const at = METER_AT[signal] + (waiting ? LEG.meter * leg : 0);
    const held = signal === "held";
    const creeping = signal === "pending";
    const transition = { duration: creeping ? TRUCK_RUN.creepSeconds : 1, ease: creeping ? "easeOut" : REVEAL_EASE } as const;

    return (
        <div aria-hidden className="flex flex-col gap-3">
            <div className="flex items-center gap-4">
                <span className={CODE} style={partAt(ASSEMBLY.codes)}>
                    <ScrambleText text={from.code} delay={delay} />
                </span>
                <span className="haulr-boot-draw bg-border-dark relative block h-px flex-1" style={partAt(ASSEMBLY.line)}>
                    <motion.span
                        className={clsx("absolute inset-0 origin-left", held ? "bg-error" : "bg-accent")}
                        initial={false}
                        animate={{ scaleX: at }}
                        transition={transition}
                    />
                    <span
                        className={clsx(
                            "absolute top-1/2 left-1/2 size-1.5 -translate-1/2 rounded-full transition-colors duration-500",
                            at >= METER_AT.midway ? (held ? "bg-error" : "bg-accent") : "bg-border-dark",
                        )}
                    />
                    <motion.span className="absolute inset-0" initial={false} animate={{ x: `${at * 100}%` }} transition={transition}>
                        <span className="haulr-pop absolute top-1/2 left-0 size-2.5 -translate-1/2 rounded-full bg-(--haulr-hot) shadow-[0_0_12px_2px_var(--colors-accent)]" style={partAt(ASSEMBLY.perforation)} />
                    </motion.span>
                </span>
                <span className={clsx(CODE, "text-right")} style={partAt(ASSEMBLY.codes + 1)}>
                    <ScrambleText text={to.code} delay={delay + STAGGER} />
                </span>
            </div>
            <div className="haulr-part haulr-label text-text-muted flex justify-between" style={partAt(ASSEMBLY.line)}>
                <span>{from.city}</span>
                <span>{load}</span>
                <span>{to.city}</span>
            </div>
        </div>
    );
}
