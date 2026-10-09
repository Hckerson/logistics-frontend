"use client";
import { useId, type ReactNode } from "react";
import FlowPanel from "@/components/auth/flow-panel";
import ResetRequestStep from "@/components/auth/reset-request-step";
import ResetSentStep from "@/components/auth/reset-sent-step";
import { FORGOT_COPY } from "@/lib/data/auth/forgot";
import { useForgotFlow } from "@/lib/hooks/use-forgot-flow";
import type { AccountField } from "@/lib/types";

interface Props {
    footer: ReactNode;
}

export default function ForgotForm({ footer }: Props) {
    const flow = useForgotFlow();
    const baseId = useId();
    const idOf = (field: AccountField) => `${baseId}-${field}`;

    return (
        <FlowPanel
            label={FORGOT_COPY.label}
            status={FORGOT_COPY.status}
            signal={flow.signal}
            problems={flow.problems}
            attempt={flow.attempt}
            fieldId={idOf}
            step={flow.step}
            footer={footer}
        >
            {flow.sentAt === null ? (
                <ResetRequestStep
                    id={idOf("email")}
                    value={flow.email}
                    error={flow.errorFor("email")}
                    pending={flow.pending}
                    onChange={flow.update}
                    onSubmit={flow.submit}
                />
            ) : (
                <ResetSentStep
                    email={flow.email.trim()}
                    sentAt={flow.sentAt}
                    resent={flow.resent}
                    pending={flow.pending}
                    onResend={flow.resend}
                />
            )}
        </FlowPanel>
    );
}
