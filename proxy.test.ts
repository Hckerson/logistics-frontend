import { generateKeyPairSync } from "node:crypto";
import { SignJWT, importPKCS8 } from "jose";
import { NextRequest } from "next/server";
import { beforeAll, describe, expect, it } from "vitest";
import { appRoutes } from "@/lib/app-routes";
import { DASHBOARD_ROUTE, LOGIN_ROUTE, SESSION_COOKIE, VERIFY_ROUTE } from "@/lib/constants";
import { CSP_HEADER } from "@/lib/security/headers";

const real = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

const base64 = (pem: string) => Buffer.from(pem, "utf8").toString("base64");

let proxy: (request: NextRequest) => Promise<Response>;
let validToken: string;

const requestFor = (pathname: string, token?: string) => {
    const request = new NextRequest(new URL(`https://app.test${pathname}`));
    if (token) request.cookies.set(SESSION_COOKIE, token);
    return request;
};

const locationOf = (response: Response) =>
    new URL(response.headers.get("location") ?? "https://app.test/");

beforeAll(async () => {
    process.env.JWT_PUBLIC_KEY = base64(real.publicKey);

    validToken = await new SignJWT({
        sub: "usr_1",
        email: "user@example.com",
        role: "USER",
    })
        .setProtectedHeader({ alg: "RS256" })
        .setIssuedAt()
        .setExpirationTime("1h")
        .sign(await importPKCS8(real.privateKey, "RS256"));

    ({ proxy } = await import("./proxy"));
});

describe("route protection", () => {
    it("sends an anonymous visitor on a protected route to the login page", async () => {
        const response = await proxy(requestFor("/dashboard"));

        expect(response.status).toBe(307);
        expect(locationOf(response).pathname).toBe(LOGIN_ROUTE);
    });

    it("remembers where the visitor was headed", async () => {
        const response = await proxy(requestFor("/dashboard/settings"));

        expect(locationOf(response).searchParams.get("next")).toBe(
            "/dashboard/settings",
        );
    });

    it("lets a verified session through to a protected route", async () => {
        const response = await proxy(requestFor("/dashboard", validToken));

        expect(response.headers.get("location")).toBeNull();
    });

    it("treats a forged cookie as no session at all", async () => {
        const forged = `${validToken.split(".").slice(0, 2).join(".")}.forged`;
        const response = await proxy(requestFor("/dashboard", forged));

        expect(locationOf(response).pathname).toBe(LOGIN_ROUTE);
    });

    it("clears the rejected cookie so it cannot be retried", async () => {
        const response = await proxy(requestFor("/dashboard", "garbage"));

        expect(response.headers.get("set-cookie")).toContain(SESSION_COOKIE);
    });

    it("leaves public routes open to anyone", async () => {
        const response = await proxy(requestFor("/"));

        expect(response.headers.get("location")).toBeNull();
    });

    it("sends a signed-in visitor on the auth pages to the dashboard", async () => {
        const response = await proxy(requestFor(LOGIN_ROUTE, validToken));

        expect(locationOf(response).pathname).toBe(DASHBOARD_ROUTE);
    });

    it("keeps email verification open to a signed-in visitor", async () => {
        const response = await proxy(requestFor(VERIFY_ROUTE, validToken));

        expect(response.headers.get("location")).toBeNull();
    });

    it("leaves the auth pages reachable while signed out", async () => {
        const response = await proxy(requestFor(LOGIN_ROUTE));

        expect(response.headers.get("location")).toBeNull();
    });

    it("guards every workspace and staff area, not only the dashboard", async () => {
        for (const path of [appRoutes.shipments(), appRoutes.dispatchBoard(), appRoutes.driverHome(), appRoutes.load("HL-1"), appRoutes.operations()]) {
            expect(locationOf(await proxy(requestFor(path))).pathname).toBe(LOGIN_ROUTE);
        }
    });

    it("leaves public profiles open even though they share a prefix with the workspace", async () => {
        expect((await proxy(requestFor(appRoutes.carrierProfile("cr_1")))).headers.get("location")).toBeNull();
    });
});

describe("security headers", () => {
    it("sends a fresh script nonce in the content security policy of every page", async () => {
        const first = (await proxy(requestFor("/"))).headers.get(CSP_HEADER) ?? "";
        const second = (await proxy(requestFor("/"))).headers.get(CSP_HEADER) ?? "";

        expect(first).toMatch(/script-src 'self' 'nonce-[\w-]+' 'strict-dynamic'/);
        expect(first).toContain("frame-ancestors 'none'");
        expect(first).not.toBe(second);
    });
});
