import type { PublicTrackingDto } from "@/lib/contract/schemas";
import { TRACKING_COPY } from "@/lib/data/tracking/copy";
import { dayName, phaseOf, shortTime } from "@/lib/tracking/view";
import { fillTemplate } from "@/lib/utils/fill-template";

const { lead } = TRACKING_COPY;

export function trackingLead(tracking: PublicTrackingDto) {
    const last = tracking.stops[tracking.stops.length - 1];
    const zone = last?.timeZone ?? "UTC";
    const phase = phaseOf(tracking);
    const when = (iso: string) => ({ day: dayName(iso, zone), time: shortTime(iso, zone) });

    if (phase === "delivered" && tracking.deliveredAt) {
        return fillTemplate(lead.delivered, { ...when(tracking.deliveredAt), city: last?.city ?? "" });
    }
    if (phase === "cancelled") return lead.cancelled;
    if (phase === "held") return lead.held;
    if (!tracking.eta) return lead.unknown;
    return fillTemplate(tracking.eta.late ? lead.late : lead.arriving, when(tracking.eta.at));
}
