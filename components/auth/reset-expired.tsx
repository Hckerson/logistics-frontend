"use client";
import type { ReactNode } from "react";
import ConsoleLink from "@/components/auth/console-link";
import FlowPanel from "@/components/auth/flow-panel";
import OutcomeStep from "@/components/auth/outcome-step";
import { RESET_COPY } from "@/lib/data/auth/reset";

interface Props {
    footer: ReactNode;
}

const { expired } = RESET_COPY;

export default function ResetExpired({ footer }: Props) {
    return (
        <FlowPanel
            label={RESET_COPY.label}
            status={RESET_COPY.status}
            signal="held"
            problems={[]}
            attempt={0}
            fieldId={(field) => field}
            step="expired"
            footer={footer}
        >
            <OutcomeStep tone="error" label={expired.label} body={expired.body}>
                <ConsoleLink href={expired.href} label={expired.action} />
            </OutcomeStep>
        </FlowPanel>
    );
}
