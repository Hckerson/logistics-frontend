"use client";
import clsx from "clsx";
import { useMemo } from "react";
import { LEGAL_COPY } from "@/lib/data/legal/copy";
import { useActiveSection } from "@/lib/hooks/use-active-section";
import type { LegalClause } from "@/lib/types";

interface Props {
    clauses: readonly LegalClause[];
}

export default function LegalContents({ clauses }: Props) {
    const ids = useMemo(() => clauses.map((clause) => clause.id), [clauses]);
    const active = useActiveSection(ids);

    return (
        <nav aria-label={LEGAL_COPY.contents} className="hidden flex-col gap-3 lg:flex">
            <p className="haulr-label text-text-muted">{LEGAL_COPY.contents}</p>
            <ol className="flex flex-col gap-1">
                {clauses.map((clause, index) => (
                    <li key={clause.id}>
                        <a
                            href={`#${clause.id}`}
                            aria-current={clause.id === active ? "location" : undefined}
                            className={clsx(
                                "focus-visible:outline-text flex items-center gap-3 py-1 text-xs transition-colors focus-visible:outline-2",
                                clause.id === active ? "text-text" : "text-text-muted hover:text-text-secondary",
                            )}
                        >
                            <span
                                aria-hidden
                                className={clsx("h-px w-3 shrink-0 transition-colors", clause.id === active ? "bg-accent" : "bg-border-dark")}
                            />
                            <span className="w-4 shrink-0 font-mono tabular-nums">{index + 1}</span>
                            {clause.title}
                        </a>
                    </li>
                ))}
            </ol>
        </nav>
    );
}
