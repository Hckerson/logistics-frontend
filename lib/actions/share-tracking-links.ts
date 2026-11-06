"use server";
import { routes } from "@/lib/contract/routes";
import type { BulkTrackingLinksDto } from "@/lib/contract/schemas";
import { invalidInput } from "@/lib/utils/action-result";
import { backendMutation } from "@/lib/utils/backend-mutation";
import { withSessionAction } from "@/lib/utils/with-action";
import { bulkTrackingEnvelopeSchema, bulkTrackingSchema } from "@/lib/validations/freight";

export const shareTrackingLinks = withSessionAction(async (_context, input: BulkTrackingLinksDto) => {
    const parsed = bulkTrackingSchema.safeParse(input);
    return parsed.success ? backendMutation(routes.trackingLinksCreateMany(), parsed.data, bulkTrackingEnvelopeSchema) : invalidInput();
});
