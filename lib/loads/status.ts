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

export const LOAD_STATUS_STAGES: Record<LoadStatus, number | null> = {
    Draft: 0,
    PendingApproval: 0,
    Posted: 0.08,
    Booked: 0.2,
    Dispatched: 0.32,
    AtPickup: 0.42,
    InTransit: 0.62,
    AtDelivery: 0.85,
    Delivered: 1,
    PodVerified: 1,
    Invoiced: 1,
    Paid: 1,
    Closed: 1,
    Cancelled: null,
    Expired: null,
    OnHold: null,
    Disputed: 1,
};

export const LOAD_QUALIFIERS: Record<LoadQualifier, Omit<StatusDisplay, "pulse" | "stage">> = {
    late: { label: "Running late", tone: "warning" },
    stale: { label: "Position stale", tone: "muted" },
};

export const LOAD_QUALIFIED_LABELS: Record<LoadQualifier, Partial<Record<LoadStatus, string>>> = {
    late: {
        Dispatched: "Dispatched · late",
        AtPickup: "At pickup · late",
        InTransit: "In transit · late",
        AtDelivery: "At delivery · late",
    },
    stale: {
        Dispatched: "Dispatched · stale",
        AtPickup: "At pickup · stale",
        InTransit: "In transit · stale",
        AtDelivery: "At delivery · stale",
    },
};

const MOVING: readonly LoadStatus[] = ["InTransit"];

export const loadStatusDisplay = (status: LoadStatus, qualifier?: LoadQualifier): StatusDisplay => {
    const stage = LOAD_STATUS_STAGES[status];
    if (!qualifier) return { label: LOAD_STATUS_LABELS[status], tone: LOAD_STATUS_TONES[status], pulse: MOVING.includes(status), stage };
    const { label, tone } = LOAD_QUALIFIERS[qualifier];
    return { label: LOAD_QUALIFIED_LABELS[qualifier][status] ?? label, tone, pulse: false, stage };
};
