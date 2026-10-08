"use client";
import { useId, type ReactNode } from "react";
import DetailsStep from "@/components/auth/details-step";
import FlowPanel from "@/components/auth/flow-panel";
import SideStep from "@/components/auth/side-step";
import { REGISTER_COPY } from "@/lib/data/auth/register";
import { useRegisterFlow } from "@/lib/hooks/use-register-flow";
import type { AccountField, AccountSide } from "@/lib/types";

interface Props {
    side: AccountSide | null;
    footer: ReactNode;
}

export default function RegisterForm({ side, footer }: Props) {
    const flow = useRegisterFlow(side);
    const baseId = useId();
    const idOf = (field: AccountField) => `${baseId}-${field}`;

    return (
        <FlowPanel
            label={REGISTER_COPY.label}
            status={REGISTER_COPY.status}
            signal={flow.signal}
            problems={flow.problems}
            attempt={flow.attempt}
            fieldId={idOf}
            step={flow.step}
            forward={flow.step === "details"}
            footer={footer}
        >
            {flow.step === "side" ? (
                <SideStep
                    id={idOf("side")}
                    value={flow.values.side}
                    error={flow.errorFor("side")}
                    returned={flow.returned}
                    onChoose={flow.choose}
                    onSubmit={flow.proceed}
                />
            ) : (
                <DetailsStep
                    idOf={idOf}
                    values={flow.values}
                    errorFor={flow.errorFor}
                    advanced={flow.advanced}
                    pending={flow.pending}
                    created={flow.created}
                    onChange={flow.update}
                    onBack={flow.back}
                    onSubmit={flow.submit}
                />
            )}
        </FlowPanel>
    );
}
