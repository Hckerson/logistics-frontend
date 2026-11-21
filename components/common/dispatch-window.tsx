"use client";
import Link from "next/link";
import { useState } from "react";
import SectionState from "@/components/common/section-state";
import Button from "@/components/ui/button";
import { appRoutes } from "@/lib/app-routes";
import { QUIET_LINK } from "@/lib/auth/constants";
import type { FleetTruckDto, FleetWindowDto } from "@/lib/contract/schemas";
import { FLEET_COPY } from "@/lib/data/fleet/copy";
import { truckName, windowSearch } from "@/lib/fleet/grid";
import { useRecommendedLoads } from "@/lib/hooks/use-fleet-plan";
import { CURRENCY } from "@/lib/loads/constants";
import { stopMoment } from "@/lib/loads/view";
import { formatMoney } from "@/lib/utils/currency";
import { fillTemplate } from "@/lib/utils/fill-template";
import { grouped } from "@/lib/utils/format-number";
import { pluralize } from "@/lib/utils/plural";

interface Props {
    window: FleetWindowDto;
    truck: FleetTruckDto;
    timeZone: string;
    back: string;
}

const { windows: copy } = FLEET_COPY;

export default function DispatchWindow({ window, truck, timeZone, back }: Props) {
    const [open, setOpen] = useState(false);
    const suggestions = useRecommendedLoads({ truck: truck.id, from: window.from, to: window.to }, open);
    const search = windowSearch(window, truck.equipment, back);

    return (
        <li className="border-border-dark flex flex-col gap-1 border-l-2 border-dashed py-1 pl-3 text-xs">
            <span className="text-text">{fillTemplate(copy.item, { truck: truckName(truck), city: window.city, region: window.region })}</span>
            <span className="text-text-secondary">
                {fillTemplate(copy.when, { from: stopMoment(window.from, timeZone), hours: String(window.hours) })}
                <span className="text-text-muted block">{window.emptyMiles === null ? copy.noMiles : fillTemplate(copy.miles, { miles: grouped(window.emptyMiles) })}</span>
            </span>
            <span className="flex flex-wrap items-center gap-3">
                <Link href={search} className={QUIET_LINK}>
                    {copy.find}
                </Link>
                <Button tone="link" size="inline" aria-expanded={open} onPress={() => setOpen(!open)}>
                    {open ? copy.hide : copy.suggest}
                </Button>
            </span>
            {open ? (
                <SectionState label={copy.suggest} query={suggestions}>
                    {(loads) => (
                        <div className="flex flex-col gap-1">
                            <p aria-live="polite" className="text-text-muted">
                                {loads.length === 0 ? copy.empty : pluralize(loads.length, copy.count)}
                            </p>
                            <ul className="flex flex-col gap-1">
                                {loads.map((load) => (
                                    <li key={load.loadId} className="flex flex-wrap items-center justify-between gap-x-3">
                                        <span className="text-text-secondary">
                                            {fillTemplate(copy.suggestion, {
                                                origin: `${load.origin.city}, ${load.origin.region}`,
                                                destination: `${load.destination.city}, ${load.destination.region}`,
                                                pickup: stopMoment(load.pickupStart, load.timeZone),
                                                miles: grouped(load.emptyMiles),
                                                rate: formatMoney(load.rateCents, CURRENCY),
                                            })}
                                        </span>
                                        <Link href={appRoutes.bookLoad(load.loadId)} className={QUIET_LINK}>
                                            {fillTemplate(copy.book, { load: load.loadId })}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </SectionState>
            ) : null}
        </li>
    );
}
