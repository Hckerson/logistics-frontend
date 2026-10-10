import type { TicketCategory, TicketStatus, TicketUrgency } from "@/lib/types/support";

export interface MockUser {
    id: string;
    name: string;
    email: string;
    password: string;
    role: "ADMIN" | "USER";
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
