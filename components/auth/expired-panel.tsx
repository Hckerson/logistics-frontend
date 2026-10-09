"use client";
import type { ReactNode } from "react";
import ConsoleLink from "@/components/auth/console-link";
import FlowPanel from "@/components/auth/flow-panel";
import OutcomeStep from "@/components/auth/outcome-step";
import type { AuthSignal } from "@/lib/types";

interface Props {
    label: string;
    status: Record<AuthSignal, string>;
    outcome: { label: string; body: string; action: string };
    href: string;
    footer: ReactNode;
}

export default function ExpiredPanel({ label, status, outcome, href, footer }: Props) {
    return (
        <FlowPanel
            label={label}
            status={status}
            signal="held"
            problems={[]}
            attempt={0}
            fieldId={(field) => field}
            step="expired"
            footer={footer}
        >
            <OutcomeStep tone="error" label={outcome.label} body={outcome.body}>
                <ConsoleLink href={href} label={outcome.action} />
            </OutcomeStep>
        </FlowPanel>
    );
}
