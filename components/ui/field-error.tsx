import { WarningFilled } from "@carbon/icons-react";

interface Props {
    id: string;
    message: string;
}

export const fieldErrorId = (id: string) => `${id}-error`;

export default function FieldError({ id, message }: Props) {
    return (
        <p id={fieldErrorId(id)} className="text-error flex items-start gap-1.5 text-xs">
            <WarningFilled aria-hidden className="mt-px size-3.5 shrink-0" />
            {message}
        </p>
    );
}
