import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getSession } from "@/lib/utils/session";
import { resendVerification, verifyEmail } from "./verify-email";

vi.mock("next/headers", () => ({
    cookies: () => Promise.resolve({ get: () => undefined }),
}));

vi.mock("@/lib/utils/session", () => ({ getSession: vi.fn() }));

const EMAIL = "kofi@northline.example";

const respondWith = (status: number, data: unknown = null) =>
    vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ statusCode: status, message: "Success", data, timestamp: "2026-10-09T00:00:00Z" }), {
            status,
            headers: { "Content-Type": "application/json" },
        }),
    );

beforeEach(() => {
    vi.stubGlobal("fetch", respondWith(200, { email: EMAIL }));
    vi.mocked(getSession).mockResolvedValue(null);
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("verifying an email", () => {
    it("returns the verified address", async () => {
        expect(await verifyEmail("vrf_live")).toEqual({ ok: true, data: EMAIL });
    });

    it("passes a dead link through as not found", async () => {
        vi.stubGlobal("fetch", respondWith(404));

        expect(await verifyEmail("vrf_dead")).toMatchObject({ ok: false, status: 404 });
    });

    it("skips the backend when the link carries no token", async () => {
        expect(await verifyEmail("")).toMatchObject({ ok: false, status: 400 });
        expect(fetch).not.toHaveBeenCalled();
    });
});

describe("resending the verification email", () => {
    it("requires a session before reaching the backend", async () => {
        expect(await resendVerification()).toMatchObject({ ok: false, status: 401 });
        expect(fetch).not.toHaveBeenCalled();
    });

    it("sends the link to the signed-in address", async () => {
        vi.mocked(getSession).mockResolvedValue({ sub: "usr_fresh", email: EMAIL, role: "USER", iat: 0, exp: 1 });
        vi.stubGlobal("fetch", respondWith(202));

        expect(await resendVerification()).toEqual({ ok: true, data: null });
        expect(vi.mocked(fetch).mock.calls[0]?.[1]?.body).toBe(JSON.stringify({ email: EMAIL }));
    });
});
