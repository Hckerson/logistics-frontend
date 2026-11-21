import type { MockScenario, QuoteConfidence, Requirement } from "@/lib/types";

export const MOCK_POSTING = {
    quoteMinutes: 30,
    unpricedMiles: 2_500,
    confidenceMiles: { high: 900, medium: 1_700 } satisfies Partial<Record<QuoteConfidence, number>>,
    surchargeCents: { team: 45_000, liftgate: 9_500, tarps: 12_500, driverAssist: 7_500 } satisfies Record<Requirement, number>,
    hazmatCents: 15_000,
    quoteBurst: { count: 6, windowMs: 60_000, retryAfter: 60 },
    defaults: { equipment: "dry-van", commodity: "", weightLb: 0 },
    messages: {
        missing: "Draft not found",
        notDraft: "This load is no longer a draft",
        stale: "This draft changed in another tab",
        incomplete: "Finish the freight step before pricing",
        unserviceable: "This lane can't be priced instantly",
        expired: "The quote expired",
        noQuote: "Get a price before posting",
        forbidden: "Your organisation can't post loads yet",
        pastWindow: "A pickup or delivery window has already started",
        drafted: "Draft saved from Post a load",
        posted: "Posted from Post a load",
        approval: "Waiting for approval from {approvers}",
    },
} as const;

export const MOCK_POSTING_SCENARIOS: Record<string, MockScenario> = {
    busy: { kind: "rate-limited", retryAfter: MOCK_POSTING.quoteBurst.retryAfter },
    down: { kind: "unavailable" },
};
