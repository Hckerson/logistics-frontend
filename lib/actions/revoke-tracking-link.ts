"use server";
import { routes } from "@/lib/contract/routes";
import { reasonDtoSchema, type ReasonDto } from "@/lib/contract/schemas";
import { invalidInput } from "@/lib/utils/action-result";
import { backendMutation, pathSegment } from "@/lib/utils/backend-mutation";
import { withSessionAction } from "@/lib/utils/with-action";
import { trackingLinkEnvelopeSchema } from "@/lib/validations/freight";

export const revokeTrackingLink = withSessionAction(async (_context, linkId: string, input: ReasonDto) => {
    const parsed = reasonDtoSchema.safeParse(input);
    return parsed.success ? backendMutation(routes.trackingLinksRevoke(pathSegment(linkId)), parsed.data, trackingLinkEnvelopeSchema) : invalidInput();
});
