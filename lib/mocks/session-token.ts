import { SignJWT } from "jose";
import { hasAnyRole, ROLE_GROUPS } from "@/lib/auth/roles";
import { SESSION_IDLE } from "@/lib/constants";
import type { MockUser } from "@/lib/types";

export const MOCK_TOKEN_ALGORITHM = "HS256";

export const MOCK_TOKEN_SECRET = new TextEncoder().encode("haulr-mock-session-secret-not-for-production");

const SECONDS_PER_MINUTE = 60;

const idleSeconds = ({ roles }: MockUser) =>
    (hasAnyRole(roles, ROLE_GROUPS.internal) ? SESSION_IDLE.internalMinutes : SESSION_IDLE.workspaceMinutes) * SECONDS_PER_MINUTE;

export const nowSeconds = () => Math.floor(new Date().getTime() / 1000);

export const signMockToken = (user: MockUser, authTime = nowSeconds()) =>
    new SignJWT({ email: user.email, role: user.role, roles: user.roles, authTime })
        .setProtectedHeader({ alg: MOCK_TOKEN_ALGORITHM })
        .setSubject(user.id)
        .setIssuedAt()
        .setExpirationTime(`${idleSeconds(user)}s`)
        .sign(MOCK_TOKEN_SECRET);
