"use client";
import type { FleetRowDto } from "@/lib/contract/schemas";
import { FLEET_COPY } from "@/lib/data/fleet/copy";
import { LOAD_COPY } from "@/lib/data/loads/copy";
import { useNow } from "@/lib/hooks/use-now";
import { truckName } from "@/lib/fleet/grid";
import { minutesSince } from "@/lib/loads/tracking";
import { ageOf } from "@/lib/tracking/view";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    row: FleetRowDto;
}

const { position: placing, hours: hourCopy } = FLEET_COPY;
const MINUTES_PER_HOUR = 60;

export default function DispatchTruck({ row: { truck, position, hours } }: Props) {
    const now = useNow();
    const age = (iso: string) => (now === null ? "" : ageOf(minutesSince(iso, now)));
    const where = position
        ? position.recordedAt
            ? fillTemplate(placing.at, { city: position.city, source: placing.sources[position.source], age: age(position.recordedAt) })
            : fillTemplate(placing.home, { city: position.city })
        : null;
    const left =
        hours?.state === "reported" && hours.remainingMinutes !== null
            ? fillTemplate(hourCopy.reported, {
                  hours: String(Math.floor(hours.remainingMinutes / MINUTES_PER_HOUR)),
                  minutes: String(hours.remainingMinutes % MINUTES_PER_HOUR),
                  age: age(hours.readAt),
              })
            : hours
              ? fillTemplate(hourCopy.unavailable, { age: age(hours.readAt) })
              : null;

    return (
        <span className="flex min-w-0 flex-col gap-0.5 text-xs leading-tight">
            <span className="text-text flex items-baseline gap-2">
                <span className="font-medium">{truckName(truck)}</span>
                <span className="text-text-muted">{LOAD_COPY.equipment[truck.equipment]}</span>
            </span>
            {truck.driverName ? <span className="text-text-secondary">{truck.driverName}</span> : null}
            {where ? <span className="text-text-muted">{where}</span> : null}
            {left ? <span className="text-text-muted">{left}</span> : null}
        </span>
    );
}
