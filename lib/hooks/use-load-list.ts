import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { local } from "@/lib/api-client";
import { apiRoutes } from "@/lib/api-routes";
import { loadKeys } from "@/lib/hooks/use-loads";
import { LOAD_PAGE_SIZE, REFRESH_MS } from "@/lib/loads/constants";
import type { LoadListParams } from "@/lib/types";
import { READ_RETRY } from "@/lib/utils/action-result";
import { loadPageEnvelopeSchema } from "@/lib/validations/freight";

export const useLoadList = (params: LoadListParams) =>
    useInfiniteQuery({
        queryKey: [...loadKeys.lists(), "pages", params],
        queryFn: async ({ pageParam, signal }) => {
            const page = { ...params, cursor: pageParam || undefined, limit: LOAD_PAGE_SIZE.default };
            return loadPageEnvelopeSchema.parse(await local.get(apiRoutes.loads(page), { signal })).data;
        },
        initialPageParam: "",
        getNextPageParam: (page) => page.nextCursor ?? undefined,
        placeholderData: keepPreviousData,
        refetchInterval: REFRESH_MS.tracking,
        ...READ_RETRY,
    });
