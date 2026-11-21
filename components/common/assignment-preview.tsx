import type { FleetEntryDto } from "@/lib/contract/schemas";
import { FLEET_COPY } from "@/lib/data/fleet/copy";
import { truckName } from "@/lib/fleet/grid";
import { stopMoment } from "@/lib/loads/view";
import type { PlanRow } from "@/lib/types";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    entry: FleetEntryDto;
    from: PlanRow;
    target: PlanRow;
}

const { preview: copy } = FLEET_COPY;

const byPickup = (entries: readonly FleetEntryDto[]) => [...entries].sort((one, other) => Date.parse(one.pickupStart) - Date.parse(other.pickupStart));

export default function AssignmentPreview({ entry, from, target }: Props) {
    const weeks = [
        target.truck ? { truck: target.truck, entries: byPickup([...(target.row?.entries ?? []), entry]) } : null,
        from.truck ? { truck: from.truck, entries: byPickup((from.row?.entries ?? []).filter(({ loadId }) => loadId !== entry.loadId)) } : null,
    ].filter((week) => week !== null);

    return (
        <section aria-label={copy.label} className="grid gap-3 sm:grid-cols-2">
            {weeks.map(({ truck, entries }) => (
                <div key={truck.id} className="flex flex-col gap-1">
                    <h3 className="haulr-label text-text-muted">{fillTemplate(copy.after, { truck: truckName(truck) })}</h3>
                    {entries.length === 0 ? <p className="text-text-muted text-xs">{copy.nothing}</p> : null}
                    <ol className="flex flex-col gap-0.5 text-xs">
                        {entries.map((item) => (
                            <li key={item.loadId} className={item.loadId === entry.loadId ? "text-text font-medium" : "text-text-secondary"}>
                                {`${item.loadId} · ${stopMoment(item.pickupStart, item.timeZone)}`}
                            </li>
                        ))}
                    </ol>
                </div>
            ))}
        </section>
    );
}
