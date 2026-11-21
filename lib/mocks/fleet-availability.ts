import { HTTP_STATUS, TIME_MS } from "@/lib/constants";
import { MOCK_FACILITIES } from "@/lib/data/mocks/facilities";
import { FLEET } from "@/lib/fleet/constants";
import { carrierLoads, overlaps, spanOf } from "@/lib/mocks/fleet-entries";
import { fleetCarrier } from "@/lib/mocks/fleet-plan";
import { fleetStore } from "@/lib/mocks/fleet-store";
import { FREIGHT_MESSAGES, withCaller, type MockCaller } from "@/lib/mocks/freight-access";
import { freightStore } from "@/lib/mocks/freight-store";
import { fail, ok } from "@/lib/mocks/http";
import { moneyOf } from "@/lib/mocks/load-views";
import type { MockUnavailable } from "@/lib/types";
import { milesApart } from "@/lib/utils/geo";
import { queryOf } from "@/lib/validations/freight";
import { recommendationQuerySchema, unavailableSchema } from "@/lib/validations/fleet";

const AVAILABILITY_MESSAGES = {
    missing: "Truck not found",
    covers: "That period covers {load}, which is booked on this truck",
} as const;

const OFFERED_SHARE = 0.85;
const iso = (instant: number) => new Date(instant).toISOString();
const toPeriod = ({ id, from, to, reason, note }: MockUnavailable) => ({ id, from: iso(from), to: iso(to), reason, note });

const ownTruck = (caller: MockCaller, truckId: string) => {
    const carrier = fleetCarrier(caller);
    const truck = fleetStore().trucks.get(truckId);
    return truck && !caller.staff && carrier && truck.carrier === carrier ? truck : null;
};

export const setUnavailable = withCaller(({ path, body }, { truckId }, caller) => {
    const truck = ownTruck(caller, truckId);
    if (!truck) return fail(HTTP_STATUS.notFound, AVAILABILITY_MESSAGES.missing, path);
    const input = unavailableSchema.safeParse(body);
    if (!input.success) return fail(HTTP_STATUS.unprocessable, FREIGHT_MESSAGES.invalid, path);

    const { unavailable } = fleetStore();
    const known = unavailable.get(input.data.id);
    if (known) return ok(HTTP_STATUS.ok, toPeriod(known));

    const period = { from: Date.parse(input.data.from), to: Date.parse(input.data.to) };
    const covered = carrierLoads(truck.carrier).find((load) => load.truck === truck.id && overlaps(spanOf(load), period));
    if (covered) return fail(HTTP_STATUS.unprocessable, AVAILABILITY_MESSAGES.covers.replace("{load}", covered.id), path);

    const record = { id: input.data.id, truck: truck.id, ...period, reason: input.data.reason, note: input.data.note ?? null };
    unavailable.set(record.id, record);
    return ok(HTTP_STATUS.created, toPeriod(record));
});

export const endUnavailable = withCaller(({ path }, { truckId, periodId }, caller) => {
    const truck = ownTruck(caller, truckId);
    const period = fleetStore().unavailable.get(periodId);
    if (!truck || !period || period.truck !== truck.id) return fail(HTTP_STATUS.notFound, AVAILABILITY_MESSAGES.missing, path);
    const now = new Date().getTime();
    if (period.from >= Math.min(now, period.to)) {
        fleetStore().unavailable.delete(period.id);
        return ok(HTTP_STATUS.ok, toPeriod({ ...period, to: period.from }));
    }
    period.to = Math.min(period.to, now);
    return ok(HTTP_STATUS.ok, toPeriod(period));
});

export const recommendations = withCaller(({ path }, _params, caller) => {
    const query = recommendationQuerySchema.safeParse(queryOf(path));
    const truck = query.success ? fleetStore().trucks.get(query.data.truck) : undefined;
    const carrier = fleetCarrier(caller);
    if (!query.success || !truck || carrier === undefined || (carrier !== null && truck.carrier !== carrier)) {
        return fail(HTTP_STATUS.badRequest, FREIGHT_MESSAGES.invalid, path);
    }

    const window = { from: Date.parse(query.data.from), to: Date.parse(query.data.to) };
    const lastDrop = carrierLoads(truck.carrier)
        .filter((load) => load.truck === truck.id && spanOf(load).to <= window.from)
        .sort((first, second) => spanOf(second).to - spanOf(first).to)[0];
    const home = MOCK_FACILITIES[lastDrop ? lastDrop.stops[lastDrop.stops.length - 1].facility : truck.home];
    const loads = [...freightStore().loads.values()]
        .filter((load) => load.status === "Posted" && load.equipment === truck.equipment && Date.parse(load.stops[0].windowStart) >= window.from - FLEET.windowMinHours * TIME_MS.hour)
        .map((load) => {
            const first = MOCK_FACILITIES[load.stops[0].facility];
            const last = MOCK_FACILITIES[load.stops[load.stops.length - 1].facility];
            return {
                loadId: load.id,
                origin: { city: first.city, region: first.region },
                destination: { city: last.city, region: last.region },
                pickupStart: load.stops[0].windowStart,
                timeZone: first.timeZone,
                equipment: load.equipment,
                emptyMiles: Math.round(milesApart([home.longitude, home.latitude], [first.longitude, first.latitude])),
                rateCents: Math.round(moneyOf(load.charges, "shipper").totalCents * OFFERED_SHARE),
            };
        })
        .sort((first, second) => first.emptyMiles - second.emptyMiles)
        .slice(0, FLEET.recommendationLimit);
    return ok(HTTP_STATUS.ok, loads);
});
