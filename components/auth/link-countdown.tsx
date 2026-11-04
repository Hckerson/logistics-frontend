"use client";
import { useState } from "react";
import Countdown from "@/components/ui/countdown";
import { RESET_LINK_MINUTES, TIME_MS } from "@/lib/constants";
import { FORGOT_COPY } from "@/lib/data/auth/forgot";
import { useNow } from "@/lib/hooks/use-now";

interface Props {
    sentAt: number;
}

const TOTAL = RESET_LINK_MINUTES * TIME_MS.minute;
const { sent } = FORGOT_COPY;

export default function LinkCountdown({ sentAt }: Props) {
    const [deadline] = useState(() => new Date().getTime() + TOTAL - (performance.now() - sentAt));
    const now = useNow();
    const remaining = now === null ? TOTAL : Math.max(0, deadline - now);

    return (
        <div aria-hidden className="flex flex-col gap-2">
            <div className="flex min-h-10 items-end justify-between gap-4">
                <p className="haulr-label text-text-muted pb-1">{remaining > 0 ? sent.countdown : sent.expired}</p>
                {remaining > 0 ? <Countdown deadline={deadline} className="text-4xl tracking-tight" /> : null}
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
