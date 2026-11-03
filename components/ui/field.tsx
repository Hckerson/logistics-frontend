import type { ReactNode } from "react";
import FieldError, { fieldErrorId } from "@/components/ui/field-error";
import FieldLabel, { fieldLabelId } from "@/components/ui/field-label";
import { describedBy } from "@/lib/ui/classes";
import type { FieldControl } from "@/lib/types";

interface Props {
    id: string;
    label: string;
    index?: string;
    hint?: ReactNode;
    error?: string;
    aside?: ReactNode;
    children: (control: FieldControl) => ReactNode;
}

export const fieldHintId = (id: string) => `${id}-hint`;

export default function Field({ id, label, index, hint, error, aside, children }: Props) {
    const invalid = Boolean(error);

    return (
        <div className="group/field flex min-w-0 flex-col">
            <FieldLabel htmlFor={id} label={label} index={index} error={invalid} aside={aside} />
            {children({
                id,
                invalid,
                "aria-invalid": invalid || undefined,
                "aria-labelledby": fieldLabelId(id),
                "aria-describedby": describedBy(hint !== undefined && fieldHintId(id), invalid && fieldErrorId(id)),
            })}
            {hint !== undefined ? (
                <p id={fieldHintId(id)} className="text-text-muted mt-1.5 text-xs">
                    {hint}
                </p>
            ) : null}
            {error ? (
                <div className="mt-1.5">
                    <FieldError id={id} message={error} />
                </div>
            ) : null}
        </div>
    );
}
