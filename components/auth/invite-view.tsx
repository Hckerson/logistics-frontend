import type { ReactNode } from "react";
import AuthIntro from "@/components/auth/auth-intro";
import ConsoleLink from "@/components/auth/console-link";
import InviteNotice from "@/components/auth/invite-notice";
import InvitePanel from "@/components/auth/invite-panel";
import SwitchAccount from "@/components/auth/switch-account";
import { inviteRoute, loginRoute } from "@/lib/constants";
import { INVITE_COPY } from "@/lib/data/auth/invite";
import type { InviteState } from "@/lib/types";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    token: string;
    state: InviteState;
    footer: ReactNode;
}

const { states } = INVITE_COPY;

export default function InviteView({ token, state, footer }: Props) {
    if (state.kind === "unknown") {
        const { title, lead, label, body, action } = states.unknown;
        return (
            <>
                <AuthIntro title={title} lead={lead} />
                <InviteNotice tone="error" signal="held" label={label} body={body} footer={footer}>
                    <ConsoleLink href={action.href} label={action.label} />
                </InviteNotice>
            </>
        );
    }

    const { invitation } = state;
    const fill = (text: string) =>
        fillTemplate(text, {
            organisation: invitation.organisation,
            inviter: invitation.inviter,
            email: invitation.email,
            role: INVITE_COPY.roles[invitation.role],
            title: INVITE_COPY.titles[invitation.role],
            viewer: state.kind === "switch" ? state.viewer : "",
        });

    if (state.kind === "expired" || state.kind === "revoked" || state.kind === "accepted" || state.kind === "elsewhere") {
        const { title, lead, label, body, action } = states[state.kind];
        return (
            <>
                <AuthIntro eyebrow={invitation.organisation} title={title} lead={fill(lead)} />
                <InviteNotice tone={state.kind === "accepted" ? "accent" : "error"} signal="held" label={label} body={fill(body)} footer={footer}>
                    <ConsoleLink href={action.href} label={action.label} />
                </InviteNotice>
            </>
        );
    }

    const intro = <AuthIntro eyebrow={fill(INVITE_COPY.eyebrow)} title={INVITE_COPY.title} lead={fill(INVITE_COPY.lead)} />;
    const back = inviteRoute(token);

    if (state.kind === "join" || state.kind === "accept") {
        return (
            <>
                {intro}
                <InvitePanel token={token} invitation={invitation} signedIn={state.kind === "accept"} footer={footer} />
            </>
        );
    }

    if (state.kind === "switch") {
        const newcomer = invitation.account === "new";
        const { body, action } = newcomer ? states.switch.new : states.switch.existing;
        return (
            <>
                {intro}
                <InviteNotice tone="accent" signal="midway" label={states.switch.label} body={fill(body)} footer={footer}>
                    <SwitchAccount label={action} then={newcomer ? back : loginRoute(back)} />
                </InviteNotice>
            </>
        );
    }

    const notice = state.kind === "sso" ? states.sso : states.signIn;
    return (
        <>
            {intro}
            <InviteNotice tone="accent" signal="midway" label={notice.label} body={fill(notice.body)} footer={footer}>
                <ConsoleLink
                    href={state.kind === "sso" ? states.sso.action.href : loginRoute(back)}
                    label={state.kind === "sso" ? states.sso.action.label : states.signIn.action}
                />
            </InviteNotice>
        </>
    );
}
