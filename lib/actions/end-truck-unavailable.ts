"use server";
import { routes } from "@/lib/contract/routes";
import { backendMutation, pathSegment } from "@/lib/utils/backend-mutation";
import { withSessionAction } from "@/lib/utils/with-action";
import { fleetUnavailableEnvelopeSchema } from "@/lib/validations/fleet";

export const endTruckUnavailable = withSessionAction(async (_context, truckId: string, periodId: string) =>
    backendMutation(routes.fleetEndUnavailable(pathSegment(truckId), pathSegment(periodId)), {}, fleetUnavailableEnvelopeSchema),
);
