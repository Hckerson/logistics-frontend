"use server";
import { routes } from "@/lib/contract/routes";
import type { ImportRowUpdateDto } from "@/lib/contract/schemas";
import { invalidInput } from "@/lib/utils/action-result";
import { backendMutation, pathSegment } from "@/lib/utils/backend-mutation";
import { withSessionAction } from "@/lib/utils/with-action";
import { importRowEnvelopeSchema, importRowUpdateSchema } from "@/lib/validations/imports";

export const updateImportRow = withSessionAction(async (_context, batchId: string, rowId: string, input: ImportRowUpdateDto) => {
    const parsed = importRowUpdateSchema.safeParse(input);
    return parsed.success
        ? backendMutation(routes.importsUpdateRow(pathSegment(batchId), pathSegment(rowId)), parsed.data, importRowEnvelopeSchema)
        : invalidInput();
});
