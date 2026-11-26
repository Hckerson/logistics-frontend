"use server";
import { routes } from "@/lib/contract/routes";
import { backendMutation, pathSegment } from "@/lib/utils/backend-mutation";
import { withSessionAction } from "@/lib/utils/with-action";
import { fleetDriverEnvelopeSchema } from "@/lib/validations/fleet";

export const deactivateDriver = withSessionAction(async (_context, driverId: string) =>
    backendMutation(routes.fleetDeactivateDriver(pathSegment(driverId)), {}, fleetDriverEnvelopeSchema),
);
