"use client";
import { useEffect, useRef, type ChangeEvent, type FormEvent } from "react";
import { ArrowRight } from "@carbon/icons-react";
import PanelField from "@/components/common/panel-field";
import { haulrButtonClass } from "@/components/home/haulr-button";
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
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
            <PanelField
                ref={input}
                id={id}
                name={email.name}
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
            <button type="submit" className={haulrButtonClass("ink", "lg", "w-full cursor-pointer")}>
                {email.next}
                <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </button>
        </form>
    );
}
