import { can } from "@/lib/auth/capabilities";
import type { FleetEntryDto } from "@/lib/contract/schemas";
import { MOCK_FACILITIES } from "@/lib/data/mocks/facilities";
import { ACTIVE_STATUSES, MOVABLE_STATUSES, PLANNED_STATUSES } from "@/lib/fleet/constants";
import type { MockCaller } from "@/lib/mocks/freight-access";
import { freightStore } from "@/lib/mocks/freight-store";
import { moneyOf } from "@/lib/mocks/load-views";
import { fleetStore } from "@/lib/mocks/fleet-store";
import { mockStore } from "@/lib/mocks/store";
import type { LoadStatus, MockLoad } from "@/lib/types";

const placeOf = (facility: string) => ({ city: MOCK_FACILITIES[facility].city, region: MOCK_FACILITIES[facility].region });

export const driverName = (driver: string | null) => (driver ? ([...mockStore().users.values()].find((user) => user.id === driver)?.name ?? null) : null);

export const carrierDrivers = (carrier: string | null) => {
    const { memberships, users } = mockStore();
    const { deactivated } = fleetStore();
    return [...users.values()].filter((user) => user.roles.includes("carrier.driver") && memberships.get(user.email) === carrier && !deactivated.has(user.id));
};

export const activeLoadOf = (matches: (load: MockLoad) => boolean) =>
    [...freightStore().loads.values()].find((load) => ACTIVE_STATUSES.some((status) => status === load.status) && matches(load)) ?? null;

export const spanOf = ({ stops }: MockLoad) => ({ from: Date.parse(stops[0].windowStart), to: Date.parse(stops[stops.length - 1].windowEnd) });

export const overlaps = (first: { from: number; to: number }, second: { from: number; to: number }) => first.from < second.to && second.from < first.to;

const planned = (status: LoadStatus) => PLANNED_STATUSES.some((candidate) => candidate === status);

export const movable = (status: LoadStatus) => MOVABLE_STATUSES.some((candidate) => candidate === status);

export const carrierLoads = (carrier: string | null) =>
    [...freightStore().loads.values()].filter((load) => (carrier === null ? load.carrier !== null : load.carrier === carrier) && planned(load.status));

export const toEntry = (load: MockLoad, caller: MockCaller): FleetEntryDto => {
    const first = load.stops[0];
    const last = load.stops[load.stops.length - 1];
    return {
        loadId: load.id,
        status: load.status,
        origin: placeOf(first.facility),
        destination: placeOf(last.facility),
        pickupStart: first.windowStart,
        pickupEnd: first.windowEnd,
        deliveryStart: last.windowStart,
        deliveryEnd: last.windowEnd,
        timeZone: MOCK_FACILITIES[first.facility].timeZone,
        equipment: load.equipment,
        carrierPayCents: can(caller.user.roles, "viewCarrierPay") ? moneyOf(load.charges, "carrier").totalCents : null,
        driverName: driverName(load.driver),
        movable: !caller.staff && movable(load.status),
        version: load.version,
    };
};
