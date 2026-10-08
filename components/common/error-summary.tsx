"use client";
import Link from "next/link";
import { useEffect, useId, useRef, type MouseEvent } from "react";
import type { AccountField, FormProblem } from "@/lib/types";

interface Props {
    problems: readonly FormProblem[];
    attempt: number;
    heading: string;
    count: string;
    fieldId: (field: AccountField) => string;
}

const LINK = "text-text-secondary hover:text-text decoration-error/70 underline underline-offset-4 transition-colors";

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
            role={attempt === 1 ? "alert" : "region"}
            aria-labelledby={headingId}
            className="border-error focus-visible:bg-error-light/60 flex flex-col gap-2 border-l-2 py-2 pr-3 pl-4 transition-colors outline-none"
        >
            <p id={headingId} className="flex items-baseline gap-3">
                <span className="text-text text-sm font-medium">{heading}</span>
                <span className="haulr-label text-error">{count}</span>
            </p>
            <ul className="flex flex-col gap-1 text-sm">
                {problems.map((problem) => (
                    <li key={problem.message} className="flex flex-wrap gap-x-3 gap-y-1">
                        {problem.field ? (
                            <a href={`#${fieldId(problem.field)}`} onClick={focusField(fieldId(problem.field))} className={LINK}>
                                {problem.message}
                            </a>
                        ) : (
                            <span className="text-text-secondary">{problem.message}</span>
                        )}
                        {problem.links?.map((link) => (
                            <Link key={link.id} href={link.href} className={LINK}>
                                {link.label}
                            </Link>
                        ))}
                    </li>
                ))}
            </ul>
        </div>
    );
}
