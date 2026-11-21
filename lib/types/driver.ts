import type { z } from "zod";
import type { DriverStopEventDto, DriverTripDto } from "@/lib/contract/schemas";
import type { queueEntrySchema } from "@/lib/validations/driver";

export type QueueEntry = z.infer<typeof queueEntrySchema>;

export type QueueKind = QueueEntry["kind"];

export type QueueEvent = Pick<DriverStopEventDto, "type" | "stopId" | "recordedAt">;

export interface QueueState {
    owner: string | null;
    entries: readonly QueueEntry[];
    syncing: boolean;
    lastSyncAt: number | null;
    failure: string | null;
    notices: readonly string[];
}

export interface CachedValue<T> {
    data: T;
    savedAt: number;
}

export interface PodPage {
    id: string;
    blob: Blob;
    preview: string;
}

export type PodCheck = { ok: true; page: PodPage } | { ok: false; reason: string };

export type StopAction = { type: QueueEvent["type"]; stop: DriverTripDto["stops"][number] };

export type LocationState = "granted" | "prompt" | "denied" | "unsupported";
