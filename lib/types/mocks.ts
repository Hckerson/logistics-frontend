import type { AccountSide } from "@/lib/types/auth";
import type { RoleKey } from "@/lib/types/enums";
import type { LaneQuery } from "@/lib/types/quote";
import type { InvitationStatus, TeamRole } from "@/lib/types/team";
import type { TicketCategory, TicketStatus, TicketUrgency } from "@/lib/types/support";

export interface MockUser {
    id: string;
    name: string;
    email: string;
    password: string;
    role: "ADMIN" | "USER";
    roles: RoleKey[];
    verified: boolean;
    mfa: boolean;
}

export type MockScenario = { kind: "rate-limited"; retryAfter: number } | { kind: "unavailable" };

export interface MockChallenge {
    email: string;
    attemptsRemaining: number;
}

export interface MockErrorDetails {
    attemptsRemaining?: number;
}

export interface MockRequest {
    method: string;
    path: string;
    body: unknown;
}

export interface MockResponse {
    status: number;
    body: unknown;
    headers?: Record<string, string>;
}

export type MockHandler = (request: MockRequest) => MockResponse | Promise<MockResponse>;

export interface MockTicket {
    reference: string;
    key: string;
    owner: string;
    subject: string;
    category: TicketCategory;
    urgency: TicketUrgency;
    status: TicketStatus;
    updated: string;
}

export interface MockOrganisation {
    name: string;
    side: AccountSide;
    sso: boolean;
}

export interface MockInvitation {
    email: string;
    organisation: string;
    inviter: string;
    role: TeamRole;
    status: InvitationStatus;
}

export interface MockSavedEstimate {
    id: string;
    owner: string;
    lane: LaneQuery;
    rate: number;
    saved: string;
}
