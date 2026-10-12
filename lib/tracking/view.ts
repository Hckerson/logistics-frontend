import type { PublicTrackingDto } from "@/lib/contract/schemas";
import { TRACKING_LOCALE } from "@/lib/tracking/constants";
import type { LoadStatus, LonLat, MapStop, TrackingPhase } from "@/lib/types";

const PHASES: Partial<Record<LoadStatus, TrackingPhase>> = {
    AtPickup: "pickup",
    InTransit: "transit",
    AtDelivery: "delivery",
    Delivered: "delivered",
    PodVerified: "delivered",
    Invoiced: "delivered",
    Paid: "delivered",
    Closed: "delivered",
    Cancelled: "cancelled",
    OnHold: "held",
};

type Tracking = Pick<PublicTrackingDto, "status" | "deliveredAt">;

export const phaseOf = ({ status, deliveredAt }: Tracking): TrackingPhase =>
    deliveredAt ? "delivered" : (PHASES[status] ?? "scheduled");

export const nextStop = (stops: PublicTrackingDto["stops"]) => stops.findIndex((stop) => !stop.departedAt);

export const mapStops = (stops: PublicTrackingDto["stops"]): MapStop[] =>
    stops.map((stop) => ({ position: [stop.longitude, stop.latitude], type: stop.type, done: Boolean(stop.departedAt) }));

export const laneOf = (stops: PublicTrackingDto["stops"]): LonLat[] => stops.map((stop) => [stop.longitude, stop.latitude]);

const formatter = (options: Intl.DateTimeFormatOptions) => (iso: string, timeZone: string) =>
    new Intl.DateTimeFormat(TRACKING_LOCALE, { ...options, timeZone }).format(new Date(iso));

export const clockTime = formatter({ hour: "numeric", minute: "2-digit", timeZoneName: "short" });

export const shortTime = formatter({ hour: "numeric", minute: "2-digit" });

export const dayName = formatter({ weekday: "short", month: "short", day: "numeric" });

export const longDate = formatter({ month: "long", day: "numeric", year: "numeric" });

const relative = new Intl.RelativeTimeFormat(TRACKING_LOCALE, { style: "short", numeric: "auto" });
const MINUTES_PER_HOUR = 60;

export const ageOf = (minutes: number) =>
    minutes < MINUTES_PER_HOUR * 2
        ? relative.format(-Math.max(0, Math.round(minutes)), "minute")
        : relative.format(-Math.round(minutes / MINUTES_PER_HOUR), "hour");
