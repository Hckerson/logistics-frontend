import type { ImportBatchDto, ImportCountsDto, ImportRowDto } from "@/lib/contract/schemas";
import { MOCK_IMPORTS } from "@/lib/data/mocks/imports";
import type { MockCaller } from "@/lib/mocks/freight-access";
import type { ImportField, ImportStatus, MockImport, MockImportPhase } from "@/lib/types";

type Timed = keyof typeof MOCK_IMPORTS.timing;

const holder = globalThis as typeof globalThis & {
    haulrImports?: Map<string, MockImport>;
    haulrImportMappings?: Map<string, Map<string, ImportField>>;
    haulrImportBlobs?: Map<string, Uint8Array>;
};

export const importBatches = () => (holder.haulrImports ??= new Map<string, MockImport>());
export const savedMappings = () => (holder.haulrImportMappings ??= new Map<string, Map<string, ImportField>>());
export const importBlobs = () => (holder.haulrImportBlobs ??= new Map<string, Uint8Array>());

export const iso = (moment: number) => new Date(moment).toISOString();

export const restingPhase = (status: ImportStatus, now: number): MockImportPhase => ({ busy: status, done: status, startedAt: now, ms: 0 });

export const timedPhase = (busy: Timed, done: ImportStatus, rows: number, now: number): MockImportPhase => {
    const { baseMs, rowMs } = MOCK_IMPORTS.timing[busy];
    return { busy, done, startedAt: now, ms: baseMs + rowMs * rows };
};

export const statusOf = ({ phase }: MockImport, now: number): ImportStatus => (now < phase.startedAt + phase.ms ? phase.busy : phase.done);

const progressOf = ({ phase }: MockImport, now: number) => (phase.ms === 0 ? 1 : Math.min(1, (now - phase.startedAt) / phase.ms));

const included = (rows: readonly ImportRowDto[], outcome: ImportRowDto["outcome"]) => rows.filter((row) => !row.excluded && row.outcome === outcome).length;

export const countsOf = (rows: readonly ImportRowDto[]): ImportCountsDto => ({
    total: rows.length,
    valid: included(rows, "valid"),
    warning: included(rows, "warning"),
    invalid: included(rows, "invalid"),
    excluded: rows.filter((row) => row.excluded).length,
});

export const toBatchDto = (batch: MockImport, now: number): ImportBatchDto => {
    const status = statusOf(batch, now);
    const progress = progressOf(batch, now);
    return {
        id: batch.id,
        fileName: batch.fileName,
        status,
        progress,
        processed: Math.round(progress * batch.raw.length),
        rowCount: batch.raw.length,
        columns: batch.columns,
        counts: countsOf(batch.rows),
        pricing: status === "priced" || status === "confirming" || status === "completed" ? batch.pricing : null,
        outcome: status === "completed" ? batch.outcome : null,
        tender: batch.tender,
        problem: status === "failed" ? batch.problem : null,
        mappingSaved: batch.mappingSaved,
        createdByName: batch.userName,
        createdAt: iso(batch.createdAt),
        completedAt: status === "completed" && batch.completedAt !== null ? iso(batch.completedAt) : null,
        version: batch.version,
    };
};

export const ownBatch = (batchId: string, caller: MockCaller) => {
    const batch = importBatches().get(batchId);
    return batch && batch.organisation === caller.organisation ? batch : null;
};

export const editable = (batch: MockImport, now: number) => {
    const status = statusOf(batch, now);
    return status === "review" || status === "priced";
};
