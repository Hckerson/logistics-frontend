"use server";
import { routes } from "@/lib/contract/routes";
import { loadTransitionDtoSchema, type LoadTransitionDto } from "@/lib/contract/schemas";
import { invalidInput } from "@/lib/utils/action-result";
import { backendMutation, pathSegment } from "@/lib/utils/backend-mutation";
import { withSessionAction } from "@/lib/utils/with-action";
import { loadEnvelopeSchema } from "@/lib/validations/freight";

export const transitionLoad = withSessionAction(async (_context, loadId: string, input: LoadTransitionDto) => {
    const parsed = loadTransitionDtoSchema.safeParse(input);
    return parsed.success ? backendMutation(routes.loadsTransition(pathSegment(loadId)), parsed.data, loadEnvelopeSchema) : invalidInput();
});
