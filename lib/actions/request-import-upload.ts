"use server";
import { routes } from "@/lib/contract/routes";
import type { ImportUploadRequestDto } from "@/lib/contract/schemas";
import { invalidInput } from "@/lib/utils/action-result";
import { backendMutation } from "@/lib/utils/backend-mutation";
import { withSessionAction } from "@/lib/utils/with-action";
import { importTicketEnvelopeSchema, importUploadSchema } from "@/lib/validations/imports";

export const requestImportUpload = withSessionAction(async (_context, input: ImportUploadRequestDto) => {
    const parsed = importUploadSchema.safeParse(input);
    return parsed.success ? backendMutation(routes.importsCreate(), parsed.data, importTicketEnvelopeSchema) : invalidInput();
});
