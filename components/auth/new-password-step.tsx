"use client";
import { useEffect, useRef, type ChangeEvent, type FormEvent } from "react";
import AuthSubmit from "@/components/auth/auth-submit";
import IdentityRow from "@/components/auth/identity-row";
import PasswordRule from "@/components/auth/password-rule";
import BoardField from "@/components/common/board-field";
import { PASSWORD_MIN_LENGTH } from "@/lib/constants";
import { RESET_COPY, RESET_FIELDS } from "@/lib/data/auth/reset";
import { AUTH_COPY } from "@/lib/data/auth/shared";
import { useCapsLock } from "@/lib/hooks/use-caps-lock";
import type { ResetField } from "@/lib/types";

interface Props {
    idOf: (field: ResetField) => string;
    email: string;
    values: Record<ResetField, string>;
    errorFor: (field: ResetField) => string | undefined;
    pending: boolean;
    onChange: (field: ResetField) => (event: ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (event: FormEvent) => void;
}

const { fields, rules } = RESET_COPY;

export default function NewPasswordStep({ idOf, email, values, errorFor, pending, onChange, onSubmit }: Props) {
    const first = useRef<HTMLInputElement>(null);
    const caps = { password: useCapsLock(), confirm: useCapsLock() };
    const long = values.password.length >= PASSWORD_MIN_LENGTH;
    const met = { password: long, confirm: long && values.confirm === values.password };

    useEffect(() => first.current?.focus(), []);

    return (
        <form onSubmit={onSubmit} noValidate aria-busy={pending} className="haulr-boot-rows flex flex-col gap-5">
            <IdentityRow label={RESET_COPY.account} value={email} mono />
            <input type="email" name="username" autoComplete="username" value={email} readOnly tabIndex={-1} className="sr-only" />
            {RESET_FIELDS.map((field, index) => (
                <BoardField
                    key={field}
                    ref={index === 0 ? first : undefined}
                    id={idOf(field)}
                    {...fields[field]}
                    value={values[field]}
                    onChange={onChange(field)}
                    onKeyDown={caps[field].track}
                    onKeyUp={caps[field].track}
                    onBlur={caps[field].clear}
                    readOnly={pending}
                    error={errorFor(field)}
                    describedBy={`${idOf(field)}-rule`}
                    hint={caps[field].on ? AUTH_COPY.capsLock : null}
                    aside={<PasswordRule id={`${idOf(field)}-rule`} rule={rules[field]} met={met[field]} />}
                />
            ))}
            <p className="text-text-muted text-xs">{RESET_COPY.notice}</p>
            <AuthSubmit label={RESET_COPY.submit} pendingLabel={RESET_COPY.pending} pending={pending} />
        </form>
    );
}
