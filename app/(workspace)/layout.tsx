import type { ReactNode } from "react";
import WorkspaceFrame from "@/components/common/workspace-frame";
import SessionProvider from "@/components/providers/session-provider";
import RouteFocus from "@/components/wrappers/route-focus";
import { requireUser } from "@/lib/auth/guards";

export default async function WorkspaceLayout({ children }: { children: ReactNode }) {
    const user = await requireUser();

    return (
        <SessionProvider user={user}>
            <WorkspaceFrame session={user}>
                <RouteFocus />
                {children}
            </WorkspaceFrame>
        </SessionProvider>
    );
}
