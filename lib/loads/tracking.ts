import { TIME_MS } from "@/lib/constants";
import { TRACKING } from "@/lib/loads/constants";
import type { PublicTrackingDto } from "@/lib/contract/schemas";
import type { StopClock, TrackingHealth } from "@/lib/types";

export const deliveredAt = (stops: readonly StopClock[]) =>
    stops.length > 0 && stops.every((stop) => stop.departedAt) ? stops[stops.length - 1].departedAt : null;

export const linkExpiry = (delivered: string | null) =>
    delivered ? new Date(Date.parse(delivered) + TRACKING.linkExpiryDays * TIME_MS.day).toISOString() : null;

export const minutesSince = (iso: string, now = Date.now()) => (now - Date.parse(iso)) / TIME_MS.minute;

export const healthOf = (recordedAt: string, now = Date.now()): TrackingHealth => {
    const age = minutesSince(recordedAt, now);
    if (age >= TRACKING.exceptionMinutes) return "exception";
    return age >= TRACKING.staleMinutes ? "stale" : "fresh";
};

export const trackingSettled = ({ expired, deliveredAt: delivered, status }: Pick<PublicTrackingDto, "expired" | "deliveredAt" | "status">) =>
    expired || delivered !== null || status === "Cancelled";

export const roundTo =(value: number, decimals: number) => Number(value.toFixed(decimals));
