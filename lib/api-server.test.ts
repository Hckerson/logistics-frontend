import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { API_BASE_URL, SESSION_COOKIE } from "@/lib/constants";
import { backendFetch } from "./api-server";

const cookieJar = vi.hoisted(() => ({
    token: undefined as string | undefined,
}));

vi.mock("next/headers", () => ({
    cookies: () =>
        Promise.resolve({
            get: (name: string) =>
                name === SESSION_COOKIE && cookieJar.token
                    ? { value: cookieJar.token }
                    : undefined,
        }),
}));

const headersOfLastCall = () => {
    const [, init] = vi.mocked(fetch).mock.calls[0];
    return new Headers(init?.headers);
};

beforeEach(() => {
    cookieJar.token = undefined;
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}")));
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("calling the backend from the server", () => {
    it("attaches the session token the browser cannot send itself", async () => {
        cookieJar.token = "signed.jwt.value";

        await backendFetch("/api/users/me");

        expect(headersOfLastCall().get("authorization")).toBe(
            "Bearer signed.jwt.value",
        );
    });

    it("sends no authorization at all when there is no session", async () => {
        await backendFetch("/api/auth/login", { method: "POST" });

        expect(headersOfLastCall().get("authorization")).toBeNull();
    });

    it("resolves the path against the backend, not the app origin", async () => {
        await backendFetch("/api/users/me");

        expect(vi.mocked(fetch).mock.calls[0][0]).toBe(
            `${API_BASE_URL}/api/users/me`,
        );
    });

    it("never serves a stale authenticated response", async () => {
        await backendFetch("/api/users/me");

        const [, init] = vi.mocked(fetch).mock.calls[0];
        expect(init?.cache).toBe("no-store");
    });
});
