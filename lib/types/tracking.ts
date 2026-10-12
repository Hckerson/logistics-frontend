import type { TrackingSnapshot } from "@/lib/types/loads";

export type TrackingPhase = "scheduled" | "pickup" | "transit" | "delivery" | "delivered" | "cancelled" | "held";

export type TrackingRead = { kind: "found"; snapshot: TrackingSnapshot } | { kind: "missing" } | { kind: "rate-limited"; wait: number };
