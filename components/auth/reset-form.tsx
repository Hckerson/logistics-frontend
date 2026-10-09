"use client";
import { useId, type ReactNode } from "react";
import ConsoleLink from "@/components/auth/console-link";
import FlowPanel from "@/components/auth/flow-panel";
import NewPasswordStep from "@/components/auth/new-password-step";
import OutcomeStep from "@/components/auth/outcome-step";
import { LOGIN_ROUTE } from "@/lib/constants";
import { RESET_COPY } from "@/lib/data/auth/reset";
import { useResetFlow } from "@/lib/hooks/use-reset-flow";
import type { AccountField } from "@/lib/types";

interface Props {
    token: string;
    email: string;
    footer: ReactNode;
}

const { saved } = RESET_COPY;

export default function ResetForm({ token, email, footer }: Props) {
    const flow = useResetFlow(token);
    const baseId = useId();
    const idOf = (field: AccountField) => `${baseId}-${field}`;

    return (
        <FlowPanel
            label={RESET_COPY.label}
            status={RESET_COPY.status}
            signal={flow.signal}
            problems={flow.problems}
            attempt={flow.attempt}
            fieldId={idOf}
            step={flow.step}
            footer={footer}
        >
            {flow.saved ? (
                <OutcomeStep label={saved.label} detail={email} body={saved.body}>
                    <ConsoleLink href={LOGIN_ROUTE} label={saved.action} />
                </OutcomeStep>
            ) : (
                <NewPasswordStep
                    idOf={idOf}
                    email={email}
                    values={flow.values}
                    errorFor={flow.errorFor}
                    pending={flow.pending}
                    onChange={flow.update}
                    onSubmit={flow.submit}
                />
            )}
        </FlowPanel>
    );
}
