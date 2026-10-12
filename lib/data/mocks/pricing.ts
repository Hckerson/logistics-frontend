import type { Confidence, Equipment, MockScenario } from "@/lib/types";

export const MOCK_PRICING = {
    perMile: { "dry-van": 2.35, reefer: 2.78, flatbed: 2.96 } satisfies Record<Equipment, number>,
    roadFactor: 1.18,
    weekend: 1.05,
    wobble: 0.08,
    roundTo: 5,
    spread: { high: 0.07, medium: 0.12, low: 0.22 } satisfies Record<Confidence, number>,
    samples: { high: 48, medium: 17, low: 4 } satisfies Record<Confidence, number>,
    trend: { days: 30, thinDays: 9, drift: 0.0021, swing: 0.014, wave: 1.7, dailyShare: 6, jitter: 2 },
} as const;

export const MOCK_PRICING_SCENARIOS: Record<string, MockScenario> = {
    busy: { kind: "rate-limited", retryAfter: 60 },
    down: { kind: "unavailable" },
};
