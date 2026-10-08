"use client";
import { useId, type ReactNode } from "react";
import EmailStep from "@/components/auth/email-step";
import FlowPanel from "@/components/auth/flow-panel";
import PasswordStep from "@/components/auth/password-step";
import { SIGN_IN_COPY } from "@/lib/data/auth/sign-in";
import { useSignInFlow } from "@/lib/hooks/use-sign-in-flow";
import type { AccountField } from "@/lib/types";

interface Props {
    next: string;
    footer: ReactNode;
}

export default function LoginForm({ next, footer }: Props) {
    const flow = useSignInFlow(next);
    const baseId = useId();
    const idOf = (field: AccountField) => `${baseId}-${field}`;

    return (
        <FlowPanel
            label={SIGN_IN_COPY.label}
            status={SIGN_IN_COPY.status}
            signal={flow.signal}
            problems={flow.problems}
            attempt={flow.attempt}
            fieldId={idOf}
            step={flow.step}
            forward={flow.step === "password"}
            footer={footer}
        >
            {flow.step === "email" ? (
                <EmailStep
                    id={idOf("email")}
                    value={flow.values.email}
                    error={flow.errorFor("email")}
                    returned={flow.returned}
                    onChange={flow.update("email")}
                    onSubmit={flow.proceed}
                />
            ) : (
                <PasswordStep
                    id={idOf("password")}
                    email={flow.values.email}
                    value={flow.values.password}
                    error={flow.errorFor("password")}
                    pending={flow.pending}
                    arrived={flow.arrived}
                    onChange={flow.update("password")}
                    onBack={flow.back}
                    onSubmit={flow.submit}
                />
            )}
        </FlowPanel>
    );
}
