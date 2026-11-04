import type { PublicTrackingDto } from "@/lib/contract/schemas";
import { shareAt } from "@/lib/maps/route";
import { phaseOf } from "@/lib/tracking/view";
import type { MapRoute, RouteLine } from "@/lib/types";

export const trackingRoute = (tracking: PublicTrackingDto, line: RouteLine, stale: boolean): MapRoute => {
    const phase = phaseOf(tracking);
    const { position } = tracking;

    if (phase === "delivered") return { ...line, travelled: 1, live: false };
    if (position) return { ...line, travelled: shareAt(line, [position.longitude, position.latitude]), live: phase === "transit" && !stale };

    const reached = tracking.stops.filter((stop) => stop.arrivedAt).at(-1);
    return { ...line, travelled: reached ? shareAt(line, [reached.longitude, reached.latitude]) : 0, live: false };
};

export const milesToGo = (tracking: PublicTrackingDto, route: MapRoute | null) =>
    tracking.eta?.milesRemaining ?? (route && tracking.route ? Math.round(tracking.route.miles * (1 - route.travelled)) : null);
