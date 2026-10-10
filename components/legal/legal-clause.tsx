import type { ReactNode } from "react";
import { LEGAL_COPY } from "@/lib/data/legal/copy";
import type { LegalClause as Clause } from "@/lib/types";

interface Props {
    clause: Clause;
    number: number;
    children?: ReactNode;
}

export default function LegalClause({ clause, number, children }: Props) {
    const heading = `${clause.id}-title`;

    return (
        <section
            id={clause.id}
            aria-labelledby={heading}
            className="grid scroll-mt-[calc(var(--haulr-header)+2rem)] gap-3 sm:grid-cols-[3rem_minmax(0,1fr)]"
        >
            <a
                href={`#${clause.id}`}
                aria-label={LEGAL_COPY.clauseLink.replace("{number}", String(number)).replace("{title}", clause.title)}
                className="text-text-muted hover:text-accent focus-visible:outline-text self-start pt-1 font-mono text-sm tabular-nums transition-colors focus-visible:outline-2"
            >
                §{number}
            </a>
            <div className="flex min-w-0 flex-col gap-3">
                <h2 id={heading} className="text-text text-xl tracking-tight" style={{ fontStretch: "var(--haulr-semi)" }}>
                    {clause.title}
                </h2>
                {clause.body.map((paragraph) => (
                    <p key={paragraph} className="text-text-secondary leading-relaxed text-pretty">
                        {paragraph}
                    </p>
                ))}
                {children}
            </div>
        </section>
    );
}
