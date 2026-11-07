import { useQuery } from "@tanstack/react-query";
import { local } from "@/lib/api-client";
import { apiRoutes } from "@/lib/api-routes";
import { positionKeys } from "@/lib/hooks/use-load-positions";
import { REFRESH_MS } from "@/lib/loads/constants";
import { READ_RETRY } from "@/lib/utils/action-result";
import { mapPositionsEnvelopeSchema } from "@/lib/validations/freight";

export const useShipmentPositions = (loadIds: readonly string[], enabled: boolean) =>
    useQuery({
        queryKey: [...positionKeys.map(), loadIds],
        queryFn: async ({ signal }) => mapPositionsEnvelopeSchema.parse(await local.get(apiRoutes.mapPositions(loadIds), { signal })).data,
        enabled: enabled && loadIds.length > 0,
        staleTime: REFRESH_MS.tracking,
        refetchInterval: REFRESH_MS.tracking,
        refetchIntervalInBackground: false,
        ...READ_RETRY,
    });
