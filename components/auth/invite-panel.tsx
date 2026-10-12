"use client";
import { useId, type ReactNode } from "react";
import AuthSubmit from "@/components/auth/auth-submit";
import ConsoleLink from "@/components/auth/console-link";
import FlowPanel from "@/components/auth/flow-panel";
import IdentityRow from "@/components/auth/identity-row";
import InviteJoinStep from "@/components/auth/invite-join-step";
import LocationConsentStep from "@/components/auth/location-consent-step";
import OutcomeStep from "@/components/auth/outcome-step";
import { INVITE_COPY } from "@/lib/data/auth/invite";
import { useInviteFlow } from "@/lib/hooks/use-invite-flow";
import type { Invitation } from "@/lib/types";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    token: string;
    invitation: Invitation;
    signedIn: boolean;
    footer: ReactNode;
}

const { done } = INVITE_COPY.states;

export default function InvitePanel({ token, invitation, signedIn, footer }: Props) {
    const flow = useInviteFlow(token, invitation);
    const baseId = useId();
    const idOf = (field: string) => `${baseId}-${field}`;

    return (
        <FlowPanel
            label={INVITE_COPY.label}
            status={INVITE_COPY.status}
            signal={flow.signal}
            problems={flow.problems}
            attempt={flow.attempt}
            fieldId={idOf}
            step={flow.step}
            footer={footer}
        >
            {flow.step === "location" ? (
                <LocationConsentStep />
            ) : flow.step === "done" ? (
                <OutcomeStep label={done.label} body={fillTemplate(done.body, flow.values)}>
                    <ConsoleLink href={done.action.href} label={done.action.label} />
                </OutcomeStep>
            ) : signedIn ? (
                <form onSubmit={flow.confirm} aria-busy={flow.pending} className="haulr-boot-rows flex flex-col gap-5">
                    <IdentityRow label={INVITE_COPY.signedInAs} value={invitation.email} mono />
                    <AuthSubmit label={INVITE_COPY.accept} pendingLabel={INVITE_COPY.pending} pending={flow.pending} />
                </form>
            ) : (
                <InviteJoinStep
                    invitation={invitation}
                    draft={flow.draft}
                    idOf={idOf}
                    errorFor={flow.errorFor}
                    pending={flow.pending}
                    onChange={flow.update}
                    onSubmit={flow.submit}
                />
            )}
        </FlowPanel>
    );
}
