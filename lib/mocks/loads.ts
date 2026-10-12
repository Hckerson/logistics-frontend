import { HTTP_STATUS } from "@/lib/constants";
import { MOCK_FACILITIES } from "@/lib/data/mocks/facilities";
import { MOCK_ORGANISATIONS } from "@/lib/data/mocks/team";
import { LOAD_PAGE_SIZE } from "@/lib/loads/constants";
import { etaOf } from "@/lib/mocks/fleet";
import { FREIGHT_MESSAGES, loadMissing, sees, visibleLoad, withCaller } from "@/lib/mocks/freight-access";
import { freightStore } from "@/lib/mocks/freight-store";
import { fail, ok } from "@/lib/mocks/http";
import { toLoadDetail, toLoadSummary } from "@/lib/mocks/load-views";
import type { LoadStatus, MockLoad } from "@/lib/types";
import { loadListQuerySchema, queryOf } from "@/lib/validations/freight";

const newestFirst = (first: MockLoad, second: MockLoad) =>
    Date.parse(second.createdAt) - Date.parse(first.createdAt) || second.id.localeCompare(first.id);

const matches = (load: MockLoad, query: string) => {
    const needle = query.toLowerCase();
    const named = (key: string | null) => (key ? MOCK_ORGANISATIONS[key].name.toLowerCase().includes(needle) : false);
    return (
        load.id.startsWith(query.toUpperCase()) ||
        load.poNumber === query ||
        load.bolNumber === query ||
        named(load.shipper) ||
        named(load.carrier) ||
        load.stops.some((stop) => MOCK_FACILITIES[stop.facility].city.toLowerCase().includes(needle))
    );
};

export const listLoads = withCaller(({ path }, _params, caller) => {
    const query = loadListQuerySchema.safeParse(queryOf(path));
    if (!query.success) return fail(HTTP_STATUS.badRequest, FREIGHT_MESSAGES.invalid, path);

    const { status, equipment, q, late, cursor, limit = LOAD_PAGE_SIZE.default } = query.data;
    const now = Date.now();
    const found = [...freightStore().loads.values()]
        .filter(sees(caller))
        .filter((load) => !status?.length || status.includes(load.status))
        .filter((load) => !equipment?.length || equipment.includes(load.equipment))
        .filter((load) => !q || matches(load, q))
        .filter((load) => late !== "true" || etaOf(load, now)?.late === true)
        .sort(newestFirst);
    const start = cursor ? found.findIndex((load) => load.id === cursor) + 1 : 0;
    const items = found.slice(start, start + limit);

    return ok(HTTP_STATUS.ok, {
        items: items.map((load) => toLoadSummary(load, now)),
        nextCursor: start + limit < found.length ? (items.at(-1)?.id ?? null) : null,
    });
});

export const countLoads = withCaller((_request, _params, caller) => {
    const counts = new Map<LoadStatus, number>();
    [...freightStore().loads.values()].filter(sees(caller)).forEach((load) => counts.set(load.status, (counts.get(load.status) ?? 0) + 1));
    return ok(HTTP_STATUS.ok, [...counts].map(([status, count]) => ({ status, count })));
});

export const findLoad = withCaller(({ path }, { loadId }, caller) => {
    const load = visibleLoad(caller, loadId);
    return load ? ok(HTTP_STATUS.ok, toLoadDetail(load, caller, Date.now())) : loadMissing(path);
});
