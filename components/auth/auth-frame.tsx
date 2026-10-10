import clsx from "clsx";
import type { ReactNode } from "react";
import EntryBeam from "@/components/auth/entry-beam";
import HaulrWordmark from "@/components/home/haulr-wordmark";
import AuthSignalProvider from "@/components/providers/auth-signal-provider";
import { AUTH_COLUMNS } from "@/lib/auth/constants";
import { ENTRY_TIMELINE } from "@/lib/auth/entry";
import { HAULR_BRAND } from "@/lib/data/home/brand";

interface Props {
    scene?: ReactNode;
    children: ReactNode;
}

export default function AuthFrame({ scene, children }: Props) {
    return (
        <AuthSignalProvider>
            <div style={ENTRY_TIMELINE} className="bg-background relative isolate flex min-h-svh flex-col overflow-hidden">
                <div className="haulr-auth-reveal flex flex-1 flex-col">
                    {scene}
                    <header className="haulr-shell flex h-(--haulr-header) shrink-0 items-center gap-10">
                        <HaulrWordmark />
                        <p className="haulr-label text-text-muted hidden lg:block">{HAULR_BRAND.tag}</p>
                    </header>
                    <main
                        className={clsx(
                            "haulr-shell grid flex-1 content-start gap-y-8 pt-[calc(var(--haulr-auth-band)-var(--haulr-header))] pb-10 lg:content-center lg:items-center lg:pt-0",
                            AUTH_COLUMNS,
                        )}
                    >
                        {children}
                    </main>
                </div>
                <EntryBeam />
            </div>
        </AuthSignalProvider>
    );
}
