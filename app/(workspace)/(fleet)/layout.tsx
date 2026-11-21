import type { ReactNode } from "react";
import { CAPABILITY_ROLES } from "@/lib/auth/capabilities";
import { requireRoles } from "@/lib/auth/guards";

export default async function FleetLayout({ children }: { children: ReactNode }) {
    await requireRoles(CAPABILITY_ROLES.readFleetPlan);
    return children;
}
