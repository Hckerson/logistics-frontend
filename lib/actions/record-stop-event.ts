"use server";
import { routes } from "@/lib/contract/routes";
import type { DriverStopEventDto } from "@/lib/contract/schemas";
import { invalidInput } from "@/lib/utils/action-result";
import { backendMutation, pathSegment } from "@/lib/utils/backend-mutation";
import { withSessionAction } from "@/lib/utils/with-action";
import { driverTripEnvelopeSchema, stopEventSchema } from "@/lib/validations/driver";

export const recordStopEvent = withSessionAction(async (_context, loadId: string, input: DriverStopEventDto) => {
    const parsed = stopEventSchema.safeParse(input);
    return parsed.success ? backendMutation(routes.driversRecordEvent(pathSegment(loadId)), parsed.data, driverTripEnvelopeSchema) : invalidInput();
});
