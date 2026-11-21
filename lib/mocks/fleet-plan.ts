import { can } from "@/lib/auth/capabilities";
import { hasAnyRole, ROLE_GROUPS } from "@/lib/auth/roles";
import { HTTP_STATUS, TIME_MS } from "@/lib/constants";
import type { FleetConflictDto, FleetRowDto, FleetWindowDto } from "@/lib/contract/schemas";
import { MOCK_FACILITIES } from "@/lib/data/mocks/facilities";
import { MOCK_ORGANISATIONS } from "@/lib/data/mocks/team";
import { MOCK_CARRIER_ZONES, MOCK_ELD } from "@/lib/data/mocks/trucks";
import { FLEET } from "@/lib/fleet/constants";
import { DAY_PATTERN, addDays, assignmentDeadline, dayOf, startOfDay, weekOf, weekStartOf } from "@/lib/fleet/time";
import { latestPosition } from "@/lib/mocks/fleet";
import { pairConflicts, unavailableConflicts } from "@/lib/mocks/fleet-conflicts";
import { carrierLoads, driverName, overlaps, spanOf, toEntry } from "@/lib/mocks/fleet-entries";
import { fleetStore } from "@/lib/mocks/fleet-store";
import { FREIGHT_MESSAGES, withCaller, type MockCaller } from "@/lib/mocks/freight-access";
import { freightStore } from "@/lib/mocks/freight-store";
import { fail, ok } from "@/lib/mocks/http";
import type { MockLoad, MockTruck } from "@/lib/types";
import { milesApart } from "@/lib/utils/geo";
import { queryOf } from "@/lib/validations/freight";
import { fleetQuerySchema } from "@/lib/validations/fleet";

const IN_FLIGHT = new Set(["AtPickup", "InTransit", "AtDelivery"]);
const iso = (instant: number) => new Date(instant).toISOString();
const coordsOf = (facility: string): [number, number] => [MOCK_FACILITIES[facility].longitude, MOCK_FACILITIES[facility].latitude];

export const fleetCarrier = (caller: MockCaller) => {
    if (caller.staff) return null;
    return caller.side === "carrier" && hasAnyRole(caller.user.roles, ROLE_GROUPS.carrier) ? caller.organisation : undefined;
};

const carrierIds = () => Object.entries(MOCK_ORGANISATIONS).flatMap(([id, { side }]) => (side === "carrier" ? [id] : []));

const planCarrier = (caller: MockCaller, requested: string | undefined) => {
    if (!caller.staff) return fleetCarrier(caller);
    if (!can(caller.user.roles, "readFleetPlan")) return undefined;
    const known = carrierIds();
    return requested && known.includes(requested) ? requested : (known.at(0) ?? undefined);
};

const truckOf = (truck: MockTruck) => ({ id: truck.id, unit: truck.unit, equipment: truck.equipment, driverId: truck.driver, driverName: driverName(truck.driver) });

const positionOf = (truck: MockTruck, loads: readonly MockLoad[], now: number): FleetRowDto["position"] => {
    const moving = loads.find((load) => IN_FLIGHT.has(load.status));
    const latest = moving ? latestPosition(moving, now) : null;
    if (latest) return { city: latest.city, source: latest.source === "eld" ? "eld" : "driverApp", recordedAt: latest.recordedAt };
    const departed = loads.flatMap((load) => load.stops.filter((stop) => stop.departedAt)).sort((first, second) => Date.parse(second.departedAt ?? "") - Date.parse(first.departedAt ?? ""))[0];
    if (departed) return { city: MOCK_FACILITIES[departed.facility].city, source: "stopEvent", recordedAt: departed.departedAt };
    return { city: MOCK_FACILITIES[truck.home].city, source: "home", recordedAt: null };
};

const nearestPosted = (truck: MockTruck, facility: string) => {
    const miles = [...freightStore().loads.values()]
        .filter((load) => load.status === "Posted" && load.equipment === truck.equipment)
        .map((load) => milesApart(coordsOf(facility), coordsOf(load.stops[0].facility)));
    return miles.length > 0 ? Math.round(Math.min(...miles)) : null;
};

const windowsOf = (truck: MockTruck, loads: readonly MockLoad[], range: { from: number; to: number }, now: number): FleetWindowDto[] => {
    const busy = [
        ...loads.map((load) => ({ ...spanOf(load), end: load.stops[load.stops.length - 1].facility })),
        ...[...fleetStore().unavailable.values()].filter((period) => period.truck === truck.id).map((period) => ({ from: period.from, to: period.to, end: null })),
    ].sort((first, second) => first.from - second.from);
    const gaps: FleetWindowDto[] = [];
    let cursor = Math.max(range.from, now);
    let place = truck.home;
    for (const block of [...busy, { from: range.to, to: range.to, end: null }]) {
        const from = cursor;
        const to = Math.min(block.from, range.to);
        if (to - from >= FLEET.windowMinHours * TIME_MS.hour) {
            const { city, region, latitude, longitude } = MOCK_FACILITIES[place];
            gaps.push({ id: `${truck.id}:${from}:${to}`, from: iso(from), to: iso(to), city, region, latitude, longitude, hours: Math.round((to - from) / TIME_MS.hour), emptyMiles: nearestPosted(truck, place) });
        }
        cursor = Math.max(cursor, block.to);
        if (block.end) place = block.end;
    }
    return gaps;
};

export const fleetPlan = withCaller(({ path }, _params, caller) => {
    const query = fleetQuerySchema.safeParse(queryOf(path));
    if (!query.success) return fail(HTTP_STATUS.badRequest, FREIGHT_MESSAGES.invalid, path);
    const carrier = planCarrier(caller, query.data.carrier);
    if (carrier === undefined || carrier === null) return fail(HTTP_STATUS.forbidden, FREIGHT_MESSAGES.signedOut, path);

    const now = new Date().getTime();
    const timeZone = (carrier && MOCK_CARRIER_ZONES[carrier]) ?? FLEET.defaultZone;
    const start = weekStartOf(query.data.week && DAY_PATTERN.test(query.data.week) ? query.data.week : dayOf(now, timeZone));
    const days = weekOf(start);
    const range = { from: startOfDay(days[0], timeZone), to: startOfDay(addDays(days[days.length - 1], 1), timeZone) };
    const loads = carrierLoads(carrier);
    const fleet = [...fleetStore().trucks.values()].filter((truck) => carrier === null || truck.carrier === carrier);
    const trucks = fleet
        .filter((truck) => !query.data.truck || truck.id === query.data.truck)
        .filter((truck) => !query.data.equipment || truck.equipment === query.data.equipment);

    const rows = trucks.flatMap((truck): FleetRowDto[] => {
        const own = loads.filter((load) => load.truck === truck.id);
        if (query.data.driver && truck.driver !== query.data.driver && !own.some((load) => load.driver === query.data.driver)) return [];
        const inWeek = own.filter((load) => overlaps(spanOf(load), range));
        const reading = !caller.staff && truck.driver ? MOCK_ELD[truck.driver] : undefined;
        return [
            {
                truck: truckOf(truck),
                position: positionOf(truck, own, now),
                hours: reading ? { state: reading.remainingMinutes === null ? "unavailable" : "reported", remainingMinutes: reading.remainingMinutes, readAt: iso(now - reading.ageMinutes * TIME_MS.minute) } : null,
                entries: inWeek.map((load) => toEntry(load, caller)),
                unavailable: [...fleetStore().unavailable.values()]
                    .filter((period) => period.truck === truck.id && overlaps(period, range))
                    .map(({ id, from, to, reason, note }) => ({ id, from: iso(from), to: iso(to), reason, note })),
                windows: windowsOf(truck, own.filter((load) => load.status !== "Delivered"), range, now),
            },
        ];
    });

    const unassigned = loads.filter((load) => (load.status === "Booked" || load.status === "Dispatched") && (!load.truck || !load.driver) && spanOf(load).from < range.to);
    const conflicts: FleetConflictDto[] = [
        ...unassigned.map((load) => {
            const deadline = assignmentDeadline(load.stops[0].windowStart);
            return { type: "needsAssignment" as const, loadId: load.id, truckId: null, otherLoadId: null, deadline: iso(deadline), overdue: now > deadline };
        }),
        ...trucks.flatMap((truck) => {
            const own = loads.filter((load) => load.truck === truck.id && overlaps(spanOf(load), range));
            return [...pairConflicts(truck, own), ...unavailableConflicts(truck, own)];
        }),
    ].sort((first, second) => Date.parse(first.deadline ?? "") - Date.parse(second.deadline ?? ""));

    return ok(HTTP_STATUS.ok, {
        weekStart: start,
        days,
        timeZone,
        carrier,
        carriers: Object.entries(MOCK_ORGANISATIONS)
            .filter(([id, { side }]) => side === "carrier" && (caller.staff || id === carrier))
            .map(([id, { name }]) => ({ id, name })),
        fleet: fleet.map(truckOf),
        rows,
        unassigned: unassigned.map((load) => toEntry(load, caller)),
        conflicts,
        readOnly: caller.staff,
        checkedAt: iso(now),
    });
});
