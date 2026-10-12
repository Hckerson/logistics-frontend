"use client";
import { useEffect, useRef, type ChangeEvent, type FormEvent } from "react";
import AuthSubmit from "@/components/auth/auth-submit";
import ConsentCheck from "@/components/auth/consent-check";
import IdentityRow from "@/components/auth/identity-row";
import PasswordRule from "@/components/auth/password-rule";
import BoardField from "@/components/common/board-field";
import { PASSWORD_MIN_LENGTH } from "@/lib/constants";
import { INVITE_COPY } from "@/lib/data/auth/invite";
import { AUTH_COPY } from "@/lib/data/auth/shared";
import { useCapsLock } from "@/lib/hooks/use-caps-lock";
import type { Invitation, JoinDraft, JoinField } from "@/lib/types";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    invitation: Invitation;
    draft: JoinDraft;
    idOf: (field: JoinField) => string;
    errorFor: (field: JoinField) => string | undefined;
    pending: boolean;
    onChange: (field: JoinField) => (event: ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (event: FormEvent) => void;
}

const { fields } = INVITE_COPY;

export default function InviteJoinStep({ invitation, draft, idOf, errorFor, pending, onChange, onSubmit }: Props) {
    const first = useRef<HTMLInputElement>(null);
    const caps = useCapsLock();
    const ruleId = `${idOf("password")}-rule`;

    useEffect(() => first.current?.focus(), []);

    return (
        <form onSubmit={onSubmit} noValidate aria-busy={pending} className="haulr-boot-rows flex flex-col gap-5">
            <IdentityRow label={INVITE_COPY.invited} value={invitation.email} mono />
            <BoardField
                ref={first}
                id={idOf("fullName")}
                {...fields.fullName}
                value={draft.fullName}
                onChange={onChange("fullName")}
                readOnly={pending}
                error={errorFor("fullName")}
            />
            <BoardField
                id={idOf("password")}
                {...fields.password}
                value={draft.password}
                onChange={onChange("password")}
                onKeyDown={caps.track}
                onKeyUp={caps.track}
                onBlur={caps.clear}
                readOnly={pending}
                error={errorFor("password")}
                revealLabel={AUTH_COPY.reveal}
                describedBy={ruleId}
                hint={caps.on ? AUTH_COPY.capsLock : null}
                aside={<PasswordRule id={ruleId} rule={INVITE_COPY.rule} met={draft.password.length >= PASSWORD_MIN_LENGTH} />}
            />
            <ConsentCheck
                id={idOf("consent")}
                side={invitation.side}
                checked={draft.consent}
                error={errorFor("consent")}
                disabled={pending}
                onChange={onChange("consent")}
            />
            <AuthSubmit
                label={fillTemplate(INVITE_COPY.submit, { organisation: invitation.organisation })}
                pendingLabel={INVITE_COPY.pending}
                pending={pending}
            />
            <input type="email" name="username" autoComplete="username" value={invitation.email} readOnly tabIndex={-1} className="sr-only" />
        </form>
    );
}
