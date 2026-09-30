import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SESSION_COOKIE } from "@/lib/constants";
import { DELETE, POST } from "./route";

vi.mock("next/headers", () => ({
    cookies: () => Promise.resolve({ get: () => undefined }),
}));

const CREDENTIALS = { email: "user@example.com", password: "correct-horse" };

const upstreamPayload = {
    data: {
        user: {
            id: "usr_1",
            name: "Ada",
            email: CREDENTIALS.email,
            role: "USER",
        },
        accessToken: "signed.jwt.value",
    },
};

const postWith = (body: unknown) =>
    POST(
        new NextRequest(new URL("https://app.test/api/session"), {
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

beforeEach(() => {
    vi.stubGlobal("fetch", respondWith(200, upstreamPayload));
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("creating a session", () => {
    it("stores the token in a cookie the browser cannot read", async () => {
        const cookie = (await postWith(CREDENTIALS)).headers.get("set-cookie");

        expect(cookie).toContain(`${SESSION_COOKIE}=signed.jwt.value`);
        expect(cookie).toContain("HttpOnly");
        expect(cookie).toContain("SameSite=lax");
    });

    it("never returns the token to the caller", async () => {
        const body = await (await postWith(CREDENTIALS)).json();

        expect(JSON.stringify(body)).not.toContain("signed.jwt.value");
        expect(body.user.email).toBe(CREDENTIALS.email);
    });

    it("rejects a malformed body before reaching the backend", async () => {
        const response = await postWith({ email: "nope", password: "short" });

        expect(response.status).toBe(400);
        expect(fetch).not.toHaveBeenCalled();
    });

    it("turns a backend rejection into a 401 with no cookie", async () => {
        vi.stubGlobal("fetch", respondWith(401, { message: "Unauthorized" }));

        const response = await postWith(CREDENTIALS);

        expect(response.status).toBe(401);
        expect(response.headers.get("set-cookie")).toBeNull();
    });

    it("refuses a response that does not carry a token", async () => {
        vi.stubGlobal("fetch", respondWith(200, { data: { user: {} } }));

        expect((await postWith(CREDENTIALS)).status).toBe(401);
    });
});

describe("destroying a session", () => {
    it("clears the cookie", () => {
        const response = DELETE();

        expect(response.status).toBe(204);
        expect(response.headers.get("set-cookie")).toContain(
            `${SESSION_COOKIE}=`,
        );
    });
});
