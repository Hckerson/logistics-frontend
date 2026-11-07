import type { ReactNode } from "react";
import ConnectivityBar from "@/components/common/connectivity-bar";
import NotificationBell from "@/components/common/notification-bell";
import QuickFind from "@/components/common/quick-find";
import SessionTimeout from "@/components/common/session-timeout";
import WorkspaceAccount from "@/components/common/workspace-account";
import HaulrWordmark from "@/components/home/haulr-wordmark";
import { MAIN_CONTENT_ID } from "@/lib/constants";
import type { SessionWindow } from "@/lib/types";

interface Props {
    session: SessionWindow;
    children: ReactNode;
}

export default function WorkspaceFrame({ session, children }: Props) {
    return (
        <div className="flex min-h-svh flex-col">
            <header className="border-border bg-background/95 sticky top-0 z-(--z-indices-sticky) border-b backdrop-blur">
                <div className="haulr-shell flex h-12 items-center gap-3">
                    <HaulrWordmark compact />
                    <div className="ml-auto flex items-center gap-2">
                        <QuickFind />
                        <NotificationBell />
                        <WorkspaceAccount />
                    </div>
                </div>
                <ConnectivityBar />
            </header>
            <main id={MAIN_CONTENT_ID} tabIndex={-1} className="flex flex-1 flex-col outline-none">
                {children}
            </main>
            <SessionTimeout session={session} />
        </div>
    );
}
