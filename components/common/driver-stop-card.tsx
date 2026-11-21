"use client";
import { Map as MapIcon, Phone } from "@carbon/icons-react";
import BoardReadout from "@/components/common/board-readout";
import ButtonLink from "@/components/ui/button-link";
import CopyButton from "@/components/ui/copy-button";
import Panel from "@/components/ui/panel";
import type { DriverStopDto } from "@/lib/contract/schemas";
import { DRIVER_COPY } from "@/lib/data/driver/copy";
import { addressOf, directionsUrl, telOf } from "@/lib/driver/directions";
import { useApplePlatform } from "@/lib/hooks/use-shortcut";
import { stopWindow } from "@/lib/loads/view";
import { clockTime, dayName, shortTime } from "@/lib/tracking/view";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    stop: DriverStopDto;
    total: number;
}

const { trip: copy, stopTypes } = DRIVER_COPY;

export default function DriverStopCard({ stop, total }: Props) {
    const apple = useApplePlatform();
    const { facility, contact } = stop;
    const directions = directionsUrl(facility, apple);
    const address = addressOf(facility);
    const zone = facility.timeZone;

    return (
        <Panel label={fillTemplate(copy.stopOf, { sequence: String(stop.sequence), total: String(total) })} aside={<span className="haulr-label text-accent">{stopTypes[stop.type]}</span>}>
            <div className="flex flex-col gap-1">
                <p className="text-text haulr-lane text-2xl tracking-tight">{facility.name}</p>
                <p className="text-text-secondary flex items-center gap-1 text-xs">
                    <span>{address}</span>
                    <CopyButton value={address} label={copy.copyAddress} done={copy.addressCopied} />
                </p>
            </div>
            <div className="flex flex-col gap-2">
                <p className="haulr-label text-text-muted">{copy.appointment}</p>
                <p className="sr-only">{stopWindow(stop)}</p>
                <BoardReadout value={shortTime(stop.windowStart, zone)} tall={false} />
                <p aria-hidden className="text-text-secondary text-xs">
                    {`${dayName(stop.windowStart, zone)} · ${fillTemplate(copy.until, { time: clockTime(stop.windowEnd, zone) })}`}
                </p>
            </div>
            {stop.reference || stop.instructions ? (
                <dl className="border-border flex flex-col gap-1.5 border-t pt-3 text-xs">
                    {stop.reference ? (
                        <div className="flex flex-wrap justify-between gap-x-3">
                            <dt className="text-text-muted">{copy.reference}</dt>
                            <dd className="text-text font-mono">{stop.reference}</dd>
                        </div>
                    ) : null}
                    {stop.instructions ? (
                        <div className="flex flex-col gap-0.5">
                            <dt className="text-text-muted">{copy.instructions}</dt>
                            <dd className="text-text-secondary">{stop.instructions}</dd>
                        </div>
                    ) : null}
                </dl>
            ) : null}
            <div className="grid grid-cols-2 gap-2">
                {directions ? (
                    <ButtonLink href={directions} target="_blank" rel="noopener noreferrer" size="lg" tone="outline" icon={MapIcon} aria-label={fillTemplate(copy.directions, { name: facility.name })}>
                        {copy.directionsShort}
                    </ButtonLink>
                ) : null}
                {contact ? (
                    <ButtonLink href={telOf(contact.phone)} size="lg" tone="outline" icon={Phone} aria-label={fillTemplate(copy.call, { name: contact.name, facility: facility.name })}>
                        {contact.name}
                    </ButtonLink>
                ) : null}
            </div>
        </Panel>
    );
}
