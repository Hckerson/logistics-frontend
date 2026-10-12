import { nanoid } from "nanoid";
import { MOCK_INVITE_SCENARIOS, MOCK_ORGANISATIONS } from "@/lib/data/mocks/team";
import { fail, issueSession, ok, playScenario } from "@/lib/mocks/http";
import { mockStore } from "@/lib/mocks/store";
import { ACCEPT_REFUSAL } from "@/lib/team/constants";
import type { MockHandler, MockInvitation, MockUser } from "@/lib/types";
import { linkTokenSchema } from "@/lib/validations/auth";
import { acceptRequestSchema, locationConsentSchema } from "@/lib/validations/team";

const INVALID = "Validation failed";
const NOT_FOUND = "Invitation not found";

const viewOf = (invitation: MockInvitation) => {
    const { name, side, sso } = MOCK_ORGANISATIONS[invitation.organisation];
    const { users, memberships } = mockStore();
    const member = memberships.get(invitation.email);
    const account = member && member !== invitation.organisation ? "elsewhere" : users.has(invitation.email) ? "existing" : "new";
    const { email, inviter, role, status } = invitation;
    return { email, organisation: name, side, sso, inviter, role, status, account } as const;
};

export const checkInvitation: MockHandler = ({ body, path }) => {
    const input = linkTokenSchema.safeParse(body);
    if (!input.success) return fail(400, INVALID, path);
    const invitation = mockStore().invitations.get(input.data.token);
    return invitation ? ok(200, viewOf(invitation)) : fail(404, NOT_FOUND, path);
};

export const acceptInvitation: MockHandler = async ({ body, path }) => {
    const input = acceptRequestSchema.safeParse(body);
    if (!input.success) return fail(400, INVALID, path);
    const blocked = playScenario(MOCK_INVITE_SCENARIOS[input.data.token], path);
    if (blocked) return blocked;
    const store = mockStore();
    const invitation = store.invitations.get(input.data.token);
    if (!invitation || invitation.status === "expired" || invitation.status === "revoked") return fail(404, ACCEPT_REFUSAL.gone, path);
    if (invitation.status === "accepted") return fail(409, ACCEPT_REFUSAL.accepted, path);
    const view = viewOf(invitation);
    if (view.sso) return fail(403, ACCEPT_REFUSAL.sso, path);
    if (view.account === "elsewhere") return fail(409, ACCEPT_REFUSAL.elsewhere, path);

    let user: MockUser | undefined;
    if ("email" in input.data) {
        if (input.data.email.toLowerCase() !== invitation.email) return fail(403, ACCEPT_REFUSAL.mismatch, path);
        user = store.users.get(invitation.email);
        if (!user) return fail(404, ACCEPT_REFUSAL.gone, path);
    } else {
        if (store.users.has(invitation.email)) return fail(409, ACCEPT_REFUSAL.existing, path);
        user = { id: nanoid(), name: input.data.fullName, email: invitation.email, password: input.data.password, role: "USER", roles: [invitation.role], verified: true, mfa: false };
        store.users.set(invitation.email, user);
    }
    store.memberships.set(invitation.email, invitation.organisation);
    store.invitations.set(input.data.token, { ...invitation, status: "accepted" });
    return issueSession(200, user);
};

export const recordLocationConsent: MockHandler = ({ body, path }) => {
    const input = locationConsentSchema.safeParse(body);
    if (!input.success) return fail(400, INVALID, path);
    mockStore().locationConsents.set(input.data.email.toLowerCase(), input.data.decision);
    return ok(201, { decision: input.data.decision });
};
