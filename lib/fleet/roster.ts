import type { EldLinkDto, FleetVehicleDto, SaveVehicleDto } from "@/lib/contract/schemas";
import { ROSTER_COPY } from "@/lib/data/fleet/roster-copy";
import { minutesSince } from "@/lib/loads/tracking";
import { ageOf } from "@/lib/tracking/view";
import type { VehicleField, VehicleQuery } from "@/lib/types";
import { fillTemplate } from "@/lib/utils/fill-template";
import { vehicleQuerySchema, vehicleSchema } from "@/lib/validations/fleet";

export const EQUIPMENT_PARAM = "equipment";

export const parseRosterSearch = (params: Record<string, string | string[] | undefined>): VehicleQuery => {
    const parsed = vehicleQuerySchema.safeParse({ [EQUIPMENT_PARAM]: params[EQUIPMENT_PARAM] });
    return parsed.success ? parsed.data : {};
};

export const eldText = ({ state, reportedAt }: EldLinkDto, now: number) => {
    const label = ROSTER_COPY.eld.states[state];
    return reportedAt ? fillTemplate(ROSTER_COPY.eld.aged, { state: label, age: ageOf(minutesSince(reportedAt, now)) }) : label;
};

const BLANK_VEHICLE: SaveVehicleDto = { kind: "truck", unit: "", equipment: "dry-van", vin: "", plate: "", plateState: "", driverId: null };

export const draftOf = (vehicle: FleetVehicleDto | null): SaveVehicleDto => {
    if (!vehicle) return BLANK_VEHICLE;
    const { kind, unit, equipment, vin, plate, plateState, driverId, version } = vehicle;
    return { kind, unit, equipment, vin, plate, plateState, driverId, version };
};

const FIELDS: readonly VehicleField[] = ["unit", "vin", "plate", "plateState"];

export const vehicleProblems = (draft: SaveVehicleDto) => {
    const problems: Partial<Record<VehicleField, string>> = {};
    const parsed = vehicleSchema.safeParse(draft);
    if (parsed.success) return problems;
    const failed = new Set(parsed.error.issues.map((issue) => issue.path[0]));
    FIELDS.filter((field) => failed.has(field)).forEach((field) => {
        problems[field] = ROSTER_COPY.editor.invalid[field];
    });
    return problems;
};
