import { useInfiniteQuery } from "@tanstack/react-query";
import { local } from "@/lib/api-client";
import { apiRoutes } from "@/lib/api-routes";
import { REFRESH_MS } from "@/lib/loads/constants";
import type { TimelineCategory } from "@/lib/types";
import { READ_RETRY } from "@/lib/utils/action-result";
import { loadEventsEnvelopeSchema } from "@/lib/validations/freight";

const FIRST_PAGE = "";

export const timelineKeys = {
    all: ["timeline"] as const,
    load: (loadId: string) => ["timeline", loadId] as const,
    list: (loadId: string, category?: TimelineCategory) => ["timeline", loadId, category ?? "all"] as const,
};

export const useLoadTimeline = (loadId: string, category?: TimelineCategory) =>
    useInfiniteQuery({
        queryKey: timelineKeys.list(loadId, category),
        queryFn: async ({ pageParam, signal }) =>
            loadEventsEnvelopeSchema.parse(await local.get(apiRoutes.loadEvents(loadId, { category, cursor: pageParam || undefined }), { signal })).data,
        initialPageParam: FIRST_PAGE,
        getNextPageParam: (page) => page.nextCursor ?? undefined,
        staleTime: REFRESH_MS.tracking,
        refetchInterval: REFRESH_MS.tracking,
        ...READ_RETRY,
    });
