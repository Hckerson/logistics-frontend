import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { assignLoad } from "@/lib/actions/assign-load";
import { inviteDriver } from "@/lib/actions/invite-driver";
import { local } from "@/lib/api-client";
import { apiRoutes } from "@/lib/api-routes";
import type { AssignLoadDto, InviteDriverDto } from "@/lib/contract/schemas";
import { fleetPlanKeys } from "@/lib/hooks/use-fleet-plan";
import { timelineKeys } from "@/lib/hooks/use-load-timeline";
import { loadKeys } from "@/lib/hooks/use-loads";
import { READ_RETRY, unwrap } from "@/lib/utils/action-result";
import { fleetOptionsEnvelopeSchema } from "@/lib/validations/fleet";

export const fleetKeys = {
    available: (loadId: string) => ["fleet", "available", loadId] as const,
};

export const useFleetOptions = (loadId: string, enabled: boolean) =>
    useQuery({
        queryKey: fleetKeys.available(loadId),
        queryFn: async ({ signal }) => fleetOptionsEnvelopeSchema.parse(await local.get(apiRoutes.loadFleet(loadId), { signal })).data,
        enabled,
        staleTime: 0,
        ...READ_RETRY,
    });

export const useAssignLoad = (loadId: string) => {
    const client = useQueryClient();
    return useMutation({
        mutationFn: async (input: AssignLoadDto) => unwrap(await assignLoad(loadId, input)),
        onSuccess: (load) => {
            client.setQueryData(loadKeys.detail(loadId), load);
            void client.invalidateQueries({ queryKey: fleetPlanKeys.all });
            void client.invalidateQueries({ queryKey: loadKeys.lists() });
            void client.invalidateQueries({ queryKey: timelineKeys.load(loadId) });
        },
        onError: () => client.invalidateQueries({ queryKey: fleetKeys.available(loadId) }),
    });
};

export const useInviteDriver = () => useMutation({ mutationFn: async (input: InviteDriverDto) => unwrap(await inviteDriver(input)) });
