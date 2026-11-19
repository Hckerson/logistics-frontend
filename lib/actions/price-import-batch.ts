"use server";
import { routes } from "@/lib/contract/routes";
import type { ImportVersionDto } from "@/lib/contract/schemas";
import { invalidInput } from "@/lib/utils/action-result";
import { backendMutation, pathSegment } from "@/lib/utils/backend-mutation";
import { withSessionAction } from "@/lib/utils/with-action";
import { importBatchEnvelopeSchema, importVersionSchema } from "@/lib/validations/imports";

export const priceImportBatch = withSessionAction(async (_context, batchId: string, input: ImportVersionDto) => {
    const parsed = importVersionSchema.safeParse(input);
    return parsed.success ? backendMutation(routes.importsPrice(pathSegment(batchId)), parsed.data, importBatchEnvelopeSchema) : invalidInput();
});
