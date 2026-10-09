"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowRight, CheckmarkFilled } from "@carbon/icons-react";
import LinkCountdown from "@/components/auth/link-countdown";
import { CONSOLE_ACTION, QUIET_LINK } from "@/lib/auth/constants";
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
    const panel = useRef<HTMLDivElement>(null);

    useEffect(() => panel.current?.focus(), []);

    return (
        <div ref={panel} tabIndex={-1} className="haulr-boot-rows flex flex-col gap-5 outline-none">
            <div className="flex flex-col gap-2">
                <p className="haulr-label text-accent flex items-center gap-2">
                    <CheckmarkFilled aria-hidden className="size-3.5" />
                    {sent.label}
                </p>
                <p className="text-text truncate font-mono text-sm">{email}</p>
                <p aria-live="polite" className="text-text-secondary text-sm">
                    {sent.body}
                </p>
            </div>
            <LinkCountdown key={sentAt} sentAt={sentAt} />
            <p className="text-text-muted text-xs">{sent.expiry}</p>
            <Link href={LOGIN_ROUTE} className={CONSOLE_ACTION}>
                {sent.back}
                <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
            <div className="flex items-center justify-between gap-4">
                <button type="button" onClick={onResend} disabled={pending} className={QUIET_LINK}>
                    {pending ? FORGOT_COPY.pending : sent.resend}
                </button>
                {resent && !pending ? <span className="haulr-label text-accent">{sent.resent}</span> : null}
            </div>
        </div>
    );
}
