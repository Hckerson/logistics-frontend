"use client";
import clsx from "clsx";
import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { View, ViewOff } from "@carbon/icons-react";
import FieldError, { fieldErrorId } from "@/components/common/field-error";

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
    id: string;
    label: string;
    error?: string;
    aside?: ReactNode;
    hint?: ReactNode;
    revealLabel?: string;
    describedBy?: string;
}

const PanelField = forwardRef<HTMLInputElement, Props>(function PanelField(
    { id, label, error, aside, hint, revealLabel, describedBy, type, ...rest },
    ref,
) {
    const [shown, setShown] = useState(false);
    const secret = revealLabel !== undefined;
    const Icon = shown ? ViewOff : View;

    return (
        <div className="flex flex-col">
            <div className="mb-2 flex items-baseline justify-between gap-4 text-sm">
                <label htmlFor={id} className={error ? "text-error" : "text-text-muted"}>
                    {label}
                </label>
                {aside}
            </div>
            <div className="relative">
                <input
                    {...rest}
                    ref={ref}
                    id={id}
                    type={secret ? (shown ? "text" : "password") : type}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={clsx(describedBy, error && fieldErrorId(id)) || undefined}
                    className={clsx(
                        "bg-background text-text placeholder:text-text-muted/60 caret-accent read-only:text-text-secondary h-11 w-full rounded-sm border px-3 font-mono text-base transition-colors outline-none sm:text-sm",
                        "autofill:shadow-[inset_0_0_0_100vmax_var(--colors-background)] autofill:[-webkit-text-fill-color:var(--colors-text)]",
                        error ? "border-error" : "border-border-dark hover:border-text-muted focus:border-text",
                        secret && "pr-11",
                    )}
                />
                {secret ? (
                    <button
                        type="button"
                        aria-pressed={shown}
                        aria-label={revealLabel}
                        onClick={() => setShown((current) => !current)}
                        className="text-text-muted hover:text-text aria-pressed:text-accent focus-visible:outline-text absolute inset-y-0.5 right-0.5 grid w-10 cursor-pointer place-items-center rounded-sm transition-colors focus-visible:outline-2"
                    >
                        <Icon aria-hidden className="size-4" />
                    </button>
                ) : null}
            </div>
            <span aria-live="polite" className="haulr-label text-accent mt-2 empty:mt-0">
                {hint}
            </span>
            {error ? (
                <div className="mt-2">
                    <FieldError id={id} message={error} />
                </div>
            ) : null}
        </div>
    );
});

PanelField.displayName = "PanelField";

export default PanelField;
