import { SignJWT } from "jose";
import { SESSION_MAX_AGE } from "@/lib/constants";
import type { MockUser } from "@/lib/types";

export const MOCK_TOKEN_ALGORITHM = "HS256";

export const MOCK_TOKEN_SECRET = new TextEncoder().encode("haulr-mock-session-secret-not-for-production");

export const signMockToken = (user: MockUser) =>
    new SignJWT({ email: user.email, role: user.role })
        .setProtectedHeader({ alg: MOCK_TOKEN_ALGORITHM })
        .setSubject(user.id)
        .setIssuedAt()
        .setExpirationTime(`${SESSION_MAX_AGE}s`)
        .sign(MOCK_TOKEN_SECRET);
