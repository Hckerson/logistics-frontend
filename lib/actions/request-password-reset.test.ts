import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { requestPasswordReset } from "./request-password-reset";

vi.mock("next/headers", () => ({
    cookies: () => Promise.resolve({ get: () => undefined }),
}));

const respondWith = (status: number, headers: Record<string, string> = {}) =>
    vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ statusCode: status }), {
            status,
            headers: { "Content-Type": "application/json", ...headers },
        }),
    );

beforeEach(() => {
    vi.stubGlobal("fetch", respondWith(202));
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("requesting a password reset", () => {
    it("accepts a well-formed email", async () => {
        expect(await requestPasswordReset("dana@northline.example")).toEqual({ ok: true, data: null });
    });

    it("refuses a malformed email before reaching the backend", async () => {
        const result = await requestPasswordReset("not-an-email");

        expect(result).toMatchObject({ ok: false, status: 400 });
        expect(fetch).not.toHaveBeenCalled();
    });

    it("carries the wait when the backend rate limits", async () => {
        vi.stubGlobal("fetch", respondWith(429, { "Retry-After": "90" }));

        expect(await requestPasswordReset("dana@northline.example")).toMatchObject({
            ok: false,
            status: 429,
            retryAfter: 90,
        });
    });
});
