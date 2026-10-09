import { describe, expect, it } from "vitest";
import { unpublishedRoutes } from "@/lib/api-routes";
import { routes } from "@/lib/contract/routes";
import { MOCK_BREACHED_PASSWORDS, MOCK_RESET_TOKENS, MOCK_USERS, MOCK_VERIFY_TOKENS } from "@/lib/data/mocks/users";
import { MOCK_MFA } from "@/lib/data/mocks/mfa";
import { mockRequest } from "@/lib/mocks/router";
import { mfaChallengeSchema } from "@/lib/validations/auth";

const [user] = MOCK_USERS;
const send = (method: string, path: string, body: unknown = null) => mockRequest({ method, path, body }, 0);

describe("mock backend", () => {
    it("signs in a seeded account with the backend envelope", async () => {
        const response = await send("POST", routes.authLogin(), { email: user.email, password: user.password });
        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({ statusCode: 200, message: "Success", data: { user: { email: user.email } } });
    });

    it("rejects a wrong password with the error envelope", async () => {
        const response = await send("POST", routes.authLogin(), { email: user.email, password: "wrong-password" });
        expect(response.status).toBe(401);
        expect(response.body).toMatchObject({ statusCode: 401, error: "UnauthorizedException" });
    });

    it("registers a new account once and refuses the same email twice", async () => {
        const account = { fullName: "Ada Mensah", email: "ada@haulr.test", password: "longhaul88" };
        expect((await send("POST", routes.authRegister(), account)).status).toBe(201);
        expect((await send("POST", routes.authRegister(), account)).status).toBe(409);
    });

    it("plays the rate-limit scenario with Retry-After", async () => {
        const response = await send("POST", routes.authLogin(), { email: "busy@haulr.test", password: "anything1" });
        expect(response.status).toBe(429);
        expect(response.headers?.["Retry-After"]).toBe("120");
    });

    it("accepts a reset request the same way whether or not the account exists", async () => {
        const known = await send("POST", unpublishedRoutes.passwordReset(), { email: user.email });
        const unknown = await send("POST", unpublishedRoutes.passwordReset(), { email: "nobody@haulr.test" });
        expect(known.status).toBe(202);
        expect(unknown.status).toBe(202);
        expect((known.body as { data: unknown }).data).toEqual((unknown.body as { data: unknown }).data);
    });

    it("answers unknown routes with a 404 naming the missing mock", async () => {
        const response = await send("GET", "/api/nowhere");
        expect(response.status).toBe(404);
        expect(response.body).toMatchObject({ message: "No mock handler for GET /api/nowhere" });
    });

    it("spends a reset token once, refusing breached passwords before it is spent", async () => {
        const token = Object.keys(MOCK_RESET_TOKENS).find((key) => MOCK_RESET_TOKENS[key] === user.email);
        const check = () => send("POST", unpublishedRoutes.passwordResetCheck(), { token });
        const confirm = (password: string) => send("POST", unpublishedRoutes.passwordResetConfirm(), { token, password });

        expect((await check()).body).toMatchObject({ data: { email: user.email } });
        expect((await confirm(MOCK_BREACHED_PASSWORDS[0])).status).toBe(422);
        expect((await confirm("fresh-lane-42")).status).toBe(200);
        expect((await check()).status).toBe(404);
        expect((await send("POST", routes.authLogin(), { email: user.email, password: "fresh-lane-42" })).status).toBe(200);
        await send("POST", unpublishedRoutes.passwordReset(), { email: user.email });
        expect((await check()).status).toBe(200);
    });

    it("verifies an email once, then reports it as already verified", async () => {
        const unverified = MOCK_USERS.find((account) => !account.verified);
        const token = Object.keys(MOCK_VERIFY_TOKENS).find((key) => MOCK_VERIFY_TOKENS[key] === unverified?.email);
        const verify = (value?: string) => send("POST", unpublishedRoutes.verifyEmail(), { token: value });
        const resend = () => send("POST", unpublishedRoutes.verifyEmailResend(), { email: unverified?.email });

        expect((await resend()).status).toBe(202);
        expect((await verify(token)).body).toMatchObject({ data: { email: unverified?.email } });
        expect((await verify(token)).status).toBe(409);
        expect((await resend()).status).toBe(409);
        expect((await verify("vrf_unknown")).status).toBe(404);
    });

    it("asks a two-step account for a code, counts misses and spends backup codes once", async () => {
        const account = MOCK_USERS.find((candidate) => candidate.mfa);
        const challenge = async () => {
            const reply = await send("POST", routes.authLogin(), { email: account?.email, password: account?.password });
            return mfaChallengeSchema.parse(reply.body).data.challenge;
        };
        const answer = (id: string, method: string, code: string) => send("POST", unpublishedRoutes.mfaVerify(), { challenge: id, method, code });
        const [backup] = MOCK_MFA.backupCodes;

        const first = await challenge();
        expect((await send("POST", unpublishedRoutes.mfaChallenge(), { challenge: first })).body).toMatchObject({ data: { email: account?.email } });
        expect((await answer(first, "totp", "000000")).body).toMatchObject({ statusCode: 401, attemptsRemaining: MOCK_MFA.attempts - 1 });
        expect((await answer(first, "backup", backup)).body).toMatchObject({ data: { user: { email: account?.email } } });

        const second = await challenge();
        expect((await answer(second, "backup", backup)).status).toBe(401);
        expect((await answer(second, "totp", MOCK_MFA.code)).status).toBe(200);

        const third = await challenge();
        const statuses: number[] = [];
        for (let attempt = 0; attempt < MOCK_MFA.attempts; attempt += 1) statuses.push((await answer(third, "totp", "000000")).status);
        expect(statuses.at(-1)).toBe(429);
        expect((await answer(third, "totp", MOCK_MFA.code)).status).toBe(404);
    });
});
