"use client";
import { Document, Download } from "@carbon/icons-react";
import IconButton from "@/components/ui/icon-button";
import StatusLabel from "@/components/ui/status-label";
import type { DocumentDto } from "@/lib/contract/schemas";
import { LOAD_RECORD_COPY } from "@/lib/data/loads/record-copy";
import { useDocumentDownload } from "@/lib/hooks/use-documents";
import { stopMoment } from "@/lib/loads/view";
import type { SignalTone } from "@/lib/types";
import { fillTemplate } from "@/lib/utils/fill-template";
import { fileSize } from "@/lib/utils/format-number";

interface Props {
    document: DocumentDto;
    zone: string;
}

const { documents: copy } = LOAD_RECORD_COPY;

const TONES: Record<DocumentDto["scanStatus"], SignalTone> = {
    awaitingUpload: "muted",
    pending: "live",
    clean: "success",
    rejected: "danger",
    failed: "danger",
};

export default function DocumentRow({ document, zone }: Props) {
    const { id, type, version, fileName, sizeBytes, scanStatus, uploadedByName, createdAt } = document;
    const download = useDocumentDownload();
    const name = copy.types[type];

    const open = () => download.mutate(id, { onSuccess: ({ url }) => window.location.assign(url) });

    return (
        <li className="border-border flex items-start gap-3 border-t py-2.5 first:border-t-0 first:pt-0">
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
                <IconButton label={fillTemplate(copy.download, { name })} icon={Download} size="sm" pending={download.isPending} onPress={open} />
            ) : (
                <StatusLabel label={copy.states[scanStatus]} tone={TONES[scanStatus]} pulse={scanStatus === "pending"} className="mt-0.5" />
            )}
        </li>
    );
}
