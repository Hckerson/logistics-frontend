import { hasAnyRole, ROLE_GROUPS } from "@/lib/auth/roles";
import { HTTP_STATUS, TIME_MS } from "@/lib/constants";
import type { LoadBoardItemDto } from "@/lib/contract/schemas";
import { MOCK_BOOKING } from "@/lib/data/mocks/booking";
import { MOCK_FACILITIES } from "@/lib/data/mocks/facilities";
import { MOCK_TOWNS } from "@/lib/data/mocks/towns";
import { NETWORK_HUBS } from "@/lib/home/trips";
import { CURRENCY } from "@/lib/loads/constants";
import { LOAD_BOARD } from "@/lib/load-board/constants";
import { routeOf } from "@/lib/mocks/fleet";
import { FREIGHT_MESSAGES, withCaller, type MockCaller } from "@/lib/mocks/freight-access";
import { freightStore } from "@/lib/mocks/freight-store";
import { fail, ok } from "@/lib/mocks/http";
import { moneyOf } from "@/lib/mocks/load-views";
import type { LonLat, MockLoad } from "@/lib/types";
import { milesApart } from "@/lib/utils/geo";
import { queryOf } from "@/lib/validations/freight";
import { loadBoardQuerySchema } from "@/lib/validations/load-board";

const BOARD_MESSAGES = { unknownPlace: "We don't know that place. Pick one from the suggestions." } as const;
const CENTS = 100;
const ROAD_FACTOR = 1.2;

const PLACES = [
    ...NETWORK_HUBS.map(({ name, lon, lat }) => ({ name, at: [lon, lat] satisfies LonLat })),
    ...MOCK_TOWNS.map(({ name, lon, lat }) => ({ name, at: [lon, lat] satisfies LonLat })),
    ...Object.values(MOCK_FACILITIES).map(({ city, region, longitude, latitude }) => ({ name: `${city}, ${region}`, at: [longitude, latitude] satisfies LonLat })),
];

export const placeNamed = (name: string) => {
    const wanted = name.trim().toLowerCase();
    return PLACES.find((place) => place.name.toLowerCase() === wanted) ?? PLACES.find((place) => place.name.toLowerCase().startsWith(wanted)) ?? null;
};

const pointOf = (facility: string): LonLat => [MOCK_FACILITIES[facility].longitude, MOCK_FACILITIES[facility].latitude];

export const boardPlace = (facility: string) => {
    const { city, region, latitude, longitude } = MOCK_FACILITIES[facility];
    return { city, region, latitude, longitude };
};

export const payOf = (load: MockLoad) => moneyOf(load.charges, "carrier").totalCents || Math.round(moneyOf(load.charges, "shipper").totalCents * MOCK_BOOKING.offeredShare);

export const milesOf = (load: MockLoad) => {
    const first = load.stops[0].facility;
    const last = load.stops[load.stops.length - 1].facility;
    return routeOf(load)?.miles ?? Math.round(milesApart(pointOf(first), pointOf(last)) * ROAD_FACTOR);
};

export const boardCarrier = ({ side, staff, organisation, user }: MockCaller) =>
    !staff && side === "carrier" && hasAnyRole(user.roles, ROLE_GROUPS.carrier) ? organisation : null;

const toItem = (load: MockLoad, origin: LonLat | null): LoadBoardItemDto => {
    const first = load.stops[0];
    const last = load.stops[load.stops.length - 1];
    const miles = Math.max(milesOf(load), 1);
    const pay = payOf(load);
    return {
        loadId: load.id,
        version: load.version,
        origin: boardPlace(first.facility),
        destination: boardPlace(last.facility),
        pickupStart: first.windowStart,
        pickupEnd: first.windowEnd,
        deliveryStart: last.windowStart,
        deliveryEnd: last.windowEnd,
        timeZone: MOCK_FACILITIES[first.facility].timeZone,
        equipment: load.equipment,
        commodity: load.commodity,
        weightLb: load.weightLb,
        tempMinF: load.tempMinF,
        tempMaxF: load.tempMaxF,
        hazmat: load.hazmat,
        carrierPayCents: pay,
        currency: CURRENCY,
        miles,
        ratePerMileCents: Math.round(pay / miles),
        deadheadMiles: origin ? Math.round(milesApart(origin, pointOf(first.facility))) : null,
    };
};

const endOf = (value: string) => (value.length <= 10 ? Date.parse(value) + TIME_MS.day - 1 : Date.parse(value));

export const searchBoard = withCaller(({ path }, _params, caller) => {
    if (!boardCarrier(caller)) return fail(HTTP_STATUS.forbidden, FREIGHT_MESSAGES.signedOut, path);
    const query = loadBoardQuerySchema.safeParse(queryOf(path));
    if (!query.success) return fail(HTTP_STATUS.badRequest, FREIGHT_MESSAGES.invalid, path);
    const { origin, originRadius, destination, destinationRadius, from, to, equipment, minRate, minRpm, maxWeight, cursor, limit } = query.data;

    const start = origin ? placeNamed(origin) : null;
    const end = destination ? placeNamed(destination) : null;
    if ((origin && !start) || (destination && !end)) return fail(HTTP_STATUS.unprocessable, BOARD_MESSAGES.unknownPlace, path);

    const kinds = equipment?.split(",");
    const matches = [...freightStore().loads.values()]
        .filter((load) => load.status === "Posted")
        .filter((load) => !start || milesApart(start.at, pointOf(load.stops[0].facility)) <= (originRadius ?? LOAD_BOARD.radius.fallback))
        .filter((load) => !end || milesApart(end.at, pointOf(load.stops[load.stops.length - 1].facility)) <= (destinationRadius ?? LOAD_BOARD.radius.fallback))
        .filter((load) => !from || Date.parse(load.stops[0].windowEnd) >= Date.parse(from))
        .filter((load) => !to || Date.parse(load.stops[0].windowStart) <= endOf(to))
        .filter((load) => !kinds || kinds.includes(load.equipment))
        .filter((load) => !maxWeight || load.weightLb <= maxWeight)
        .map((load) => toItem(load, start?.at ?? null))
        .filter((item) => !minRate || item.carrierPayCents >= minRate * CENTS)
        .filter((item) => !minRpm || item.ratePerMileCents >= minRpm * CENTS)
        .sort((one, other) => other.ratePerMileCents - one.ratePerMileCents);

    const offset = Number(cursor ?? 0) || 0;
    const size = limit ?? LOAD_BOARD.pageSize;
    const next = offset + size < matches.length ? String(offset + size) : null;
    const resolved = start ? { city: start.name.split(", ")[0], region: start.name.split(", ")[1] ?? "", latitude: start.at[1], longitude: start.at[0] } : null;

    return ok(HTTP_STATUS.ok, { items: matches.slice(offset, offset + size), total: matches.length, nextCursor: next, origin: resolved, checkedAt: new Date().toISOString() });
});
