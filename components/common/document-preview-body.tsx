"use client";
import { useState } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import DocumentImageView from "@/components/common/document-image-view";
import Button from "@/components/ui/button";
import ProgressLine from "@/components/ui/progress-line";
import type { DocumentDto, DocumentPreviewDto } from "@/lib/contract/schemas";
import { DOCUMENT_PREVIEW_COPY as copy } from "@/lib/data/documents/preview";
import { PREVIEWABLE_TYPES } from "@/lib/documents/constants";
import { LOADING_SLOW_MS } from "@/lib/errors/constants";
import { useSlow } from "@/lib/hooks/use-slow";
import { failureFrom } from "@/lib/utils/action-result";

interface Props {
    document: DocumentDto;
    preview: UseQueryResult<DocumentPreviewDto>;
    name: string;
    alt: string;
}

const NOTE = "text-text-secondary py-10 text-center text-sm";

export default function DocumentPreviewBody({ document, preview, name, alt }: Props) {
    const [refreshed, setRefreshed] = useState(false);
    const [broken, setBroken] = useState(false);
    const slow = useSlow(preview.isPending, LOADING_SLOW_MS);
    const failure = preview.isError ? failureFrom(preview.error) : null;

    const fail = () => {
        if (refreshed) return setBroken(true);
        setRefreshed(true);
        void preview.refetch();
    };

    if (document.scanStatus !== "clean") return <p className={NOTE}>{copy.pending}</p>;
    if (failure?.errorClass === "not-found" || failure?.errorClass === "forbidden") return <p className={NOTE}>{copy.gone}</p>;
    if (failure || broken) {
        return (
            <div className="flex flex-col items-center gap-3 py-10">
                <p role="alert" className="text-text-secondary text-sm">
                    {copy.failed}
                </p>
                <Button
                    tone="outline"
                    onPress={() => {
                        setBroken(false);
                        setRefreshed(false);
                        void preview.refetch();
                    }}
                >
                    {copy.retry}
                </Button>
            </div>
        );
    }
    if (!preview.data) {
        return (
            <div className="flex flex-col gap-2 py-10">
                <ProgressLine className="bg-border" />
                <p aria-live="polite" className="text-text-muted text-center text-xs">
                    {slow ? copy.slow : copy.loading}
                </p>
            </div>
        );
    }

    const { url, contentType, previewable } = preview.data;
    if (!previewable || !PREVIEWABLE_TYPES.some((type) => type === contentType)) return <p className={NOTE}>{copy.unsupported}</p>;
    if (contentType === "application/pdf") {
        return <iframe key={url} src={url} title={name} onError={fail} className="border-border bg-background-muted h-[70svh] w-full border" />;
    }
    return <DocumentImageView key={url} url={url} alt={alt} onError={fail} />;
}
