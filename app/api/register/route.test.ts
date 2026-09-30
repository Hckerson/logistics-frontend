import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SESSION_COOKIE } from "@/lib/constants";
import { POST } from "./route";

vi.mock("next/headers", () => ({
    cookies: () => Promise.resolve({ get: () => undefined }),
}));

const VISITOR = {
    fullName: "Ada Lovelace",
    email: "ada@example.com",
    password: "correct-horse",
};

const registered = {
    data: {
        user: { id: "usr_1", name: "Ada", email: VISITOR.email, role: "USER" },
        accessToken: "signed.jwt.value",
    },
};

const postWith = (body: unknown) =>
    POST(
        new NextRequest(new URL("https://app.test/api/register"), {
            method: "POST",
            body: JSON.stringify(body),
            headers: { "Content-Type": "application/json" },
        }),
    );

const respondWith = (status: number, payload: unknown) =>
    vi.fn().mockResolvedValue(
        new Response(JSON.stringify(payload), {
            status,
            headers: { "Content-Type": "application/json" },
        }),
    );

const forwardedBody = () =>
    JSON.parse(String(vi.mocked(fetch).mock.calls[0][1]?.body));

beforeEach(() => {
    vi.stubGlobal("fetch", respondWith(201, registered));
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("registering", () => {
    it("signs the new user in with a cookie the browser cannot read", async () => {
        const response = await postWith(VISITOR);
        const cookie = response.headers.get("set-cookie");

        expect(response.status).toBe(201);
        expect(cookie).toContain(`${SESSION_COOKIE}=signed.jwt.value`);
        expect(cookie).toContain("HttpOnly");
    });

    it("never returns the token to the caller", async () => {
        const body = await (await postWith(VISITOR)).json();

        expect(JSON.stringify(body)).not.toContain("signed.jwt.value");
        expect(body.user.email).toBe(VISITOR.email);
    });

    it("drops a role the visitor tries to grant themselves", async () => {
        await postWith({ ...VISITOR, role: "ADMIN" });

        expect(forwardedBody()).not.toHaveProperty("role");
    });

    it("rejects a short password before reaching the backend", async () => {
        const response = await postWith({ ...VISITOR, password: "short" });

        expect(response.status).toBe(400);
        expect(fetch).not.toHaveBeenCalled();
    });

    it("passes a backend refusal through without a cookie", async () => {
        vi.stubGlobal(
            "fetch",
            respondWith(409, { message: "User already exists" }),
        );

        const response = await postWith(VISITOR);

        expect(response.status).toBe(409);
        expect((await response.json()).message).toBe("User already exists");
        expect(response.headers.get("set-cookie")).toBeNull();
    });
});
