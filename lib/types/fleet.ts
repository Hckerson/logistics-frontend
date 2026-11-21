import type { z } from "zod";
import type { FleetEntryDto, FleetRowDto, FleetTruckDto, FleetUnavailableDto, FleetWindowDto } from "@/lib/contract/schemas";
import type { Equipment } from "./quote";
import type { fleetQuerySchema, recommendationQuerySchema } from "@/lib/validations/fleet";

export interface MockTruck {
    id: string;
    carrier: string;
    unit: string;
    equipment: Equipment;
    driver: string | null;
    home: string;
}

export interface MockUnavailableSpec {
    truck: string;
    startsIn: number;
    endsIn: number;
    reason: FleetUnavailableDto["reason"];
    note: string;
}

export interface MockUnavailable {
    id: string;
    truck: string;
    from: number;
    to: number;
    reason: FleetUnavailableDto["reason"];
    note: string | null;
}

export interface MockEldReading {
    remainingMinutes: number | null;
    ageMinutes: number;
}

export type FleetQuery = z.infer<typeof fleetQuerySchema>;

export type RecommendationQuery = z.infer<typeof recommendationQuerySchema>;

export type PlanItem =
    | { kind: "entry"; entry: FleetEntryDto }
    | { kind: "unavailable"; period: FleetUnavailableDto }
    | { kind: "window"; window: FleetWindowDto };

export interface PlacedItem {
    key: string;
    item: PlanItem;
    start: number;
    span: number;
    lane: number;
}

export interface PlanRow {
    key: string;
    truck: FleetRowDto["truck"] | null;
    row: FleetRowDto | null;
    items: PlacedItem[];
    lanes: number;
}

export interface GridFocus {
    row: number;
    col: number;
    item: number | null;
    entered: boolean;
}

export interface PlanMove {
    entry: FleetEntryDto;
    from: number;
    target: number;
}

export interface AssignTarget {
    loadId: string;
    truckId?: string;
    driverId?: string | null;
}

export type PlanView = "grid" | "list";

export interface AvailabilityTarget {
    truck: FleetTruckDto;
    period: FleetUnavailableDto | null;
}
