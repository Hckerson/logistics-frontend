import type { ReactNode } from "react";
import SessionProvider from "@/components/providers/session-provider";
import { requireUser } from "@/lib/auth/guards";

export default async function WorkspaceLayout({ children }: { children: ReactNode }) {
    return <SessionProvider user={await requireUser()}>{children}</SessionProvider>;
}
