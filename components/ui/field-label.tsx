import clsx from "clsx";
import type { ReactNode } from "react";

interface Props {
    htmlFor?: string;
    label: string;
    index?: string;
    error?: boolean;
    aside?: ReactNode;
}

export const fieldLabelId = (id: string) => `${id}-label`;

export default function FieldLabel({ htmlFor, label, index, error = false, aside }: Props) {
    return (
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <label
                id={htmlFor ? fieldLabelId(htmlFor) : undefined}
                htmlFor={htmlFor}
                className={clsx(
                    "haulr-label flex items-baseline gap-2.5 whitespace-nowrap transition-colors",
                    error ? "text-error" : "text-text-muted group-focus-within/field:text-text-secondary",
                )}
            >
                {index ? <span className={clsx(!error && "group-focus-within/field:text-accent")}>{index}</span> : null}
                {label}
            </label>
            {aside}
        </div>
    );
}
