import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { transitionLoad } from "@/lib/actions/transition-load";
import { local } from "@/lib/api-client";
import { apiRoutes } from "@/lib/api-routes";
import type { LoadDto, LoadTransitionDto } from "@/lib/contract/schemas";
import { timelineKeys } from "@/lib/hooks/use-load-timeline";
import { REFRESH_MS } from "@/lib/loads/constants";
import type { LoadListParams } from "@/lib/types";
import { READ_RETRY, unwrap } from "@/lib/utils/action-result";
import { loadCountsEnvelopeSchema, loadEnvelopeSchema, loadPageEnvelopeSchema } from "@/lib/validations/freight";

export const loadKeys = {
    all: ["loads"] as const,
    lists: () => ["loads", "list"] as const,
    list: (params: LoadListParams) => ["loads", "list", params] as const,
    detail: (loadId: string) => ["loads", "detail", loadId] as const,
    counts: () => ["loads", "counts"] as const,
};

export const useLoads = (params: LoadListParams) =>
    useQuery({
        queryKey: loadKeys.list(params),
        queryFn: async ({ signal }) => loadPageEnvelopeSchema.parse(await local.get(apiRoutes.loads(params), { signal })).data,
        placeholderData: keepPreviousData,
        staleTime: REFRESH_MS.tracking,
        ...READ_RETRY,
    });

export const useLoad = (loadId: string, initial?: LoadDto) =>
    useQuery({
        queryKey: loadKeys.detail(loadId),
        queryFn: async ({ signal }) => loadEnvelopeSchema.parse(await local.get(apiRoutes.load(loadId), { signal })).data,
        initialData: initial,
        staleTime: REFRESH_MS.tracking,
        ...READ_RETRY,
    });

export const useLoadCounts = () =>
    useQuery({
        queryKey: loadKeys.counts(),
        queryFn: async ({ signal }) => loadCountsEnvelopeSchema.parse(await local.get(apiRoutes.loadCounts(), { signal })).data,
        staleTime: REFRESH_MS.counts,
        ...READ_RETRY,
    });

export const useLoadActions = (loadId: string) => {
    const client = useQueryClient();
    return useMutation({
        mutationFn: async (input: LoadTransitionDto) => unwrap(await transitionLoad(loadId, input)),
        onSuccess: (load) => {
            client.setQueryData(loadKeys.detail(loadId), load);
            void client.invalidateQueries({ queryKey: loadKeys.lists() });
            void client.invalidateQueries({ queryKey: loadKeys.counts() });
            void client.invalidateQueries({ queryKey: timelineKeys.load(loadId) });
        },
    });
};
