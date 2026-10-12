"use client";
import { Renew } from "@carbon/icons-react";
import ConsoleLink from "@/components/auth/console-link";
import ProgressLine from "@/components/common/progress-line";
import ResendButton from "@/components/auth/resend-button";
import { CONSOLE_ACTION } from "@/lib/auth/constants";
import { DASHBOARD_ROUTE } from "@/lib/constants";
import { VERIFY_COPY } from "@/lib/data/auth/verify";
import type { VerifyStatus } from "@/lib/types";

interface Props {
    status: VerifyStatus;
    sentAt: number | null;
    resent: boolean;
    sending: boolean;
    onResend: () => void;
    onRetry: () => void;
}

const { resend } = VERIFY_COPY;

export default function VerifyAction({ status, sentAt, resent, sending, onResend, onRetry }: Props) {
    if (status === "verifying") return <ProgressLine className="bg-border" />;
    if (status === "verified" || status === "already") return <ConsoleLink href={DASHBOARD_ROUTE} label={VERIFY_COPY.proceed} />;
    if (status === "failed") {
        return (
            <button type="button" onClick={onRetry} className={CONSOLE_ACTION}>
                {VERIFY_COPY.retry}
                <Renew aria-hidden className="size-4" />
            </button>
        );
    }

    return (
        <>
            <ResendButton label={status === "expired" ? resend.fresh : resend.ready} sentAt={sentAt} pending={sending} onResend={onResend} />
            {resent && !sending ? (
                <p role="status" className="haulr-label text-accent">
                    {resend.sent}
                </p>
            ) : null}
        </>
    );
}
