import type { InvitationDto } from "@/lib/contract/schemas";
import type { INVITATION_STATUSES, LOCATION_DECISIONS, TEAM_ROLES } from "@/lib/team/constants";

export type TeamRole = (typeof TEAM_ROLES)[number];

export type Invitation = InvitationDto;

export type InvitationStatus = (typeof INVITATION_STATUSES)[number];

export type LocationDecision = (typeof LOCATION_DECISIONS)[number];

export type JoinField = "fullName" | "password" | "consent";

export interface JoinDraft {
    fullName: string;
    password: string;
    consent: boolean;
}

export type InviteState =
    | { kind: "unknown" }
    | { kind: "expired" | "revoked" | "accepted" | "elsewhere" | "sso"; invitation: Invitation }
    | { kind: "sign-in" | "join" | "accept"; invitation: Invitation }
    | { kind: "switch"; invitation: Invitation; viewer: string };

export type InviteStep = "invite" | "location" | "done";

export type LocationOutcome = "on" | "declined" | "blocked" | "queued";
