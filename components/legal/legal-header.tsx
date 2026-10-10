import { LEGAL_COPY } from "@/lib/data/legal/copy";
import type { LegalDocument } from "@/lib/types";

interface Props {
    document: LegalDocument;
}

export default function LegalHeader({ document }: Props) {
    return (
        <header className="flex max-w-3xl flex-col gap-5">
            <p className="haulr-label text-accent-dark">{LEGAL_COPY.label}</p>
            <h1 className="haulr-title text-text overflow-hidden pb-[0.08em]">
                <span className="haulr-rise block">{document.title}</span>
            </h1>
            <p className="text-text-secondary max-w-xl text-(length:--haulr-lead) text-pretty">{document.summary}</p>
            <p className="haulr-label text-text-muted">{LEGAL_COPY.placeholder}</p>
        </header>
    );
}
