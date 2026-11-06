import { useQuery } from "@tanstack/react-query";
import { local } from "@/lib/api-client";
import { apiRoutes } from "@/lib/api-routes";
import { loadKeys } from "@/lib/hooks/use-loads";
import { REFRESH_MS } from "@/lib/loads/constants";
import { READ_RETRY } from "@/lib/utils/action-result";
import { loadFacetsEnvelopeSchema } from "@/lib/validations/freight";

export const useLoadFacets = () =>
    useQuery({
        queryKey: [...loadKeys.all, "facets"],
        queryFn: async ({ signal }) => loadFacetsEnvelopeSchema.parse(await local.get(apiRoutes.loadFacets(), { signal })).data,
        staleTime: REFRESH_MS.counts,
        ...READ_RETRY,
    });
