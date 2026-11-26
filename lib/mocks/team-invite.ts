import { nanoid } from "nanoid";
import { HTTP_STATUS, TIME_MS } from "@/lib/constants";
import { fleetCarrier } from "@/lib/mocks/fleet-plan";
import { FREIGHT_MESSAGES, withCaller } from "@/lib/mocks/freight-access";
import { fail, ok } from "@/lib/mocks/http";
import { mockStore } from "@/lib/mocks/store";
import { INVITATION_DAYS } from "@/lib/team/constants";
import { inviteDriverSchema } from "@/lib/validations/fleet";

const INVITE_MESSAGES = {
    forbidden: "Only your carrier's dispatchers and admins can invite drivers",
    taken: "{email} is already on a team or already invited",
} as const;

export const inviteDriver = withCaller(({ path, body }, _params, caller) => {
    const carrier = fleetCarrier(caller);
    if (!carrier) return fail(HTTP_STATUS.forbidden, INVITE_MESSAGES.forbidden, path);
    const input = inviteDriverSchema.safeParse(body);
    if (!input.success) return fail(HTTP_STATUS.unprocessable, FREIGHT_MESSAGES.invalid, path);

    const email = input.data.email.toLowerCase();
    const { memberships, invitations } = mockStore();
    const invited = [...invitations.values()].some((invitation) => invitation.email === email && invitation.status === "open");
    if (memberships.has(email) || invited) return fail(HTTP_STATUS.conflict, INVITE_MESSAGES.taken.replace("{email}", email), path);

    const now = new Date().getTime();
    invitations.set(`inv_${nanoid()}`, { email, organisation: carrier, inviter: caller.user.name, role: "carrier.driver", status: "open", sentAt: new Date(now).toISOString() });
    return ok(HTTP_STATUS.created, { email, role: "carrier.driver", expiresAt: new Date(now + INVITATION_DAYS * TIME_MS.day).toISOString() });
});
