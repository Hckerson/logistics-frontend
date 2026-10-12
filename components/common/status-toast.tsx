"use client";
import clsx from "clsx";
import Link from "next/link";
import type { KeyboardEvent } from "react";
import { Close } from "@carbon/icons-react";
import HudCorners from "@/components/common/hud-corners";
import { ANNOUNCER_COPY } from "@/lib/announcer/constants";
import type { Announcement } from "@/lib/types";

interface Props {
    announcement: Announcement | null;
    onDismiss: () => void;
}

const ESCAPE = "Escape";

export default function StatusToast({ announcement, onDismiss }: Props) {
    const dismissOnEscape = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === ESCAPE) onDismiss();
    };

    const card = announcement ? (
        <div
            onKeyDown={dismissOnEscape}
            className="border-border/70 bg-background/95 pointer-events-auto relative flex max-w-sm items-start gap-3 border px-4 py-3"
        >
            <HudCorners tone={announcement.tone === "assertive" ? "error" : "accent"} />
            <span
                aria-hidden
                className={clsx("mt-1.5 size-1.5 shrink-0 rounded-full", announcement.tone === "assertive" ? "bg-error" : "bg-accent")}
            />
            <div className="flex min-w-0 flex-col gap-2">
                <p className="text-text text-sm">{announcement.message}</p>
                {announcement.action ? (
                    <Link href={announcement.action.href} onClick={onDismiss} className="haulr-label text-accent hover:text-text self-start">
                        {announcement.action.label}
                    </Link>
                ) : null}
            </div>
            <button
                type="button"
                onClick={onDismiss}
                aria-label={ANNOUNCER_COPY.dismiss}
                className="text-text-muted hover:text-text focus-visible:outline-text -mr-1 cursor-pointer p-0.5 transition-colors focus-visible:outline-2"
            >
                <Close aria-hidden className="size-4" />
            </button>
        </div>
    ) : null;

    return (
        <div className="pointer-events-none fixed bottom-4 left-4 z-(--z-indices-popover) sm:bottom-6 sm:left-6">
            <div role="status" aria-live="polite">
                {announcement?.tone === "polite" ? card : null}
            </div>
            <div role="alert" aria-live="assertive">
                {announcement?.tone === "assertive" ? card : null}
            </div>
        </div>
    );
}
