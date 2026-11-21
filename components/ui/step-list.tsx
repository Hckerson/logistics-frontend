"use client";
import clsx from "clsx";
import { useId } from "react";
import { Checkmark } from "@carbon/icons-react";
import { Button as AriaButton } from "react-aria-components";
import { FOCUS_RING } from "@/lib/ui/constants";

type StepState = "done" | "current" | "open" | "locked";

interface StepItem<T extends string> {
    id: T;
    label: string;
    state: StepState;
    reason?: string;
}

interface Props<T extends string> {
    label: string;
    items: readonly StepItem<T>[];
    stateLabels: Record<StepState, string>;
    onSelect: (id: T) => void;
    className?: string;
}

const MARK: Record<StepState, string> = {
    done: "border-text text-text",
    current: "border-text bg-text text-text-inverse",
    open: "border-border-dark text-text-secondary",
    locked: "border-border text-text-muted",
};

const RULE: Record<StepState, string> = {
    done: "bg-text",
    current: "bg-text",
    open: "bg-border-dark",
    locked: "bg-border",
};

export default function StepList<T extends string>({ label, items, stateLabels, onSelect, className }: Props<T>) {
    const reasonBase = useId();

    return (
        <ol aria-label={label} className={clsx("flex items-center gap-2 text-xs", className)}>
            {items.map((item, index) => {
                const reasonId = `${reasonBase}-${item.id}`;
                const locked = item.state === "locked";
                const body = (
                    <>
                        <span aria-hidden className={clsx("grid size-5 shrink-0 place-items-center border font-mono transition-colors duration-300", MARK[item.state])}>
                            {item.state === "done" ? <Checkmark className="size-3" /> : index + 1}
                        </span>
                        <span className="truncate max-md:sr-only">{item.label}</span>
                        <span className="sr-only">{stateLabels[item.state]}</span>
                    </>
                );
                return (
                    <li key={item.id} aria-current={item.state === "current" ? "step" : undefined} className="flex min-w-0 items-center gap-2">
                        {index > 0 ? <span aria-hidden className={clsx("h-px w-4 shrink-0 transition-colors duration-300 sm:w-8", RULE[item.state])} /> : null}
                        {item.state === "current" ? (
                            <span className="text-text flex min-w-0 items-center gap-2 font-medium">{body}</span>
                        ) : (
                            <AriaButton
                                onPress={locked ? undefined : () => onSelect(item.id)}
                                aria-disabled={locked || undefined}
                                aria-describedby={locked && item.reason ? reasonId : undefined}
                                className={clsx(
                                    FOCUS_RING,
                                    "flex min-w-0 items-center gap-2 transition-colors",
                                    locked ? "text-text-muted cursor-not-allowed" : "text-text-secondary hover:text-text cursor-pointer",
                                )}
                            >
                                {body}
                            </AriaButton>
                        )}
                        {locked && item.reason ? (
                            <span id={reasonId} hidden>
                                {item.reason}
                            </span>
                        ) : null}
                    </li>
                );
            })}
        </ol>
    );
}
