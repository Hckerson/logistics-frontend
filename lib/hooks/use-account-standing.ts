import { useQuery } from "@tanstack/react-query";
import { local } from "@/lib/api-client";
import { apiRoutes } from "@/lib/api-routes";
import { STANDING } from "@/lib/billing/constants";
import { standingEnvelopeSchema } from "@/lib/validations/billing";

export const organizationKeys = { standing: () => ["organization", "standing"] as const };

export const useAccountStanding = () =>
    useQuery({
        queryKey: organizationKeys.standing(),
        queryFn: async ({ signal }) => standingEnvelopeSchema.parse(await local.get(apiRoutes.standing(), { signal })).data,
        staleTime: STANDING.staleMs,
        refetchOnWindowFocus: true,
        retry: false,
    });
