"use server";
import { routes } from "@/lib/contract/routes";
import type { PostLoadRequestDto } from "@/lib/contract/schemas";
import { invalidInput } from "@/lib/utils/action-result";
import { backendMutation, pathSegment } from "@/lib/utils/backend-mutation";
import { withSessionAction } from "@/lib/utils/with-action";
import { postLoadEnvelopeSchema, postLoadRequestSchema } from "@/lib/validations/posting";

export const postLoad = withSessionAction(async (_context, draftId: string, input: PostLoadRequestDto) => {
    const parsed = postLoadRequestSchema.safeParse(input);
    return parsed.success ? backendMutation(routes.loadDraftsPost(pathSegment(draftId)), parsed.data, postLoadEnvelopeSchema) : invalidInput();
});
