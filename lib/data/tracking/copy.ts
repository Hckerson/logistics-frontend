import type { AuthLink, TrackingPhase } from "@/lib/types";
import { HOME_ROUTE, registerRoute } from "@/lib/constants";
import { AUTH_COPY } from "@/lib/data/auth/shared";
import { TRACKING } from "@/lib/loads/constants";

export const TRACKING_COPY = {
    meta: { title: "Track a load · Haulr", description: "Live status and arrival estimate for a shared load." },
    note: AUTH_COPY.note,
    eyebrow: "{reference} · Shared by {sharedBy}",
    phases: {
        scheduled: "Scheduled.",
        pickup: "At pickup.",
        transit: "In transit.",
        delivery: "At delivery.",
        delivered: "Delivered.",
        cancelled: "Cancelled.",
        held: "On hold.",
    } satisfies Record<TrackingPhase, string>,
    lead: {
        arriving: "Arriving {day} around {time}.",
        late: "Running late. Now arriving {day} around {time}.",
        unknown: "The arrival estimate is unavailable right now. Status and stops are still live.",
        delivered: "Delivered {day} at {time} in {city}.",
        cancelled: "This shipment was cancelled before delivery.",
        held: "This shipment is paused. Check back for an update.",
    },
    arrival: {
        label: "Arrival",
        board: "Estimated arrival",
        delivered: "Delivered",
        confidence: { high: "High confidence", medium: "Medium confidence", low: "Low confidence" },
        late: "Running late",
        onTime: "On time",
        miles: "{miles} mi to go",
        unavailable: "Estimate unavailable",
        window: "Delivery window {window}",
    },
    position: {
        label: "Live position",
        updated: "Updated {age}",
        lastSeen: "Last seen {age}",
        none: "No position yet",
        text: "Near {city} · {source} · {age}",
        stale: "This position is more than an hour old. The truck may be out of signal.",
        map: "Map of the load's stops, with the truck near {city}",
        sources: { eld: "ELD", driverApp: "Driver app", mobileWeb: "Driver's phone", checkCall: "Check call" },
    },
    stops: {
        label: "Stops",
        types: { pickup: "Pickup", delivery: "Delivery" },
        departed: "Departed {time}",
        arrived: "Arrived {time}",
        next: "Next",
    },
    link: {
        shared: "Shared by {sharedBy}.",
        until: "This link works until {date}.",
        live: `This link keeps working until ${TRACKING.linkExpiryDays} days after delivery.`,
        convert: "Moving freight yourself?",
        links: [
            { id: "ship", label: "Ship with Haulr", href: registerRoute("shipper") },
            { id: "home", label: "How Haulr works", href: HOME_ROUTE },
        ] satisfies AuthLink[],
    },
    ended: {
        title: "Tracking ended.",
        lead: "This link stopped working on {date}.",
        delivered: "The load was delivered {day} at {time} in {city}.",
        label: "Link expired",
    },
    missing: { eyebrow: "Tracking", title: "Link not found.", lead: "This tracking link doesn't work. Check you opened the newest message, or ask the sender for a new link." },
    problems: {
        title: "Tracking unavailable.",
        lead: "We couldn't load this shipment just now.",
        status: "Unavailable",
        rateLimited: "Too many checks from this connection. Try again in {time}.",
        unavailable: "Tracking is unavailable right now. Try again in a moment.",
        retry: "Try again",
    },
    announce: "Delivered at {time}.",
} as const;
