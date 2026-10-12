import type { SessionUser } from "@/lib/types";
import type { SessionPayload } from "@/lib/utils/verify-session-token";

export const toSessionUser = (session: SessionPayload | null): SessionUser | null =>
    session ? { id: session.sub, email: session.email, role: session.role, roles: session.roles ?? [] } : null;
