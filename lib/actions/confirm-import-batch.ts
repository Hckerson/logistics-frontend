"use server";
import { routes } from "@/lib/contract/routes";
import type { ImportConfirmRequestDto } from "@/lib/contract/schemas";
import { invalidInput } from "@/lib/utils/action-result";
import { backendMutation, pathSegment } from "@/lib/utils/backend-mutation";
import { withSessionAction } from "@/lib/utils/with-action";
import { importBatchEnvelopeSchema, importConfirmSchema } from "@/lib/validations/imports";

export const confirmImportBatch = withSessionAction(async (_context, batchId: string, input: ImportConfirmRequestDto) => {
    const parsed = importConfirmSchema.safeParse(input);
    return parsed.success ? backendMutation(routes.importsConfirm(pathSegment(batchId)), parsed.data, importBatchEnvelopeSchema) : invalidInput();
});
