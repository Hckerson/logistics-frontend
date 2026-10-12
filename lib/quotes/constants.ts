export const EQUIPMENT_TYPES = ["dry-van", "reefer", "flatbed"] as const;

export const LANE_FIELDS = ["origin", "destination", "equipment", "date"] as const;

export const PLACE_QUERY = { min: 2, max: 200, debounce: 250, limit: 6 } as const;

export const ESTIMATE_TIMING = { slowMs: 5_000, timeoutMs: 15_000, staleMs: 5 * 60_000, trendStaleMs: 60 * 60_000 } as const;

export const TREND = { days: 30, minimumDays: 14, width: 320, height: 72, pad: 4 } as const;

export const UNRESOLVED_LOCATION = {
    origin: "Origin could not be resolved",
    destination: "Destination could not be resolved",
} as const;

export const RATE_LOCALE = "en-US";

export const RATE_CURRENCY = "USD";
