"use client";
import { useEffect, useRef, type ChangeEvent, type FormEvent } from "react";
import { ArrowRight, Checkmark } from "@carbon/icons-react";
import ConsentCheck from "@/components/auth/consent-check";
import IdentityRow from "@/components/auth/identity-row";
import PasswordRule from "@/components/auth/password-rule";
import PanelField from "@/components/common/panel-field";
import { haulrButtonClass } from "@/components/home/haulr-button";
import { ACCOUNT_SIDES, PASSWORD_MIN_LENGTH } from "@/lib/constants";
import { REGISTER_COPY } from "@/lib/data/auth/register";
import { AUTH_COPY } from "@/lib/data/auth/shared";
import { useCapsLock } from "@/lib/hooks/use-caps-lock";
import type { AccountDraft, AccountField } from "@/lib/types";

type Editable = Exclude<AccountField, "side">;

interface Props {
    idOf: (field: AccountField) => string;
    values: AccountDraft;
    errorFor: (field: AccountField) => string | undefined;
    advanced: boolean;
    pending: boolean;
    created: boolean;
    onChange: (field: Editable) => (event: ChangeEvent<HTMLInputElement>) => void;
    onBack: () => void;
    onSubmit: (event: FormEvent) => void;
}

const { side, fields } = REGISTER_COPY;

export default function DetailsStep(props: Props) {
    const { idOf, values, errorFor, advanced, pending, created, onChange, onBack, onSubmit } = props;
    const first = useRef<HTMLInputElement>(null);
    const caps = useCapsLock();
    const busy = pending || created;
    const chosen = values.side ?? ACCOUNT_SIDES[0];
    const ruleId = `${idOf("password")}-rule`;

    useEffect(() => {
        if (advanced) first.current?.focus();
    }, [advanced]);

    return (
        <form onSubmit={onSubmit} noValidate aria-busy={pending} className="flex flex-col gap-4">
            <IdentityRow
                label={side.identity}
                value={side.names[chosen]}
                change={side.change}
                changeLabel={side.changeLabel}
                disabled={busy}
                onChange={onBack}
            />
            <PanelField
                ref={first}
                id={idOf("fullName")}
                {...fields.fullName}
                value={values.fullName}
                onChange={onChange("fullName")}
                readOnly={busy}
                error={errorFor("fullName")}
            />
            <PanelField
                id={idOf("email")}
                {...fields.email}
                inputMode="email"
                spellCheck={false}
                value={values.email}
                onChange={onChange("email")}
                readOnly={busy}
                error={errorFor("email")}
            />
            <PanelField
                id={idOf("password")}
                {...fields.password}
                value={values.password}
                onChange={onChange("password")}
                onKeyDown={caps.track}
                onKeyUp={caps.track}
                onBlur={caps.clear}
                readOnly={busy}
                error={errorFor("password")}
                revealLabel={AUTH_COPY.reveal}
                describedBy={ruleId}
                hint={caps.on ? AUTH_COPY.capsLock : null}
                aside={
                    <PasswordRule id={ruleId} rule={REGISTER_COPY.rule} met={values.password.length >= PASSWORD_MIN_LENGTH} />
                }
            />
            <ConsentCheck
                id={idOf("consent")}
                side={chosen}
                checked={values.consent}
                error={errorFor("consent")}
                disabled={busy}
                onChange={onChange("consent")}
            />
            <button
                type="submit"
                aria-disabled={busy}
                className={haulrButtonClass("ink", "lg", "mt-1 w-full cursor-pointer aria-disabled:cursor-wait")}
            >
                {created ? REGISTER_COPY.arrived : pending ? REGISTER_COPY.pending : REGISTER_COPY.submit}
                {created ? <Checkmark aria-hidden className="size-4" /> : null}
                {busy ? null : (
                    <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                )}
            </button>
        </form>
    );
}
