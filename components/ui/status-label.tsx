import clsx from "clsx";
import { SIGNAL_TAGS, SIGNAL_TONES } from "@/lib/ui/constants";
import type { SignalTone } from "@/lib/types";

interface Props {
    label: string;
    tone?: SignalTone;
    pulse?: boolean;
    tag?: boolean;
    className?: string;
}

export default function StatusLabel({ label, tone = "neutral", pulse = false, tag = false, className }: Props) {
    return (
        <span
            className={clsx(
                "haulr-label inline-flex items-center gap-2 whitespace-nowrap",
                tag && clsx("border px-2 py-1 leading-none", SIGNAL_TAGS[tone]),
                SIGNAL_TONES[tone],
                className,
            )}
        >
            <span aria-hidden className="relative grid size-1.5 shrink-0 place-items-center">
                {pulse ? <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-60" /> : null}
                <span className="relative size-1.5 rounded-full bg-current" />
            </span>
            <span key={label} className="haulr-flip inline-block">
                {label}
            </span>
        </span>
    );
}
