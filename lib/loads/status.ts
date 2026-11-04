import type { LoadQualifier, LoadStatus, SignalTone, StatusDisplay } from "@/lib/types";

export const LOAD_STATUS_LABELS: Record<LoadStatus, string> = {
    Draft: "Draft",
    PendingApproval: "Pending approval",
    Posted: "Posted",
    Booked: "Booked",
    Dispatched: "Dispatched",
    AtPickup: "At pickup",
    InTransit: "In transit",
    AtDelivery: "At delivery",
    Delivered: "Delivered",
    PodVerified: "POD verified",
    Invoiced: "Invoiced",
    Paid: "Paid",
    Closed: "Closed",
    Cancelled: "Cancelled",
    Expired: "Expired",
    OnHold: "On hold",
    Disputed: "Disputed",
};

export const LOAD_STATUS_TONES: Record<LoadStatus, SignalTone> = {
    Draft: "neutral",
    PendingApproval: "warning",
    Posted: "neutral",
    Booked: "neutral",
    Dispatched: "live",
    AtPickup: "live",
    InTransit: "live",
    AtDelivery: "live",
    Delivered: "success",
    PodVerified: "success",
    Invoiced: "success",
    Paid: "success",
    Closed: "success",
    Cancelled: "muted",
    Expired: "muted",
    OnHold: "warning",
    Disputed: "danger",
};

export const LOAD_QUALIFIERS: Record<LoadQualifier, Omit<StatusDisplay, "pulse">> = {
    late: { label: "Running late", tone: "warning" },
    stale: { label: "Position stale", tone: "muted" },
};

const MOVING: readonly LoadStatus[] = ["InTransit"];

export const loadStatusDisplay = (status: LoadStatus, qualifier?: LoadQualifier): StatusDisplay =>
    qualifier
        ? { ...LOAD_QUALIFIERS[qualifier], pulse: false }
        : { label: LOAD_STATUS_LABELS[status], tone: LOAD_STATUS_TONES[status], pulse: MOVING.includes(status) };
