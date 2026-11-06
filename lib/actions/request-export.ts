"use server";
import { routes } from "@/lib/contract/routes";
import type { LoadExportRequestDto } from "@/lib/contract/schemas";
import { invalidInput } from "@/lib/utils/action-result";
import { backendMutation } from "@/lib/utils/backend-mutation";
import { withSessionAction } from "@/lib/utils/with-action";
import { exportJobEnvelopeSchema, exportRequestSchema } from "@/lib/validations/freight";

export const requestExport = withSessionAction(async (_context, input: LoadExportRequestDto) => {
    const parsed = exportRequestSchema.safeParse(input);
    return parsed.success ? backendMutation(routes.exportsCreate(), parsed.data, exportJobEnvelopeSchema) : invalidInput();
});
