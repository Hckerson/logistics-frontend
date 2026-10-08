import clsx from "clsx";
import type { ReactNode } from "react";
import HudPanel from "@/components/common/hud-panel";
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
            className={clsx("relative hidden w-full max-w-sm shrink-0 md:block motion-reduce:block", className)}
        >
            <div aria-hidden>
                <HudPanel label={label} status={status} note={PANEL_NOTE}>
                    {children}
                </HudPanel>
            </div>
        </div>
    );
}
