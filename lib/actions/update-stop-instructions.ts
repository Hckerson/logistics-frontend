"use server";
import { routes } from "@/lib/contract/routes";
import type { StopInstructionsDto } from "@/lib/contract/schemas";
import { invalidInput } from "@/lib/utils/action-result";
import { backendMutation, pathSegment } from "@/lib/utils/backend-mutation";
import { withSessionAction } from "@/lib/utils/with-action";
import { loadEnvelopeSchema, stopInstructionsSchema } from "@/lib/validations/freight";

export const updateStopInstructions = withSessionAction(async (_context, loadId: string, stopId: string, input: StopInstructionsDto) => {
    const parsed = stopInstructionsSchema.safeParse(input);
    return parsed.success
        ? backendMutation(routes.loadsUpdateStopInstructions(pathSegment(loadId), pathSegment(stopId)), parsed.data, loadEnvelopeSchema)
        : invalidInput();
});
