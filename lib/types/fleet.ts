import type { z } from "zod";
import type { DriverInvitationDto, FleetDriverDto, FleetEntryDto, FleetRowDto, FleetTruckDto, FleetUnavailableDto, FleetVehicleDto, FleetWindowDto } from "@/lib/contract/schemas";
import type { Equipment } from "./quote";
import type { fleetQuerySchema, recommendationQuerySchema, vehicleQuerySchema } from "@/lib/validations/fleet";

export interface MockVehicleSpec {
    id: string;
    carrier: string;
    unit: string;
    equipment: Equipment;
    vin: string;
    plate: string;
    plateState: string;
}

export interface MockTruckSpec extends MockVehicleSpec {
    driver: string | null;
    home: string;
}

interface MockVersioned {
    version: number;
    updatedAt: string;
    updatedBy: string | null;
}

export type MockTrailer = MockVehicleSpec & MockVersioned;

export type MockTruck = MockTruckSpec & MockVersioned & { eldAgeMinutes: number | null };

export type VehicleKind = FleetVehicleDto["kind"];

export type MockVehicle = { kind: "truck"; vehicle: MockTruck } | { kind: "trailer"; vehicle: MockTrailer };

export type VehicleField = "unit" | "vin" | "plate" | "plateState";

export type RosterRemoval = { kind: "retire"; vehicle: FleetVehicleDto } | { kind: "deactivate"; driver: FleetDriverDto } | { kind: "revoke"; invitation: DriverInvitationDto };

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

export type VehicleQuery = z.infer<typeof vehicleQuerySchema>;

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
