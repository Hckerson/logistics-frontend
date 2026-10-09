import clsx from "clsx";
import Link from "next/link";
import type { ChangeEvent } from "react";
import { Checkmark } from "@carbon/icons-react";
import FieldError, { fieldErrorId } from "@/components/common/field-error";
import { REGISTER_COPY } from "@/lib/data/auth/register";
import type { AccountSide } from "@/lib/types";

interface Props {
    id: string;
    side: AccountSide;
    checked: boolean;
    error?: string;
    disabled: boolean;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

const { consent } = REGISTER_COPY;
const DOCUMENT = "text-text hover:text-accent underline decoration-border-dark underline-offset-4 transition-colors";

export default function ConsentCheck({ id, side, checked, error, disabled, onChange }: Props) {
    const [service, sideTerms] = consent.documents[side];

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-start gap-3">
                <span className="relative mt-0.5 grid size-4 shrink-0 place-items-center">
                    <input
                        id={id}
                        type="checkbox"
                        name="consent"
                        checked={checked}
                        disabled={disabled}
                        onChange={onChange}
                        aria-invalid={error ? true : undefined}
                        aria-describedby={error ? fieldErrorId(id) : undefined}
                        className={clsx(
                            "peer bg-background checked:border-text checked:bg-text focus-visible:outline-text size-4 cursor-pointer appearance-none border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
                            error ? "border-error" : "border-text-muted",
                        )}
                    />
                    <Checkmark
                        aria-hidden
                        className="text-text-inverse pointer-events-none absolute size-3 opacity-0 peer-checked:opacity-100"
                    />
                </span>
                <label htmlFor={id} className="text-text-secondary text-xs leading-relaxed">
                    {consent.lead}{" "}
                    <Link href={service.href} target="_blank" rel="noopener noreferrer" className={DOCUMENT}>
                        {service.label}
                    </Link>{" "}
                    {consent.and}{" "}
                    <Link href={sideTerms.href} target="_blank" rel="noopener noreferrer" className={DOCUMENT}>
                        {sideTerms.label}
                    </Link>
                    {consent.read}{" "}
                    <Link href={consent.privacy.href} target="_blank" rel="noopener noreferrer" className={DOCUMENT}>
                        {consent.privacy.label}
                    </Link>
                    {consent.end}
                </label>
            </div>
            {error ? <FieldError id={id} message={error} /> : null}
        </div>
    );
}
