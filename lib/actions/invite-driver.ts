"use server";
import { routes } from "@/lib/contract/routes";
import type { InviteDriverDto } from "@/lib/contract/schemas";
import { invalidInput } from "@/lib/utils/action-result";
import { backendMutation } from "@/lib/utils/backend-mutation";
import { withSessionAction } from "@/lib/utils/with-action";
import { invitationSentEnvelopeSchema, inviteDriverSchema } from "@/lib/validations/fleet";

export const inviteDriver = withSessionAction(async (_context, input: InviteDriverDto) => {
    const parsed = inviteDriverSchema.safeParse(input);
    return parsed.success ? backendMutation(routes.teamInviteDriver(), parsed.data, invitationSentEnvelopeSchema) : invalidInput();
});
