import HudPanel from "@/components/common/hud-panel";
import type { PublicTrackingDto } from "@/lib/contract/schemas";
import { TRACKING_COPY } from "@/lib/data/tracking/copy";
import { dayName, shortTime } from "@/lib/tracking/view";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    tracking: PublicTrackingDto;
}

const { ended, note } = TRACKING_COPY;

export default function TrackingEnded({ tracking }: Props) {
    const last = tracking.stops[tracking.stops.length - 1];
    const zone = last?.timeZone ?? "UTC";

    return (
        <HudPanel label={TRACKING_COPY.position.label} status={ended.label} alert note={note} className="max-w-xl">
            <p className="text-text-secondary text-sm">
                {tracking.deliveredAt
                    ? fillTemplate(ended.delivered, {
                          day: dayName(tracking.deliveredAt, zone),
                          time: shortTime(tracking.deliveredAt, zone),
                          city: last?.city ?? "",
                      })
                    : TRACKING_COPY.lead.cancelled}
            </p>
        </HudPanel>
    );
}
