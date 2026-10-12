"use server";
import { unpublishedRoutes } from "@/lib/api-routes";
import type { TrackingSendRequest } from "@/lib/types";
import { invalidInput } from "@/lib/utils/action-result";
import { backendMutation, pathSegment } from "@/lib/utils/backend-mutation";
import { withSessionAction } from "@/lib/utils/with-action";
import { trackingSendEnvelopeSchema } from "@/lib/validations/freight";
import { trackingSendSchema } from "@/lib/validations/tracking";

export const sendTrackingLink = withSessionAction(async (_context, loadId: string, input: TrackingSendRequest) => {
    const parsed = trackingSendSchema.safeParse(input);
    return parsed.success
        ? backendMutation(unpublishedRoutes.trackingLinkSend(pathSegment(loadId)), parsed.data, trackingSendEnvelopeSchema)
        : invalidInput();
});
