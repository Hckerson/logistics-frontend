"use client";
import { Document } from "@carbon/icons-react";
import Button from "@/components/ui/button";
import StatusLabel from "@/components/ui/status-label";
import type { DriverTripDto } from "@/lib/contract/schemas";
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

    return (
        <div className="flex flex-col gap-1">
            <p className="haulr-label text-text-muted">{copy.documents}</p>
            {trip.documents.length === 0 ? <p className="text-text-muted text-xs">{copy.noDocuments}</p> : null}
            <ul className="flex flex-col">
                {trip.documents.map((document) => {
                    const name = documents.types[document.type];
                    return (
                        <li key={document.id} className="border-border flex min-h-12 items-center justify-between gap-3 border-b text-xs last:border-b-0">
                            <span className="text-text">{name}</span>
                            {document.scanStatus === "clean" ? (
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
                            ) : (
                                <StatusLabel label={documents.states[document.scanStatus]} tone="muted" />
                            )}
                        </li>
                    );
                })}
            </ul>
            {open.isError ? (
                <p role="alert" className="text-error text-xs">
                    {copy.openFailed}
                </p>
            ) : null}
        </div>
    );
}
