import type { NotificationDto } from "@/lib/contract/schemas";

export const NOTIFICATION_COPY = {
    label: "Notifications",
    unread: { one: "Notifications, 1 unread", other: "Notifications, {count} unread" },
    arrived: { one: "1 new notification", other: "{count} new notifications" },
    markAll: "Mark all read",
    marking: "Marking…",
    empty: "You're all caught up.",
    unreadTag: "Unread",
    events: {
        checkCallRequested: "Check call requested on {reference}.",
        loadPosted: "{reference} was posted to the load board.",
        loadBooked: "{reference} was booked by a carrier.",
        bidReceived: "New bid on {reference}.",
        etaChanged: "The arrival estimate changed on {reference}.",
        trackingStale: "Tracking went quiet on {reference}.",
        podVerified: "Proof of delivery verified on {reference}.",
        invoiceDue: "An invoice is due on {reference}.",
        complianceChanged: "Your compliance status changed.",
        exportReady: "Your export is ready to download.",
    } satisfies Record<NotificationDto["event"], string>,
    noLoad: "a load",
} as const;
