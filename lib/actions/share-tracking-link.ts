"use server";
import { routes } from "@/lib/contract/routes";
import { reasonDtoSchema, type ReasonDto } from "@/lib/contract/schemas";
import { invalidInput } from "@/lib/utils/action-result";
import { backendMutation, pathSegment } from "@/lib/utils/backend-mutation";
import { withSessionAction } from "@/lib/utils/with-action";
import { trackingLinkEnvelopeSchema } from "@/lib/validations/freight";

export const shareTrackingLink = withSessionAction(async (_context, loadId: string, input: ReasonDto) => {
    const parsed = reasonDtoSchema.safeParse(input);
    return parsed.success ? backendMutation(routes.trackingLinksCreate(pathSegment(loadId)), parsed.data, trackingLinkEnvelopeSchema) : invalidInput();
});
