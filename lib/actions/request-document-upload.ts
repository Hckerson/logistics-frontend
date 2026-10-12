"use server";
import { routes } from "@/lib/contract/routes";
import type { UploadRequestDto } from "@/lib/contract/schemas";
import { invalidInput } from "@/lib/utils/action-result";
import { backendMutation, pathSegment } from "@/lib/utils/backend-mutation";
import { withSessionAction } from "@/lib/utils/with-action";
import { documentFileSchema, uploadTicketEnvelopeSchema } from "@/lib/validations/freight";

export const requestDocumentUpload = withSessionAction(async (_context, loadId: string, input: UploadRequestDto) => {
    const parsed = documentFileSchema.safeParse(input);
    return parsed.success ? backendMutation(routes.documentsRequestUpload(pathSegment(loadId)), parsed.data, uploadTicketEnvelopeSchema) : invalidInput();
});
