import { HTTP_STATUS } from "@/lib/constants";
import { importRowValuesDtoSchema } from "@/lib/contract/schemas";
import { IMPORT_FIELD_SPECS } from "@/lib/data/loads/import-fields";
import { MOCK_IMPORTS } from "@/lib/data/mocks/imports";
import { IMPORT_FIELDS, IMPORT_REQUIRED, IMPORT_RULES, squash } from "@/lib/loads/imports";
import { FREIGHT_MESSAGES, withCaller } from "@/lib/mocks/freight-access";
import { fail, ok } from "@/lib/mocks/http";
import { confirmRows, priceRows } from "@/lib/mocks/import-price";
import { countsOf, editable, restingPhase, savedMappings, statusOf, timedPhase, toBatchDto } from "@/lib/mocks/import-store";
import { revalidate } from "@/lib/mocks/import-validate";
import { missingBatch, readableBatch, writableBatch } from "@/lib/mocks/imports";
import type { ImportField, MockImport } from "@/lib/types";
import { fillTemplate } from "@/lib/utils/fill-template";
import { queryOf } from "@/lib/validations/freight";
import { importConfirmSchema, importExcludeSchema, importMappingSchema, importRowsQuerySchema, importRowUpdateSchema, importVersionSchema } from "@/lib/validations/imports";

const { messages } = MOCK_IMPORTS;
const NO_COLUMN = -1;

const invalid = (path: string) => fail(HTTP_STATUS.badRequest, FREIGHT_MESSAGES.invalid, path);
const stale = (path: string) => fail(HTTP_STATUS.preconditionFailed, messages.stale, path);
const blocked = (path: string, message: string = messages.notEditable) => fail(HTTP_STATUS.conflict, message, path);

const changed = (batch: MockImport, now: number) => {
    batch.rows = revalidate(batch.rows, batch.organisation);
    batch.pricing = null;
    batch.version += 1;
    if (statusOf(batch, now) === "priced") batch.phase = restingPhase("review", now);
};

export const mapImport = withCaller(({ path, body }, { batchId }, caller) => {
    const batch = writableBatch(batchId, caller);
    const now = new Date().getTime();
    if (!batch) return missingBatch(path);
    const input = importMappingSchema.safeParse(body);
    if (!input.success) return invalid(path);
    if (statusOf(batch, now) !== "mapping") return blocked(path, messages.notMapping);
    if (input.data.version !== batch.version) return stale(path);

    const chosen = new Map(input.data.columns.flatMap(({ index, field }) => (field ? [[field, index] as const] : [])));
    const missing = IMPORT_REQUIRED.filter((field) => !chosen.has(field));
    if (missing.length > 0) return fail(HTTP_STATUS.unprocessable, fillTemplate(messages.unmapped, { fields: missing.map((field) => IMPORT_FIELD_SPECS[field].label).join(", ") }), path);

    batch.columns = batch.columns.map((column) => {
        const field = IMPORT_FIELDS.find((candidate) => chosen.get(candidate) === column.index) ?? null;
        return { ...column, field, source: field === column.field ? column.source : field ? "detected" : "none" };
    });
    const cellOf = (cells: readonly string[], field: ImportField) => cells.at(chosen.get(field) ?? NO_COLUMN) ?? "";
    const rows = batch.raw.map((cells, index) => ({
        id: `${batch.id}-${index + 1}`,
        line: index + 2,
        values: importRowValuesDtoSchema.parse(Object.fromEntries(IMPORT_FIELDS.map((field) => [field, chosen.has(field) ? cellOf(cells, field) : ""]))),
        outcome: "valid" as const,
        excluded: false,
        issues: [],
        pickupFacilityId: null,
        deliveryFacilityId: null,
        priceCents: null,
        split: null,
        loadId: null,
        version: 1,
    }));
    batch.rows = revalidate(rows, batch.organisation);
    if (input.data.save) savedMappings().set(batch.organisation, new Map(batch.columns.flatMap(({ header, field }) => (field ? [[squash(header), field] as const] : []))));
    batch.mappingSaved = input.data.save;
    batch.version += 1;
    batch.phase = timedPhase("validating", "review", rows.length, now);
    return ok(HTTP_STATUS.ok, toBatchDto(batch, now));
});

export const importRows = withCaller(({ path }, { batchId }, caller) => {
    const batch = readableBatch(batchId, caller);
    if (!batch) return missingBatch(path);
    const query = importRowsQuerySchema.safeParse(queryOf(path));
    if (!query.success) return invalid(path);

    const { outcome, cursor, limit = IMPORT_RULES.pageSize } = query.data;
    const rows = batch.rows.filter((row) => !outcome || (outcome === "excluded" ? row.excluded : !row.excluded && row.outcome === outcome));
    const start = cursor ? rows.findIndex((row) => row.id === cursor) + 1 : 0;
    const items = rows.slice(start, start + limit);
    return ok(HTTP_STATUS.ok, { items, nextCursor: start + limit < rows.length ? (items.at(-1)?.id ?? null) : null, counts: countsOf(batch.rows) });
});

export const updateImportRow = withCaller(({ path, body }, { batchId, rowId }, caller) => {
    const batch = writableBatch(batchId, caller);
    const now = new Date().getTime();
    if (!batch) return missingBatch(path);
    const input = importRowUpdateSchema.safeParse(body);
    if (!input.success) return invalid(path);
    if (!editable(batch, now)) return blocked(path);
    const row = batch.rows.find((candidate) => candidate.id === rowId);
    if (!row) return fail(HTTP_STATUS.notFound, messages.rowMissing, path);
    if (row.version !== input.data.version) return stale(path);

    batch.rows = batch.rows.map((candidate) => (candidate.id === row.id ? { ...candidate, values: input.data.values, version: candidate.version + 1 } : candidate));
    changed(batch, now);
    return ok(HTTP_STATUS.ok, batch.rows.find((candidate) => candidate.id === row.id));
});

export const excludeImportRows = withCaller(({ path, body }, { batchId }, caller) => {
    const batch = writableBatch(batchId, caller);
    const now = new Date().getTime();
    if (!batch) return missingBatch(path);
    const input = importExcludeSchema.safeParse(body);
    if (!input.success) return invalid(path);
    if (!editable(batch, now)) return blocked(path);

    const chosen = new Set(input.data.rowIds);
    batch.rows = batch.rows.map((row) => (chosen.has(row.id) ? { ...row, excluded: input.data.excluded } : row));
    changed(batch, now);
    return ok(HTTP_STATUS.ok, toBatchDto(batch, now));
});

export const priceImport = withCaller(({ path, body }, { batchId }, caller) => {
    const batch = writableBatch(batchId, caller);
    const now = new Date().getTime();
    if (!batch) return missingBatch(path);
    const input = importVersionSchema.safeParse(body);
    if (!input.success) return invalid(path);
    if (!editable(batch, now)) return blocked(path);
    if (input.data.version !== batch.version) return stale(path);
    const counts = countsOf(batch.rows);
    if (counts.invalid > 0) return blocked(path, messages.invalidIncluded);
    if (counts.valid + counts.warning === 0) return blocked(path, messages.nothingToPrice);

    priceRows(batch, caller, now);
    batch.version += 1;
    batch.phase = timedPhase("pricing", "priced", counts.valid + counts.warning, now);
    return ok(HTTP_STATUS.ok, toBatchDto(batch, now));
});

export const confirmImport = withCaller(({ path, body }, { batchId }, caller) => {
    const batch = writableBatch(batchId, caller);
    const now = new Date().getTime();
    if (!batch) return missingBatch(path);
    const input = importConfirmSchema.safeParse(body);
    if (!input.success) return invalid(path);
    if (statusOf(batch, now) !== "priced" || !batch.pricing) return blocked(path);
    if (input.data.version !== batch.version) return stale(path);
    if (Date.parse(batch.pricing.quoteExpiresAt) <= now) return blocked(path, messages.expired);

    confirmRows(batch, caller, now);
    batch.tender = input.data.tender;
    batch.version += 1;
    batch.phase = timedPhase("confirming", "completed", batch.rows.length, now);
    batch.completedAt = now + batch.phase.ms;
    return ok(HTTP_STATUS.ok, toBatchDto(batch, now));
});
