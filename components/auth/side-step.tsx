"use client";
import clsx from "clsx";
import { useEffect, useRef, type FormEvent } from "react";
import AuthSubmit from "@/components/auth/auth-submit";
import SidePicker from "@/components/auth/side-picker";
import FieldError, { fieldErrorId } from "@/components/common/field-error";
import { REGISTER_COPY } from "@/lib/data/auth/register";
import type { AccountSide } from "@/lib/types";

interface Props {
    id: string;
    value: AccountSide | null;
    error?: string;
    returned: boolean;
    onChoose: (side: AccountSide) => void;
    onSubmit: (event: FormEvent) => void;
}

const { side, consent } = REGISTER_COPY;

export default function SideStep({ id, value, error, returned, onChoose, onSubmit }: Props) {
    const group = useRef<HTMLFieldSetElement>(null);

    useEffect(() => {
        if (returned) group.current?.querySelector<HTMLInputElement>("input:checked")?.focus();
    }, [returned]);

    return (
        <form onSubmit={onSubmit} noValidate className="haulr-boot-rows flex flex-col gap-5">
            <fieldset
                ref={group}
                id={id}
                tabIndex={-1}
                aria-describedby={error ? fieldErrorId(id) : undefined}
                className="flex flex-col gap-3 outline-none"
            >
                <legend
                    className={clsx("haulr-label mb-3 flex items-baseline gap-2.5", error ? "text-error" : "text-text-muted")}
                >
                    <span className={clsx(!error && "text-accent")}>{side.index}</span>
                    {side.legend}
                </legend>
                <SidePicker name={`${id}-choice`} value={value} error={Boolean(error)} onChoose={onChoose} />
                {error ? (
                    <FieldError id={id} message={error} />
                ) : (
                    <p aria-live="polite" className="text-text-muted text-xs">
                        {value ? (
                            <>
                                {side.agreement}: <span className="text-text-secondary">{consent.documents[value][1].label}</span>
                            </>
                        ) : (
                            side.hint
                        )}
                    </p>
                )}
            </fieldset>
            <AuthSubmit label={side.next} />
        </form>
    );
}
