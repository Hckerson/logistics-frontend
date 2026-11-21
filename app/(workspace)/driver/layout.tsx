import type { ReactNode } from "react";
import OfflineQueueProvider from "@/components/providers/offline-queue-provider";
import { requireRoles } from "@/lib/auth/guards";
import { ROLE_GROUPS } from "@/lib/auth/roles";

export default async function DriverLayout({ children }: { children: ReactNode }) {
    const user = await requireRoles(ROLE_GROUPS.driver);
    return <OfflineQueueProvider owner={user.id}>{children}</OfflineQueueProvider>;
}
