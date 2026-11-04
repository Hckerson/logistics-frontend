import clsx from "clsx";
import { grouped } from "@/lib/utils/format-number";

type BadgeTone = "accent" | "muted";

interface Props {
    value: number;
    max?: number;
    tone?: BadgeTone;
    label?: string;
    className?: string;
}

const TONES: Record<BadgeTone, string> = {
    accent: "bg-signal-live text-text-inverse",
    muted: "bg-background-muted text-text-secondary",
};

export default function CountBadge({ value, max = 99, tone = "accent", label, className }: Props) {
    const shown = value > max ? `${grouped(max)}+` : grouped(value);

    return (
        <span
            className={clsx(
                "inline-grid h-4 min-w-4 shrink-0 place-items-center overflow-hidden px-1 font-mono text-[0.6875rem] leading-none tabular-nums",
                TONES[tone],
                className,
            )}
        >
            <span key={shown} aria-hidden={label === undefined ? undefined : true} className="haulr-flip">
                {shown}
            </span>
            {label === undefined ? null : <span className="sr-only">{label}</span>}
        </span>
    );
}
