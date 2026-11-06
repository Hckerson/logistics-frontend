import clsx from "clsx";
import StatusLane from "@/components/ui/status-lane";
import { SIGNAL_TONES } from "@/lib/ui/constants";
import type { SignalTone } from "@/lib/types";

interface Props {
    label: string;
    tone?: SignalTone;
    pulse?: boolean;
    stage?: number | null;
    className?: string;
}

const WORDS: Partial<Record<SignalTone, string>> = {
    danger: "text-signal-danger",
    muted: "text-text-muted",
};

export default function StatusLabel({ label, tone = "neutral", pulse = false, stage, className }: Props) {
    return (
        <span className={clsx("inline-flex items-center gap-2 text-xs whitespace-nowrap", WORDS[tone] ?? "text-text-secondary", className)}>
            {stage === undefined ? (
                <span aria-hidden className={clsx("grid size-3 shrink-0 place-items-center", SIGNAL_TONES[tone])}>
                    <span className={clsx("size-1.5 rounded-full bg-current", pulse && "haulr-breathe")} />
                </span>
            ) : (
                <StatusLane stage={stage} tone={tone} pulse={pulse} />
            )}
            {label}
        </span>
    );
}
