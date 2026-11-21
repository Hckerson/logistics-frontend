import { nanoid } from "nanoid";
import { TIME_MS } from "@/lib/constants";
import { MOCK_LOADS } from "@/lib/data/mocks/loads";
import { MOCK_TRUCKS, MOCK_UNAVAILABLE } from "@/lib/data/mocks/trucks";
import { freightStore } from "@/lib/mocks/freight-store";
import type { MockTruck, MockUnavailable } from "@/lib/types";

interface FleetStore {
    trucks: Map<string, MockTruck>;
    unavailable: Map<string, MockUnavailable>;
}

const holder = globalThis as typeof globalThis & { haulrFleetStore?: FleetStore };

const seed = (): FleetStore => {
    const now = new Date().getTime();
    const { loads } = freightStore();
    MOCK_LOADS.forEach(({ id, truck, driver }) => {
        const load = loads.get(id);
        if (!load || !truck || load.truck) return;
        load.truck = truck;
        if (driver) load.driver = driver;
    });
    return {
        trucks: new Map(MOCK_TRUCKS.map((truck) => [truck.id, { ...truck }])),
        unavailable: new Map(
            MOCK_UNAVAILABLE.map(({ truck, startsIn, endsIn, reason, note }) => {
                const id = nanoid();
                return [id, { id, truck, from: now + startsIn * TIME_MS.hour, to: now + endsIn * TIME_MS.hour, reason, note }];
            }),
        ),
    };
};

export const fleetStore = (): FleetStore => (holder.haulrFleetStore ??= seed());
