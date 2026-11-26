import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deactivateDriver } from "@/lib/actions/deactivate-driver";
import { resendInvitation } from "@/lib/actions/resend-invitation";
import { retireVehicle } from "@/lib/actions/retire-vehicle";
import { revokeInvitation } from "@/lib/actions/revoke-invitation";
import { saveVehicle } from "@/lib/actions/save-vehicle";
import { local } from "@/lib/api-client";
import { apiRoutes } from "@/lib/api-routes";
import type { FleetVehicleDto, SaveVehicleDto } from "@/lib/contract/schemas";
import type { VehicleQuery } from "@/lib/types";
import { READ_RETRY, unwrap } from "@/lib/utils/action-result";
import { rosterEnvelopeSchema, vehiclesEnvelopeSchema } from "@/lib/validations/fleet";

export const rosterKeys = {
    fleet: ["fleet"] as const,
    vehicles: (query: VehicleQuery) => ["fleet", "roster", "vehicles", query] as const,
    drivers: () => ["fleet", "roster", "drivers"] as const,
};

export const useFleetVehicles = (query: VehicleQuery) =>
    useQuery({
        queryKey: rosterKeys.vehicles(query),
        queryFn: async ({ signal }) => vehiclesEnvelopeSchema.parse(await local.get(apiRoutes.fleetVehicles(query), { signal })).data,
        placeholderData: keepPreviousData,
        ...READ_RETRY,
    });

export const useFleetRoster = () =>
    useQuery({
        queryKey: rosterKeys.drivers(),
        queryFn: async ({ signal }) => rosterEnvelopeSchema.parse(await local.get(apiRoutes.fleetDrivers(), { signal })).data,
        ...READ_RETRY,
    });

const useSettle = () => {
    const client = useQueryClient();
    return () => client.invalidateQueries({ queryKey: rosterKeys.fleet });
};

export const useSaveVehicle = (vehicleId: string | null) => {
    const onSettled = useSettle();
    return useMutation({ mutationFn: async (input: SaveVehicleDto) => unwrap(await saveVehicle(vehicleId, input)), onSettled });
};

export const useRetireVehicle = () => {
    const onSettled = useSettle();
    return useMutation({ mutationFn: async ({ id, version }: FleetVehicleDto) => unwrap(await retireVehicle(id, { version })), onSettled });
};

export const useDeactivateDriver = () => {
    const onSettled = useSettle();
    return useMutation({ mutationFn: async (driverId: string) => unwrap(await deactivateDriver(driverId)), onSettled });
};

export const useInvitationActions = () => {
    const onSettled = useSettle();
    const resend = useMutation({ mutationFn: async (invitationId: string) => unwrap(await resendInvitation(invitationId)), onSettled });
    const revoke = useMutation({ mutationFn: async (invitationId: string) => unwrap(await revokeInvitation(invitationId)), onSettled });
    return { resend, revoke };
};
