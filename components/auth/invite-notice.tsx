"use client";
import type { ReactNode } from "react";
import FlowPanel from "@/components/auth/flow-panel";
import OutcomeStep from "@/components/auth/outcome-step";
import { INVITE_COPY } from "@/lib/data/auth/invite";
import type { AuthSignal, OutcomeTone } from "@/lib/types";

interface Props {
    tone: OutcomeTone;
    signal: AuthSignal;
    label: string;
    body: string;
    footer: ReactNode;
    children: ReactNode;
}

export default function InviteNotice({ tone, signal, label, body, footer, children }: Props) {
    return (
        <FlowPanel
            label={INVITE_COPY.label}
            status={INVITE_COPY.status}
            signal={signal}
            problems={[]}
            attempt={0}
            fieldId={(field) => field}
            step={label}
            footer={footer}
        >
            <OutcomeStep tone={tone} label={label} body={body}>
                {children}
            </OutcomeStep>
        </FlowPanel>
    );
}
