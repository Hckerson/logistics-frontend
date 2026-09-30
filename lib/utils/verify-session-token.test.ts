import { generateKeyPairSync } from "node:crypto";
import { SignJWT, importPKCS8 } from "jose";
import { beforeAll, describe, expect, it } from "vitest";
import type { SessionPayload } from "./verify-session-token";

const pair = () =>
    generateKeyPairSync("rsa", {
        modulusLength: 2048,
        publicKeyEncoding: { type: "spki", format: "pem" },
        privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });

const real = pair();
const attacker = pair();

const base64 = (pem: string) => Buffer.from(pem, "utf8").toString("base64");

const CLAIMS = {
    sub: "usr_1",
    email: "user@example.com",
    role: "USER",
};

const signWith = async (
    privatePem: string,
    claims: Record<string, unknown> = CLAIMS,
    expiry = "1h",
) =>
    new SignJWT(claims)
        .setProtectedHeader({ alg: "RS256" })
        .setIssuedAt()
        .setExpirationTime(expiry)
        .sign(await importPKCS8(privatePem, "RS256"));

let verifySessionToken: (token: string) => Promise<SessionPayload | null>;

beforeAll(async () => {
    process.env.JWT_PUBLIC_KEY = base64(real.publicKey);
    ({ verifySessionToken } = await import("./verify-session-token"));
});

describe("the proxy's session verification", () => {
    it("accepts a token the backend actually signed", async () => {
        const session = await verifySessionToken(
            await signWith(real.privateKey),
        );

        expect(session).not.toBeNull();
        expect(session?.sub).toBe("usr_1");
        expect(session?.role).toBe("USER");
    });

    it("rejects a token signed by a different key — the forgery case", async () => {
        expect(
            await verifySessionToken(await signWith(attacker.privateKey)),
        ).toBeNull();
    });

    it("rejects a token whose payload was edited after signing", async () => {
        const token = await signWith(real.privateKey);
        const [header, , signature] = token.split(".");

        const forgedPayload = Buffer.from(
            JSON.stringify({ ...CLAIMS, role: "ADMIN", exp: 9_999_999_999 }),
            "utf8",
        ).toString("base64url");

        expect(
            await verifySessionToken(`${header}.${forgedPayload}.${signature}`),
        ).toBeNull();
    });

    it("rejects an unsigned alg=none token", async () => {
        const header = Buffer.from(
            JSON.stringify({ alg: "none", typ: "JWT" }),
            "utf8",
        ).toString("base64url");
        const payload = Buffer.from(
            JSON.stringify({ ...CLAIMS, exp: 9_999_999_999 }),
            "utf8",
        ).toString("base64url");

        expect(await verifySessionToken(`${header}.${payload}.`)).toBeNull();
    });

    it("rejects an expired token even though the signature is good", async () => {
        expect(
            await verifySessionToken(
                await signWith(real.privateKey, CLAIMS, "-1s"),
            ),
        ).toBeNull();
    });

    it("rejects a token carrying a role the app does not define", async () => {
        expect(
            await verifySessionToken(
                await signWith(real.privateKey, { ...CLAIMS, role: "ROOT" }),
            ),
        ).toBeNull();
    });

    it("rejects malformed input rather than throwing", async () => {
        expect(await verifySessionToken("not-a-token")).toBeNull();
        expect(await verifySessionToken("")).toBeNull();
    });
});
