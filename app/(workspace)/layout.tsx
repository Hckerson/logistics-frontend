import type { ReactNode } from "react";
import WorkspaceFrame from "@/components/common/workspace-frame";
import SessionProvider from "@/components/providers/session-provider";
import { requireUser } from "@/lib/auth/guards";

export default async function WorkspaceLayout({ children }: { children: ReactNode }) {
    return (
        <SessionProvider user={await requireUser()}>
            <WorkspaceFrame>{children}</WorkspaceFrame>
        </SessionProvider>
    );
}
