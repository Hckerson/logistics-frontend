"use client";
import clsx from "clsx";
import { Send } from "@carbon/icons-react";
import ProgressLine from "@/components/auth/progress-line";
import { CONSOLE_ACTION } from "@/lib/auth/constants";
import { VERIFICATION_RESEND_COOLDOWN_S } from "@/lib/constants";
import { VERIFY_COPY } from "@/lib/data/auth/verify";
import { useCountdown } from "@/lib/hooks/use-countdown";
import { formatClock } from "@/lib/utils/date-formatter";

interface Props {
    label: string;
    sentAt: number | null;
    pending: boolean;
    onResend: () => void;
}

const SECOND = 1000;
const COOLDOWN = VERIFICATION_RESEND_COOLDOWN_S * SECOND;
const { resend } = VERIFY_COPY;

export default function ResendButton({ label, sentAt, pending, onResend }: Props) {
    const remaining = useCountdown(sentAt === null ? 0 : sentAt + COOLDOWN);
    const waiting = remaining > 0;
    const blocked = waiting || pending;
    const wait = resend.wait.replace("{time}", formatClock(Math.ceil(remaining / SECOND)));

    return (
        <button
            type="button"
            aria-disabled={blocked}
            onClick={blocked ? undefined : onResend}
            className={clsx(
                CONSOLE_ACTION,
                "aria-disabled:bg-background-muted aria-disabled:text-text-muted aria-disabled:hover:bg-background-muted aria-disabled:cursor-not-allowed",
            )}
        >
            <span className="tabular-nums">{pending ? resend.pending : waiting ? wait : label}</span>
            {blocked ? null : <Send aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />}
            {blocked ? (
                <ProgressLine value={pending ? undefined : 1 - remaining / COOLDOWN} className="bg-border absolute inset-x-0 bottom-0" />
            ) : null}
        </button>
    );
}
