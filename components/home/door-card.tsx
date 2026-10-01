"use client";
import clsx from "clsx";
import { motion } from "motion/react";
import { ArrowRight } from "@carbon/icons-react";
import HaulrButton from "@/components/home/haulr-button";
import { LANE_DRAW_SECONDS, REVEAL_EASE } from "@/lib/home/constants";
import type { Door } from "@/lib/types";

interface Props {
    door: Door;
    active: boolean;
    order: number;
    shown: boolean;
}

const STAGGER = 0.15;

const CLOSED = "inset(0 0 100% 0)";
const OPEN = "inset(0 0 0% 0)";

export default function DoorCard({ door, active, order, shown }: Props) {
    return (
        <motion.article
            layout
            initial={{ clipPath: CLOSED }}
            animate={{ clipPath: shown ? OPEN : CLOSED }}
            transition={{ duration: LANE_DRAW_SECONDS, delay: order * STAGGER, ease: REVEAL_EASE }}
            className={clsx(
                "flex flex-col gap-8 rounded-sm border p-6 transition-colors duration-500 sm:p-10",
                active
                    ? "border-text bg-text text-text-inverse lg:col-span-7"
                    : "border-border-dark bg-background text-text lg:col-span-5",
            )}
        >
            <p className={clsx("haulr-label", active ? "text-accent" : "text-text-muted")}>{door.label}</p>
            <h3 className="text-3xl leading-tight font-normal tracking-tight sm:text-4xl">{door.title}</h3>
            <ul className="flex flex-col gap-3">
                {door.points.map((point) => (
                    <li key={point} className="flex items-baseline gap-3">
                        <span aria-hidden className="bg-accent size-1.5 shrink-0 -translate-y-0.5 rounded-full" />
                        <span className={active ? "text-text-inverse/80" : "text-text-secondary"}>{point}</span>
                    </li>
                ))}
            </ul>
            <HaulrButton href={door.cta.href} tone={active ? "accent" : "ghost"} className="mt-auto self-start">
                {door.cta.label}
                <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
            </HaulrButton>
        </motion.article>
    );
}
