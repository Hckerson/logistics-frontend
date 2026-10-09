"use client";
import clsx from "clsx";
import Link from "next/link";
import { useEffect, useRef, type ChangeEvent, type FormEvent } from "react";
import AuthSubmit from "@/components/auth/auth-submit";
import IdentityRow from "@/components/auth/identity-row";
import BoardField from "@/components/common/board-field";
import { QUIET_LINK } from "@/lib/auth/constants";
import { MFA_CODE_LENGTH } from "@/lib/constants";
import { MFA_COPY } from "@/lib/data/auth/mfa";
import type { MfaMethod } from "@/lib/types";

interface Props {
    id: string;
    email: string;
    method: MfaMethod;
    value: string;
    error?: string;
    pending: boolean;
    arrived: boolean;
    locked: boolean;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (event: FormEvent) => void;
    onToggle: () => void;
}

export default function CodeStep(props: Props) {
    const { id, email, method, value, error, pending, arrived, locked, onChange, onSubmit, onToggle } = props;
    const input = useRef<HTMLInputElement>(null);
    const busy = pending || arrived || locked;
    const totp = method === "totp";

    useEffect(() => input.current?.focus(), []);

    return (
        <form onSubmit={onSubmit} noValidate aria-busy={pending} className="haulr-boot-rows flex flex-col gap-5">
            <IdentityRow label={MFA_COPY.account} value={email} mono />
            <BoardField
                ref={input}
                id={id}
                {...MFA_COPY.fields[method]}
                cells={totp ? MFA_CODE_LENGTH : undefined}
                tall={totp}
                spellCheck={false}
                value={value}
                onChange={onChange}
                readOnly={busy}
                error={error}
                aside={<span className="haulr-label text-text-muted">{MFA_COPY.rules[method]}</span>}
            />
            <AuthSubmit label={MFA_COPY.submit} pendingLabel={MFA_COPY.pending} doneLabel={MFA_COPY.arrived} pending={pending} done={arrived} />
            <div className="flex items-center justify-between gap-4">
                <button type="button" onClick={onToggle} disabled={busy} className={clsx(QUIET_LINK, "cursor-pointer disabled:opacity-40")}>
                    {MFA_COPY.switch[method]}
                </button>
                <Link href={MFA_COPY.help.href} className={QUIET_LINK}>
                    {MFA_COPY.help.label}
                </Link>
            </div>
        </form>
    );
}
