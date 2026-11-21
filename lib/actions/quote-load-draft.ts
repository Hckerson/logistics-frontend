"use server";
import { routes } from "@/lib/contract/routes";
import type { LoadQuoteRequestDto } from "@/lib/contract/schemas";
import { invalidInput } from "@/lib/utils/action-result";
import { backendMutation, pathSegment } from "@/lib/utils/backend-mutation";
import { withSessionAction } from "@/lib/utils/with-action";
import { loadQuoteEnvelopeSchema, quoteRequestSchema } from "@/lib/validations/posting";

export const quoteLoadDraft = withSessionAction(async (_context, draftId: string, input: LoadQuoteRequestDto) => {
    const parsed = quoteRequestSchema.safeParse(input);
    return parsed.success ? backendMutation(routes.loadDraftsQuote(pathSegment(draftId)), parsed.data, loadQuoteEnvelopeSchema) : invalidInput();
});
