import { nanoid } from "nanoid";
import { loginDtoSchema, registerDtoSchema } from "@/lib/contract/schemas";
import { resetRequestSchema } from "@/lib/validations/auth";
import { MOCK_SCENARIOS } from "@/lib/data/mocks/users";
import { fail, ok } from "@/lib/mocks/http";
import { signMockToken } from "@/lib/mocks/session-token";
import { mockStore } from "@/lib/mocks/store";
import type { MockHandler, MockResponse, MockUser } from "@/lib/types";

const INVALID_BODY = "Validation failed";
const INVALID_CREDENTIALS = "Invalid credentials";
const EMAIL_TAKEN = "Email already registered";
const TOO_MANY = "Too many requests";
const UNAVAILABLE = "Service temporarily unavailable";

const publicUser = ({ id, name, email, role }: MockUser) => ({ id, name, email, role });

const scenario = (email: string, path: string): MockResponse | null => {
    const found = MOCK_SCENARIOS[email.toLowerCase()];
    if (!found) return null;
    if (found.kind === "rate-limited") return fail(429, TOO_MANY, path, { "Retry-After": String(found.retryAfter) });
    return fail(503, UNAVAILABLE, path);
};

const session = async (status: number, user: MockUser) =>
    ok(status, { user: publicUser(user), accessToken: await signMockToken(user) });

export const login: MockHandler = async ({ body, path }) => {
    const input = loginDtoSchema.safeParse(body);
    if (!input.success) return fail(400, INVALID_BODY, path);
    const blocked = scenario(input.data.email, path);
    if (blocked) return blocked;
    const user = mockStore().users.get(input.data.email.toLowerCase());
    if (!user || user.password !== input.data.password) return fail(401, INVALID_CREDENTIALS, path);
    return session(200, user);
};

export const register: MockHandler = async ({ body, path }) => {
    const input = registerDtoSchema.safeParse(body);
    if (!input.success) return fail(400, INVALID_BODY, path);
    const blocked = scenario(input.data.email, path);
    if (blocked) return blocked;
    const key = input.data.email.toLowerCase();
    const { users } = mockStore();
    if (users.has(key)) return fail(409, EMAIL_TAKEN, path);
    const user: MockUser = { id: nanoid(), name: input.data.fullName, email: key, password: input.data.password, role: "USER" };
    users.set(key, user);
    return session(201, user);
};

export const requestReset: MockHandler = ({ body, path }) => {
    const input = resetRequestSchema.safeParse(body);
    if (!input.success) return fail(400, INVALID_BODY, path);
    return scenario(input.data.email, path) ?? ok(202, { accepted: true });
};
