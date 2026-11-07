"use client";
import { Download } from "@carbon/icons-react";
import Button from "@/components/ui/button";
import Disclosure from "@/components/ui/disclosure";
import type { LoadEventDto } from "@/lib/contract/schemas";
import { LOAD_RECORD_COPY } from "@/lib/data/loads/record-copy";
import { useDocumentDownload } from "@/lib/hooks/use-documents";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    event: Pick<LoadEventDto, "city" | "documentId">;
}

const { timeline: copy, documents } = LOAD_RECORD_COPY;

export default function EventEvidence({ event: { city, documentId } }: Props) {
    const download = useDocumentDownload();

    if (!city && !documentId) return null;

    const open = (id: string) => download.mutate(id, { onSuccess: ({ url }) => window.location.assign(url) });

    return (
        <Disclosure title={copy.evidence} level={4} className="border-b-0!">
            <div className="flex flex-col items-start gap-1.5">
                {city ? <p>{fillTemplate(copy.recordedAt, { city })}</p> : null}
                {documentId ? (
                    <Button tone="link" size="inline" icon={Download} pending={download.isPending} onPress={() => open(documentId)}>
                        {copy.openDocument}
                    </Button>
                ) : null}
                {download.isError ? (
                    <p role="alert" className="text-error">
                        {documents.downloadFailed}
                    </p>
                ) : null}
            </div>
        </Disclosure>
    );
}
