"use client";
import { useState } from "react";
import { Renew } from "@carbon/icons-react";
import HudPanel from "@/components/common/hud-panel";
import { CONSOLE_ACTION } from "@/lib/auth/constants";
import { TIME_MS } from "@/lib/constants";
import { TRACKING_COPY } from "@/lib/data/tracking/copy";
import { useCountdown } from "@/lib/hooks/use-countdown";
import { formatClock } from "@/lib/utils/date-formatter";

interface Props {
    wait: number;
    pending: boolean;
    onRetry: () => void;
}

const { problems, note } = TRACKING_COPY;

export default function TrackingWait({ wait, pending, onRetry }: Props) {
    const [until] = useState(() => performance.now() + wait * TIME_MS.second);
    const remaining = Math.ceil(useCountdown(until) / TIME_MS.second);
    const say = (seconds: number) => (wait ? problems.rateLimited.replace("{time}", formatClock(seconds)) : problems.unavailable);
    const [announced] = useState(() => say(wait));

    return (
        <HudPanel label={TRACKING_COPY.position.label} status={problems.status} alert note={note} className="max-w-xl">
            <p role="status" className="sr-only">
                {announced}
            </p>
            <p aria-hidden className="text-text-secondary text-sm tabular-nums">
                {say(remaining)}
            </p>
            <button
                type="button"
                onClick={onRetry}
                disabled={remaining > 0 || pending}
                className={`${CONSOLE_ACTION} disabled:bg-background-muted disabled:text-text-muted disabled:cursor-not-allowed`}
            >
                {problems.retry}
                <Renew aria-hidden className="size-4" />
            </button>
        </HudPanel>
    );
}
