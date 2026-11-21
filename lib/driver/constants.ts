import type { LoadStatus } from "@/lib/types";

export const DRIVER_TRIP_STATUSES: readonly LoadStatus[] = ["Booked", "Dispatched", "AtPickup", "InTransit", "AtDelivery", "Delivered"];

export const DRIVER_MOVING_STATUSES: readonly LoadStatus[] = ["AtPickup", "InTransit", "AtDelivery", "Delivered"];

export const OPERATIONS_CONTACT = { name: "Haulr operations, 24/7", phone: "+1 800 555 0199" } as const;

export const DRIVER_QUEUE = {
    database: "haulr-driver",
    version: 1,
    stores: { queue: "queue", keys: "keys", cache: "cache" },
    retentionDays: 7,
    retryMs: 30_000,
} as const;

export const STOP_EVENT_LIMITS = { sealMax: 30, piecesMax: 99_999 } as const;

export const POD_LIMITS = { minPages: 1, maxPages: 10, receiverMax: 120, notesMax: 1000 } as const;

export const POD_IMAGE = {
    types: ["image/jpeg", "image/png"],
    minShortSide: 600,
    maxLongSide: 1600,
    sampleWidth: 240,
    darkLuminance: 0.16,
    blurVariance: 40,
    jpegQuality: 0.85,
    outputType: "image/jpeg",
} as const;

export const DRIVER_LOCATION = { maximumAge: 60_000, timeout: 15_000, enableHighAccuracy: true } as const;
