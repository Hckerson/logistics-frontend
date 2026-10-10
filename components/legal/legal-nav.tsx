import clsx from "clsx";
import Link from "next/link";
import { legalRoute } from "@/lib/constants";
import { LEGAL_COPY } from "@/lib/data/legal/copy";
import { LEGAL_LIBRARY } from "@/lib/data/legal/library";
import { LEGAL_DOCUMENTS } from "@/lib/legal/constants";
import type { LegalDocumentKey } from "@/lib/types";

interface Props {
    active: LegalDocumentKey;
}

const order = (index: number) => String(index + 1).padStart(2, "0");

export default function LegalNav({ active }: Props) {
    return (
        <nav aria-label={LEGAL_COPY.documents} className="flex flex-col gap-3">
            <p className="haulr-label text-text-muted">{LEGAL_COPY.documents}</p>
            <ul className="border-border flex flex-col border-l">
                {LEGAL_DOCUMENTS.map((key, index) => (
                    <li key={key}>
                        <Link
                            href={legalRoute(key)}
                            aria-current={key === active ? "page" : undefined}
                            className={clsx(
                                "focus-visible:outline-text -ml-px flex items-baseline gap-3 border-l py-1.5 pl-4 text-sm transition-colors focus-visible:outline-2",
                                key === active ? "border-accent text-text" : "text-text-muted hover:text-text border-transparent",
                            )}
                        >
                            <span className="haulr-label">{order(index)}</span>
                            {LEGAL_LIBRARY[key].title}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
