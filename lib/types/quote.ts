import type { z } from "zod";
import type { PlaceDto, RateEstimateDto, TrendPointDto } from "@/lib/contract/schemas";
import type { EQUIPMENT_TYPES } from "@/lib/enums/equipment-type";
import type { laneQuerySchema } from "@/lib/validations/lane";

export type Equipment = (typeof EQUIPMENT_TYPES)[number];

export type LaneQuery = z.infer<typeof laneQuerySchema>;

export type LaneField = keyof LaneQuery;

export type LaneEntry = Record<LaneField, string>;

export type Place = PlaceDto;

export type RateEstimate = RateEstimateDto;

export type Confidence = RateEstimate["confidence"];

export type TrendPoint = TrendPointDto;

export type EstimateFailure =
    | { kind: "unresolved"; field: "origin" | "destination" }
    | { kind: "rate-limited"; wait: number }
    | { kind: "unavailable" }
    | { kind: "timeout" }
    | { kind: "server" };
