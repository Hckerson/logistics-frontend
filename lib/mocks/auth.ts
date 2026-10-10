import { nanoid } from "nanoid";
import { loginDtoSchema, registerDtoSchema } from "@/lib/contract/schemas";
import { linkTokenSchema, resetPasswordSchema, resetRequestSchema } from "@/lib/validations/auth";
import { MOCK_BREACHED_PASSWORDS, MOCK_RESET_TOKENS, MOCK_SCENARIOS, MOCK_VERIFY_TOKENS } from "@/lib/data/mocks/users";
import { fail, issueSession, ok } from "@/lib/mocks/http";
import { openChallenge } from "@/lib/mocks/mfa";
import { mockStore } from "@/lib/mocks/store";
import type { MockHandler, MockResponse, MockUser } from "@/lib/types";

const INVALID_BODY = "Validation failed";
const INVALID_CREDENTIALS = "Invalid credentials";
const EMAIL_TAKEN = "Email already registered";
const TOO_MANY = "Too many requests";
const UNAVAILABLE = "Service temporarily unavailable";
const LINK_DEAD = "Reset link is invalid or expired";
const BREACHED = "Password found in a data breach";
const VERIFY_LINK_DEAD = "Verification link is invalid or expired";
const ALREADY_VERIFIED = "Email already verified";

export const scenario = (email: string, path: string): MockResponse | null => {
    const found = MOCK_SCENARIOS[email.toLowerCase()];
    if (!found) return null;
    if (found.kind === "rate-limited") return fail(429, TOO_MANY, path, { "Retry-After": String(found.retryAfter) });
    return fail(503, UNAVAILABLE, path);
};

export const login: MockHandler = async ({ body, path }) => {
    const input = loginDtoSchema.safeParse(body);
    if (!input.success) return fail(400, INVALID_BODY, path);
    const blocked = scenario(input.data.email, path);
    if (blocked) return blocked;
    const user = mockStore().users.get(input.data.email.toLowerCase());
    if (!user || user.password !== input.data.password) return fail(401, INVALID_CREDENTIALS, path);
    return user.mfa ? openChallenge(user) : issueSession(200, user);
};

export const register: MockHandler = async ({ body, path }) => {
    const input = registerDtoSchema.safeParse(body);
    if (!input.success) return fail(400, INVALID_BODY, path);
    const blocked = scenario(input.data.email, path);
    if (blocked) return blocked;
    const key = input.data.email.toLowerCase();
    const { users } = mockStore();
    if (users.has(key)) return fail(409, EMAIL_TAKEN, path);
    const user: MockUser = { id: nanoid(), name: input.data.fullName, email: key, password: input.data.password, role: "USER", verified: false, mfa: false };
    users.set(key, user);
    return issueSession(201, user);
};

export const requestReset: MockHandler = ({ body, path }) => {
    const input = resetRequestSchema.safeParse(body);
    if (!input.success) return fail(400, INVALID_BODY, path);
    const blocked = scenario(input.data.email, path);
    if (blocked) return blocked;
    const email = input.data.email.toLowerCase();
    const token = Object.keys(MOCK_RESET_TOKENS).find((key) => MOCK_RESET_TOKENS[key] === email);
    if (token) mockStore().resetTokens.set(token, email);
    return ok(202, { accepted: true });
};

export const checkReset: MockHandler = ({ body, path }) => {
    const input = linkTokenSchema.safeParse(body);
    if (!input.success) return fail(400, INVALID_BODY, path);
    const email = mockStore().resetTokens.get(input.data.token);
    return email ? ok(200, { email }) : fail(404, LINK_DEAD, path);
};

export const confirmReset: MockHandler = ({ body, path }) => {
    const input = resetPasswordSchema.safeParse(body);
    if (!input.success) return fail(400, INVALID_BODY, path);
    const { token, password } = input.data;
    const { resetTokens, users } = mockStore();
    const email = resetTokens.get(token);
    if (!email) return fail(404, LINK_DEAD, path);
    const blocked = scenario(email, path);
    if (blocked) return blocked;
    if (MOCK_BREACHED_PASSWORDS.includes(password.toLowerCase())) return fail(422, BREACHED, path);
    resetTokens.delete(token);
    const user = users.get(email);
    if (user) user.password = password;
    return ok(200, { reset: true });
};

export const verifyEmail: MockHandler = ({ body, path }) => {
    const input = linkTokenSchema.safeParse(body);
    if (!input.success) return fail(400, INVALID_BODY, path);
    const email = MOCK_VERIFY_TOKENS[input.data.token];
    if (!email) return fail(404, VERIFY_LINK_DEAD, path);
    const blocked = scenario(email, path);
    if (blocked) return blocked;
    const { verifiedEmails } = mockStore();
    if (verifiedEmails.has(email)) return fail(409, ALREADY_VERIFIED, path);
    verifiedEmails.add(email);
    return ok(200, { email });
};

export const resendVerification: MockHandler = ({ body, path }) => {
    const input = resetRequestSchema.safeParse(body);
    if (!input.success) return fail(400, INVALID_BODY, path);
    const blocked = scenario(input.data.email, path);
    if (blocked) return blocked;
    const verified = mockStore().verifiedEmails.has(input.data.email.toLowerCase());
    return verified ? fail(409, ALREADY_VERIFIED, path) : ok(202, { accepted: true });
};
