"use client";
import BoardReadout from "@/components/common/board-readout";
import Skeleton from "@/components/ui/skeleton";
import StatusLabel from "@/components/ui/status-label";
import type { LoadDto, LoadPositionsDto } from "@/lib/contract/schemas";
import { LOAD_COPY } from "@/lib/data/loads/copy";
import { useNow } from "@/lib/hooks/use-now";
import { TRACE_STATUSES } from "@/lib/loads/constants";
import { LOAD_STATUS_LABELS } from "@/lib/loads/status";
import { deliveredAt, minutesSince } from "@/lib/loads/tracking";
import { currentStop, stopMoment, stopWindow } from "@/lib/loads/view";
import { ageOf, dayName, shortTime } from "@/lib/tracking/view";
import { fillTemplate } from "@/lib/utils/fill-template";
import { grouped } from "@/lib/utils/format-number";

interface Props {
    load: LoadDto;
    positions: LoadPositionsDto | undefined;
}

const { tracking: copy } = LOAD_COPY;

export default function LoadPosition({ load, positions }: Props) {
    const now = useNow();
    const { stops, status } = load;
    const delivered = deliveredAt(stops);
    const ahead = stops.find((stop) => !stop.arrivedAt) ?? null;
    const last = stops[stops.length - 1];

    if (delivered) {
        return (
            <div className="flex flex-col gap-2">
                <p className="haulr-label text-text-muted">
                    {copy.deliveredLabel} · {dayName(delivered, last.facility.timeZone)}
                </p>
                <BoardReadout tall={false} value={shortTime(delivered, last.facility.timeZone)} />
                <p className="sr-only">{fillTemplate(copy.delivered, { time: stopMoment(delivered, last.facility.timeZone) })}</p>
            </div>
        );
    }

    if (!TRACE_STATUSES.includes(status)) {
        const pickup = currentStop(stops) ?? stops[0];
        const before = status === "Booked" || status === "Dispatched";
        return (
            <p className="text-text-secondary text-xs">
                {before ? fillTemplate(copy.before, { window: stopWindow(pickup) }) : fillTemplate(copy.idle, { status: LOAD_STATUS_LABELS[status] })}
            </p>
        );
    }

    if (!positions) return <Skeleton lines={3} />;

    const { latest, health } = positions;
    const eta = positions.eta ?? load.eta;
    const zone = ahead?.facility.timeZone ?? last.facility.timeZone;
    const age = latest ? (now ? ageOf(minutesSince(latest.recordedAt, now)) : shortTime(latest.recordedAt, zone)) : "";

    return (
        <div className="flex flex-col gap-3">
            {eta && ahead ? (
                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="haulr-label text-text-muted">
                            {fillTemplate(copy.eta, { city: ahead.facility.city })} · {dayName(eta.at, zone)}
                        </p>
                        <StatusLabel label={eta.late ? copy.late : copy.onTime} tone={eta.late ? "warning" : "live"} />
                    </div>
                    <BoardReadout key={eta.at} tall={false} value={shortTime(eta.at, zone)} />
                    <p className="sr-only">{fillTemplate(copy.etaText, { city: ahead.facility.city, time: stopMoment(eta.at, zone) })}</p>
                    <p className="text-text-muted flex flex-wrap gap-x-3 gap-y-1 text-xs">
                        <span>{copy.confidence[eta.confidence]}</span>
                        {eta.milesRemaining === null ? null : <span>{fillTemplate(copy.miles, { miles: grouped(eta.milesRemaining) })}</span>}
                        <span>{fillTemplate(copy.window, { window: stopWindow(ahead) })}</span>
                    </p>
                </div>
            ) : null}
            {latest ? (
                <div className="border-border flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-t pt-3 text-xs">
                    <p className="text-text">{fillTemplate(copy.position, { city: latest.city })}</p>
                    <p className="text-text-muted font-mono">{fillTemplate(copy.sourceAge, { source: copy.sources[latest.source], age })}</p>
                </div>
            ) : (
                <p className="text-text-muted text-xs">{copy.none}</p>
            )}
            {health === "stale" ? <p className="text-signal-warning text-xs">{fillTemplate(copy.stale, { age })}</p> : null}
            {health === "exception" ? <p className="text-signal-danger text-xs">{fillTemplate(copy.exception, { age })}</p> : null}
        </div>
    );
}
