import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { local } from "@/lib/api-client";
import { apiRoutes } from "@/lib/api-routes";
import { QUICK_FIND, REFRESH_MS } from "@/lib/loads/constants";
import { READ_RETRY } from "@/lib/utils/action-result";
import { quickFindEnvelopeSchema } from "@/lib/validations/freight";

export const quickFindKeys = {
    all: ["quick-find"] as const,
    term: (term: string) => ["quick-find", term] as const,
};

export const useQuickFind = (term: string) => {
    const query = term.trim();
    return useQuery({
        queryKey: quickFindKeys.term(query),
        queryFn: async ({ signal }) => quickFindEnvelopeSchema.parse(await local.get(apiRoutes.quickFind(query), { signal })).data,
        enabled: query.length >= QUICK_FIND.min && query.length <= QUICK_FIND.max,
        placeholderData: keepPreviousData,
        staleTime: REFRESH_MS.tracking,
        ...READ_RETRY,
    });
};
