import clsx from "clsx";
import type { ReactNode } from "react";
import HudCorners from "@/components/common/hud-corners";

interface Props {
    label: string;
    status: string;
    note: string;
    alert?: boolean;
    footer?: ReactNode;
    className?: string;
    children: ReactNode;
}

export default function HudPanel({ label, status, note, alert = false, footer, className, children }: Props) {
    return (
        <div className={clsx("border-border/70 bg-background/85 relative w-full border", className)}>
            <HudCorners />
            <div className="border-border flex items-center justify-between gap-4 border-b px-5 py-3">
                <p className="haulr-label text-text-muted">{label}</p>
                <p
                    aria-live="polite"
                    className={clsx("haulr-label flex items-center gap-2", alert ? "text-error" : "text-accent")}
                >
                    <span className="block size-1.5 rounded-full bg-current" />
                    {status}
                </p>
            </div>
            <div className={clsx("flex flex-col gap-5 px-5 pt-5", footer ? "pb-6" : "pb-7")}>{children}</div>
            {footer}
            <p aria-hidden className="haulr-label text-text-muted bg-background absolute right-8 bottom-0 translate-y-1/2 px-2">
                {note}
            </p>
        </div>
    );
}
