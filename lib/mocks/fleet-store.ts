import { nanoid } from "nanoid";
import { TIME_MS } from "@/lib/constants";
import { MOCK_LOADS } from "@/lib/data/mocks/loads";
import { MOCK_ELD, MOCK_TRAILERS, MOCK_TRUCKS, MOCK_UNAVAILABLE } from "@/lib/data/mocks/trucks";
import { freightStore } from "@/lib/mocks/freight-store";
import type { MockTrailer, MockTruck, MockUnavailable } from "@/lib/types";

interface FleetStore {
    trucks: Map<string, MockTruck>;
    trailers: Map<string, MockTrailer>;
    retired: Map<string, MockTruck | MockTrailer>;
    deactivated: Set<string>;
    unavailable: Map<string, MockUnavailable>;
}

const holder = globalThis as typeof globalThis & { haulrFleetStore?: FleetStore };

const versioned = <T,>(spec: T, at: string) => ({ ...spec, version: 1, updatedAt: at, updatedBy: null });

const eldAge = (driver: string | null) => (driver && driver in MOCK_ELD ? MOCK_ELD[driver].ageMinutes : null);

const seedRoster = (at: string) => ({
    trailers: new Map(MOCK_TRAILERS.map((trailer) => [trailer.id, versioned(trailer, at)])),
    retired: new Map<string, MockTruck | MockTrailer>(),
    deactivated: new Set<string>(),
});

const seed = (): FleetStore => {
    const now = new Date().getTime();
    const at = new Date(now).toISOString();
    const { loads } = freightStore();
    MOCK_LOADS.forEach(({ id, truck, driver }) => {
        const load = loads.get(id);
        if (!load || !truck || load.truck) return;
        load.truck = truck;
        if (driver) load.driver = driver;
    });
    return {
        trucks: new Map(MOCK_TRUCKS.map((truck) => [truck.id, { ...versioned(truck, at), eldAgeMinutes: eldAge(truck.driver) }])),
        ...seedRoster(at),
        unavailable: new Map(
            MOCK_UNAVAILABLE.map(({ truck, startsIn, endsIn, reason, note }) => {
                const id = nanoid();
                return [id, { id, truck, from: now + startsIn * TIME_MS.hour, to: now + endsIn * TIME_MS.hour, reason, note }];
            }),
        ),
    };
};

export const fleetStore = (): FleetStore => (holder.haulrFleetStore = { ...seedRoster(new Date().toISOString()), ...(holder.haulrFleetStore ?? seed()) });
