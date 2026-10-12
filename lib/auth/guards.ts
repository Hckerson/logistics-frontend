import "server-only";
import { forbidden, redirect } from "next/navigation";
import { hasAnyRole } from "@/lib/auth/roles";
import { LOGIN_ROUTE } from "@/lib/constants";
import type { RoleKey, SessionUser } from "@/lib/types";
import { getSession } from "@/lib/utils/session";
import { toSessionUser } from "@/lib/utils/session-user";

export const requireUser = async (): Promise<SessionUser> => {
    const user = toSessionUser(await getSession());
    if (!user) redirect(LOGIN_ROUTE);
    return user;
};

export const requireRoles = async (allowed: readonly RoleKey[]): Promise<SessionUser> => {
    const user = await requireUser();
    if (!hasAnyRole(user.roles, allowed)) forbidden();
    return user;
};
