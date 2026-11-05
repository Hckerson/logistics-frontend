import Link from "next/link";
import LaneLabel from "@/components/common/lane-label";
import StatusLabel from "@/components/ui/status-label";
import { appRoutes } from "@/lib/app-routes";
import type { LoadSummaryDto } from "@/lib/contract/schemas";
import { SHIPMENTS_COPY } from "@/lib/data/loads/shipments";
import { placeLabel, shipmentQualifier, shortMoment } from "@/lib/loads/shipments";
import { loadStatusDisplay } from "@/lib/loads/status";
import { minutesSince } from "@/lib/loads/tracking";
import { ageOf } from "@/lib/tracking/view";
import { RECORD_LINK } from "@/lib/ui/constants";
import { fillTemplate } from "@/lib/utils/fill-template";
import type { TableColumn } from "@/lib/types";

const { columns: label } = SHIPMENTS_COPY;

const delivery = ({ eta, destination }: LoadSummaryDto) =>
    eta ? (
        <span className={eta.late ? "text-signal-warning" : undefined}>
            {fillTemplate(SHIPMENTS_COPY.eta, { time: shortMoment(eta.at, destination.timeZone) })}
        </span>
    ) : (
        shortMoment(destination.windowStart, destination.timeZone)
    );

const seen = ({ lastPositionAt, lastPositionCity }: LoadSummaryDto, now: number) =>
    lastPositionAt && lastPositionCity ? (
        fillTemplate(SHIPMENTS_COPY.seen, { place: lastPositionCity, age: ageOf(minutesSince(lastPositionAt, now)) })
    ) : (
        <span className="text-text-muted">{SHIPMENTS_COPY.noPosition}</span>
    );

export const shipmentColumns = (now: number): readonly TableColumn<LoadSummaryDto>[] => [
    {
        key: "load",
        label: label.load,
        rowHeader: true,
        width: "8.5rem",
        cell: (row) => (
            <Link href={appRoutes.load(row.id)} className={RECORD_LINK}>
                {row.id}
            </Link>
        ),
    },
    { key: "lane", label: label.lane, cell: (row) => <LaneLabel origin={placeLabel(row.origin)} destination={placeLabel(row.destination)} /> },
    {
        key: "status",
        label: label.status,
        width: "9.5rem",
        phone: "aside",
        cell: (row) => <StatusLabel {...loadStatusDisplay(row.status, shipmentQualifier(row, now))} tag />,
    },
    { key: "pickup", label: label.pickup, width: "9.5rem", cell: (row) => shortMoment(row.origin.windowStart, row.origin.timeZone) },
    { key: "delivery", label: label.delivery, width: "10.5rem", cell: delivery },
    { key: "carrier", label: label.carrier, width: "9rem", cell: (row) => row.carrier?.name ?? <span className="text-text-muted">{SHIPMENTS_COPY.notBooked}</span> },
    { key: "seen", label: label.seen, width: "10.5rem", phone: "hidden", cell: (row) => seen(row, now) },
];
