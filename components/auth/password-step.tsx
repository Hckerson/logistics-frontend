"use client";
import Link from "next/link";
import { useEffect, useRef, type ChangeEvent, type FormEvent } from "react";
import { ArrowRight, Checkmark } from "@carbon/icons-react";
import IdentityRow from "@/components/auth/identity-row";
import PanelField from "@/components/common/panel-field";
import { haulrButtonClass } from "@/components/home/haulr-button";
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
        <form onSubmit={onSubmit} noValidate aria-busy={pending} className="flex flex-col gap-5">
            <input type="email" name="username" autoComplete="username" value={email} readOnly tabIndex={-1} className="sr-only" />
            <IdentityRow
                label={password.identity}
                value={email}
                change={password.change}
                changeLabel={password.changeLabel}
                disabled={busy}
                mono
                onChange={onBack}
            />
            <PanelField
                ref={input}
                id={id}
                name={password.name}
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
            <button
                type="submit"
                aria-disabled={busy}
                className={haulrButtonClass("ink", "lg", "w-full cursor-pointer aria-disabled:cursor-wait")}
            >
                {arrived ? SIGN_IN_COPY.arrived : pending ? SIGN_IN_COPY.pending : SIGN_IN_COPY.submit}
                {arrived ? <Checkmark aria-hidden className="size-4" /> : null}
                {busy ? null : (
                    <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                )}
            </button>
        </form>
    );
}
