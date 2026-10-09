"use client";
import type { ReactNode } from "react";
import AuthIntro from "@/components/auth/auth-intro";
import FlowPanel from "@/components/auth/flow-panel";
import OutcomeStep from "@/components/auth/outcome-step";
import VerifyAction from "@/components/auth/verify-action";
import { VERIFY_COPY } from "@/lib/data/auth/verify";
import { useVerifyFlow } from "@/lib/hooks/use-verify-flow";

interface Props {
    token: string | null;
    email: string | null;
    footer: ReactNode;
}

export default function VerifyEmail({ token, email, footer }: Props) {
    const flow = useVerifyFlow(token, email);
    const view = VERIFY_COPY.states[flow.status];

    return (
        <>
            <AuthIntro title={view.title} lead={view.lead} />
            <FlowPanel
                label={VERIFY_COPY.label}
                status={VERIFY_COPY.status}
                signal={flow.signal}
                problems={flow.problems}
                attempt={flow.attempt}
                fieldId={(field) => field}
                step={flow.status}
                footer={footer}
            >
                <OutcomeStep tone={view.tone} label={view.label} detail={flow.email} body={view.body}>
                    <VerifyAction
                        status={flow.status}
                        sentAt={flow.sentAt}
                        resent={flow.resent}
                        sending={flow.sending}
                        onResend={flow.send}
                        onRetry={flow.retry}
                    />
                </OutcomeStep>
            </FlowPanel>
        </>
    );
}
