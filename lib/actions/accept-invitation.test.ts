import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LEGAL_VERSIONS } from "@/lib/data/legal/library";
import { ACCEPT_REFUSAL } from "@/lib/team/constants";
import { getSession, openSession } from "@/lib/utils/session";
import { acceptInvitation } from "./accept-invitation";

vi.mock("next/headers", () => ({
    cookies: () => Promise.resolve({ get: () => undefined }),
}));

vi.mock("@/lib/utils/session", () => ({
    getSession: vi.fn(),
    openSession: vi.fn(),
}));

const respondWith = (status: number, body: unknown) =>
    vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }));

const sentBody = () => JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body));

beforeEach(() => {
    vi.mocked(getSession).mockResolvedValue(null);
    vi.mocked(openSession).mockResolvedValue(true);
    vi.stubGlobal("fetch", respondWith(200, { statusCode: 200, message: "Success", data: {}, timestamp: "2026-10-12T00:00:00Z" }));
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("accepting an invitation", () => {
    it("creates the account with the terms version it agreed to, then starts a session", async () => {
        expect(await acceptInvitation("inv_member", { fullName: "Ines Duarte", password: "longhaul88" })).toEqual({ ok: true, data: null });
        expect(sentBody()).toMatchObject({ token: "inv_member", fullName: "Ines Duarte", termsVersion: LEGAL_VERSIONS.terms });
        expect(openSession).toHaveBeenCalled();
    });

    it("joins as the signed-in account without asking for a password", async () => {
        vi.mocked(getSession).mockResolvedValue({ sub: "usr_fresh", email: "fresh@northline.example", role: "USER", iat: 0, exp: 0 });
        await acceptInvitation("inv_existing");
        expect(sentBody()).toEqual({ token: "inv_existing", email: "fresh@northline.example" });
    });

    it("refuses a short password before reaching the backend", async () => {
        expect(await acceptInvitation("inv_member", { fullName: "Ines Duarte", password: "short" })).toMatchObject({ ok: false, status: 400 });
        expect(fetch).not.toHaveBeenCalled();
    });

    it("carries the backend's reason when it refuses", async () => {
        vi.stubGlobal("fetch", respondWith(409, { statusCode: 409, message: ACCEPT_REFUSAL.elsewhere }));
        expect(await acceptInvitation("inv_elsewhere", { fullName: "Dana Okafor", password: "longhaul88" })).toMatchObject({
            ok: false,
            status: 409,
            message: ACCEPT_REFUSAL.elsewhere,
        });
    });
});
