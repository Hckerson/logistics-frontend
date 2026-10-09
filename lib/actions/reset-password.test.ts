import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { checkResetToken, resetPassword } from "./reset-password";

vi.mock("next/headers", () => ({
    cookies: () => Promise.resolve({ get: () => undefined }),
}));

const respondWith = (status: number, data: unknown = null, headers: Record<string, string> = {}) =>
    vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ statusCode: status, message: "Success", data, timestamp: "2026-10-09T00:00:00Z" }), {
            status,
            headers: { "Content-Type": "application/json", ...headers },
        }),
    );

beforeEach(() => {
    vi.stubGlobal("fetch", respondWith(200, { email: "dana@northline.example" }));
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("checking a reset token", () => {
    it("names the account a live token belongs to", async () => {
        expect(await checkResetToken("rst_live")).toBe("dana@northline.example");
    });

    it("treats a dead token as no account", async () => {
        vi.stubGlobal("fetch", respondWith(404));

        expect(await checkResetToken("rst_dead")).toBeNull();
    });

    it("skips the backend when the link carries no token", async () => {
        expect(await checkResetToken("")).toBeNull();
        expect(fetch).not.toHaveBeenCalled();
    });

    it("refuses to call a link dead when the backend is down", async () => {
        vi.stubGlobal("fetch", respondWith(503));

        await expect(checkResetToken("rst_live")).rejects.toThrow();
    });
});

describe("saving a new password", () => {
    it("accepts a password that meets the policy", async () => {
        expect(await resetPassword("rst_live", "long enough")).toEqual({ ok: true, data: null });
    });

    it("refuses a short password before reaching the backend", async () => {
        expect(await resetPassword("rst_live", "short")).toMatchObject({ ok: false, status: 400 });
        expect(fetch).not.toHaveBeenCalled();
    });

    it("carries the wait when the backend rate limits", async () => {
        vi.stubGlobal("fetch", respondWith(429, null, { "Retry-After": "120" }));

        expect(await resetPassword("rst_live", "long enough")).toMatchObject({ ok: false, status: 429, retryAfter: 120 });
    });
});
