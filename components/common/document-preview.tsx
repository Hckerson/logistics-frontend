"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Download } from "@carbon/icons-react";
import DocumentPreviewBody from "@/components/common/document-preview-body";
import Button from "@/components/ui/button";
import Dialog from "@/components/ui/dialog";
import IconButton from "@/components/ui/icon-button";
import type { DocumentDto } from "@/lib/contract/schemas";
import { DOCUMENT_PREVIEW_COPY as copy } from "@/lib/data/documents/preview";
import { LOAD_RECORD_COPY } from "@/lib/data/loads/record-copy";
import { useDocumentPreview } from "@/lib/hooks/use-document-preview";
import { stopMoment } from "@/lib/loads/view";
import type { PreviewSource } from "@/lib/types";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    source: PreviewSource;
    documents: readonly DocumentDto[];
    start: number;
    zone: string;
    downloading: boolean;
    onDownload: (documentId: string) => void;
    onClose: () => void;
}

export default function DocumentPreview({ source, documents, start, zone, downloading, onDownload, onClose }: Props) {
    const [index, setIndex] = useState(start);
    const document = documents[index];
    const preview = useDocumentPreview(source, document.id, document.scanStatus === "clean");
    const name = LOAD_RECORD_COPY.documents.types[document.type];
    const position = { name, number: String(index + 1), total: String(documents.length) };

    return (
        <Dialog
            isOpen
            onOpenChange={(open) => (open ? undefined : onClose())}
            width="lg"
            kicker={document.fileName}
            title={name}
            description={fillTemplate(copy.meta, { version: String(document.version), time: stopMoment(document.createdAt, zone) })}
            footer={
                <>
                    <Button tone="ghost" onPress={onClose}>
                        {copy.close}
                    </Button>
                    <Button tone="outline" icon={Download} pending={downloading} isDisabled={document.scanStatus !== "clean"} onPress={() => onDownload(document.id)}>
                        {copy.download}
                    </Button>
                </>
            }
        >
            {documents.length > 1 ? (
                <div className="flex items-center justify-between gap-3">
                    <IconButton label={copy.previous} icon={ChevronLeft} size="sm" isDisabled={index === 0} onPress={() => setIndex(index - 1)} />
                    <p role="status" className="text-text-secondary text-xs tabular-nums">
                        {fillTemplate(copy.pages, position)}
                    </p>
                    <IconButton label={copy.next} icon={ChevronRight} size="sm" isDisabled={index === documents.length - 1} onPress={() => setIndex(index + 1)} />
                </div>
            ) : null}
            <DocumentPreviewBody key={document.id} document={document} preview={preview} name={fillTemplate(copy.frame, { name })} alt={fillTemplate(copy.page, position)} />
        </Dialog>
    );
}
