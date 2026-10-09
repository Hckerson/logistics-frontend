"use client";
import { RESET_LINK_MINUTES } from "@/lib/constants";
import { FORGOT_COPY } from "@/lib/data/auth/forgot";
import { useCountdown } from "@/lib/hooks/use-countdown";
import { formatClock } from "@/lib/utils/date-formatter";

interface Props {
    sentAt: number;
}

const SECOND = 1000;
const MINUTE = 60;
const TOTAL = RESET_LINK_MINUTES * MINUTE * SECOND;
const { sent } = FORGOT_COPY;

export default function LinkCountdown({ sentAt }: Props) {
    const remaining = useCountdown(sentAt + TOTAL);

    return (
        <div aria-hidden className="flex flex-col gap-2">
            <div className="flex items-end justify-between gap-4">
                <p className="haulr-label text-text-muted pb-1">{remaining > 0 ? sent.countdown : sent.expired}</p>
                <p className="text-text font-mono text-4xl tracking-tight tabular-nums">{formatClock(Math.ceil(remaining / SECOND))}</p>
            </div>
            <div className="bg-background-muted h-1.5 overflow-hidden rounded-full">
                <span
                    className="bg-accent block h-full origin-left transition-transform duration-1000 ease-linear"
                    style={{ transform: `scaleX(${remaining / TOTAL})` }}
                />
            </div>
        </div>
    );
}
