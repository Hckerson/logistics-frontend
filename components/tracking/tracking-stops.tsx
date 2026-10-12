import clsx from "clsx";
import HudPanel from "@/components/common/hud-panel";
import type { PublicTrackingDto } from "@/lib/contract/schemas";
import { TRACKING_COPY } from "@/lib/data/tracking/copy";
import { clockTime, dayName, nextStop, shortTime } from "@/lib/tracking/view";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    stops: PublicTrackingDto["stops"];
}

const { stops: copy, note } = TRACKING_COPY;

export default function TrackingStops({ stops }: Props) {
    const next = nextStop(stops);
    const done = stops.filter((stop) => stop.departedAt).length;

    return (
        <HudPanel label={copy.label} status={`${done}/${stops.length}`} note={note}>
            <ol className="-my-3 flex flex-col">
                {stops.map((stop, index) => {
                    const zone = stop.timeZone;
                    const current = index === next;
                    return (
                        <li key={`${stop.type}-${stop.windowStart}`} className="border-border grid grid-cols-[0.75rem_minmax(0,1fr)] gap-3 border-b py-3 last:border-b-0">
                            <span
                                aria-hidden
                                className={clsx(
                                    "mt-1.5 size-2.5 rounded-full border-2",
                                    stop.departedAt ? "border-accent bg-accent" : current ? "border-accent" : "border-border-dark",
                                )}
                            />
                            <div className="flex min-w-0 flex-col gap-1">
                                <p className="flex items-baseline justify-between gap-3">
                                    <span className="text-text truncate text-sm">
                                        {stop.city}, {stop.region}
                                    </span>
                                    <span className="haulr-label text-text-muted shrink-0">{copy.types[stop.type]}</span>
                                </p>
                                <p className="text-text-muted font-mono text-xs">
                                    {dayName(stop.windowStart, zone)} · {shortTime(stop.windowStart, zone)}–{clockTime(stop.windowEnd, zone)}
                                </p>
                                {stop.departedAt ? (
                                    <p className="text-text-secondary text-xs">{fillTemplate(copy.departed, { time: clockTime(stop.departedAt, zone) })}</p>
                                ) : stop.arrivedAt ? (
                                    <p className="text-accent text-xs">{fillTemplate(copy.arrived, { time: clockTime(stop.arrivedAt, zone) })}</p>
                                ) : current ? (
                                    <p className="haulr-label text-accent">{copy.next}</p>
                                ) : null}
                            </div>
                        </li>
                    );
                })}
            </ol>
        </HudPanel>
    );
}
