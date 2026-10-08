import clsx from "clsx";
import type { ReactNode } from "react";
import LaneScene from "@/components/auth/lane-scene";
import HaulrWordmark from "@/components/home/haulr-wordmark";
import { AUTH_COLUMNS } from "@/lib/auth/constants";
import { HAULR_BRAND } from "@/lib/data/home/brand";

interface Props {
    children: ReactNode;
}

export default function AuthShell({ children }: Props) {
    return (
        <div className="bg-background relative isolate flex min-h-svh flex-col overflow-hidden">
            <LaneScene />
            <header className="haulr-shell flex h-(--haulr-header) shrink-0 items-center gap-10">
                <HaulrWordmark />
                <p className="haulr-label text-text-muted hidden lg:block">{HAULR_BRAND.tag}</p>
            </header>
            <div className={clsx("haulr-shell grid flex-1 items-center pt-[11svh] pb-3 lg:pt-0 lg:pb-8", AUTH_COLUMNS)}>
                <main className="lg:col-start-2">{children}</main>
            </div>
        </div>
    );
}
