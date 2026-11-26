"use client";
import { useState } from "react";
import { Document, View } from "@carbon/icons-react";
import DocumentPreview from "@/components/common/document-preview";
import Button from "@/components/ui/button";
import StatusLabel from "@/components/ui/status-label";
import type { DriverTripDto } from "@/lib/contract/schemas";
import { DOCUMENT_PREVIEW_COPY } from "@/lib/data/documents/preview";
import { DRIVER_COPY } from "@/lib/data/driver/copy";
import { LOAD_RECORD_COPY } from "@/lib/data/loads/record-copy";
import { useDriverDocument } from "@/lib/hooks/use-driver-document";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    trip: DriverTripDto;
}

const { trip: copy } = DRIVER_COPY;
const { documents } = LOAD_RECORD_COPY;

export default function DriverDocuments({ trip }: Props) {
    const open = useDriverDocument(trip.loadId);
    const [previewing, setPreviewing] = useState<number | null>(null);

    return (
        <div className="flex flex-col gap-1">
            <p className="haulr-label text-text-muted">{copy.documents}</p>
            {trip.documents.length === 0 ? <p className="text-text-muted text-xs">{copy.noDocuments}</p> : null}
            <ul className="flex flex-col">
                {trip.documents.map((document, index) => {
                    const name = documents.types[document.type];
                    return (
                        <li key={document.id} className="border-border flex min-h-12 items-center justify-between gap-3 border-b text-xs last:border-b-0">
                            <span className="text-text">{name}</span>
                            {document.scanStatus === "clean" ? (
                                <span className="flex shrink-0 items-center gap-2">
                                    <Button tone="ghost" size="lg" icon={View} aria-label={fillTemplate(DOCUMENT_PREVIEW_COPY.open, { name })} onPress={() => setPreviewing(index)}>
                                        {DOCUMENT_PREVIEW_COPY.short}
                                    </Button>
                                    <Button
                                        tone="outline"
                                        size="lg"
                                        icon={Document}
                                        pending={open.isPending && open.variables === document.id}
                                        aria-label={fillTemplate(copy.open, { name })}
                                        onPress={() => open.mutate(document.id)}
                                    >
                                        {copy.openShort}
                                    </Button>
                                </span>
                            ) : (
                                <StatusLabel label={documents.states[document.scanStatus]} tone="muted" />
                            )}
                        </li>
                    );
                })}
            </ul>
            {previewing !== null && trip.documents[previewing] ? (
                <DocumentPreview
                    source={{ kind: "trip", loadId: trip.loadId }}
                    documents={trip.documents}
                    start={previewing}
                    zone={trip.stops[0].facility.timeZone}
                    downloading={open.isPending}
                    onDownload={(documentId) => open.mutate(documentId)}
                    onClose={() => setPreviewing(null)}
                />
            ) : null}
            {open.isError ? (
                <p role="alert" className="text-error text-xs">
                    {copy.openFailed}
                </p>
            ) : null}
        </div>
    );
}
