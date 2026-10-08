"use client";
import clsx from "clsx";
import { motion } from "motion/react";
import { LANE_DRAW_SECONDS, REVEAL_EASE, REVEAL_VIEWPORT } from "@/lib/home/constants";
import { PAY_SCALE_DAYS } from "@/lib/data/home/pay";
import type { PayTerm } from "@/lib/types";

interface Props {
    term: PayTerm;
    order: number;
}

const STAGGER = 0.18;

export default function PayBar({ term, order }: Props) {
    const share = `${(term.days / PAY_SCALE_DAYS) * 100}%`;
    const delay = order * STAGGER;

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-baseline justify-between gap-4">
                <dt className={term.featured ? "text-text" : "text-text-muted"}>{term.label}</dt>
                <dd
                    className={clsx(
                        "font-mono text-2xl tabular-nums sm:text-3xl",
                        term.featured ? "text-accent" : "text-text-muted",
                    )}
                >
                    {term.value}
                </dd>
            </div>
            <div aria-hidden className="relative h-6">
                <span className="bg-border-dark absolute inset-x-0 top-1/2 h-px" />
                <motion.span
                    className={clsx(
                        "absolute top-1/2 left-0 h-0.5 origin-left -translate-y-1/2",
                        term.featured ? "bg-accent" : "bg-text-muted",
                    )}
                    style={{ width: share }}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={REVEAL_VIEWPORT}
                    transition={{ duration: LANE_DRAW_SECONDS, delay, ease: REVEAL_EASE }}
                />
                <motion.span
                    className="absolute top-1/2 flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center"
                    style={{ left: share }}
                    initial={{ opacity: 0, scale: 0.4 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={REVEAL_VIEWPORT}
                    transition={{ duration: LANE_DRAW_SECONDS / 2, delay: delay + LANE_DRAW_SECONDS * 0.7, ease: REVEAL_EASE }}
                >
                    {term.featured ? (
                        <span className="from-accent/45 absolute inset-0 rounded-full bg-radial to-transparent" />
                    ) : null}
                    <span
                        className={clsx(
                            "relative block size-3 rounded-full",
                            term.featured ? "bg-accent" : "border-text-muted bg-background border-2",
                        )}
                    />
                </motion.span>
            </div>
        </div>
    );
}
