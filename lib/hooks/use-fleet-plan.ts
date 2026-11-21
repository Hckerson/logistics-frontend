import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { endTruckUnavailable } from "@/lib/actions/end-truck-unavailable";
import { setTruckUnavailable } from "@/lib/actions/set-truck-unavailable";
import { local } from "@/lib/api-client";
import { apiRoutes } from "@/lib/api-routes";
import type { TruckUnavailableDto } from "@/lib/contract/schemas";
import { REFRESH_MS } from "@/lib/loads/constants";
import type { FleetQuery, RecommendationQuery } from "@/lib/types";
import { READ_RETRY, unwrap } from "@/lib/utils/action-result";
import { fleetPlanEnvelopeSchema, recommendationsEnvelopeSchema } from "@/lib/validations/fleet";

export const fleetPlanKeys = {
    all: ["fleet", "plan"] as const,
    week: (query: FleetQuery) => ["fleet", "plan", query] as const,
    recommendations: (query: RecommendationQuery) => ["fleet", "recommendations", query] as const,
};

export const useFleetPlan = (query: FleetQuery) =>
    useQuery({
        queryKey: fleetPlanKeys.week(query),
        queryFn: async ({ signal }) => fleetPlanEnvelopeSchema.parse(await local.get(apiRoutes.fleetPlan(query), { signal })).data,
        placeholderData: keepPreviousData,
        refetchInterval: REFRESH_MS.tracking,
        refetchOnWindowFocus: true,
        staleTime: REFRESH_MS.tracking,
        ...READ_RETRY,
    });

export const useRecommendedLoads = (query: RecommendationQuery, enabled: boolean) =>
    useQuery({
        queryKey: fleetPlanKeys.recommendations(query),
        queryFn: async ({ signal }) => recommendationsEnvelopeSchema.parse(await local.get(apiRoutes.fleetRecommendations(query), { signal })).data,
        enabled,
        staleTime: REFRESH_MS.tracking,
        ...READ_RETRY,
    });

export const useTruckAvailability = (truckId: string) => {
    const client = useQueryClient();
    const settle = () => client.invalidateQueries({ queryKey: fleetPlanKeys.all });
    const mark = useMutation({
        mutationFn: async (input: TruckUnavailableDto) => unwrap(await setTruckUnavailable(truckId, input)),
        onSuccess: settle,
    });
    const end = useMutation({
        mutationFn: async (periodId: string) => unwrap(await endTruckUnavailable(truckId, periodId)),
        onSuccess: settle,
    });
    return { mark, end };
};
