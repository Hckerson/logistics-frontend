"use client";
import Link from "next/link";
import { useState } from "react";
import { Renew } from "@carbon/icons-react";
import { CONSOLE_ACTION, QUIET_LINK } from "@/lib/auth/constants";
import { ESTIMATOR_COPY } from "@/lib/data/quotes/estimator";
import { useCountdown } from "@/lib/hooks/use-countdown";
import type { EstimateFailure } from "@/lib/types";
import { formatClock } from "@/lib/utils/date-formatter";

interface Props {
    failure: Exclude<EstimateFailure, { kind: "unresolved" }>;
    onRetry: () => void;
}

const SECOND = 1000;
const { failure: copy } = ESTIMATOR_COPY;

export default function EstimateNotice({ failure, onRetry }: Props) {
    const wait = failure.kind === "rate-limited" ? failure.wait : 0;
    const [until] = useState(() => performance.now() + wait * SECOND);
    const remaining = Math.ceil(useCountdown(until) / SECOND);
    const say = (seconds: number) =>
        failure.kind !== "rate-limited"
            ? copy[failure.kind]
            : wait
              ? copy.rateLimited.replace("{time}", formatClock(seconds))
              : copy.rateLimitedUnknown;
    const [announced] = useState(() => say(wait));

    return (
        <div className="flex flex-col gap-4">
            <p role="status" className="sr-only">
                {announced}
            </p>
            <p aria-hidden className="text-text-secondary text-sm tabular-nums">
                {say(remaining)}
            </p>
            <button
                type="button"
                onClick={onRetry}
                disabled={remaining > 0}
                className={`${CONSOLE_ACTION} disabled:bg-background-muted disabled:text-text-muted disabled:cursor-not-allowed`}
            >
                {copy.retry}
                <Renew aria-hidden className="size-4" />
            </button>
            {failure.kind === "rate-limited" ? (
                <Link href={copy.signUp.href} className={QUIET_LINK}>
                    {copy.signUp.label}
                </Link>
            ) : null}
        </div>
    );
}
