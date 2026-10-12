"use server";
import { routes } from "@/lib/contract/routes";
import { checkCallDtoSchema, type CheckCallDto } from "@/lib/contract/schemas";
import { invalidInput } from "@/lib/utils/action-result";
import { backendMutation, pathSegment } from "@/lib/utils/backend-mutation";
import { withSessionAction } from "@/lib/utils/with-action";
import { checkCallEnvelopeSchema } from "@/lib/validations/freight";

export const requestCheckCall = withSessionAction(async (_context, loadId: string, input: CheckCallDto) => {
    const parsed = checkCallDtoSchema.safeParse(input);
    return parsed.success ? backendMutation(routes.positionsCheckCall(pathSegment(loadId)), parsed.data, checkCallEnvelopeSchema) : invalidInput();
});
