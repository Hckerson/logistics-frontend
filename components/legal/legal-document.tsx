import LegalChanges from "@/components/legal/legal-changes";
import LegalClause from "@/components/legal/legal-clause";
import LegalContents from "@/components/legal/legal-contents";
import LegalHeader from "@/components/legal/legal-header";
import LegalHistory from "@/components/legal/legal-history";
import LegalNav from "@/components/legal/legal-nav";
import LegalRecord from "@/components/legal/legal-record";
import SubProcessors from "@/components/legal/sub-processors";
import { PROVIDERS_CLAUSE } from "@/lib/legal/constants";
import type { LegalEdition } from "@/lib/types";

interface Props {
    found: LegalEdition;
}

export default function LegalDocument({ found }: Props) {
    const { document, edition, replacedBy } = found;
    const providers = replacedBy ? null : document.subProcessors;

    return (
        <div className="haulr-shell flex flex-col gap-10 pt-[calc(var(--haulr-header)+3rem)] pb-20 lg:gap-14 lg:pt-[calc(var(--haulr-header)+5rem)] print:pt-0">
            <LegalHeader document={document} />
            <div className="grid gap-10 lg:grid-cols-[14rem_minmax(0,44rem)] lg:gap-16 xl:gap-24">
                <aside className="flex flex-col gap-8 lg:sticky lg:top-[calc(var(--haulr-header)+2rem)] lg:self-start print:hidden">
                    <LegalNav active={document.key} />
                    <LegalContents clauses={edition.clauses} />
                </aside>
                <article className="flex min-w-0 flex-col gap-10">
                    <LegalRecord found={found} />
                    <LegalChanges edition={edition} />
                    {edition.clauses.map((clause, index) => (
                        <LegalClause key={clause.id} clause={clause} number={index + 1}>
                            {clause.id === PROVIDERS_CLAUSE && providers ? <SubProcessors providers={providers} /> : null}
                        </LegalClause>
                    ))}
                    <LegalHistory found={found} />
                </article>
            </div>
        </div>
    );
}
