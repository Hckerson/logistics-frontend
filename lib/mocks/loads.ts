import { HTTP_STATUS, TIME_MS } from "@/lib/constants";
import { MOCK_FREIGHT } from "@/lib/data/mocks/loads";
import { CANCELLATION, CURRENCY, LOAD_PAGE_SIZE, STOP_INSTRUCTIONS } from "@/lib/loads/constants";
import { FREIGHT_MESSAGES, loadMissing, sees, staleLoad, visibleLoad, withCaller } from "@/lib/mocks/freight-access";
import { freightStore } from "@/lib/mocks/freight-store";
import { fail, ok } from "@/lib/mocks/http";
import { findLoads } from "@/lib/mocks/load-query";
import { toLoadDetail, toLoadSummary } from "@/lib/mocks/load-views";
import type { ChargeDto } from "@/lib/contract/schemas";
import type { LoadStatus, MockCharge, MockLoad } from "@/lib/types";
import { loadListQuerySchema, queryOf, stopInstructionsSchema } from "@/lib/validations/freight";

export const listLoads = withCaller(({ path }, _params, caller) => {
    const query = loadListQuerySchema.safeParse(queryOf(path));
    if (!query.success) return fail(HTTP_STATUS.badRequest, FREIGHT_MESSAGES.invalid, path);

    const { cursor, limit = LOAD_PAGE_SIZE.default } = query.data;
    const now = new Date().getTime();
    const found = findLoads(caller, query.data, now);
    const start = cursor ? found.findIndex((load) => load.id === cursor) + 1 : 0;
    const items = found.slice(start, start + limit);

    return ok(HTTP_STATUS.ok, {
        items: items.map((load) => toLoadSummary(load, now)),
        nextCursor: start + limit < found.length ? (items.at(-1)?.id ?? null) : null,
        total: found.length,
    });
});

export const countLoads = withCaller((_request, _params, caller) => {
    const counts = new Map<LoadStatus, number>();
    [...freightStore().loads.values()].filter(sees(caller)).forEach((load) => counts.set(load.status, (counts.get(load.status) ?? 0) + 1));
    return ok(HTTP_STATUS.ok, [...counts].map(([status, count]) => ({ status, count })));
});

export const findLoad = withCaller(({ path }, { loadId }, caller) => {
    const load = visibleLoad(caller, loadId);
    return load ? ok(HTTP_STATUS.ok, toLoadDetail(load, caller, new Date().getTime())) : loadMissing(path);
});

const freeUntil = (load: MockLoad) => Date.parse(load.stops[0].windowStart) - CANCELLATION.tonuHours * TIME_MS.hour;

const tonuApplies = (load: MockLoad) => CANCELLATION.tonuStatuses.some((status) => status === load.status);

const TONU_CHARGE = { kind: "accessorial", amountCents: MOCK_FREIGHT.tonuCents, status: "agreed" } as const satisfies ChargeDto;

export const tonuCharges = (load: MockLoad, now: number): MockCharge[] =>
    tonuApplies(load) && now >= freeUntil(load) ? [{ party: "shipper", ...TONU_CHARGE }, { party: "carrier", ...TONU_CHARGE }] : [];

export const cancellationTerms = withCaller(({ path }, { loadId }, caller) => {
    const load = visibleLoad(caller, loadId);
    if (!load) return loadMissing(path);

    const now = new Date().getTime();
    const owed = tonuCharges(load, now).length > 0;
    return ok(HTTP_STATUS.ok, {
        tonu: owed ? { totalCents: TONU_CHARGE.amountCents, currency: CURRENCY, pending: false, parts: [TONU_CHARGE] } : null,
        freeUntil: tonuApplies(load) && !owed ? new Date(freeUntil(load)).toISOString() : null,
    });
});

const INSTRUCTION_MESSAGES = {
    stale: "The load changed since you opened it",
    closed: "Instructions close once the load is dispatched",
} as const;

export const updateStopInstructions = withCaller(({ path, body }, { loadId, stopId }, caller) => {
    const load = visibleLoad(caller, loadId, "editStopInstructions");
    const stop = load?.stops.find((candidate) => candidate.id === stopId);
    if (!load || !stop) return loadMissing(path);
    const input = stopInstructionsSchema.safeParse(body);
    if (!input.success) return fail(HTTP_STATUS.badRequest, FREIGHT_MESSAGES.invalid, path);
    if (!STOP_INSTRUCTIONS.openStatuses.some((status) => status === load.status)) return fail(HTTP_STATUS.conflict, INSTRUCTION_MESSAGES.closed, path);
    if (input.data.version !== load.version) return staleLoad(path, INSTRUCTION_MESSAGES.stale, load);

    const now = new Date().getTime();
    stop.instructions = input.data.instructions || null;
    Object.assign(load, { version: load.version + 1, updatedAt: new Date(now).toISOString(), updatedBy: caller.user.name });
    return ok(HTTP_STATUS.ok, toLoadDetail(load, caller, now));
});
