"use server";
import { routes } from "@/lib/contract/routes";
import type { LoadDraftRequestDto, LoadDraftUpdateDto } from "@/lib/contract/schemas";
import { invalidInput } from "@/lib/utils/action-result";
import { backendMutation, pathSegment } from "@/lib/utils/backend-mutation";
import { withSessionAction } from "@/lib/utils/with-action";
import { loadDraftEnvelopeSchema, loadDraftRequestSchema, loadDraftUpdateSchema } from "@/lib/validations/posting";

export const createLoadDraft = withSessionAction(async (_context, input: LoadDraftRequestDto) => {
    const parsed = loadDraftRequestSchema.safeParse(input);
    return parsed.success ? backendMutation(routes.loadDraftsCreate(), parsed.data, loadDraftEnvelopeSchema) : invalidInput();
});

export const updateLoadDraft = withSessionAction(async (_context, draftId: string, input: LoadDraftUpdateDto) => {
    const parsed = loadDraftUpdateSchema.safeParse(input);
    return parsed.success ? backendMutation(routes.loadDraftsUpdate(pathSegment(draftId)), parsed.data, loadDraftEnvelopeSchema) : invalidInput();
});
