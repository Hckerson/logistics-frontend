"use client";
import clsx from "clsx";
import { motion } from "motion/react";
import { REGISTER_COPY } from "@/lib/data/auth/register";
import { POINTER_SPRING } from "@/lib/home/constants";
import type { AccountSide } from "@/lib/types";

interface Props {
    name: string;
    value: AccountSide | null;
    error: boolean;
    onChoose: (side: AccountSide) => void;
}

const HIGHLIGHT_ID = "haulr-account-side";
const { options } = REGISTER_COPY.side;

export default function SidePicker({ name, value, error, onChoose }: Props) {
    return (
        <div className={clsx("flex flex-col border transition-colors", error ? "border-error/70" : "border-border-dark")}>
            {options.map((option, index) => {
                const checked = option.value === value;
                return (
                    <label
                        key={option.value}
                        className={clsx(
                            "group has-focus-visible:outline-text relative flex cursor-pointer items-center gap-4 px-4 py-3.5 has-focus-visible:outline-2 has-focus-visible:-outline-offset-2",
                            index > 0 && "border-border-dark border-t",
                        )}
                    >
                        <input
                            type="radio"
                            name={name}
                            value={option.value}
                            checked={checked}
                            onChange={() => onChoose(option.value)}
                            className="sr-only"
                        />
                        {checked ? (
                            <motion.span
                                layoutId={HIGHLIGHT_ID}
                                aria-hidden
                                transition={{ type: "spring", ...POINTER_SPRING }}
                                className="bg-background-muted/70 border-accent absolute inset-0 border-l-2"
                            />
                        ) : null}
                        <span className="sr-only">{option.title}</span>
                        <span
                            aria-hidden
                            className={clsx(
                                "relative w-14 shrink-0 text-xl leading-none font-light tracking-tight transition-colors duration-300 font-stretch-(--haulr-wide)",
                                checked ? "text-text" : "text-text-secondary group-hover:text-text",
                            )}
                        >
                            {option.word}
                        </span>
                        <span
                            className={clsx(
                                "relative min-w-0 flex-1 text-xs transition-colors duration-300",
                                checked ? "text-text-secondary" : "text-text-muted",
                            )}
                        >
                            {option.detail}
                        </span>
                        <span
                            aria-hidden
                            className={clsx(
                                "relative grid size-4 shrink-0 place-items-center rounded-full border transition-colors duration-300",
                                checked ? "border-accent" : "border-text-muted group-hover:border-text-secondary",
                            )}
                        >
                            <span
                                className={clsx(
                                    "bg-accent size-2 rounded-full transition-transform duration-300",
                                    checked ? "scale-100" : "scale-0",
                                )}
                            />
                        </span>
                    </label>
                );
            })}
        </div>
    );
}
