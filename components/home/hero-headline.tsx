"use client";
import { AnimatePresence, motion } from "motion/react";
import { HEADLINE_STAGGER, REVEAL_EASE } from "@/lib/home/constants";

interface Props {
    id: string;
    lines: readonly string[];
}

const SECONDS = 0.9;

export default function HeroHeadline({ id, lines }: Props) {
    return (
        <h1 className="haulr-display text-text">
            <AnimatePresence mode="wait" initial={false}>
                <motion.span key={id} className="block">
                    {lines.map((line, index) => (
                        <span key={line} className="block overflow-hidden pb-[0.08em]">
                            <motion.span
                                className="haulr-rise block"
                                style={{ animationDelay: `${index * HEADLINE_STAGGER}s` }}
                                initial={{ y: "105%" }}
                                animate={{ y: 0 }}
                                exit={{ y: "-105%" }}
                                transition={{
                                    duration: SECONDS,
                                    delay: index * HEADLINE_STAGGER,
                                    ease: REVEAL_EASE,
                                }}
                            >
                                {line}
                            </motion.span>
                        </span>
                    ))}
                </motion.span>
            </AnimatePresence>
        </h1>
    );
}
