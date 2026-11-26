"use server";
import { routes } from "@/lib/contract/routes";
import type { SaveVehicleDto } from "@/lib/contract/schemas";
import { invalidInput } from "@/lib/utils/action-result";
import { backendMutation, pathSegment } from "@/lib/utils/backend-mutation";
import { withSessionAction } from "@/lib/utils/with-action";
import { vehicleEnvelopeSchema, vehicleSchema } from "@/lib/validations/fleet";

export const saveVehicle = withSessionAction(async (_context, vehicleId: string | null, input: SaveVehicleDto) => {
    const parsed = vehicleSchema.safeParse(input);
    if (!parsed.success) return invalidInput();
    const path = vehicleId ? routes.fleetUpdateVehicle(pathSegment(vehicleId)) : routes.fleetAddVehicle();
    return backendMutation(path, parsed.data, vehicleEnvelopeSchema);
});
