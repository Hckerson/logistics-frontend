"use server";
import { routes } from "@/lib/contract/routes";
import { backendMutation, pathSegment } from "@/lib/utils/backend-mutation";
import { withSessionAction } from "@/lib/utils/with-action";
import { driverInvitationEnvelopeSchema } from "@/lib/validations/fleet";

export const revokeInvitation = withSessionAction(async (_context, invitationId: string) =>
    backendMutation(routes.teamRevokeInvitation(pathSegment(invitationId)), {}, driverInvitationEnvelopeSchema),
);
