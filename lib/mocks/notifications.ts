import { HTTP_STATUS } from "@/lib/constants";
import { notificationDtoSchema } from "@/lib/contract/schemas";
import { LOAD_PAGE_SIZE } from "@/lib/loads/constants";
import { FREIGHT_MESSAGES, withCaller, type MockCaller } from "@/lib/mocks/freight-access";
import { freightStore } from "@/lib/mocks/freight-store";
import { fail, ok } from "@/lib/mocks/http";
import { pageQuerySchema, queryOf } from "@/lib/validations/freight";

const mine = ({ user }: MockCaller) =>
    [...freightStore().notifications.values()]
        .filter((notification) => notification.userId === user.id)
        .sort((first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt) || second.id.localeCompare(first.id));

const unread = (caller: MockCaller) => ({ count: mine(caller).filter((notification) => !notification.readAt).length });

export const listNotifications = withCaller(({ path }, _params, caller) => {
    const query = pageQuerySchema.safeParse(queryOf(path));
    if (!query.success) return fail(HTTP_STATUS.badRequest, FREIGHT_MESSAGES.invalid, path);

    const { cursor, limit = LOAD_PAGE_SIZE.default } = query.data;
    const all = mine(caller);
    const start = cursor ? all.findIndex((notification) => notification.id === cursor) + 1 : 0;
    const items = all.slice(start, start + limit).map((notification) => notificationDtoSchema.parse(notification));
    return ok(HTTP_STATUS.ok, { items, nextCursor: start + limit < all.length ? (items.at(-1)?.id ?? null) : null });
});

export const unreadCount = withCaller((_request, _params, caller) => ok(HTTP_STATUS.ok, unread(caller)));

export const markRead = withCaller((_request, { notificationId }, caller) => {
    const notification = mine(caller).find((candidate) => candidate.id === notificationId);
    if (notification && !notification.readAt) notification.readAt = new Date().toISOString();
    return ok(HTTP_STATUS.ok, unread(caller));
});

export const markAllRead = withCaller((_request, _params, caller) => {
    const readAt = new Date().toISOString();
    for (const notification of mine(caller)) notification.readAt ??= readAt;
    return ok(HTTP_STATUS.ok, unread(caller));
});
