import type { ReactNode } from "react";
import SessionProvider from "@/components/providers/session-provider";
import { requireRoles } from "@/lib/auth/guards";
import { ROLE_GROUPS } from "@/lib/auth/roles";

export default async function InternalLayout({ children }: { children: ReactNode }) {
    return <SessionProvider user={await requireRoles(ROLE_GROUPS.internal)}>{children}</SessionProvider>;
}
