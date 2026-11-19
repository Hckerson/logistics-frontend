"use server";
import { routes } from "@/lib/contract/routes";
import type { ImportExcludeRequestDto } from "@/lib/contract/schemas";
import { invalidInput } from "@/lib/utils/action-result";
import { backendMutation, pathSegment } from "@/lib/utils/backend-mutation";
import { withSessionAction } from "@/lib/utils/with-action";
import { importBatchEnvelopeSchema, importExcludeSchema } from "@/lib/validations/imports";

export const excludeImportRows = withSessionAction(async (_context, batchId: string, input: ImportExcludeRequestDto) => {
    const parsed = importExcludeSchema.safeParse(input);
    return parsed.success ? backendMutation(routes.importsExclude(pathSegment(batchId)), parsed.data, importBatchEnvelopeSchema) : invalidInput();
});
