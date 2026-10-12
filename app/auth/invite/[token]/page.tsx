import AuthLinks from "@/components/auth/auth-links";
import InviteView from "@/components/auth/invite-view";
import { LINK_PAGE_METADATA } from "@/lib/auth/constants";
import { INVITE_COPY } from "@/lib/data/auth/invite";
import { inviteState } from "@/lib/team/invite-state";
import { checkInvitation } from "@/lib/team/server-checks";
import { getSession } from "@/lib/utils/session";

interface Props {
    params: Promise<{ token: string }>;
}

export const metadata = LINK_PAGE_METADATA;

const { footer } = INVITE_COPY;

export default async function InvitePage({ params }: Props) {
    const { token } = await params;
    const [invitation, session] = await Promise.all([checkInvitation(token), getSession()]);

    return (
        <InviteView
            token={token}
            state={inviteState(invitation, session?.email ?? null)}
            footer={<AuthLinks label={footer.label} links={footer.links} />}
        />
    );
}
