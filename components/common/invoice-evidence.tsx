"use client";
import { getLocalTimeZone } from "@internationalized/date";
import DocumentRow from "@/components/common/document-row";
import SectionState from "@/components/common/section-state";
import Panel from "@/components/ui/panel";
import type { DocumentDto } from "@/lib/contract/schemas";
import { evidenceAnchor } from "@/lib/billing/invoice-view";
import { INVOICE_COPY } from "@/lib/data/billing/invoice-copy";
import { useDocuments } from "@/lib/hooks/use-documents";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    loadId: string;
}

const { evidence: copy } = INVOICE_COPY;
const EVIDENCE: readonly DocumentDto["type"][] = ["pod", "rateConfirmation", "lumperReceipt", "bol"];

export default function InvoiceEvidence({ loadId }: Props) {
    const documents = useDocuments(loadId);
    const zone = getLocalTimeZone();

    return (
        <Panel label={copy.label}>
            <div className="flex flex-col gap-3">
                <p className="text-text-muted text-xs">{fillTemplate(copy.lead, { load: loadId })}</p>
                <SectionState
                    label={copy.label}
                    query={documents}
                    isEmpty={(list) => !list.some((document) => EVIDENCE.includes(document.type))}
                    empty={<p className="text-text-muted text-xs">{copy.empty}</p>}
                >
                    {(list) => (
                        <ul className="flex flex-col">
                            {list
                                .filter((document) => EVIDENCE.includes(document.type))
                                .map((document) => (
                                    <DocumentRow key={document.id} id={evidenceAnchor(document.id)} document={document} zone={zone} />
                                ))}
                        </ul>
                    )}
                </SectionState>
            </div>
        </Panel>
    );
}
