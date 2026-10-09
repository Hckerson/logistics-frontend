"use client";
import ConsoleLink from "@/components/auth/console-link";
import LinkCountdown from "@/components/auth/link-countdown";
import OutcomeStep from "@/components/auth/outcome-step";
import { QUIET_LINK } from "@/lib/auth/constants";
import { LOGIN_ROUTE } from "@/lib/constants";
import { FORGOT_COPY } from "@/lib/data/auth/forgot";

interface Props {
    email: string;
    sentAt: number;
    resent: boolean;
    pending: boolean;
    onResend: () => void;
}

const { sent } = FORGOT_COPY;

export default function ResetSentStep({ email, sentAt, resent, pending, onResend }: Props) {
    return (
        <OutcomeStep label={sent.label} detail={email} body={sent.body}>
            <LinkCountdown key={sentAt} sentAt={sentAt} />
            <p className="text-text-muted text-xs">{sent.expiry}</p>
            <ConsoleLink href={LOGIN_ROUTE} label={sent.back} />
            <div className="flex items-center justify-between gap-4">
                <button type="button" onClick={onResend} disabled={pending} className={QUIET_LINK}>
                    {pending ? FORGOT_COPY.pending : sent.resend}
                </button>
                {resent && !pending ? <span className="haulr-label text-accent">{sent.resent}</span> : null}
            </div>
        </OutcomeStep>
    );
}
