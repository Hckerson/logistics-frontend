import clsx from "clsx";
import { useId } from "react";
import DriverDocuments from "@/components/common/driver-documents";
import type { DriverTripDto } from "@/lib/contract/schemas";
import { DRIVER_COPY } from "@/lib/data/driver/copy";
import { currentIndex, podOpen } from "@/lib/driver/trip";
import { stopWindow } from "@/lib/loads/view";
import { clockTime } from "@/lib/tracking/view";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    trip: DriverTripDto;
}

const { trip: copy, stopTypes } = DRIVER_COPY;

export default function DriverStops({ trip }: Props) {
    const headingId = useId();
    const current = currentIndex(trip.stops);
    const reached = current === -1 ? trip.stops.length - 1 : current;
    const fill = trip.stops.length > 1 ? (reached / (trip.stops.length - 1)) * 100 : 0;
    const last = trip.stops[trip.stops.length - 1];

    return (
        <section aria-labelledby={headingId} className="border-border flex flex-col gap-4 border-t pt-4">
            <header className="flex items-baseline justify-between">
                <h2 id={headingId} className="haulr-label text-text-muted">
                    {copy.overview}
                </h2>
                <span className="haulr-label text-text-muted">{trip.stops.length}</span>
            </header>
            <div className="relative pl-7">
                <span aria-hidden className="bg-border-dark absolute top-4 bottom-4 left-[5px] w-px">
                    <span className="bg-accent absolute inset-x-0 top-0 transition-[height] duration-700" style={{ height: `${fill}%` }} />
                </span>
                <ol className="flex flex-col">
                    {trip.stops.map((stop, index) => {
                        const now = index === current;
                        const zone = stop.facility.timeZone;
                        return (
                            <li key={stop.id} aria-current={now ? "step" : undefined} className="relative flex flex-col gap-0.5 py-2.5">
                                <span
                                    aria-hidden
                                    className={clsx(
                                        "absolute top-4 -left-7 block size-[11px] rounded-full",
                                        stop.departedAt ? "bg-accent" : now ? "border-accent bg-background border-2 shadow-[0_0_0_4px_var(--haulr-glow)]" : "border-border-dark bg-background border",
                                    )}
                                />
                                <span className="flex items-baseline justify-between gap-3">
                                    <span className="haulr-label text-text">
                                        {stopTypes[stop.type]} · {stop.sequence}
                                    </span>
                                    <span className={clsx("haulr-label", now ? "text-accent" : "text-text-muted")}>{stop.departedAt ? copy.done : now ? copy.current : copy.ahead}</span>
                                </span>
                                <span className={clsx("text-sm", stop.departedAt ? "text-text-secondary" : "text-text")}>{stop.facility.name}</span>
                                <span className="text-text-muted text-xs">
                                    {stop.facility.city}, {stop.facility.region} · {stopWindow(stop)}
                                </span>
                                {stop.arrivedAt || stop.departedAt ? (
                                    <span className="text-text-secondary font-mono text-xs">
                                        {[stop.arrivedAt && fillTemplate(copy.arrived, { time: clockTime(stop.arrivedAt, zone) }), stop.departedAt && fillTemplate(copy.left, { time: clockTime(stop.departedAt, zone) })]
                                            .filter(Boolean)
                                            .join(" · ")}
                                    </span>
                                ) : null}
                                {stop === last && !podOpen(trip) ? <span className="text-text-muted text-xs">{fillTemplate(copy.podAt, { name: stop.facility.name })}</span> : null}
                            </li>
                        );
                    })}
                </ol>
            </div>
            <DriverDocuments trip={trip} />
        </section>
    );
}
