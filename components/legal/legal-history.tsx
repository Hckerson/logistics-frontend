import Link from "next/link";
import { QUIET_LINK } from "@/lib/auth/constants";
import { legalRoute } from "@/lib/constants";
import { LEGAL_COPY } from "@/lib/data/legal/copy";
import { legalDate } from "@/lib/legal/edition";
import type { LegalEdition } from "@/lib/types";

interface Props {
    found: LegalEdition;
}

const { history } = LEGAL_COPY;

export default function LegalHistory({ found }: Props) {
    const { document, edition, current } = found;

    return (
        <section aria-labelledby="version-history" className="flex flex-col gap-4 print:hidden">
            <h2 id="version-history" className="haulr-label text-text-muted">
                {history.label}
            </h2>
            <ol className="border-border-dark border-t">
                {document.versions.map(({ version, effective }) => (
                    <li key={version} className="border-border flex items-baseline justify-between gap-4 border-b py-3 text-sm">
                        <span className="flex items-baseline gap-4">
                            <span className="text-text w-10 font-mono tabular-nums">{version}</span>
                            <span className="text-text-muted">{legalDate(effective)}</span>
                            {version === current.version ? (
                                <span className="haulr-label text-text-muted hidden sm:inline">{history.current}</span>
                            ) : null}
                        </span>
                        {version === edition.version ? (
                            <span className="haulr-label text-accent">{history.reading}</span>
                        ) : (
                            <Link
                                href={legalRoute(document.key, version === current.version ? undefined : version)}
                                className={QUIET_LINK}
                            >
                                {history.read.replace("{version}", version)}
                            </Link>
                        )}
                    </li>
                ))}
            </ol>
        </section>
    );
}
