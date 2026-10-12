import type { Invitation, InviteState } from "@/lib/types";

export function inviteState(invitation: Invitation | null, viewer: string | null): InviteState {
    if (!invitation) return { kind: "unknown" };
    if (invitation.status !== "open") return { kind: invitation.status, invitation };
    if (invitation.account === "elsewhere") return { kind: "elsewhere", invitation };
    if (invitation.sso) return { kind: "sso", invitation };
    if (viewer && viewer.toLowerCase() !== invitation.email.toLowerCase()) return { kind: "switch", invitation, viewer };
    if (viewer) return { kind: "accept", invitation };
    return { kind: invitation.account === "existing" ? "sign-in" : "join", invitation };
}
