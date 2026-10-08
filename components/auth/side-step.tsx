"use client";
import clsx from "clsx";
import { useEffect, useRef, type FormEvent } from "react";
import { ArrowRight } from "@carbon/icons-react";
import SideOption from "@/components/auth/side-option";
import FieldError, { fieldErrorId } from "@/components/common/field-error";
import { haulrButtonClass } from "@/components/home/haulr-button";
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

const { side } = REGISTER_COPY;

export default function SideStep({ id, value, error, returned, onChoose, onSubmit }: Props) {
    const group = useRef<HTMLFieldSetElement>(null);

    useEffect(() => {
        if (returned) group.current?.querySelector<HTMLInputElement>("input:checked")?.focus();
    }, [returned]);

    return (
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
            <fieldset
                ref={group}
                id={id}
                tabIndex={-1}
                aria-describedby={error ? fieldErrorId(id) : undefined}
                className="flex flex-col gap-3 outline-none"
            >
                <legend className={clsx("mb-2 text-sm", error ? "text-error" : "text-text-muted")}>{side.legend}</legend>
                {side.options.map((option) => (
                    <SideOption
                        key={option.value}
                        name={`${id}-choice`}
                        value={option.value}
                        title={option.title}
                        detail={option.detail}
                        checked={value === option.value}
                        onChoose={() => onChoose(option.value)}
                    />
                ))}
            </fieldset>
            {error ? <FieldError id={id} message={error} /> : null}
            <button type="submit" className={haulrButtonClass("ink", "lg", "w-full cursor-pointer")}>
                {side.next}
                <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </button>
        </form>
    );
}
