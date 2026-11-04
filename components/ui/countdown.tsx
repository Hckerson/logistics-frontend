"use client";
import clsx from "clsx";
import { useEffect, useRef } from "react";
import { TIME_MS } from "@/lib/constants";
import { useNow } from "@/lib/hooks/use-now";
import { UI_COPY } from "@/lib/ui/copy";
import { formatClock } from "@/lib/utils/date-formatter";
import { fillTemplate } from "@/lib/utils/fill-template";
import { pluralize } from "@/lib/utils/plural";

type CountdownFormat = "clock" | "words";

interface Props {
    deadline: string | number;
    warnAt?: number;
    format?: CountdownFormat;
    label?: string;
    onExpire?: () => void;
    className?: string;
}

const SECONDS = { hour: 3_600, minute: 60 } as const;

const clock = (seconds: number) => {
    const hours = Math.floor(seconds / SECONDS.hour);
    return hours > 0 ? `${hours}:${formatClock(seconds % SECONDS.hour)}` : formatClock(seconds);
};

const words = (seconds: number) => {
    const { durations } = UI_COPY;
    const time =
        seconds >= 2 * SECONDS.hour
            ? pluralize(Math.floor(seconds / SECONDS.hour), durations.hour)
            : seconds >= SECONDS.minute
              ? pluralize(Math.ceil(seconds / SECONDS.minute), durations.minute)
              : pluralize(seconds, durations.second);
    return fillTemplate(UI_COPY.timeLeft, { time });
};

export default function Countdown({ deadline, warnAt = 0, format = "clock", label, onExpire, className }: Props) {
    const now = useNow();
    const fired = useRef(false);
    const end = typeof deadline === "number" ? deadline : new Date(deadline).getTime();
    const remaining = now === null || Number.isNaN(end) ? null : Math.max(0, Math.ceil((end - now) / TIME_MS.second));
    const expired = remaining === 0;

    useEffect(() => {
        if (!expired) {
            fired.current = false;
            return;
        }
        if (fired.current) return;
        fired.current = true;
        onExpire?.();
    }, [expired, onExpire]);

    if (Number.isNaN(end)) return null;

    const text = remaining === null ? "" : expired ? UI_COPY.expired : format === "clock" ? clock(remaining) : words(remaining);
    const warning = remaining !== null && !expired && remaining <= warnAt;
    const flips = format === "clock" && !expired ? [...text] : [text];

    return (
        <span
            role="timer"
            aria-live="off"
            aria-label={label}
            className={clsx(
                "inline-flex font-mono tabular-nums transition-colors",
                warning ? "text-warning" : expired ? "text-text-muted" : "text-text",
                className,
            )}
        >
            <span aria-hidden className="inline-flex overflow-hidden">
                {flips.map((glyph, index) => (
                    <span key={`${index}-${glyph}`} className="haulr-flip inline-block whitespace-pre">
                        {glyph}
                    </span>
                ))}
            </span>
            <span className="sr-only">{text}</span>
        </span>
    );
}
