import BoardReadout from "@/components/common/board-readout";
import HudPanel from "@/components/common/hud-panel";
import type { PublicTrackingDto } from "@/lib/contract/schemas";
import { TRACKING_COPY } from "@/lib/data/tracking/copy";
import { count } from "@/lib/quotes/format";
import { dayName, phaseOf, shortTime } from "@/lib/tracking/view";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    tracking: PublicTrackingDto;
}

const { arrival: copy, note } = TRACKING_COPY;

export default function TrackingArrival({ tracking }: Props) {
    const { eta, stops } = tracking;
    const last = stops[stops.length - 1];
    const zone = last?.timeZone ?? "UTC";
    const delivered = phaseOf(tracking) === "delivered" ? tracking.deliveredAt : null;
    const at = delivered ?? eta?.at ?? null;
    const status = delivered ? copy.delivered : eta ? copy.confidence[eta.confidence] : copy.unavailable;

    return (
        <HudPanel label={copy.label} status={status} alert={Boolean(!delivered && eta?.late)} note={note}>
            {at ? (
                <div className="flex flex-col gap-2">
                    <p className="haulr-label text-text-muted">
                        {delivered ? copy.delivered : copy.board} · {dayName(at, zone)}
                    </p>
                    <BoardReadout key={at} value={shortTime(at, zone)} />
                </div>
            ) : (
                <p className="text-text-secondary text-sm">{copy.unavailable}</p>
            )}
            {!delivered && eta ? (
                <p className="haulr-label flex flex-wrap gap-x-3 gap-y-1">
                    <span className={eta.late ? "text-error" : "text-accent"}>{eta.late ? copy.late : copy.onTime}</span>
                    {eta.milesRemaining !== null ? (
                        <span className="text-text-muted">{fillTemplate(copy.miles, { miles: count(Math.round(eta.milesRemaining)) })}</span>
                    ) : null}
                </p>
            ) : null}
            {last && !delivered ? (
                <p className="text-text-muted text-xs">
                    {fillTemplate(copy.window, {
                        window: `${dayName(last.windowStart, zone)}, ${shortTime(last.windowStart, zone)}–${shortTime(last.windowEnd, zone)}`,
                    })}
                </p>
            ) : null}
        </HudPanel>
    );
}
