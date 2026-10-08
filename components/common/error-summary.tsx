"use client";
import { useEffect, useId, useRef, type MouseEvent } from "react";
import type { FormProblem } from "@/lib/types";

interface Props {
    problems: readonly FormProblem[];
    attempt: number;
    heading: string;
    count: string;
    fieldId: (field: NonNullable<FormProblem["field"]>) => string;
}

export default function ErrorSummary({ problems, attempt, heading, count, fieldId }: Props) {
    const ref = useRef<HTMLDivElement>(null);
    const headingId = useId();

    useEffect(() => {
        if (attempt > 0) ref.current?.focus();
    }, [attempt]);

    if (problems.length === 0) return null;

    const focusField = (id: string) => (event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        document.getElementById(id)?.focus();
    };

    return (
        <div
            ref={ref}
            tabIndex={-1}
            role="alert"
            aria-labelledby={headingId}
            className="border-error bg-error-light focus-visible:outline-error flex flex-col gap-2 rounded-sm border-l-2 px-4 py-3 focus-visible:outline-2"
        >
            <p id={headingId} className="text-text font-medium">
                {heading} <span className="text-text-muted font-normal">· {count}</span>
            </p>
            <ul className="flex flex-col gap-1 text-sm">
                {problems.map((problem) => (
                    <li key={problem.message}>
                        {problem.field ? (
                            <a
                                href={`#${fieldId(problem.field)}`}
                                onClick={focusField(fieldId(problem.field))}
                                className="text-error underline underline-offset-4 hover:no-underline"
                            >
                                {problem.message}
                            </a>
                        ) : (
                            <span className="text-text-secondary">{problem.message}</span>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}
