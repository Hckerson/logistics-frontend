import { keepPreviousData, useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { local } from "@/lib/api-client";
import { apiRoutes } from "@/lib/api-routes";
import type { ImportBatchDto } from "@/lib/contract/schemas";
import { IMPORT_BUSY, IMPORT_RULES } from "@/lib/loads/imports";
import type { ImportOutcome } from "@/lib/types";
import { READ_RETRY } from "@/lib/utils/action-result";
import { downloadLinkEnvelopeSchema } from "@/lib/validations/freight";
import { facilitiesEnvelopeSchema, importBatchEnvelopeSchema, importBatchPageEnvelopeSchema, importRowPageEnvelopeSchema } from "@/lib/validations/imports";

export const importKeys = {
    all: ["imports"] as const,
    list: ["imports", "list"] as const,
    batch: (batchId: string) => ["imports", "batch", batchId] as const,
    rows: (batchId: string) => ["imports", "rows", batchId] as const,
    facilities: ["facilities"] as const,
};

export const importBusy = (batch: ImportBatchDto | undefined) => batch !== undefined && IMPORT_BUSY.includes(batch.status);

export const useImportBatch = (batchId: string | null) =>
    useQuery({
        queryKey: importKeys.batch(batchId ?? ""),
        queryFn: async ({ signal }) => importBatchEnvelopeSchema.parse(await local.get(apiRoutes.importBatch(batchId ?? ""), { signal })).data,
        enabled: batchId !== null,
        refetchInterval: ({ state }) => (importBusy(state.data) ? IMPORT_RULES.batchPollMs : false),
        ...READ_RETRY,
    });

export const useImportBatches = () =>
    useInfiniteQuery({
        queryKey: importKeys.list,
        queryFn: async ({ pageParam, signal }) =>
            importBatchPageEnvelopeSchema.parse(await local.get(apiRoutes.imports({ cursor: pageParam || undefined, limit: IMPORT_RULES.historyPage }), { signal })).data,
        initialPageParam: "",
        getNextPageParam: (page) => page.nextCursor ?? undefined,
        refetchInterval: ({ state }) => (state.data?.pages.some((page) => page.items.some(importBusy)) ? IMPORT_RULES.historyPollMs : false),
        ...READ_RETRY,
    });

export const useImportRows = (batchId: string, outcome: ImportOutcome | null) =>
    useInfiniteQuery({
        queryKey: [...importKeys.rows(batchId), outcome ?? "all"],
        queryFn: async ({ pageParam, signal }) => {
            const query = { outcome: outcome ?? undefined, cursor: pageParam || undefined, limit: IMPORT_RULES.pageSize };
            return importRowPageEnvelopeSchema.parse(await local.get(apiRoutes.importRows(batchId, query), { signal })).data;
        },
        initialPageParam: "",
        getNextPageParam: (page) => page.nextCursor ?? undefined,
        placeholderData: keepPreviousData,
        ...READ_RETRY,
    });

export const useFacilities = () =>
    useQuery({
        queryKey: importKeys.facilities,
        queryFn: async ({ signal }) => facilitiesEnvelopeSchema.parse(await local.get(apiRoutes.facilities(), { signal })).data,
        staleTime: Infinity,
        ...READ_RETRY,
    });

export const useImportDownload = () =>
    useMutation({
        mutationFn: async (batchId: string | null) =>
            downloadLinkEnvelopeSchema.parse(await local.get(batchId ? apiRoutes.importResults(batchId) : apiRoutes.importTemplate())).data,
    });
