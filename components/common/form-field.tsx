import type { ReactNode } from "react";

interface Props {
    id: string;
    label: string;
    error?: string;
    children: ReactNode;
}

export const fieldErrorId = (id: string) => `${id}-error`;

export default function FormField({ id, label, error, children }: Props) {
    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={id} className="haulr-label text-text-muted">
                {label}
            </label>
            {error ? (
                <p id={fieldErrorId(id)} className="text-error text-sm">
                    {error}
                </p>
            ) : null}
            {children}
        </div>
    );
}
