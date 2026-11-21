"use server";
import { routes } from "@/lib/contract/routes";
import type { DriverUndoRequestDto } from "@/lib/contract/schemas";
import { invalidInput } from "@/lib/utils/action-result";
import { backendMutation, pathSegment } from "@/lib/utils/backend-mutation";
import { withSessionAction } from "@/lib/utils/with-action";
import { driverTripEnvelopeSchema, undoRequestSchema } from "@/lib/validations/driver";

export const undoStopEvent = withSessionAction(async (_context, loadId: string, eventId: string, input: DriverUndoRequestDto) => {
    const parsed = undoRequestSchema.safeParse(input);
    return parsed.success
        ? backendMutation(routes.driversUndoEvent(pathSegment(loadId), pathSegment(eventId)), parsed.data, driverTripEnvelopeSchema)
        : invalidInput();
});
