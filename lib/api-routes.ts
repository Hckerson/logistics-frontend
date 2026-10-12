import type { LaneQuery, TicketStatus } from "@/lib/types";
import { queryString } from "@/lib/utils/query-string";

export const apiRoutes = {
    session: () => "/api/session",
    register: () => "/api/register",
    rateEstimate: (lane: LaneQuery) => `/api/rate-estimate${queryString(lane)}`,
    laneTrend: (lane: LaneQuery) =>
        `/api/rate-estimate/trend${queryString(lane)}`,
    places: (query: string) => `/api/places${queryString({ q: query })}`,
    tickets: (status?: TicketStatus) =>
        `/api/tickets${queryString({ status })}`,
} as const;

export const unpublishedRoutes = {
    passwordReset: () => "/api/auth/password-reset",
    passwordResetCheck: () => "/api/auth/password-reset/check",
    passwordResetConfirm: () => "/api/auth/password-reset/confirm",
    verifyEmail: () => "/api/auth/verify-email",
    verifyEmailResend: () => "/api/auth/verify-email/resend",
    mfaChallenge: () => "/api/auth/mfa/challenge",
    mfaVerify: () => "/api/auth/mfa/verify",
    helpFeedback: () => "/api/help/feedback",
    supportTickets: () => "/api/support/tickets",
    supportTicketsMine: () => "/api/support/tickets/mine",
    pricingEstimate: (lane?: LaneQuery) =>
        `/api/pricing/estimate${queryString(lane)}`,
    pricingTrend: (lane?: LaneQuery) =>
        `/api/pricing/trend${queryString(lane)}`,
    pricingSaved: () => "/api/pricing/estimates",
    places: (query?: string) => `/api/geo/places${queryString({ q: query })}`,
    invitationCheck: () => "/api/team/invitations/check",
    invitationAccept: () => "/api/team/invitations/accept",
    locationConsent: () => "/api/drivers/location-consent",
} as const;
