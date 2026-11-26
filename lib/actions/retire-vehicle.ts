"use server";
import { routes } from "@/lib/contract/routes";
import { vehicleVersionDtoSchema, type VehicleVersionDto } from "@/lib/contract/schemas";
import { invalidInput } from "@/lib/utils/action-result";
import { backendMutation, pathSegment } from "@/lib/utils/backend-mutation";
import { withSessionAction } from "@/lib/utils/with-action";
import { vehicleEnvelopeSchema } from "@/lib/validations/fleet";

export const retireVehicle = withSessionAction(async (_context, vehicleId: string, input: VehicleVersionDto) => {
    const parsed = vehicleVersionDtoSchema.safeParse(input);
    return parsed.success ? backendMutation(routes.fleetRetireVehicle(pathSegment(vehicleId)), parsed.data, vehicleEnvelopeSchema) : invalidInput();
});
