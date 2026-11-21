"use server";
import { routes } from "@/lib/contract/routes";
import type { BookLoadDto } from "@/lib/contract/schemas";
import { invalidInput } from "@/lib/utils/action-result";
import { backendMutation, pathSegment } from "@/lib/utils/backend-mutation";
import { withSessionAction } from "@/lib/utils/with-action";
import { bookSchema, loadBookedEnvelopeSchema } from "@/lib/validations/load-board";

export const bookLoad = withSessionAction(async (_context, loadId: string, input: BookLoadDto) => {
    const parsed = bookSchema.safeParse(input);
    return parsed.success ? backendMutation(routes.loadsBook(pathSegment(loadId)), parsed.data, loadBookedEnvelopeSchema) : invalidInput();
});
