import clsx from "clsx";
import { useId, type ReactNode } from "react";
import HudCorners from "@/components/ui/hud-corners";

interface Props {
    label: string;
    aside?: ReactNode;
    footer?: ReactNode;
    flush?: boolean;
    className?: string;
    children: ReactNode;
}

export default function Panel({ label, aside, footer, flush = false, className, children }: Props) {
    const headingId = useId();

    return (
        <section aria-labelledby={headingId} className={clsx("border-border-dark bg-background relative border", className)}>
            <HudCorners />
            <header className="border-border flex min-h-10 items-center justify-between gap-3 border-b px-4 py-1.5">
                <h2 id={headingId} className="haulr-label text-text-muted">
                    {label}
                </h2>
                {aside}
            </header>
            <div className={flush ? undefined : "flex flex-col gap-3 p-4"}>{children}</div>
            {footer ? <div className="border-border border-t px-4 py-2.5">{footer}</div> : null}
        </section>
    );
}
