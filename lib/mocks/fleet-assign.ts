import { can } from "@/lib/auth/capabilities";
import { HTTP_STATUS } from "@/lib/constants";
import type { FleetOptionDto, FleetSuggestionDto } from "@/lib/contract/schemas";
import { LOAD_COPY } from "@/lib/data/loads/copy";
import { MOCK_FACILITIES } from "@/lib/data/mocks/facilities";
import { assignmentDeadline } from "@/lib/fleet/time";
import { carrierDrivers, carrierLoads, driverName, movable, overlaps, spanOf } from "@/lib/mocks/fleet-entries";
import { fleetStore } from "@/lib/mocks/fleet-store";
import { freightStore } from "@/lib/mocks/freight-store";
import { FREIGHT_MESSAGES, loadMissing, recordEvent, staleLoad, visibleLoad, withCaller, type MockCaller } from "@/lib/mocks/freight-access";
import { fail, ok } from "@/lib/mocks/http";
import { toLoadDetail } from "@/lib/mocks/load-views";
import type { MockLoad } from "@/lib/types";
import { assignSchema } from "@/lib/validations/fleet";

const ASSIGN_MESSAGES = {
    closed: "Loads in transit or delivered keep their driver and truck",
    stale: "The load changed since you opened it",
    reason: "Give a reason for the reassignment",
} as const;

const clock = (instant: number, timeZone: string) =>
    new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short", hour: "numeric", minute: "2-digit" }).format(instant);

const zoneOf = (load: MockLoad) => MOCK_FACILITIES[load.stops[0].facility].timeZone;

const busyWith = (load: MockLoad, matches: (other: MockLoad) => boolean) =>
    carrierLoads(load.carrier).find((other) => other.id !== load.id && matches(other) && overlaps(spanOf(other), spanOf(load))) ?? null;

const driversFor = (load: MockLoad): FleetOptionDto[] =>
    carrierDrivers(load.carrier).map((user) => {
        const clash = busyWith(load, (other) => other.driver === user.id);
        return {
            id: user.id,
            label: user.name,
            detail: null,
            eligible: !clash,
            reason: clash ? `On ${clash.id} until ${clock(spanOf(clash).to, zoneOf(clash))}` : null,
        };
    });

const trucksFor = (load: MockLoad): FleetOptionDto[] =>
    [...fleetStore().trucks.values()]
        .filter((truck) => truck.carrier === load.carrier)
        .map((truck) => {
            const clash = busyWith(load, (other) => other.truck === truck.id);
            const down = [...fleetStore().unavailable.values()].find((period) => period.truck === truck.id && overlaps(period, spanOf(load)));
            const reason =
                truck.equipment !== load.equipment
                    ? `${LOAD_COPY.equipment[load.equipment]} required`
                    : down
                      ? `Unavailable until ${clock(down.to, zoneOf(load))}`
                      : clash
                        ? `Runs ${clash.id} then`
                        : null;
            return { id: truck.id, label: `Unit ${truck.unit}`, detail: driverName(truck.driver), eligible: reason === null, reason };
        });

const fits = (options: readonly FleetOptionDto[], id: string | null | undefined) => options.some((option) => option.id === id && option.eligible);

const suggestionFor = (load: MockLoad, drivers: readonly FleetOptionDto[], trucks: readonly FleetOptionDto[]): FleetSuggestionDto | null => {
    const usedAt = (other: MockLoad) => Date.parse(other.assignedAt ?? other.createdAt);
    const recent = [...freightStore().loads.values()]
        .filter((other) => other.id !== load.id && other.carrier === load.carrier && other.driver && other.truck)
        .filter((other) => other.driver !== load.driver || other.truck !== load.truck)
        .sort((first, second) => usedAt(second) - usedAt(first))
        .find((other) => fits(drivers, other.driver) && fits(trucks, other.truck));
    if (!recent?.driver || !recent.truck) return null;
    return { driverId: recent.driver, truckId: recent.truck, loadId: recent.id, assignedAt: recent.assignedAt ?? recent.createdAt };
};

const deadlineOf = (load: MockLoad) => new Date(assignmentDeadline(load.stops[0].windowStart)).toISOString();

const assignable = (caller: MockCaller, loadId: string) => {
    const load = visibleLoad(caller, loadId);
    return load && can(caller.user.roles, "assignLoad") ? load : null;
};

export const fleetOptions = withCaller(({ path }, { loadId }, caller) => {
    const load = assignable(caller, loadId);
    if (!load) return loadMissing(path);
    const drivers = driversFor(load);
    const trucks = trucksFor(load);
    return ok(HTTP_STATUS.ok, {
        drivers,
        trucks,
        driverId: load.driver,
        truckId: load.truck ?? null,
        deadline: movable(load.status) ? deadlineOf(load) : null,
        suggestion: suggestionFor(load, drivers, trucks),
        version: load.version,
        timeZone: zoneOf(load),
        reassign: load.driver !== null && Boolean(load.truck),
    });
});

export const assignLoad = withCaller(({ path, body }, { loadId }, caller) => {
    const load = assignable(caller, loadId);
    if (!load) return loadMissing(path);
    const input = assignSchema.safeParse(body);
    if (!input.success) return fail(HTTP_STATUS.badRequest, FREIGHT_MESSAGES.invalid, path);
    if (!movable(load.status)) return fail(HTTP_STATUS.conflict, ASSIGN_MESSAGES.closed, path);
    if (input.data.version !== load.version) return staleLoad(path, ASSIGN_MESSAGES.stale, load);

    const reassign = load.driver !== null && Boolean(load.truck);
    if ((reassign || caller.staff) && !input.data.reason) return fail(HTTP_STATUS.unprocessable, ASSIGN_MESSAGES.reason, path);
    const driver = driversFor(load).find((option) => option.id === input.data.driverId);
    const truck = trucksFor(load).find((option) => option.id === input.data.truckId);
    if (!driver || !truck) return fail(HTTP_STATUS.unprocessable, FREIGHT_MESSAGES.invalid, path);
    const refusal = driver.reason ?? truck.reason;
    if (refusal) return fail(HTTP_STATUS.conflict, refusal, path);

    const now = new Date().getTime();
    const at = new Date(now).toISOString();
    const from = load.status;
    Object.assign(load, {
        driver: input.data.driverId,
        truck: input.data.truckId,
        trackingSource: input.data.trackingSource,
        assignedAt: at,
        status: from === "Booked" ? "Dispatched" : from,
        version: load.version + 1,
        updatedAt: at,
        updatedBy: caller.user.name,
    });
    recordEvent(load.id, caller, { type: "driverAssigned", category: "status", note: `${driver.label} · ${truck.label}`, reason: input.data.reason ?? null });
    if (from === "Booked") recordEvent(load.id, caller, { type: "statusChanged", category: "status", fromStatus: from, toStatus: "Dispatched" });
    return ok(HTTP_STATUS.ok, toLoadDetail(load, caller, now));
});
