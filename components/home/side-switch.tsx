"use client";
import clsx from "clsx";
import { motion } from "motion/react";
import { useSide } from "@/lib/hooks/use-side";
import { SIDE_SWITCH } from "@/lib/data/home/brand";
import { POINTER_SPRING } from "@/lib/home/constants";

const THUMB_ID = "haulr-side-thumb";

export default function SideSwitch() {
    const { side, setSide } = useSide();

    return (
        <div
            role="radiogroup"
            aria-label={SIDE_SWITCH.label}
            className="border-border-dark bg-background inline-flex rounded-sm border p-0.5"
        >
            {SIDE_SWITCH.options.map((option) => {
                const active = option.side === side;
                return (
                    <button
                        key={option.side}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setSide(option.side)}
                        className={clsx(
                            "haulr-label focus-visible:outline-text relative h-8 cursor-pointer px-4 transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2",
                            active ? "text-text-inverse" : "text-text-muted hover:text-text",
                        )}
                    >
                        {active ? (
                            <motion.span
                                layoutId={THUMB_ID}
                                aria-hidden
                                transition={{ type: "spring", ...POINTER_SPRING }}
                                className="bg-text absolute inset-0 rounded-xs"
                            />
                        ) : null}
                        <span className="relative">{option.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
