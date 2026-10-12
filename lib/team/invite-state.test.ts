import { describe, expect, it } from "vitest";
import { inviteState } from "@/lib/team/invite-state";
import type { Invitation } from "@/lib/types";

const invitation: Invitation = {
    email: "ines@northline.example",
    organisation: "Northline Freight",
    side: "shipper",
    sso: false,
    inviter: "Priya Raman",
    role: "shipper.member",
    status: "open",
    account: "new",
};

describe("invite state", () => {
    it("asks a new person to join and an existing account to sign in", () => {
        expect(inviteState(invitation, null).kind).toBe("join");
        expect(inviteState({ ...invitation, account: "existing" }, null).kind).toBe("sign-in");
    });

    it("lets the invited account accept and asks anyone else to switch", () => {
        expect(inviteState({ ...invitation, account: "existing" }, "INES@northline.example").kind).toBe("accept");
        expect(inviteState(invitation, "kofi@northline.example")).toMatchObject({ kind: "switch", viewer: "kofi@northline.example" });
    });

    it("explains closed invitations, other organisations and single sign-on before anything else", () => {
        expect(inviteState(null, null).kind).toBe("unknown");
        expect(inviteState({ ...invitation, status: "expired" }, null).kind).toBe("expired");
        expect(inviteState({ ...invitation, account: "elsewhere" }, null).kind).toBe("elsewhere");
        expect(inviteState({ ...invitation, sso: true }, null).kind).toBe("sso");
    });
});
