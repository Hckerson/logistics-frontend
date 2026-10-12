"use server";
import { actionFailure, backendPost } from "@/lib/api-server";
import { unpublishedRoutes } from "@/lib/api-routes";
import { LOCATION_CONSENT_VERSION } from "@/lib/team/constants";
import type { ActionResult, LocationDecision } from "@/lib/types";
import { invalidInput } from "@/lib/utils/action-result";
import { withSessionAction } from "@/lib/utils/with-action";
import { locationConsentSchema } from "@/lib/validations/team";

export const recordLocationConsent = withSessionAction(async ({ user }, decision: LocationDecision): Promise<ActionResult<null>> => {
    const input = locationConsentSchema.safeParse({ email: user.email, decision, version: LOCATION_CONSENT_VERSION });
    if (!input.success) return invalidInput();

    const upstream = await backendPost(unpublishedRoutes.locationConsent(), input.data);
    return upstream.ok ? { ok: true, data: null } : actionFailure(upstream);
});
