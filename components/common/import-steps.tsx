import clsx from "clsx";
import { Checkmark } from "@carbon/icons-react";
import { IMPORT_COPY } from "@/lib/data/loads/import-copy";
import { IMPORT_STEPS } from "@/lib/loads/imports";
import type { ImportStep } from "@/lib/types";

interface Props {
    current: ImportStep;
}

const MARK = {
    done: "border-text text-text",
    current: "border-text bg-text text-text-inverse",
    next: "border-border text-text-muted",
} as const;

export default function ImportSteps({ current }: Props) {
    const at = IMPORT_STEPS.indexOf(current);

    return (
        <ol aria-label={IMPORT_COPY.stepsLabel} className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
            {IMPORT_STEPS.map((step, index) => {
                const state = index < at || current === "done" ? "done" : index === at ? "current" : "next";
                return (
                    <li key={step} aria-current={state === "current" ? "step" : undefined} className={clsx("flex items-center gap-2", state === "next" ? "text-text-muted" : "text-text")}>
                        <span aria-hidden className={clsx("grid size-5 place-items-center border font-mono text-xs transition-colors duration-300", MARK[state])}>
                            {state === "done" ? <Checkmark className="size-3" /> : index + 1}
                        </span>
                        {IMPORT_COPY.steps[step]}
                        <span className="sr-only">{IMPORT_COPY.stepState[state]}</span>
                    </li>
                );
            })}
        </ol>
    );
}
