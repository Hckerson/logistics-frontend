import { TIME_MS } from "@/lib/constants";

export const LOAD_BOARD = {
    pageSize: 50,
    pageMax: 200,
    refreshMs: 30 * TIME_MS.second,
    searchDebounceMs: 500,
    radius: { min: 10, max: 500, step: 5, presets: [25, 50, 100, 250], fallback: 100 },
    widenRadius: 100,
    widenDays: 1,
    similarLimit: 3,
    similarRadius: 250,
    signerMax: 200,
    graceSeconds: 120,
} as const;

export const BOARD_VIEWS = ["list", "map"] as const;

export const BOOKING_FIXES = { onboarding: "carrierOnboarding", documents: "documents", fleet: "fleet", loadBoard: "loadBoard" } as const;
