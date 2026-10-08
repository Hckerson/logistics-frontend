import type { ReactNode } from "react";
import AuthAside from "@/components/auth/auth-aside";
import HaulrWordmark from "@/components/home/haulr-wordmark";

interface Props {
    children: ReactNode;
}

export default function AuthShell({ children }: Props) {
    return (
        <div className="grid min-h-svh lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
            <AuthAside />
            <main className="bg-background-alt flex flex-col">
                <header className="haulr-shell flex h-(--haulr-header) items-center lg:hidden">
                    <HaulrWordmark />
                </header>
                <div className="flex flex-1 items-start justify-center px-(--haulr-gutter) py-12 lg:items-center lg:py-16">
                    <div className="flex w-full max-w-md flex-col gap-10">{children}</div>
                </div>
            </main>
        </div>
    );
}
