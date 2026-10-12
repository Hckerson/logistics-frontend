import type { LoadStatus } from "@/lib/types";

export const LOAD_ACTORS = ["Shipper", "Approver", "Carrier", "Driver", "Operations", "Compliance", "Finance", "System"] as const;

export const ACTIVE_LOAD_STATUSES: readonly LoadStatus[] = [
    "Posted",
    "Booked",
    "Dispatched",
    "AtPickup",
    "InTransit",
    "AtDelivery",
    "Delivered",
    "PodVerified",
    "Invoiced",
    "Paid",
    "Disputed",
];

export const UNDOABLE_LOAD_STATUSES: readonly LoadStatus[] = ["AtPickup", "InTransit", "AtDelivery", "Delivered"];

export const STOP_EVENT_UNDO_MINUTES = 5;
