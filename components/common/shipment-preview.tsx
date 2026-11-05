import { ArrowRight } from "@carbon/icons-react";
import ButtonLink from "@/components/ui/button-link";
import { appRoutes } from "@/lib/app-routes";
import type { LoadSummaryDto } from "@/lib/contract/schemas";
import { LOAD_COPY } from "@/lib/data/loads/copy";
import { SHIPMENTS_COPY } from "@/lib/data/loads/shipments";
import { placeWindow, shortMoment } from "@/lib/loads/shipments";
import { minutesSince } from "@/lib/loads/tracking";
import { ageOf } from "@/lib/tracking/view";
import { LABEL_TEXT } from "@/lib/ui/constants";
import { fillTemplate } from "@/lib/utils/fill-template";
import { grouped } from "@/lib/utils/format-number";

interface Props {
    load: LoadSummaryDto;
    now: number;
}

const { preview } = SHIPMENTS_COPY;

const arrival = ({ eta, destination }: LoadSummaryDto) => {
    if (!eta) return null;
    const parts = [shortMoment(eta.at, destination.timeZone), preview.confidence[eta.confidence]];
    if (eta.milesRemaining !== null) parts.push(fillTemplate(preview.remaining, { miles: grouped(eta.milesRemaining) }));
    return parts.join(" · ");
};

export default function ShipmentPreview({ load, now }: Props) {
    const facts = [
        { label: preview.pickup, value: placeWindow(load.origin) },
        { label: preview.delivery, value: placeWindow(load.destination) },
        { label: preview.eta, value: arrival(load) },
        {
            label: preview.seen,
            value: load.lastPositionAt && load.lastPositionCity ? `${load.lastPositionCity} · ${ageOf(minutesSince(load.lastPositionAt, now))}` : null,
        },
        { label: preview.carrier, value: load.carrier?.name ?? SHIPMENTS_COPY.notBooked },
        { label: preview.equipment, value: LOAD_COPY.equipment[load.equipment] },
    ];

    return (
        <div className="flex flex-col gap-3 whitespace-normal">
            <dl className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {facts.map((fact) =>
                    fact.value ? (
                        <div key={fact.label} className="flex min-w-0 flex-col gap-0.5">
                            <dt className={LABEL_TEXT}>{fact.label}</dt>
                            <dd className="text-text-secondary text-xs tabular-nums">{fact.value}</dd>
                        </div>
                    ) : null,
                )}
            </dl>
            <ButtonLink href={appRoutes.load(load.id)} tone="outline" size="sm" trailing={ArrowRight} className="self-start">
                {preview.open}
            </ButtonLink>
        </div>
    );
}
