import type { SessionUser, SessionWindow } from "@/lib/types";
import type { SessionPayload } from "@/lib/utils/verify-session-token";

const MS_PER_SECOND = 1000;

export const sessionWindowOf = ({ iat, exp }: Pick<SessionPayload, "iat" | "exp">, serverNow = new Date().getTime()): SessionWindow => ({
    issuedAt: iat * MS_PER_SECOND,
    expiresAt: exp * MS_PER_SECOND,
    serverNow,
});

export const toSessionUser = (session: SessionPayload | null): SessionUser | null =>
    session ? { id: session.sub, email: session.email, role: session.role, roles: session.roles ?? [], ...sessionWindowOf(session) } : null;
