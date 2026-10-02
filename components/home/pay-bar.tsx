"use client";
import clsx from "clsx";
import { motion } from "motion/react";
import { LANE_DRAW_SECONDS, REVEAL_EASE } from "@/lib/home/constants";
import { PAY_SCALE_DAYS } from "@/lib/data/home/pay";
import type { PayTerm } from "@/lib/types";

interface Props {
    term: PayTerm;
    order: number;
}

const STAGGER = 0.18;
const MIN_SHARE = 0.012;

export default function PayBar({ term, order }: Props) {
    const share = Math.max(term.days / PAY_SCALE_DAYS, MIN_SHARE);

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
            <div aria-hidden className="bg-background-muted h-3 overflow-hidden rounded-full">
                <motion.span
                    className={clsx(
                        "block h-full origin-left rounded-full",
                        term.featured ? "bg-accent" : "bg-border-dark",
                    )}
                    style={{ width: `${share * 100}%` }}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: LANE_DRAW_SECONDS, delay: order * STAGGER, ease: REVEAL_EASE }}
                />
            </div>
        </div>
    );
}
