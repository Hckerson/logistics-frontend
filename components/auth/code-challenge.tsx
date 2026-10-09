"use client";
import { useId, type ReactNode } from "react";
import AuthIntro from "@/components/auth/auth-intro";
import CodeStep from "@/components/auth/code-step";
import ExpiredPanel from "@/components/auth/expired-panel";
import FlowPanel from "@/components/auth/flow-panel";
import { loginRoute } from "@/lib/constants";
import { MFA_COPY } from "@/lib/data/auth/mfa";
import { useMfaFlow } from "@/lib/hooks/use-mfa-flow";
import type { AccountField, MfaStatus } from "@/lib/types";

interface Props {
    challenge: MfaStatus | null;
    next: string;
    footer: ReactNode;
}

const { expired } = MFA_COPY;

export default function CodeChallenge({ challenge, next, footer }: Props) {
    const flow = useMfaFlow(next, challenge !== null);
    const baseId = useId();
    const idOf = (field: AccountField) => `${baseId}-${field}`;

    if (flow.expired || !challenge) {
        return (
            <>
                <AuthIntro title={expired.title} lead={expired.lead} />
                <ExpiredPanel label={MFA_COPY.label} status={MFA_COPY.status} outcome={expired} href={loginRoute(next)} footer={footer} />
            </>
        );
    }

    return (
        <>
            <AuthIntro title={MFA_COPY.title} lead={MFA_COPY.lead[flow.method]} />
            <FlowPanel
                label={MFA_COPY.label}
                status={MFA_COPY.status}
                signal={flow.signal}
                problems={flow.problems}
                attempt={flow.attempt}
                fieldId={idOf}
                step={flow.step}
                footer={footer}
            >
                <CodeStep
                    id={idOf("code")}
                    email={challenge.email}
                    method={flow.method}
                    value={flow.value}
                    error={flow.errorFor("code")}
                    pending={flow.pending}
                    arrived={flow.arrived}
                    locked={flow.locked}
                    onChange={flow.update}
                    onSubmit={flow.submit}
                    onToggle={flow.toggle}
                />
            </FlowPanel>
        </>
    );
}
