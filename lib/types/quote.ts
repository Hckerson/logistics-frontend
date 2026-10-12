import type { z } from "zod";
import type { EQUIPMENT_TYPES } from "@/lib/enums/equipment-type";
import type { laneQuerySchema, placeSchema, rateEstimateSchema, trendPointSchema } from "@/lib/validations/lane";

export type Equipment = (typeof EQUIPMENT_TYPES)[number];

export type LaneQuery = z.infer<typeof laneQuerySchema>;

export type LaneField = keyof LaneQuery;

export type LaneEntry = Record<LaneField, string>;

export type Place = z.infer<typeof placeSchema>;

export type RateEstimate = z.infer<typeof rateEstimateSchema>;

export type Confidence = RateEstimate["confidence"];

export type TrendPoint = z.infer<typeof trendPointSchema>;

export type EstimateFailure =
    | { kind: "unresolved"; field: "origin" | "destination" }
    | { kind: "rate-limited"; wait: number }
    | { kind: "unavailable" }
    | { kind: "timeout" }
    | { kind: "server" };
