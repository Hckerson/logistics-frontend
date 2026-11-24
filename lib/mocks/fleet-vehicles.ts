import { nanoid } from "nanoid";
import { can } from "@/lib/auth/capabilities";
import { HTTP_STATUS, TIME_MS } from "@/lib/constants";
import { vehicleVersionDtoSchema, type EldLinkDto, type FleetVehicleDto } from "@/lib/contract/schemas";
import { MOCK_ROSTER } from "@/lib/data/mocks/trucks";
import { ROSTER } from "@/lib/fleet/constants";
import { activeLoadOf, carrierDrivers, driverName } from "@/lib/mocks/fleet-entries";
import { fleetCarrier } from "@/lib/mocks/fleet-plan";
import { fleetStore } from "@/lib/mocks/fleet-store";
import { FREIGHT_MESSAGES, withCaller, type MockCaller } from "@/lib/mocks/freight-access";
import { fail, ok } from "@/lib/mocks/http";
import type { MockTrailer, MockTruck, MockVehicle } from "@/lib/types";
import { fillTemplate } from "@/lib/utils/fill-template";
import { queryOf } from "@/lib/validations/freight";
import { vehicleQuerySchema, vehicleSchema } from "@/lib/validations/fleet";

const VEHICLE_MESSAGES = {
    forbidden: "Only your carrier's admins can change vehicles",
    missing: "Vehicle not found",
    stale: "The vehicle changed since you opened it",
    vin: "VIN {vin} is already on unit {unit}",
    plate: "Plate {plate} ({state}) is already on unit {unit}",
    driver: "That driver isn't on your team",
    kind: "A truck can't become a trailer, or a trailer a truck",
    busy: "Unit {unit} is on {load}; retire it after that load delivers",
} as const;

const eldOf = (truck: MockTruck, now: number): EldLinkDto => {
    if (truck.eldAgeMinutes === null) return { state: "notLinked", reportedAt: null };
    const state = truck.eldAgeMinutes > ROSTER.eldFreshMinutes ? "lost" : "connected";
    return { state, reportedAt: new Date(now - truck.eldAgeMinutes * TIME_MS.minute).toISOString() };
};

const toVehicle = (entry: MockVehicle, now: number): FleetVehicleDto => {
    const truck = entry.kind === "truck" ? entry.vehicle : null;
    const currentLoadId = truck ? (activeLoadOf((load) => load.truck === truck.id)?.id ?? null) : null;
    const { id, unit, equipment, vin, plate, plateState, version, updatedAt, updatedBy } = entry.vehicle;
    const driver = { driverId: truck?.driver ?? null, driverName: driverName(truck?.driver ?? null), eld: truck ? eldOf(truck, now) : null };
    return { id, kind: entry.kind, unit, equipment, vin, plate, plateState, ...driver, currentLoadId, version, updatedAt, updatedBy };
};

const trailerLast = ({ kind }: MockVehicle) => Number(kind === "trailer");

const byUnit = (first: MockVehicle, second: MockVehicle) =>
    trailerLast(first) - trailerLast(second) || first.vehicle.unit.localeCompare(second.vehicle.unit, undefined, { numeric: true });

const vehiclesOf = (carrier: string): MockVehicle[] => {
    const { trucks, trailers } = fleetStore();
    return [
        ...[...trucks.values()].filter((truck) => truck.carrier === carrier).map((vehicle) => ({ kind: "truck" as const, vehicle })),
        ...[...trailers.values()].filter((trailer) => trailer.carrier === carrier).map((vehicle) => ({ kind: "trailer" as const, vehicle })),
    ].sort(byUnit);
};

const carrierFor = (caller: MockCaller, write: boolean) => {
    const carrier = fleetCarrier(caller);
    return carrier && can(caller.user.roles, write ? "editVehicles" : "planFleet") ? carrier : null;
};

const clashOf = (carrier: string, id: string | null, { vin, plate, plateState }: Pick<MockTruck, "vin" | "plate" | "plateState">) => {
    const others = vehiclesOf(carrier).filter((entry) => entry.vehicle.id !== id);
    const sameVin = others.find((entry) => entry.vehicle.vin === vin);
    if (sameVin) return fillTemplate(VEHICLE_MESSAGES.vin, { vin, unit: sameVin.vehicle.unit });
    const samePlate = others.find((entry) => entry.vehicle.plate === plate && entry.vehicle.plateState === plateState);
    return samePlate ? fillTemplate(VEHICLE_MESSAGES.plate, { plate, state: plateState, unit: samePlate.vehicle.unit }) : null;
};

const pairDriver = (carrier: string, truckId: string, driver: string | null) => {
    if (!driver) return;
    fleetStore().trucks.forEach((truck) => {
        if (truck.carrier === carrier && truck.id !== truckId && truck.driver === driver) truck.driver = null;
    });
};

const stale = (path: string, { updatedBy, updatedAt }: MockTrailer) =>
    fail(HTTP_STATUS.preconditionFailed, VEHICLE_MESSAGES.stale, path, undefined, { changedBy: updatedBy, changedAt: updatedAt });

const ownVehicle = (carrier: string, vehicleId: string) => vehiclesOf(carrier).find((entry) => entry.vehicle.id === vehicleId) ?? null;

export const listVehicles = withCaller(({ path }, _params, caller) => {
    const carrier = carrierFor(caller, false);
    if (!carrier) return fail(HTTP_STATUS.forbidden, FREIGHT_MESSAGES.signedOut, path);
    const query = vehicleQuerySchema.safeParse(queryOf(path));
    if (!query.success) return fail(HTTP_STATUS.badRequest, FREIGHT_MESSAGES.invalid, path);
    const { kind, equipment } = query.data;
    const now = new Date().getTime();
    const shown = vehiclesOf(carrier).filter((entry) => (!kind || entry.kind === kind) && (!equipment || entry.vehicle.equipment === equipment));
    return ok(HTTP_STATUS.ok, shown.map((entry) => toVehicle(entry, now)));
});

export const saveVehicle = withCaller(({ path, body }, { vehicleId }, caller) => {
    const carrier = carrierFor(caller, true);
    if (!carrier) return fail(HTTP_STATUS.forbidden, VEHICLE_MESSAGES.forbidden, path);
    const input = vehicleSchema.safeParse(body);
    if (!input.success) return fail(HTTP_STATUS.unprocessable, FREIGHT_MESSAGES.invalid, path);
    const { kind, unit, equipment, vin, plate, plateState, version } = input.data;
    const driver = kind === "truck" ? (input.data.driverId ?? null) : null;
    if (driver && !carrierDrivers(carrier).some((user) => user.id === driver)) return fail(HTTP_STATUS.unprocessable, VEHICLE_MESSAGES.driver, path);

    const current = vehicleId ? ownVehicle(carrier, vehicleId) : null;
    if (vehicleId && !current) return fail(HTTP_STATUS.notFound, VEHICLE_MESSAGES.missing, path);
    if (current && current.kind !== kind) return fail(HTTP_STATUS.unprocessable, VEHICLE_MESSAGES.kind, path);
    if (current && version !== current.vehicle.version) return stale(path, current.vehicle);
    const clash = clashOf(carrier, current?.vehicle.id ?? null, { vin, plate, plateState });
    if (clash) return fail(HTTP_STATUS.conflict, clash, path);

    const now = new Date().getTime();
    const stamp = { unit, equipment, vin, plate, plateState, version: (current?.vehicle.version ?? 0) + 1, updatedAt: new Date(now).toISOString(), updatedBy: caller.user.name };
    const { trucks, trailers } = fleetStore();
    if (kind === "trailer") {
        const trailer: MockTrailer = { ...(current?.vehicle ?? { id: `trl_${nanoid()}`, carrier }), ...stamp };
        trailers.set(trailer.id, trailer);
        return ok(current ? HTTP_STATUS.ok : HTTP_STATUS.created, toVehicle({ kind, vehicle: trailer }, now));
    }
    const existing = current?.kind === "truck" ? current.vehicle : null;
    const home = existing?.home ?? [...trucks.values()].find((truck) => truck.carrier === carrier)?.home ?? MOCK_ROSTER.defaultHome;
    const truck: MockTruck = { ...(existing ?? { id: `veh_${nanoid()}`, carrier, eldAgeMinutes: null }), home, driver, ...stamp };
    pairDriver(carrier, truck.id, driver);
    trucks.set(truck.id, truck);
    return ok(current ? HTTP_STATUS.ok : HTTP_STATUS.created, toVehicle({ kind, vehicle: truck }, now));
});

export const retireVehicle = withCaller(({ path, body }, { vehicleId }, caller) => {
    const carrier = carrierFor(caller, true);
    if (!carrier) return fail(HTTP_STATUS.forbidden, VEHICLE_MESSAGES.forbidden, path);
    const input = vehicleVersionDtoSchema.safeParse(body);
    if (!input.success) return fail(HTTP_STATUS.unprocessable, FREIGHT_MESSAGES.invalid, path);
    const entry = ownVehicle(carrier, vehicleId);
    if (!entry) return fail(HTTP_STATUS.notFound, VEHICLE_MESSAGES.missing, path);
    if (input.data.version !== entry.vehicle.version) return stale(path, entry.vehicle);
    const busy = entry.kind === "truck" ? activeLoadOf((load) => load.truck === entry.vehicle.id) : null;
    if (busy) return fail(HTTP_STATUS.conflict, fillTemplate(VEHICLE_MESSAGES.busy, { unit: entry.vehicle.unit, load: busy.id }), path);

    const { trucks, trailers, retired } = fleetStore();
    const now = new Date().getTime();
    const dto = toVehicle(entry, now);
    (entry.kind === "truck" ? trucks : trailers).delete(entry.vehicle.id);
    retired.set(entry.vehicle.id, { ...entry.vehicle, updatedAt: new Date(now).toISOString(), updatedBy: caller.user.name });
    return ok(HTTP_STATUS.ok, dto);
});
