"use client";
import { useState } from "react";
import DocumentRow from "@/components/common/document-row";
import DocumentUpload from "@/components/common/document-upload";
import SectionState from "@/components/common/section-state";
import Panel from "@/components/ui/panel";
import Select from "@/components/ui/select";
import { useSession } from "@/components/providers/session-provider";
import { can } from "@/lib/auth/capabilities";
import type { DocumentDto, LoadDto } from "@/lib/contract/schemas";
import { LOAD_RECORD_COPY } from "@/lib/data/loads/record-copy";
import { useDocuments } from "@/lib/hooks/use-documents";
import { useLoad } from "@/lib/hooks/use-loads";
import { ACTIVE_LOAD_STATUSES } from "@/lib/loads/constants";
import { zoneAt } from "@/lib/loads/timeline";
import { deliveredAt } from "@/lib/loads/tracking";
import type { ChoiceOption, DocumentFilter } from "@/lib/types";

interface Props {
    initial: LoadDto;
}

const { documents: copy } = LOAD_RECORD_COPY;

const pagesOf = (list: readonly DocumentDto[], document: DocumentDto) =>
    list.filter((item) => item.type === document.type && item.scanStatus === "clean" && item.contentType !== "application/pdf");

export default function LoadDocuments({ initial }: Props) {
    const { data: load = initial } = useLoad(initial.id, initial);
    const roles = useSession()?.roles ?? [];
    const documents = useDocuments(load.id);
    const delivered = deliveredAt(load.stops) !== null;
    const missingPod = documents.data ? !documents.data.some((document) => document.type === "pod" && document.scanStatus !== "rejected") : false;
    const [chosen, setChosen] = useState<DocumentFilter>("all");
    const present = [...new Set(documents.data?.map((document) => document.type) ?? [])];
    const kind = chosen !== "all" && present.includes(chosen) ? chosen : "all";
    const options: ChoiceOption<DocumentFilter>[] = [{ value: "all", label: copy.allTypes }, ...present.map((type) => ({ value: type, label: copy.types[type] }))];

    return (
        <Panel
            label={copy.label}
            aside={
                documents.data ? (
                    <div className="flex items-center gap-3">
                        {present.length > 1 ? <Select size="sm" label={copy.filter} options={options} value={kind} onChange={setChosen} className="w-40" /> : null}
                        <span className="haulr-label text-text-muted">{documents.data.length}</span>
                    </div>
                ) : null
            }
        >
            <SectionState
                label={copy.label}
                query={documents}
                isEmpty={(list) => list.length === 0}
                empty={<p className="text-text-muted text-xs">{copy.none}</p>}
            >
                {(list) => (
                    <ul className="flex flex-col">
                        {list.filter((document) => kind === "all" || document.type === kind).map((document) => (
                            <DocumentRow key={document.id} document={document} zone={zoneAt(load.stops, document.createdAt)} set={pagesOf(list, document)} />
                        ))}
                    </ul>
                )}
            </SectionState>
            {missingPod && !delivered && ACTIVE_LOAD_STATUSES.includes(load.status) ? <p className="text-text-muted text-xs">{copy.podExpected}</p> : null}
            {missingPod && delivered ? <p className="text-signal-warning text-xs">{copy.podOutstanding}</p> : null}
            {can(roles, "uploadDocument") ? <DocumentUpload loadId={load.id} /> : null}
        </Panel>
    );
}
