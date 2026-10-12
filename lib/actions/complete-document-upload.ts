"use server";
import { routes } from "@/lib/contract/routes";
import { backendMutation, pathSegment } from "@/lib/utils/backend-mutation";
import { withSessionAction } from "@/lib/utils/with-action";
import { documentEnvelopeSchema } from "@/lib/validations/freight";

export const completeDocumentUpload = withSessionAction(async (_context, documentId: string) =>
    backendMutation(routes.documentsComplete(pathSegment(documentId)), {}, documentEnvelopeSchema),
);
