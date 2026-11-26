"use server";
import { routes } from "@/lib/contract/routes";
import { backendMutation, pathSegment } from "@/lib/utils/backend-mutation";
import { withSessionAction } from "@/lib/utils/with-action";
import { driverInvitationEnvelopeSchema } from "@/lib/validations/fleet";

export const resendInvitation = withSessionAction(async (_context, invitationId: string) =>
    backendMutation(routes.teamResendInvitation(pathSegment(invitationId)), {}, driverInvitationEnvelopeSchema),
);
