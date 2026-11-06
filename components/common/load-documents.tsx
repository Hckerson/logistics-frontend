"use client";
import DocumentRow from "@/components/common/document-row";
import DocumentUpload from "@/components/common/document-upload";
import SectionState from "@/components/common/section-state";
import Panel from "@/components/ui/panel";
import { useSession } from "@/components/providers/session-provider";
import { can } from "@/lib/auth/capabilities";
import type { LoadDto } from "@/lib/contract/schemas";
import { LOAD_RECORD_COPY } from "@/lib/data/loads/record-copy";
import { useDocuments } from "@/lib/hooks/use-documents";
import { useLoad } from "@/lib/hooks/use-loads";
import { ACTIVE_LOAD_STATUSES } from "@/lib/loads/constants";
import { zoneAt } from "@/lib/loads/timeline";
import { deliveredAt } from "@/lib/loads/tracking";

interface Props {
    initial: LoadDto;
}

const { documents: copy } = LOAD_RECORD_COPY;

export default function LoadDocuments({ initial }: Props) {
    const { data: load = initial } = useLoad(initial.id, initial);
    const roles = useSession()?.roles ?? [];
    const documents = useDocuments(load.id);
    const delivered = deliveredAt(load.stops) !== null;
    const missingPod = documents.data ? !documents.data.some((document) => document.type === "pod" && document.scanStatus !== "rejected") : false;

    return (
        <Panel label={copy.label} aside={documents.data ? <span className="haulr-label text-text-muted">{documents.data.length}</span> : null}>
            <SectionState
                label={copy.label}
                query={documents}
                isEmpty={(list) => list.length === 0}
                empty={<p className="text-text-muted text-xs">{copy.none}</p>}
            >
                {(list) => (
                    <ul className="flex flex-col">
                        {list.map((document) => (
                            <DocumentRow key={document.id} document={document} zone={zoneAt(load.stops, document.createdAt)} />
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
