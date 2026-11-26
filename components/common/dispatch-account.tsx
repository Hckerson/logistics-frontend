"use client";
import Link from "next/link";
import DispatchTruck from "@/components/common/dispatch-truck";
import Button from "@/components/ui/button";
import { appRoutes } from "@/lib/app-routes";
import { QUIET_LINK } from "@/lib/auth/constants";
import type { FleetEntryDto, FleetTruckDto, FleetUnavailableDto } from "@/lib/contract/schemas";
import { FLEET_COPY } from "@/lib/data/fleet/copy";
import { entryLabel, timeOrdered, truckName, windowSearch, withinDays } from "@/lib/fleet/grid";
import { stopMoment } from "@/lib/loads/view";
import type { PlanRow } from "@/lib/types";
import { fillTemplate } from "@/lib/utils/fill-template";
import { withBack } from "@/lib/navigation/back";

interface Props {
    rows: readonly PlanRow[];
    timeZone: string;
    back: string;
    readOnly: boolean;
    days?: readonly string[];
    onMove: (entry: FleetEntryDto, row: PlanRow) => void;
    onMark: (truck: FleetTruckDto) => void;
    onEnd: (truck: FleetTruckDto, period: FleetUnavailableDto) => void;
}

const { account, grid, reasons, windows, unavailable } = FLEET_COPY;
const ITEM = "border-border flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-l-2 py-1.5 pl-3 text-xs";

export default function DispatchAccount({ rows, timeZone, back, readOnly, days, onMove, onMark, onEnd }: Props) {
    return (
        <div className="flex flex-col gap-4">
            {rows.map((row) => {
                const name = row.truck ? truckName(row.truck) : grid.unassigned;
                const items = timeOrdered(row.items).filter(({ item }) => !days || withinDays(item, days, timeZone));
                return (
                    <section key={row.key} aria-label={fillTemplate(days ? account.phoneLabel : account.label, { truck: name, days: String(days?.length ?? 0) })} className="flex flex-col gap-2">
                        <header className="flex items-start justify-between gap-3">
                            {row.row ? <DispatchTruck row={row.row} /> : <h3 className="text-text text-xs font-medium">{grid.unassigned}</h3>}
                            {row.truck && !readOnly ? (
                                <Button tone="quiet" size="sm" onPress={() => row.truck && onMark(row.truck)}>
                                    {unavailable.mark}
                                </Button>
                            ) : null}
                        </header>
                        {items.length === 0 ? <p className="text-text-muted text-xs">{account.nothing}</p> : null}
                        <ol className="flex flex-col gap-1">
                            {items.map(({ key, item }) => (
                                <li key={key} className={ITEM}>
                                    {item.kind === "entry" ? (
                                        <>
                                            <Link href={withBack(appRoutes.load(item.entry.loadId), back)} className={QUIET_LINK}>
                                                {entryLabel(item.entry)}
                                            </Link>
                                            {item.entry.movable && !readOnly ? (
                                                <Button tone="quiet" size="sm" onPress={() => onMove(item.entry, row)}>
                                                    {fillTemplate(row.truck ? account.move : account.assign, { load: item.entry.loadId })}
                                                </Button>
                                            ) : null}
                                        </>
                                    ) : item.kind === "unavailable" ? (
                                        <>
                                            <span className="text-text-secondary">
                                                {fillTemplate(grid.unavailable, { truck: name, reason: reasons[item.period.reason], until: stopMoment(item.period.to, timeZone) })}
                                            </span>
                                            {row.truck && !readOnly ? (
                                                <Button tone="quiet" size="sm" onPress={() => row.truck && onEnd(row.truck, item.period)}>
                                                    {unavailable.end}
                                                </Button>
                                            ) : null}
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-text-secondary">
                                                {`${fillTemplate(windows.item, { truck: name, city: item.window.city, region: item.window.region })} · ${fillTemplate(windows.when, { from: stopMoment(item.window.from, timeZone), hours: String(item.window.hours) })}`}
                                            </span>
                                            {row.truck ? (
                                                <Link href={windowSearch(item.window, row.truck.equipment, back)} className={QUIET_LINK}>
                                                    {windows.find}
                                                </Link>
                                            ) : null}
                                        </>
                                    )}
                                </li>
                            ))}
                        </ol>
                    </section>
                );
            })}
        </div>
    );
}
