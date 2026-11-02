import { MOCK_LATENCY_MS } from "@/lib/constants";
import { routes } from "@/lib/contract/routes";
import { checkReset, confirmReset, login, register, requestReset, resendVerification, verifyEmail } from "@/lib/mocks/auth";
import { fail } from "@/lib/mocks/http";
import { answerChallenge, challengeStatus } from "@/lib/mocks/mfa";
import { recordFeedback } from "@/lib/mocks/help";
import { createTicket, listTickets } from "@/lib/mocks/support";
import { places } from "@/lib/mocks/geo";
import { estimate, saveEstimate, trend } from "@/lib/mocks/pricing";
import { acceptInvitation, checkInvitation, recordLocationConsent } from "@/lib/mocks/team";
import { FREIGHT_HANDLERS } from "@/lib/mocks/freight-routes";
import { pathOf, resolveRoute } from "@/lib/mocks/match-route";
import { EQUIPMENT_TYPES } from "@/lib/enums/equipment-type";
import type { LaneQuery, MockHandler, MockRequest, MockResponse } from "@/lib/types";

const NO_MOCK = "No mock handler for";
const ANY_LANE: LaneQuery = { origin: "", destination: "", equipment: EQUIPMENT_TYPES[0], date: "" };

const HANDLERS: Record<string, MockHandler> = {
    [`POST ${routes.authLogin()}`]: login,
    [`POST ${routes.authRegister()}`]: register,
    [`POST ${routes.authRequestPasswordReset()}`]: requestReset,
    [`POST ${routes.authCheckPasswordReset()}`]: checkReset,
    [`POST ${routes.authConfirmPasswordReset()}`]: confirmReset,
    [`POST ${routes.authVerifyEmail()}`]: verifyEmail,
    [`POST ${routes.authResendVerification()}`]: resendVerification,
    [`POST ${routes.authMfaChallenge()}`]: challengeStatus,
    [`POST ${routes.authMfaVerify()}`]: answerChallenge,
    [`POST ${routes.helpRecordFeedback()}`]: recordFeedback,
    [`POST ${routes.supportCreateTicket()}`]: createTicket,
    [`POST ${routes.supportListMine()}`]: listTickets,
    [`GET ${pathOf(routes.pricingEstimate(ANY_LANE))}`]: estimate,
    [`GET ${pathOf(routes.pricingTrend(ANY_LANE))}`]: trend,
    [`POST ${routes.pricingSaveEstimate()}`]: saveEstimate,
    [`GET ${pathOf(routes.geoPlaces({ q: "" }))}`]: places,
    [`POST ${routes.teamCheckInvitation()}`]: checkInvitation,
    [`POST ${routes.teamAcceptInvitation()}`]: acceptInvitation,
    [`POST ${routes.driversRecordLocationConsent()}`]: recordLocationConsent,
    ...FREIGHT_HANDLERS,
};

const randomLatency = () => MOCK_LATENCY_MS.min + Math.random() * (MOCK_LATENCY_MS.max - MOCK_LATENCY_MS.min);

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function mockRequest(request: MockRequest, latency = randomLatency()): Promise<MockResponse> {
    await pause(latency);
    const method = request.method.toUpperCase();
    const path = request.path.split("?")[0];
    const found = resolveRoute(HANDLERS, method, path);
    return found ? found.handler(request, found.params) : fail(404, `${NO_MOCK} ${method} ${path}`, request.path);
}

export const toResponse = ({ status, body, headers }: MockResponse) =>
    new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...headers } });
