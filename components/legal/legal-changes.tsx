import { LEGAL_COPY } from "@/lib/data/legal/copy";
import type { LegalVersion } from "@/lib/types";

interface Props {
    edition: LegalVersion;
}

export default function LegalChanges({ edition }: Props) {
    const heading = `${edition.version}-changes`;

    return (
        <section aria-labelledby={heading} className="border-border flex flex-col gap-4 border-y py-6">
            <h2 id={heading} className="haulr-label text-text-muted">
                {LEGAL_COPY.changes.replace("{version}", edition.version)}
            </h2>
            <ul className="flex flex-col gap-3">
                {edition.changes.map((change) => (
                    <li key={change} className="text-text-secondary flex gap-3 text-sm">
                        <span aria-hidden className="bg-accent mt-2 size-1 shrink-0 rounded-full" />
                        {change}
                    </li>
                ))}
            </ul>
        </section>
    );
}
