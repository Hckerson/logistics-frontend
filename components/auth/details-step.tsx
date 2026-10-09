"use client";
import { useEffect, useRef, type ChangeEvent, type FormEvent } from "react";
import AuthSubmit from "@/components/auth/auth-submit";
import ConsentCheck from "@/components/auth/consent-check";
import IdentityRow from "@/components/auth/identity-row";
import ManifestRows from "@/components/auth/manifest-rows";
import PasswordRule from "@/components/auth/password-rule";
import BoardField from "@/components/common/board-field";
import AssemblyProvider, { useAssembly } from "@/components/providers/assembly-provider";
import { FIELD_FLIP } from "@/lib/auth/constants";
import { ACCOUNT_SIDES, PASSWORD_MIN_LENGTH } from "@/lib/constants";
import { REGISTER_COPY } from "@/lib/data/auth/register";
import { AUTH_COPY } from "@/lib/data/auth/shared";
import { useCapsLock } from "@/lib/hooks/use-caps-lock";
import type { useManifest } from "@/lib/hooks/use-manifest";
import type { AccountDraft, AccountField } from "@/lib/types";

interface Props {
    idOf: (field: AccountField) => string;
    values: AccountDraft;
    errorFor: (field: AccountField) => string | undefined;
    manifest: ReturnType<typeof useManifest>;
    advanced: boolean;
    pending: boolean;
    created: boolean;
    onChange: (field: Exclude<AccountField, "side">) => (event: ChangeEvent<HTMLInputElement>) => void;
    onBack: () => void;
    onSubmit: (event: FormEvent) => void;
}

const { side, fields } = REGISTER_COPY;

export default function DetailsStep(props: Props) {
    const { idOf, values, errorFor, manifest, advanced, pending, created, onChange, onBack, onSubmit } = props;
    const board = useRef<HTMLInputElement>(null);
    const caps = useCapsLock();
    const inherited = useAssembly();
    const busy = pending || created;
    const chosen = values.side ?? ACCOUNT_SIDES[0];
    const { field, last, moved } = manifest;
    const ruleId = `${idOf("password")}-rule`;
    const secret = field === "password";

    useEffect(() => {
        if (advanced || moved) board.current?.focus();
    }, [advanced, moved, field]);

    return (
        <form onSubmit={onSubmit} noValidate aria-busy={pending} className="haulr-boot-rows flex flex-col gap-5">
            <IdentityRow
                label={side.identity}
                value={side.names[chosen]}
                change={side.change}
                changeLabel={side.changeLabel}
                disabled={busy}
                onChange={onBack}
            />
            {manifest.done.length > 0 ? (
                <ManifestRows fields={manifest.done} values={values} disabled={busy} onEdit={manifest.edit} />
            ) : null}
            <AssemblyProvider boot={moved ? FIELD_FLIP : inherited}>
                <BoardField
                    key={field}
                    ref={board}
                    id={idOf(field)}
                    {...fields[field]}
                    inputMode={field === "email" ? "email" : undefined}
                    spellCheck={field === "fullName" ? undefined : false}
                    value={values[field]}
                    onChange={onChange(field)}
                    readOnly={busy}
                    error={errorFor(field)}
                    {...(secret
                        ? {
                              revealLabel: AUTH_COPY.reveal,
                              describedBy: ruleId,
                              hint: caps.on ? AUTH_COPY.capsLock : null,
                              onKeyDown: caps.track,
                              onKeyUp: caps.track,
                              onBlur: caps.clear,
                              aside: (
                                  <PasswordRule
                                      id={ruleId}
                                      rule={REGISTER_COPY.rule}
                                      met={values.password.length >= PASSWORD_MIN_LENGTH}
                                  />
                              ),
                          }
                        : {})}
                />
            </AssemblyProvider>
            {last ? (
                <ConsentCheck
                    id={idOf("consent")}
                    side={chosen}
                    checked={values.consent}
                    error={errorFor("consent")}
                    disabled={busy}
                    onChange={onChange("consent")}
                />
            ) : null}
            <AuthSubmit
                label={last ? REGISTER_COPY.submit : REGISTER_COPY.manifest.next}
                pendingLabel={REGISTER_COPY.pending}
                doneLabel={REGISTER_COPY.arrived}
                pending={pending}
                done={created}
            />
            {last ? (
                <input type="email" name="username" autoComplete="username" value={values.email} readOnly tabIndex={-1} className="sr-only" />
            ) : null}
        </form>
    );
}
