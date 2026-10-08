import clsx from "clsx";
import type { ReactNode } from "react";
import HudCorners from "@/components/home/hud-corners";
import { PANEL_NOTE } from "@/lib/data/home/panels";

interface Props {
    label: string;
    status: string;
    summary: string;
    className?: string;
    children: ReactNode;
}

export default function PanelFrame({ label, status, summary, className, children }: Props) {
    return (
        <div
            role="img"
            aria-label={summary}
            className={clsx(
                "border-border/70 bg-background/85 relative hidden w-full max-w-sm shrink-0 border md:block motion-reduce:block",
                className,
            )}
        >
            <HudCorners />
            <div aria-hidden className="flex flex-col">
                <div className="border-border flex items-center justify-between gap-4 border-b px-5 py-3">
                    <p className="haulr-label text-text-muted">{label}</p>
                    <p className="haulr-label text-accent flex items-center gap-2">
                        <span className="bg-accent block size-1.5 rounded-full" />
                        {status}
                    </p>
                </div>
                <div className="flex flex-col gap-5 px-5 pt-5 pb-7">{children}</div>
            </div>
            <p aria-hidden className="haulr-label text-text-muted bg-background absolute right-8 bottom-0 translate-y-1/2 px-2">
                {PANEL_NOTE}
            </p>
        </div>
    );
}
