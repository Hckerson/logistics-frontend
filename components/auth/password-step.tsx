"use client";
import Link from "next/link";
import { useEffect, useRef, type ChangeEvent, type FormEvent } from "react";
import AuthSubmit from "@/components/auth/auth-submit";
import IdentityRow from "@/components/auth/identity-row";
import BoardField from "@/components/common/board-field";
import { QUIET_LINK } from "@/lib/auth/constants";
import { FORGOT_PASSWORD_ROUTE } from "@/lib/constants";
import { AUTH_COPY } from "@/lib/data/auth/shared";
import { SIGN_IN_COPY } from "@/lib/data/auth/sign-in";
import { useCapsLock } from "@/lib/hooks/use-caps-lock";

interface Props {
    id: string;
    email: string;
    value: string;
    error?: string;
    pending: boolean;
    arrived: boolean;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onBack: () => void;
    onSubmit: (event: FormEvent) => void;
}

const { password } = SIGN_IN_COPY;

export default function PasswordStep({ id, email, value, error, pending, arrived, onChange, onBack, onSubmit }: Props) {
    const input = useRef<HTMLInputElement>(null);
    const caps = useCapsLock();
    const busy = pending || arrived;

    useEffect(() => input.current?.focus(), []);

    return (
        <form onSubmit={onSubmit} noValidate aria-busy={pending} className="haulr-boot-rows flex flex-col gap-5">
            <IdentityRow
                label={password.identity}
                value={email}
                change={password.change}
                changeLabel={password.changeLabel}
                disabled={busy}
                mono
                onChange={onBack}
            />
            <BoardField
                ref={input}
                id={id}
                name={password.name}
                index={password.index}
                label={password.label}
                autoComplete={password.autoComplete}
                value={value}
                onChange={onChange}
                onKeyDown={caps.track}
                onKeyUp={caps.track}
                onBlur={caps.clear}
                readOnly={busy}
                error={error}
                revealLabel={AUTH_COPY.reveal}
                hint={caps.on ? AUTH_COPY.capsLock : null}
                aside={
                    <Link href={FORGOT_PASSWORD_ROUTE} className={QUIET_LINK}>
                        {password.forgot}
                    </Link>
                }
            />
            <AuthSubmit
                label={SIGN_IN_COPY.submit}
                pendingLabel={SIGN_IN_COPY.pending}
                doneLabel={SIGN_IN_COPY.arrived}
                pending={pending}
                done={arrived}
            />
            <input type="email" name="username" autoComplete="username" value={email} readOnly tabIndex={-1} className="sr-only" />
        </form>
    );
}
