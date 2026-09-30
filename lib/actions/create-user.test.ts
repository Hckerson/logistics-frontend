import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SESSION_COOKIE } from "@/lib/constants";
import { createUser } from "./create-user";

const SESSION_TOKEN = "signed.jwt.value";

vi.mock("next/headers", () => ({
    cookies: () =>
        Promise.resolve({
            get: (name: string) =>
                name === SESSION_COOKIE ? { value: SESSION_TOKEN } : undefined,
        }),
}));

const NEW_USER = {
    fullName: "Ada Lovelace",
    email: "ada@example.com",
    password: "correct-horse",
};

const user = {
    id: "usr_1",
    fullName: NEW_USER.fullName,
    email: NEW_USER.email,
    phoneNumber: null,
    avatar: null,
    bio: null,
    role: "USER",
    status: "ACTIVE",
    createdAt: "2026-09-22T08:00:00.000Z",
    updatedAt: "2026-09-22T08:00:00.000Z",
    lastActive: null,
};

const created = {
    statusCode: 201,
    message: "Success",
    timestamp: "2026-09-22T08:00:00.000Z",
    data: user,
};

const respondWith = (status: number, payload: unknown) =>
    vi.fn().mockResolvedValue(
        new Response(JSON.stringify(payload), {
            status,
            headers: { "Content-Type": "application/json" },
        }),
    );

beforeEach(() => {
    vi.stubGlobal("fetch", respondWith(201, created));
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("createUser", () => {
    it("authenticates the backend call with the session cookie", async () => {
        await createUser(NEW_USER);

        const [, init] = vi.mocked(fetch).mock.calls[0];
        expect(new Headers(init?.headers).get("Authorization")).toBe(
            `Bearer ${SESSION_TOKEN}`,
        );
    });

    it("returns the created user", async () => {
        expect(await createUser(NEW_USER)).toEqual({ ok: true, data: user });
    });

    it("refuses a malformed input before reaching the backend", async () => {
        const result = await createUser({ ...NEW_USER, email: 42 } as never);

        expect(result).toMatchObject({ ok: false, status: 400 });
        expect(fetch).not.toHaveBeenCalled();
    });

    it("carries the backend's refusal and status back", async () => {
        vi.stubGlobal(
            "fetch",
            respondWith(409, { message: "User already exists" }),
        );

        expect(await createUser(NEW_USER)).toEqual({
            ok: false,
            status: 409,
            message: "User already exists",
        });
    });

    it("joins validation messages the backend returns as a list", async () => {
        vi.stubGlobal(
            "fetch",
            respondWith(400, { message: ["email must be an email", "x"] }),
        );

        expect(await createUser(NEW_USER)).toMatchObject({
            message: "email must be an email, x",
        });
    });
});
