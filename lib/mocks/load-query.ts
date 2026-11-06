import { MOCK_FACILITIES } from "@/lib/data/mocks/facilities";
import { MOCK_ORGANISATIONS } from "@/lib/data/mocks/team";
import { TRACKING } from "@/lib/loads/constants";
import { minutesSince } from "@/lib/loads/tracking";
import { etaOf, latestPosition } from "@/lib/mocks/fleet";
import { sees, type MockCaller } from "@/lib/mocks/freight-access";
import { freightStore } from "@/lib/mocks/freight-store";
import type { LoadListFilters, MockLoad } from "@/lib/types";

const newestFirst = (first: MockLoad, second: MockLoad) =>
    Date.parse(second.createdAt) - Date.parse(first.createdAt) || second.id.localeCompare(first.id);

const matches = (load: MockLoad, query: string) => {
    const needle = query.toLowerCase();
    const named = (key: string | null) => (key ? MOCK_ORGANISATIONS[key].name.toLowerCase().includes(needle) : false);
    return (
        load.id.startsWith(query.toUpperCase()) ||
        load.poNumber === query ||
        load.bolNumber === query ||
        named(load.shipper) ||
        named(load.carrier) ||
        load.stops.some((stop) => MOCK_FACILITIES[stop.facility].city.toLowerCase().includes(needle))
    );
};

export const pickupOf = (load: MockLoad) => load.stops[0];
export const deliveryOf = (load: MockLoad) => load.stops[load.stops.length - 1];
const cityOf = (stop: MockLoad["stops"][number]) => MOCK_FACILITIES[stop.facility].city.toLowerCase();

const SORT_KEYS = {
    pickup: (load: MockLoad) => Date.parse(pickupOf(load).windowStart),
    delivery: (load: MockLoad) => Date.parse(deliveryOf(load).windowStart),
    updated: (load: MockLoad) => Date.parse(load.updatedAt),
} as const;

const SORTS: Record<NonNullable<LoadListFilters["sort"]>, readonly [keyof typeof SORT_KEYS, number]> = {
    pickup: ["pickup", 1],
    "-pickup": ["pickup", -1],
    delivery: ["delivery", 1],
    "-delivery": ["delivery", -1],
    updated: ["updated", 1],
    "-updated": ["updated", -1],
};

const sorter = (sort: LoadListFilters["sort"]) => {
    if (!sort) return newestFirst;
    const [field, direction] = SORTS[sort];
    const key = SORT_KEYS[field];
    return (first: MockLoad, second: MockLoad) => direction * (key(first) - key(second)) || newestFirst(first, second);
};

const inWindow = (load: MockLoad, { from, to, dateField }: LoadListFilters) => {
    const day = (dateField === "delivery" ? deliveryOf(load) : pickupOf(load)).windowStart.slice(0, 10);
    return (!from || day >= from) && (!to || day <= to);
};

const silent = (load: MockLoad, now: number) => {
    const latest = latestPosition(load, now);
    return latest !== null && minutesSince(latest.recordedAt, now) >= TRACKING.exceptionMinutes;
};

export const findLoads = (caller: MockCaller, filters: LoadListFilters, now: number) => {
    const { status, equipment, q, late, origin, destination, carrier, exceptions, sort } = filters;
    return [...freightStore().loads.values()]
        .filter(sees(caller))
        .filter((load) => !status?.length || status.includes(load.status))
        .filter((load) => !equipment?.length || equipment.includes(load.equipment))
        .filter((load) => !q || matches(load, q))
        .filter((load) => late !== "true" || etaOf(load, now)?.late === true)
        .filter((load) => inWindow(load, filters))
        .filter((load) => !origin || cityOf(pickupOf(load)) === origin.toLowerCase())
        .filter((load) => !destination || cityOf(deliveryOf(load)) === destination.toLowerCase())
        .filter((load) => !carrier || load.carrier === carrier)
        .filter((load) => exceptions !== "true" || silent(load, now))
        .sort(sorter(sort));
};
