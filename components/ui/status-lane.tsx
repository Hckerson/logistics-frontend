import clsx from "clsx";
import { SIGNAL_TONES } from "@/lib/ui/constants";
import type { SignalTone } from "@/lib/types";

interface Props {
    stage: number | null;
    tone: SignalTone;
    pulse: boolean;
}

const MOTION = "duration-500 ease-(--haulr-ease)";

export default function StatusLane({ stage, tone, pulse }: Props) {
    const at = stage === null ? null : `${Math.min(Math.max(stage, 0), 1) * 100}%`;

    return (
        <span aria-hidden className={clsx("relative inline-block h-2 w-7 shrink-0", SIGNAL_TONES[tone])}>
            <span className="absolute inset-x-0.75 inset-y-0">
                {at === null ? (
                    <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-dashed border-current opacity-70" />
                ) : (
                    <>
                        <span className="bg-border-dark absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2" />
                        <span className={clsx("absolute top-1/2 left-0 h-0.5 -translate-y-1/2 bg-current transition-[width]", MOTION)} style={{ width: at }} />
                        <span
                            className={clsx("absolute top-1/2 size-1.5 -translate-1/2 rounded-full bg-current transition-[left]", MOTION, pulse && "haulr-breathe")}
                            style={{ left: at }}
                        />
                    </>
                )}
            </span>
        </span>
    );
}
