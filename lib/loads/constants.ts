import { TIME_MS } from "@/lib/constants";
import type { ChargeDto, DocumentDto, LoadEventDto } from "@/lib/contract/schemas";
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

export const TRACKED_STATUSES: readonly LoadStatus[] = ["AtPickup", "InTransit", "AtDelivery"];

export const TRACE_STATUSES: readonly LoadStatus[] = [...TRACKED_STATUSES, "Delivered"];

export const STOP_EVENT_UNDO_MINUTES = 5;

export const LOAD_PAGE_SIZE = { default: 50, max: 200 } as const;

export const LOAD_SEARCH_MAX = 200;

export const QUICK_FIND = { min: 2, max: 200, groupLimit: 5, debounceMs: 300, recentLimit: 10 } as const;

export const QUERY_BASE = "http://query.local";

export const TIMELINE_CATEGORIES = ["status", "stop", "tracking", "document"] as const satisfies readonly LoadEventDto["category"][];

export const CURRENCY = "USD";

export const SUBTRACTIVE_CHARGES: readonly ChargeDto["kind"][] = ["deduction", "quickPayFee"];

export const TRACKING = {
    staleMinutes: 60,
    exceptionMinutes: 90,
    windowHours: 24,
    mapLoadLimit: 500,
    linkExpiryDays: 7,
    publicDecimals: 1,
    checkCallRepeatMinutes: 30,
    checkCallNoteMax: 500,
} as const;

export const DOCUMENT_RULES = { maxBytes: 20 * 1024 * 1024, maxFiles: 10, nameMax: 255, signedUrlSeconds: 300 } as const;

export const DOCUMENT_SCAN_POLL_MS = 5 * TIME_MS.second;

export const DOCUMENT_CONTENT_TYPES = ["application/pdf", "image/jpeg", "image/png"] as const satisfies readonly DocumentDto["contentType"][];

export const PUBLIC_TRACKING_HEADERS ={ "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" } as const;

export const TRACKING_SHARE ={ maxRecipients: 10, tokenPrefix: "trk_", tokenLength: 16 } as const;

export const POSITION_STREAM = {
    contentType: "text/event-stream",
    event: "positions",
    closeEvent: "closed",
    keepAlive: "keep-alive",
    pollMs: 15 * TIME_MS.second,
    headers: { "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" },
} as const;

export const REFRESH_MS = {
    tracking: TIME_MS.minute,
    publicTracking: 2 * TIME_MS.minute,
    notifications: TIME_MS.minute,
    counts: TIME_MS.minute,
} as const;
