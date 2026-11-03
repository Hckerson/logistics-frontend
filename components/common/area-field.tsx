import clsx from "clsx";
import type { ReactNode, TextareaHTMLAttributes } from "react";
import FieldError, { fieldErrorId } from "@/components/ui/field-error";
import FieldLabel from "@/components/ui/field-label";
import FocusCorners from "@/components/ui/focus-corners";

interface Props extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id" | "value"> {
    id: string;
    label: string;
    value: string;
    index?: string;
    error?: string;
    aside?: ReactNode;
}

export default function AreaField({ id, label, value, index, error, aside, ...rest }: Props) {
    return (
        <div className="group/field flex flex-col">
            <FieldLabel htmlFor={id} label={label} index={index} error={Boolean(error)} aside={aside} />
            <div className="group/control relative">
                <textarea
                    {...rest}
                    id={id}
                    value={value}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? fieldErrorId(id) : undefined}
                    className={clsx(
                        "text-text placeholder:text-text-muted/50 block min-h-36 w-full resize-y p-3 font-mono text-sm leading-relaxed outline-none",
                        error ? "bg-error-light" : "bg-background-muted",
                    )}
                />
                <FocusCorners invalid={Boolean(error)} />
            </div>
            {error ? (
                <div className="mt-2">
                    <FieldError id={id} message={error} />
                </div>
            ) : null}
        </div>
    );
}
