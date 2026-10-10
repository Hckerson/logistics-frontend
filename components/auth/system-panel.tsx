"use client";
import type { ReactNode } from "react";
import FlowPanel from "@/components/auth/flow-panel";
import OutcomeStep from "@/components/auth/outcome-step";
import StatusBoard from "@/components/auth/status-board";
import type { AuthSignal, SystemView } from "@/lib/types";

interface Props {
    view: SystemView;
    outcome?: SystemView["outcome"];
    detail?: string;
    signal?: AuthSignal;
    footer: ReactNode;
    children: ReactNode;
}

export default function SystemPanel({ view, outcome = view.outcome, detail, signal = "held", footer, children }: Props) {
    return (
        <FlowPanel
            label={view.label}
            status={view.status}
            signal={signal}
            problems={[]}
            attempt={0}
            fieldId={(field) => field}
            step={view.code}
            footer={footer}
        >
            <OutcomeStep tone="error" label={outcome.label} detail={detail} body={outcome.body} before={<StatusBoard code={view.code} />}>
                {children}
            </OutcomeStep>
        </FlowPanel>
    );
}
