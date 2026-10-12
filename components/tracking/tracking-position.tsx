"use client";
import HudPanel from "@/components/common/hud-panel";
import TrackingMap from "@/components/tracking/tracking-map";
import type { PublicTrackingDto } from "@/lib/contract/schemas";
import { TRACKING_COPY } from "@/lib/data/tracking/copy";
import { healthOf, minutesSince } from "@/lib/loads/tracking";
import { ageOf, shortTime } from "@/lib/tracking/view";
import { fillTemplate } from "@/lib/utils/fill-template";

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

    return (
        <HudPanel label={copy.label} status={status} alert={stale} note={note}>
            <div className="border-border relative -mx-5 -mt-5 h-72 border-b sm:h-96">
                <TrackingMap tracking={tracking} stale={stale} label={fillTemplate(copy.map, { city: position?.city ?? stops[0]?.city ?? "" })} />
            </div>
            {position ? (
                <p className="text-text-secondary text-sm">
                    {fillTemplate(copy.text, { city: position.city, source: copy.sources[position.source], age })}
                </p>
            ) : (
                <p className="text-text-muted text-sm">{copy.none}</p>
            )}
            {stale ? <p className="text-text-muted text-xs">{copy.stale}</p> : null}
        </HudPanel>
    );
}
