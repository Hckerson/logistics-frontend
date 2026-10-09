"use client";
import type { ChangeEvent, FormEvent } from "react";
import AuthSubmit from "@/components/auth/auth-submit";
import BoardField from "@/components/common/board-field";
import { FORGOT_COPY } from "@/lib/data/auth/forgot";

interface Props {
    id: string;
    value: string;
    error?: string;
    pending: boolean;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (event: FormEvent) => void;
}

export default function ResetRequestStep({ id, value, error, pending, onChange, onSubmit }: Props) {
    return (
        <form onSubmit={onSubmit} noValidate aria-busy={pending} className="haulr-boot-rows flex flex-col gap-5">
            <BoardField
                id={id}
                {...FORGOT_COPY.email}
                inputMode="email"
                spellCheck={false}
                value={value}
                onChange={onChange}
                readOnly={pending}
                error={error}
            />
            <AuthSubmit label={FORGOT_COPY.submit} pendingLabel={FORGOT_COPY.pending} pending={pending} />
        </form>
    );
}
