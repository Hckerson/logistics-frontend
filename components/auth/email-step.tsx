"use client";
import { useEffect, useRef, type ChangeEvent, type FormEvent } from "react";
import AuthSubmit from "@/components/auth/auth-submit";
import BoardField from "@/components/common/board-field";
import { SIGN_IN_COPY } from "@/lib/data/auth/sign-in";

interface Props {
    id: string;
    value: string;
    error?: string;
    returned: boolean;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (event: FormEvent) => void;
}

const { email } = SIGN_IN_COPY;

export default function EmailStep({ id, value, error, returned, onChange, onSubmit }: Props) {
    const input = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (returned) input.current?.focus();
    }, [returned]);

    return (
        <form onSubmit={onSubmit} noValidate className="haulr-boot-rows flex flex-col gap-5">
            <BoardField
                ref={input}
                id={id}
                name={email.name}
                index={email.index}
                label={email.label}
                type={email.type}
                inputMode="email"
                autoComplete={email.autoComplete}
                placeholder={email.placeholder}
                spellCheck={false}
                value={value}
                onChange={onChange}
                error={error}
            />
            <AuthSubmit label={email.next} />
        </form>
    );
}
