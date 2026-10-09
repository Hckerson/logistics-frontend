"use client";
import clsx from "clsx";
import { useEffect, useRef, type ReactNode } from "react";
import { CheckmarkFilled, InProgress, WarningAltFilled } from "@carbon/icons-react";
import type { OutcomeTone } from "@/lib/types";

interface Props {
    label: string;
    detail?: string | null;
    body: string;
    tone?: OutcomeTone;
    children: ReactNode;
}

const TONES = {
    accent: { Icon: CheckmarkFilled, color: "text-accent" },
    pending: { Icon: InProgress, color: "text-accent" },
    error: { Icon: WarningAltFilled, color: "text-error" },
} as const;

export default function OutcomeStep({ label, detail, body, tone = "accent", children }: Props) {
    const panel = useRef<HTMLDivElement>(null);
    const { Icon, color } = TONES[tone];

    useEffect(() => panel.current?.focus(), []);

    return (
        <div ref={panel} tabIndex={-1} className="haulr-boot-rows flex flex-col gap-5 outline-none">
            <div className="flex flex-col gap-2">
                <p className={clsx("haulr-label flex items-center gap-2", color)}>
                    <Icon aria-hidden className="size-3.5" />
                    {label}
                </p>
                {detail ? <p className="text-text truncate font-mono text-sm">{detail}</p> : null}
                <p aria-live="polite" className="text-text-secondary text-sm">
                    {body}
                </p>
            </div>
            {children}
        </div>
    );
}
