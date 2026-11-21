import { appRoutes } from "@/lib/app-routes";
import { hasAnyRole, ROLE_GROUPS } from "@/lib/auth/roles";
import type { RoleKey } from "@/lib/types";

const HOMES = [
    { roles: ROLE_GROUPS.internal, home: null },
    { roles: ROLE_GROUPS.carrier, home: appRoutes.dispatchBoard() },
    { roles: ROLE_GROUPS.driver, home: appRoutes.driverHome() },
    { roles: ROLE_GROUPS.shipper, home: appRoutes.shipments() },
] as const;

export const roleHome = (roles: readonly RoleKey[]) => HOMES.find((entry) => hasAnyRole(roles, entry.roles))?.home ?? null;
