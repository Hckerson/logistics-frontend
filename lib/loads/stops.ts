import type { StopDto } from "@/lib/contract/schemas";
import type { LoadStatus } from "@/lib/types";

export const stopFits = (to: LoadStatus, stops: readonly Pick<StopDto, "type" | "departedAt">[]) => {
    const index = stops.findIndex((stop) => !stop.departedAt);
    const current = index === -1 ? undefined : stops[index];
    if (to === "AtPickup") return current?.type === "pickup";
    if (to === "AtDelivery") return current?.type === "delivery";
    if (to === "InTransit") return index !== -1 && index < stops.length - 1;
    if (to === "Delivered") return index === stops.length - 1;
    return true;
};
