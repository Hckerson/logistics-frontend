import type { LoadStatus, MockStop } from "@/lib/types";

const AT_STOP: readonly LoadStatus[] = ["AtPickup", "AtDelivery"];
const LEFT_STOP: readonly LoadStatus[] = ["InTransit", "Delivered"];

export const applyStopTimes = (stops: MockStop[], from: LoadStatus, to: LoadStatus, undo: boolean, now: string) => {
    const current = stops.find((stop) => !stop.departedAt);
    const lastDeparted = stops.filter((stop) => stop.departedAt).at(-1);

    if (undo) {
        if (AT_STOP.includes(from) && current) current.arrivedAt = null;
        else if (LEFT_STOP.includes(from) && lastDeparted) lastDeparted.departedAt = null;
        return;
    }
    if (!current) return;
    if (AT_STOP.includes(to)) current.arrivedAt = now;
    else if (AT_STOP.includes(from) && LEFT_STOP.includes(to)) current.departedAt = now;
};
