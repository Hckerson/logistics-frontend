import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { markAllNotificationsRead } from "@/lib/actions/mark-all-notifications-read";
import { markNotificationRead } from "@/lib/actions/mark-notification-read";
import { local } from "@/lib/api-client";
import { apiRoutes } from "@/lib/api-routes";
import type { UnreadCountDto } from "@/lib/contract/schemas";
import { REFRESH_MS } from "@/lib/loads/constants";
import { READ_RETRY, unwrap } from "@/lib/utils/action-result";
import { notificationPageEnvelopeSchema, unreadCountEnvelopeSchema } from "@/lib/validations/freight";

const FIRST_PAGE = "";

export const notificationKeys = {
    all: ["notifications"] as const,
    list: () => ["notifications", "list"] as const,
    unread: () => ["notifications", "unread"] as const,
};

export const useUnreadCount = () =>
    useQuery({
        queryKey: notificationKeys.unread(),
        queryFn: async ({ signal }) => unreadCountEnvelopeSchema.parse(await local.get(apiRoutes.unreadCount(), { signal })).data,
        staleTime: REFRESH_MS.notifications,
        refetchInterval: REFRESH_MS.notifications,
        ...READ_RETRY,
    });

export const useNotifications = (enabled = true) =>
    useInfiniteQuery({
        queryKey: notificationKeys.list(),
        queryFn: async ({ pageParam, signal }) =>
            notificationPageEnvelopeSchema.parse(await local.get(apiRoutes.notifications({ cursor: pageParam || undefined }), { signal })).data,
        initialPageParam: FIRST_PAGE,
        getNextPageParam: (page) => page.nextCursor ?? undefined,
        enabled,
        ...READ_RETRY,
    });

const useReadMutation = <I>(run: (input: I) => Promise<UnreadCountDto>, optimistic: (count: number) => number) => {
    const client = useQueryClient();
    return useMutation({
        mutationFn: run,
        onMutate: async () => {
            await client.cancelQueries({ queryKey: notificationKeys.unread() });
            const previous = client.getQueryData<UnreadCountDto>(notificationKeys.unread());
            if (previous) client.setQueryData(notificationKeys.unread(), { count: optimistic(previous.count) });
            return { previous };
        },
        onError: (_error, _input, context) => client.setQueryData(notificationKeys.unread(), context?.previous),
        onSuccess: (unread) => client.setQueryData(notificationKeys.unread(), unread),
        onSettled: () => client.invalidateQueries({ queryKey: notificationKeys.list() }),
    });
};

export const useMarkRead = () =>
    useReadMutation(async (notificationId: string) => unwrap(await markNotificationRead(notificationId)), (count) => Math.max(0, count - 1));

export const useMarkAllRead = () => useReadMutation<void>(async () => unwrap(await markAllNotificationsRead()), () => 0);
