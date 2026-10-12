import { describe, expect, it } from "vitest";
import { unpublishedRoutes } from "@/lib/api-routes";
import { mockRequest } from "@/lib/mocks/router";
import { ACCEPT_REFUSAL } from "@/lib/team/constants";
import { invitationEnvelopeSchema } from "@/lib/validations/team";

const post = (path: string, body: unknown) => mockRequest({ method: "POST", path, body }, 0);
const check = async (token: string) => invitationEnvelopeSchema.parse((await post(unpublishedRoutes.invitationCheck(), { token })).body).data;
const accept = (body: unknown) => post(unpublishedRoutes.invitationAccept(), body);

describe("mock invitations", () => {
    it("describes an open invitation for a new account", async () => {
        expect(await check("inv_member")).toMatchObject({ organisation: "Northline Freight", status: "open", account: "new", sso: false });
    });

    it("spots an existing account, one in another organisation, and an SSO organisation", async () => {
        expect((await check("inv_existing")).account).toBe("existing");
        expect((await check("inv_elsewhere")).account).toBe("elsewhere");
        expect((await check("inv_sso")).sso).toBe(true);
    });

    it("answers an unknown token with 404", async () => {
        expect((await post(unpublishedRoutes.invitationCheck(), { token: "inv_nope" })).status).toBe(404);
    });

    it("accepts once, creating the account, then refuses the same link", async () => {
        const join = { token: "inv_driver", fullName: "Tomas Reyes", password: "longhaul88", termsVersion: "1.1" };
        expect((await accept(join)).status).toBe(200);
        expect((await check("inv_driver")).status).toBe("accepted");
        expect((await accept(join)).body).toMatchObject({ message: ACCEPT_REFUSAL.accepted });
    });

    it("refuses another organisation's member and an SSO organisation", async () => {
        expect((await accept({ token: "inv_elsewhere", email: "dispatch@northline.example" })).body).toMatchObject({ message: ACCEPT_REFUSAL.elsewhere });
        expect((await accept({ token: "inv_sso", email: "lee@harborfoods.example" })).status).toBe(403);
    });

    it("plays the rate-limit scenario", async () => {
        expect((await accept({ token: "inv_busy", fullName: "Busy Person", password: "longhaul88", termsVersion: "1.1" })).status).toBe(429);
    });
});
