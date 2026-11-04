"use client";
import HudPanel from "@/components/common/hud-panel";
import TrackingMap from "@/components/tracking/tracking-map";
import type { PublicTrackingDto } from "@/lib/contract/schemas";
import { TRACKING_COPY } from "@/lib/data/tracking/copy";
import { useTrackingRoute } from "@/lib/hooks/use-tracking-route";
import { healthOf, minutesSince } from "@/lib/loads/tracking";
import { milesToGo } from "@/lib/tracking/route";
import { ageOf, phaseOf, shortTime } from "@/lib/tracking/view";
import { fillTemplate } from "@/lib/utils/fill-template";
import { grouped } from "@/lib/utils/format-number";

interface Props {
    tracking: PublicTrackingDto;
    now: number | null;
}

const { position: copy, note } = TRACKING_COPY;

export default function TrackingPosition({ tracking, now }: Props) {
    const { position, stops } = tracking;
    const zone = stops[stops.length - 1]?.timeZone ?? "UTC";
    const age = position ? (now ? ageOf(minutesSince(position.recordedAt, now)) : shortTime(position.recordedAt, zone)) : "";
    const stale = Boolean(position && now && healthOf(position.recordedAt, now) !== "fresh");
    const status = position ? fillTemplate(stale ? copy.lastSeen : copy.updated, { age }) : copy.none;
    const route = useTrackingRoute(tracking, stale);
    const remaining = phaseOf(tracking) === "delivered" ? null : milesToGo(tracking, route);
    const destination = stops[stops.length - 1];

    return (
        <HudPanel label={copy.label} status={status} alert={stale} note={note}>
            <div className="border-border relative -mx-5 -mt-5 h-72 border-b sm:h-96">
                <TrackingMap
                    tracking={tracking}
                    route={route}
                    stale={stale}
                    label={fillTemplate(copy.map, { city: position?.city ?? stops[0]?.city ?? "" })}
                    recentreLabel={copy.recentre}
                />
            </div>
            {position ? (
                <p className="text-text-secondary text-sm">
                    {fillTemplate(copy.text, { city: position.city, source: copy.sources[position.source], age })}
                </p>
            ) : (
                <p className="text-text-muted text-sm">{copy.none}</p>
            )}
            {remaining !== null && destination ? (
                <p className="text-text-muted font-mono text-xs">
                    {fillTemplate(copy.remaining, { miles: grouped(remaining), city: destination.city })}
                </p>
            ) : null}
            {stale ? <p className="text-text-muted text-xs">{copy.stale}</p> : null}
        </HudPanel>
    );
}
