import clsx from "clsx";
import type { ReactNode } from "react";
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
                "border-border-dark bg-background-alt hidden w-full max-w-sm shrink-0 rounded-md border shadow-2xl md:block motion-reduce:block",
                className,
            )}
        >
            <div aria-hidden className="flex flex-col">
                <div className="border-border flex items-center justify-between gap-4 border-b px-5 py-3">
                    <p className="haulr-label text-text-muted">{label}</p>
                    <p className="haulr-label text-accent flex items-center gap-2">
                        <span className="bg-accent block size-1.5 rounded-full" />
                        {status}
                    </p>
                </div>
                <div className="flex flex-col gap-5 p-5">{children}</div>
                <p className="haulr-label text-text-muted border-border border-t px-5 py-3">{PANEL_NOTE}</p>
            </div>
        </div>
    );
}
