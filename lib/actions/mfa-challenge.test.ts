import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { completeChallenge, endChallenge, readChallenge } from "@/lib/utils/session";
import { checkMfaChallenge } from "@/lib/auth/server-checks";
import { answerMfaChallenge } from "./mfa-challenge";

vi.mock("next/headers", () => ({
    cookies: () => Promise.resolve({ get: () => undefined }),
}));

vi.mock("@/lib/utils/session", () => ({
    getSession: () => Promise.resolve(null),
    readChallenge: vi.fn(),
    endChallenge: vi.fn(),
    completeChallenge: vi.fn(),
}));

const respondWith = (status: number, body: unknown, headers: Record<string, string> = {}) =>
    vi.fn().mockResolvedValue(
        new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...headers } }),
    );

const envelope = (data: unknown) => ({ statusCode: 200, message: "Success", data, timestamp: "2026-10-09T00:00:00Z" });

beforeEach(() => {
    vi.mocked(readChallenge).mockResolvedValue("mfa_pending");
    vi.mocked(completeChallenge).mockResolvedValue(true);
    vi.mocked(endChallenge).mockResolvedValue(undefined);
});

afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
});

describe("checking a pending two-step sign-in", () => {
    it("reports the account and attempts left", async () => {
        vi.stubGlobal("fetch", respondWith(200, envelope({ email: "mara@northline.example", method: "totp", attemptsRemaining: 5 })));

        expect(await checkMfaChallenge()).toEqual({ email: "mara@northline.example", method: "totp", attemptsRemaining: 5 });
    });

    it("finds nothing without the challenge cookie", async () => {
        vi.mocked(readChallenge).mockResolvedValue(null);
        vi.stubGlobal("fetch", vi.fn());

        expect(await checkMfaChallenge()).toBeNull();
        expect(fetch).not.toHaveBeenCalled();
    });
});

describe("answering the code challenge", () => {
    it("opens the session when the code is accepted", async () => {
        vi.stubGlobal("fetch", respondWith(200, envelope({ user: {}, accessToken: "signed.jwt.value" })));

        expect(await answerMfaChallenge({ method: "totp", code: "246810" })).toEqual({ ok: true, data: null });
        expect(completeChallenge).toHaveBeenCalled();
    });

    it("refuses a short code before reaching the backend", async () => {
        vi.stubGlobal("fetch", vi.fn());

        expect(await answerMfaChallenge({ method: "totp", code: "2468" })).toMatchObject({ ok: false, status: 400 });
        expect(fetch).not.toHaveBeenCalled();
    });

    it("carries the attempts left after a wrong code", async () => {
        vi.stubGlobal("fetch", respondWith(401, { statusCode: 401, message: "Invalid code", attemptsRemaining: 3 }));

        expect(await answerMfaChallenge({ method: "backup", code: "7q2m-x9kd" })).toMatchObject({
            ok: false,
            status: 401,
            attemptsRemaining: 3,
        });
        expect(endChallenge).not.toHaveBeenCalled();
    });

    it("ends the pending sign-in when the attempts run out", async () => {
        vi.stubGlobal("fetch", respondWith(429, { statusCode: 429, message: "Too many attempts" }, { "Retry-After": "300" }));

        expect(await answerMfaChallenge({ method: "totp", code: "000000" })).toMatchObject({ status: 429, retryAfter: 300 });
        expect(endChallenge).toHaveBeenCalled();
    });
});
