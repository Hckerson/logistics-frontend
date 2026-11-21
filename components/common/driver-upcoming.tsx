import clsx from "clsx";
import Link from "next/link";
import { useId } from "react";
import LaneLabel from "@/components/common/lane-label";
import { appRoutes } from "@/lib/app-routes";
import type { DriverTripSummaryDto } from "@/lib/contract/schemas";
import { DRIVER_COPY } from "@/lib/data/driver/copy";
import { stopWindow } from "@/lib/loads/view";
import { clockTime, dayName, shortTime } from "@/lib/tracking/view";
import { FOCUS_RING } from "@/lib/ui/constants";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    trips: readonly DriverTripSummaryDto[];
}

const { home: copy } = DRIVER_COPY;
const GRID = "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 sm:grid-cols-[minmax(0,2fr)_1fr_1.2fr]";

export default function DriverUpcoming({ trips }: Props) {
    const headingId = useId();

    return (
        <section aria-labelledby={headingId} className="flex flex-col">
            <header className="flex items-baseline justify-between pb-3">
                <h2 id={headingId} className="haulr-label text-text-muted">
                    {copy.upcoming}
                </h2>
                <span className="haulr-label text-text-muted">{trips.length}</span>
            </header>
            <div aria-hidden className={clsx(GRID, "haulr-label text-text-muted border-border border-b pb-2")}>
                <span>{copy.columns.lane}</span>
                <span className="text-right sm:text-left">{copy.columns.day}</span>
                <span className="hidden sm:block">{copy.columns.window}</span>
            </div>
            {trips.length === 0 ? <p className="text-text-muted border-border border-b py-4 text-xs">{copy.upcomingEmpty}</p> : null}
            <ul>
                {trips.map(({ loadId, status, nextStop, origin, destination }) => {
                    const window = nextStop ? stopWindow({ windowStart: nextStop.windowStart, windowEnd: nextStop.windowEnd, facility: { timeZone: nextStop.timeZone } }) : "";
                    return (
                        <li key={loadId} className="border-border border-b">
                            <Link
                                href={appRoutes.driverTrip(loadId)}
                                aria-label={fillTemplate(copy.openTrip, { reference: loadId, origin: origin.city, destination: destination.city, window })}
                                className={clsx(GRID, "hover:bg-background-muted/60 min-h-16 py-3 transition-colors", FOCUS_RING)}
                            >
                                <span className="flex min-w-0 flex-col gap-1">
                                    <span className="haulr-lane truncate text-lg tracking-tight">
                                        <LaneLabel origin={origin.city} destination={destination.city} />
                                    </span>
                                    <span className="text-text-muted font-mono text-xs">
                                        {loadId} · {status === "Booked" ? copy.notDispatched : copy.readOnly}
                                    </span>
                                </span>
                                {nextStop ? (
                                    <>
                                        <span className="flex flex-col items-end gap-1 sm:items-start">
                                            <span className="text-text text-sm">{dayName(nextStop.windowStart, nextStop.timeZone)}</span>
                                            <span className="text-text-secondary font-mono text-xs tabular-nums sm:hidden">{shortTime(nextStop.windowStart, nextStop.timeZone)}</span>
                                        </span>
                                        <span className="text-text-secondary hidden font-mono text-xs tabular-nums sm:block">
                                            {`${shortTime(nextStop.windowStart, nextStop.timeZone)}–${clockTime(nextStop.windowEnd, nextStop.timeZone)}`}
                                        </span>
                                    </>
                                ) : null}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
