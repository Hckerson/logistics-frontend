import type { LoadDto, LoadPositionsDto } from "@/lib/contract/schemas";
import { shareAt } from "@/lib/maps/route";
import { deliveredAt } from "@/lib/loads/tracking";
import type { MapRoute, RouteLine } from "@/lib/types";

export const loadRoute = ({ status, stops }: Pick<LoadDto, "status" | "stops">, { latest, health }: Pick<LoadPositionsDto, "latest" | "health">, line: RouteLine): MapRoute => {
    if (deliveredAt(stops)) return { ...line, travelled: 1, live: false };
    if (latest) return { ...line, travelled: shareAt(line, [latest.longitude, latest.latitude]), live: status === "InTransit" && health === "fresh" };

    const reached = stops.filter((stop) => stop.arrivedAt).at(-1);
    return { ...line, travelled: reached ? shareAt(line, [reached.facility.longitude, reached.facility.latitude]) : 0, live: false };
};
