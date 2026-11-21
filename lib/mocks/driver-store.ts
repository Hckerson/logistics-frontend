import { MOCK_LOADS } from "@/lib/data/mocks/loads";
import { freightStore } from "@/lib/mocks/freight-store";
import type { DriverStopEventDto } from "@/lib/contract/schemas";
import type { LoadStatus } from "@/lib/types";

interface DriverEventRecord {
    id: string;
    loadId: string;
    driverId: string;
    type: DriverStopEventDto["type"];
    stopId: string;
    from: LoadStatus;
    to: LoadStatus;
    at: number;
    undone: boolean;
}

interface PodRecord {
    id: string;
    loadId: string;
    pageIds: string[];
    receiverName: string;
    osdNotes: string | null;
    submittedAt: number;
    verifyAt: number;
    settled: boolean;
}

interface DriverStore {
    events: Map<string, DriverEventRecord>;
    undos: Set<string>;
    pods: Map<string, PodRecord>;
    details: Map<string, { seal: string; pieces: number }>;
}

const LEGACY_DRIVER = "usr_driver";
const holder = globalThis as typeof globalThis & { haulrDriverStore?: DriverStore };

const seed = (): DriverStore => {
    const { loads } = freightStore();
    MOCK_LOADS.forEach(({ id, driver }) => {
        const load = loads.get(id);
        if (load && driver && load.driver === LEGACY_DRIVER && driver !== LEGACY_DRIVER) load.driver = driver;
    });
    return { events: new Map(), undos: new Set(), pods: new Map(), details: new Map() };
};

export const driverStore = (): DriverStore => (holder.haulrDriverStore ??= seed());
