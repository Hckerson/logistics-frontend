import type { ReactNode } from "react";
import WorkspaceAccount from "@/components/common/workspace-account";
import HaulrWordmark from "@/components/home/haulr-wordmark";
import { MAIN_CONTENT_ID } from "@/lib/constants";

interface Props {
    children: ReactNode;
}

export default function WorkspaceFrame({ children }: Props) {
    return (
        <div className="flex min-h-svh flex-col">
            <header className="border-border bg-background/95 sticky top-0 z-(--z-indices-sticky) border-b backdrop-blur">
                <div className="haulr-shell flex h-12 items-center justify-between gap-4">
                    <HaulrWordmark compact />
                    <WorkspaceAccount />
                </div>
            </header>
            <main id={MAIN_CONTENT_ID} tabIndex={-1} className="flex flex-1 flex-col outline-none">
                {children}
            </main>
        </div>
    );
}
