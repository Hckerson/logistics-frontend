import type { ReactNode } from "react";
import { requireRoles } from "@/lib/auth/guards";
import { ROLE_GROUPS } from "@/lib/auth/roles";

export default async function ShipperLayout({ children }: { children: ReactNode }) {
    await requireRoles(ROLE_GROUPS.shipper);
    return children;
}
