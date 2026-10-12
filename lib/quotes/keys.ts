import type { LaneQuery } from "@/lib/types";

export const quoteKeys = {
    all: ["quotes"] as const,
    estimate: (lane: LaneQuery | null) => ["quotes", "estimate", lane] as const,
    trend: (lane: LaneQuery | null) => ["quotes", "trend", lane] as const,
    places: (query: string) => ["places", query] as const,
};
