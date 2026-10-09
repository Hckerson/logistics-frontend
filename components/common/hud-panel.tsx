import clsx from "clsx";
import type { ReactNode } from "react";
import AssemblyFrame from "@/components/common/assembly-frame";
import HudCorners from "@/components/common/hud-corners";
import ScrambleText from "@/components/common/scramble-text";
import { ASSEMBLY } from "@/lib/auth/constants";
import { bootBase, partAt } from "@/lib/auth/entry";

interface Props {
    label: string;
    status: string;
    note: string;
    alert?: boolean;
    boot?: number;
    footer?: ReactNode;
    className?: string;
    children: ReactNode;
}

export default function HudPanel(props: Props) {
    const { label, status, note, alert = false, boot, footer, className, children } = props;
    const entry = boot !== undefined;
    const settle = entry ? boot + ASSEMBLY.header * ASSEMBLY.unit : 0;

    return (
        <div
            style={entry ? bootBase(boot) : undefined}
            className={clsx("relative w-full", !entry && "border-border/70 bg-background/85 border", className)}
        >
            {entry ? <AssemblyFrame /> : null}
            <HudCorners className={entry ? "haulr-lock" : undefined} />
            <div
                style={entry ? partAt(ASSEMBLY.header) : undefined}
                className={clsx(
                    "border-border relative flex items-center justify-between gap-4 border-b px-5 py-3",
                    entry && "haulr-part [--haulr-part-y:-0.75rem]",
                )}
            >
                <p className="haulr-label text-text-muted">{entry ? <ScrambleText text={label} delay={settle} /> : label}</p>
                <p
                    aria-live="polite"
                    className={clsx("haulr-label flex items-center gap-2", alert ? "text-error" : "text-accent")}
                >
                    <span className="block size-1.5 rounded-full bg-current" />
                    {entry ? <ScrambleText text={status} delay={settle} /> : status}
                </p>
            </div>
            <div className={clsx("relative flex flex-col gap-5 px-5 pt-5", footer ? "pb-6" : "pb-7")}>{children}</div>
            {footer}
            <p
                aria-hidden
                style={entry ? partAt(ASSEMBLY.note) : undefined}
                className={clsx(
                    "haulr-label text-text-muted bg-background absolute right-8 bottom-0 translate-y-1/2 px-2",
                    entry && "haulr-part [--haulr-part-x:1.5rem]",
                )}
            >
                {note}
            </p>
        </div>
    );
}
