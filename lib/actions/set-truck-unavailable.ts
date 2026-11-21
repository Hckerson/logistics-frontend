"use server";
import { routes } from "@/lib/contract/routes";
import type { TruckUnavailableDto } from "@/lib/contract/schemas";
import { invalidInput } from "@/lib/utils/action-result";
import { backendMutation, pathSegment } from "@/lib/utils/backend-mutation";
import { withSessionAction } from "@/lib/utils/with-action";
import { fleetUnavailableEnvelopeSchema, unavailableSchema } from "@/lib/validations/fleet";

export const setTruckUnavailable = withSessionAction(async (_context, truckId: string, input: TruckUnavailableDto) => {
    const parsed = unavailableSchema.safeParse(input);
    return parsed.success ? backendMutation(routes.fleetSetUnavailable(pathSegment(truckId)), parsed.data, fleetUnavailableEnvelopeSchema) : invalidInput();
});
