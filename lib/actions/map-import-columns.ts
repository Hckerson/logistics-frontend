"use server";
import { routes } from "@/lib/contract/routes";
import type { ImportMappingRequestDto } from "@/lib/contract/schemas";
import { invalidInput } from "@/lib/utils/action-result";
import { backendMutation, pathSegment } from "@/lib/utils/backend-mutation";
import { withSessionAction } from "@/lib/utils/with-action";
import { importBatchEnvelopeSchema, importMappingSchema } from "@/lib/validations/imports";

export const mapImportColumns = withSessionAction(async (_context, batchId: string, input: ImportMappingRequestDto) => {
    const parsed = importMappingSchema.safeParse(input);
    return parsed.success ? backendMutation(routes.importsMap(pathSegment(batchId)), parsed.data, importBatchEnvelopeSchema) : invalidInput();
});
