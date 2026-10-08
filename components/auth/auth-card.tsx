import type { ReactNode } from "react";
import HudCorners from "@/components/home/hud-corners";

interface Props {
    label: string;
    footer: ReactNode;
    children: ReactNode;
}

export default function AuthCard({ label, footer, children }: Props) {
    return (
        <section className="sm:border-border/70 sm:bg-background/85 relative sm:border sm:backdrop-blur-md">
            <span className="hidden sm:block">
                <HudCorners />
            </span>
            <p className="haulr-label text-accent sm:border-border flex items-center gap-2 pb-4 sm:border-b sm:px-6 sm:py-3">
                <span aria-hidden className="bg-accent block size-1.5 rounded-full" />
                {label}
            </p>
            <div className="flex flex-col gap-6 sm:p-6 lg:px-8">{children}</div>
            <div className="border-border mt-4 border-t sm:mt-0 sm:px-6 lg:px-8">{footer}</div>
        </section>
    );
}
