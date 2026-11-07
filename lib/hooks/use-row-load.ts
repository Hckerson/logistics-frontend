import { useQuery } from "@tanstack/react-query";
import { local } from "@/lib/api-client";
import { apiRoutes } from "@/lib/api-routes";
import { loadKeys } from "@/lib/hooks/use-loads";
import { READ_RETRY } from "@/lib/utils/action-result";
import { loadEnvelopeSchema } from "@/lib/validations/freight";

export const useRowLoad = (loadId: string | null) =>
    useQuery({
        queryKey: loadKeys.detail(loadId ?? ""),
        queryFn: async ({ signal }) => loadEnvelopeSchema.parse(await local.get(apiRoutes.load(loadId ?? ""), { signal })).data,
        enabled: loadId !== null,
        staleTime: 0,
        ...READ_RETRY,
    });
