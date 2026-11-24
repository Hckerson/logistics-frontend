"use client";
import { useState } from "react";
import { Document, Download, View } from "@carbon/icons-react";
import DocumentPreview from "@/components/common/document-preview";
import IconButton from "@/components/ui/icon-button";
import StatusLabel from "@/components/ui/status-label";
import type { DocumentDto } from "@/lib/contract/schemas";
import { DOCUMENT_PREVIEW_COPY } from "@/lib/data/documents/preview";
import { LOAD_RECORD_COPY } from "@/lib/data/loads/record-copy";
import { useDocumentDownload } from "@/lib/hooks/use-documents";
import { stopMoment } from "@/lib/loads/view";
import type { PreviewSource, SignalTone } from "@/lib/types";
import { fillTemplate } from "@/lib/utils/fill-template";
import { fileSize } from "@/lib/utils/format-number";

interface Props {
    document: DocumentDto;
    zone: string;
    anchor?: string;
    set?: readonly DocumentDto[];
}

const { documents: copy } = LOAD_RECORD_COPY;
const LOAD_SOURCE: PreviewSource = { kind: "load" };

const TONES: Record<DocumentDto["scanStatus"], SignalTone> = {
    awaitingUpload: "muted",
    pending: "live",
    clean: "success",
    rejected: "danger",
    failed: "danger",
};

export default function DocumentRow({ document, zone, anchor, set }: Props) {
    const { id, type, version, fileName, sizeBytes, scanStatus, uploadedByName, createdAt } = document;
    const download = useDocumentDownload();
    const [previewing, setPreviewing] = useState(false);
    const pages = set && set.some((item) => item.id === id) ? set : [document];
    const name = copy.types[type];

    const open = () => download.mutate(id, { onSuccess: ({ url }) => window.location.assign(url) });

    return (
        <li id={anchor} className="border-border flex scroll-mt-24 items-start gap-3 border-t py-2.5 first:border-t-0 first:pt-0">
            <Document aria-hidden className="text-text-muted mt-0.5 size-4 shrink-0" />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-xs">
                <p className="text-text">
                    {name}
                    {version > 1 ? <span className="text-text-muted"> · {fillTemplate(copy.version, { version: String(version) })}</span> : null}
                </p>
                <p className="text-text-muted truncate">
                    {fileName} · {fileSize(sizeBytes)}
                </p>
                <p className="text-text-muted">{fillTemplate(copy.by, { name: uploadedByName, time: stopMoment(createdAt, zone) })}</p>
                {scanStatus === "rejected" ? <p className="text-error">{copy.rejected}</p> : null}
                {download.isError ? (
                    <p role="alert" className="text-error">
                        {copy.downloadFailed}
                    </p>
                ) : null}
            </div>
            {scanStatus === "clean" ? (
                <span className="flex shrink-0 items-center gap-1">
                    <IconButton label={fillTemplate(DOCUMENT_PREVIEW_COPY.open, { name })} icon={View} size="sm" onPress={() => setPreviewing(true)} />
                    <IconButton label={fillTemplate(copy.download, { name })} icon={Download} size="sm" pending={download.isPending} onPress={open} />
                </span>
            ) : (
                <StatusLabel label={copy.states[scanStatus]} tone={TONES[scanStatus]} pulse={scanStatus === "pending"} className="mt-0.5" />
            )}
            {previewing ? (
                <DocumentPreview
                    source={LOAD_SOURCE}
                    documents={pages}
                    start={Math.max(pages.findIndex((item) => item.id === id), 0)}
                    zone={zone}
                    downloading={download.isPending}
                    onDownload={(documentId) => download.mutate(documentId, { onSuccess: ({ url }) => window.location.assign(url) })}
                    onClose={() => setPreviewing(false)}
                />
            ) : null}
        </li>
    );
}
