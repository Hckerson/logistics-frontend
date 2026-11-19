"use server";
import { routes } from "@/lib/contract/routes";
import { backendMutation, pathSegment } from "@/lib/utils/backend-mutation";
import { withSessionAction } from "@/lib/utils/with-action";
import { importBatchEnvelopeSchema } from "@/lib/validations/imports";

export const completeImportUpload = withSessionAction(async (_context, batchId: string) =>
    backendMutation(routes.importsComplete(pathSegment(batchId)), {}, importBatchEnvelopeSchema),
);
