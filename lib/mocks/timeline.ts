import { HTTP_STATUS } from "@/lib/constants";
import { loadEventDtoSchema } from "@/lib/contract/schemas";
import { LOAD_PAGE_SIZE } from "@/lib/loads/constants";
import { FREIGHT_MESSAGES, loadMissing, visibleLoad, withCaller } from "@/lib/mocks/freight-access";
import { freightStore } from "@/lib/mocks/freight-store";
import { fail, ok } from "@/lib/mocks/http";
import { queryOf, timelineQuerySchema } from "@/lib/validations/freight";

export const loadTimeline = withCaller(({ path }, { loadId }, caller) => {
    const load = visibleLoad(caller, loadId);
    if (!load) return loadMissing(path);
    const query = timelineQuerySchema.safeParse(queryOf(path));
    if (!query.success) return fail(HTTP_STATUS.badRequest, FREIGHT_MESSAGES.invalid, path);

    const { category, cursor, limit = LOAD_PAGE_SIZE.default } = query.data;
    const events = freightStore()
        .events.filter((event) => event.loadId === load.id && (!category || event.category === category))
        .sort((first, second) => Date.parse(second.occurredAt) - Date.parse(first.occurredAt) || second.id.localeCompare(first.id));
    const start = cursor ? events.findIndex((event) => event.id === cursor) + 1 : 0;
    const items = events.slice(start, start + limit).map((event) => loadEventDtoSchema.parse(event));

    return ok(HTTP_STATUS.ok, { items, nextCursor: start + limit < events.length ? (items.at(-1)?.id ?? null) : null });
});
