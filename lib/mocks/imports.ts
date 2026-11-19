import { nanoid } from "nanoid";
import { can } from "@/lib/auth/capabilities";
import { HTTP_STATUS, TIME_MS } from "@/lib/constants";
import { MOCK_FACILITIES } from "@/lib/data/mocks/facilities";
import { MOCK_IMPORTS, MOCK_IMPORT_SCENARIOS } from "@/lib/data/mocks/imports";
import { IMPORT_RULES } from "@/lib/loads/imports";
import { FREIGHT_MESSAGES, withCaller, type MockCaller } from "@/lib/mocks/freight-access";
import { fail, ok, playScenario } from "@/lib/mocks/http";
import { fileHash, parseFile, proposeColumns } from "@/lib/mocks/import-parse";
import { importBatches, importBlobs, iso, ownBatch, restingPhase, savedMappings, statusOf, timedPhase, toBatchDto } from "@/lib/mocks/import-store";
import type { MockImport } from "@/lib/types";
import { queryOf } from "@/lib/validations/freight";
import { importPageQuerySchema, importUploadSchema } from "@/lib/validations/imports";

const EXTENSION = /\.[^.]+$/;
const { messages } = MOCK_IMPORTS;

const linkTo = (url: string, now: number) => ({ url, expiresAt: iso(now + MOCK_IMPORTS.linkMinutes * TIME_MS.minute) });

export const missingBatch = (path: string) => fail(HTTP_STATUS.notFound, messages.missing, path);

export const readableBatch = (batchId: string, caller: MockCaller) => (can(caller.user.roles, "viewImports") ? ownBatch(batchId, caller) : null);

export const writableBatch = (batchId: string, caller: MockCaller) => {
    const batch = ownBatch(batchId, caller);
    return batch && can(caller.user.roles, "importLoads") && batch.userId === caller.user.id ? batch : null;
};

export const createImport = withCaller(({ path, body }, _params, caller) => {
    if (!caller.organisation || !can(caller.user.roles, "importLoads")) return fail(HTTP_STATUS.forbidden, FREIGHT_MESSAGES.invalid, path);
    const input = importUploadSchema.safeParse(body);
    if (!input.success) return fail(HTTP_STATUS.badRequest, FREIGHT_MESSAGES.invalid, path);
    const blocked = playScenario(MOCK_IMPORT_SCENARIOS[input.data.fileName.toLowerCase().replace(EXTENSION, "")], path);
    if (blocked) return blocked;

    const now = new Date().getTime();
    const batch: MockImport = {
        ...input.data,
        id: `imp_${nanoid()}`,
        organisation: caller.organisation,
        userId: caller.user.id,
        userName: caller.user.name,
        createdAt: now,
        hash: null,
        phase: restingPhase("awaitingUpload", now),
        headers: [],
        columns: [],
        raw: [],
        rows: [],
        problem: null,
        pricing: null,
        outcome: null,
        tender: null,
        mappingSaved: false,
        completedAt: null,
        version: 1,
    };
    importBatches().set(batch.id, batch);
    return ok(HTTP_STATUS.created, { batch: toBatchDto(batch, now), ...linkTo(`${MOCK_IMPORTS.storagePath}/${batch.id}`, now) });
});

export const completeImport = withCaller(async ({ path }, { batchId }, caller) => {
    const batch = writableBatch(batchId, caller);
    const now = new Date().getTime();
    if (!batch || statusOf(batch, now) !== "awaitingUpload") return missingBatch(path);
    const bytes = importBlobs().get(batch.id);
    if (!bytes) return fail(HTTP_STATUS.conflict, messages.notUploaded, path);

    const hash = fileHash(bytes);
    const earlier = [...importBatches().values()].find((other) => other.id !== batch.id && other.userId === batch.userId && other.hash === hash && statusOf(other, now) !== "failed");
    if (earlier) {
        importBatches().delete(batch.id);
        importBlobs().delete(batch.id);
        return ok(HTTP_STATUS.ok, toBatchDto(earlier, now));
    }

    const saved = savedMappings().get(batch.organisation);
    const parsed = await parseFile(bytes, saved);
    batch.hash = hash;
    if ("problem" in parsed) {
        batch.problem = parsed.problem;
        batch.phase = timedPhase("parsing", "failed", 0, now);
    } else {
        batch.headers = parsed.headers;
        batch.raw = parsed.raw;
        batch.columns = proposeColumns(parsed.headers, parsed.raw, saved);
        batch.phase = timedPhase("parsing", "mapping", parsed.raw.length, now);
    }
    return ok(HTTP_STATUS.ok, toBatchDto(batch, now));
});

export const findImport = withCaller(({ path }, { batchId }, caller) => {
    const batch = readableBatch(batchId, caller);
    return batch ? ok(HTTP_STATUS.ok, toBatchDto(batch, new Date().getTime())) : missingBatch(path);
});

export const listImports = withCaller(({ path }, _params, caller) => {
    const query = importPageQuerySchema.safeParse(queryOf(path));
    if (!query.success) return fail(HTTP_STATUS.badRequest, FREIGHT_MESSAGES.invalid, path);
    if (!can(caller.user.roles, "viewImports")) return ok(HTTP_STATUS.ok, { items: [], nextCursor: null });

    const now = new Date().getTime();
    const since = now - IMPORT_RULES.historyDays * TIME_MS.day;
    const batches = [...importBatches().values()]
        .filter((batch) => batch.organisation === caller.organisation && batch.createdAt >= since && statusOf(batch, now) !== "awaitingUpload")
        .sort((first, second) => second.createdAt - first.createdAt);
    const { cursor, limit = IMPORT_RULES.historyPage } = query.data;
    const start = cursor ? batches.findIndex((batch) => batch.id === cursor) + 1 : 0;
    const items = batches.slice(start, start + limit);
    return ok(HTTP_STATUS.ok, { items: items.map((batch) => toBatchDto(batch, now)), nextCursor: start + limit < batches.length ? (items.at(-1)?.id ?? null) : null });
});

export const importTemplate = withCaller(() => ok(HTTP_STATUS.ok, linkTo(`${MOCK_IMPORTS.filesPath}/${MOCK_IMPORTS.templateFile}`, new Date().getTime())));

export const importResults = withCaller(({ path }, { batchId }, caller) => {
    const batch = readableBatch(batchId, caller);
    const now = new Date().getTime();
    if (!batch) return missingBatch(path);
    if (statusOf(batch, now) !== "completed") return fail(HTTP_STATUS.conflict, messages.notFinished, path);
    return ok(HTTP_STATUS.ok, linkTo(`${MOCK_IMPORTS.storagePath}/${batch.id}`, now));
});

export const listFacilities = withCaller((_request, _params, caller) =>
    ok(
        HTTP_STATUS.ok,
        Object.entries(MOCK_FACILITIES)
            .filter(([, place]) => place.organisation === caller.organisation)
            .map(([id, { name, city, region }]) => ({ id, name, city, region })),
    ),
);
