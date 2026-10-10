import { MOCK_LATENCY_MS } from "@/lib/constants";
import { routes } from "@/lib/contract/routes";
import { unpublishedRoutes } from "@/lib/api-routes";
import { checkReset, confirmReset, login, register, requestReset, resendVerification, verifyEmail } from "@/lib/mocks/auth";
import { fail } from "@/lib/mocks/http";
import { answerChallenge, challengeStatus } from "@/lib/mocks/mfa";
import { recordFeedback } from "@/lib/mocks/help";
import { createTicket, listTickets } from "@/lib/mocks/support";
import type { MockHandler, MockRequest, MockResponse } from "@/lib/types";

const NO_MOCK = "No mock handler for";

const HANDLERS: Record<string, MockHandler> = {
    [`POST ${routes.authLogin()}`]: login,
    [`POST ${routes.authRegister()}`]: register,
    [`POST ${unpublishedRoutes.passwordReset()}`]: requestReset,
    [`POST ${unpublishedRoutes.passwordResetCheck()}`]: checkReset,
    [`POST ${unpublishedRoutes.passwordResetConfirm()}`]: confirmReset,
    [`POST ${unpublishedRoutes.verifyEmail()}`]: verifyEmail,
    [`POST ${unpublishedRoutes.verifyEmailResend()}`]: resendVerification,
    [`POST ${unpublishedRoutes.mfaChallenge()}`]: challengeStatus,
    [`POST ${unpublishedRoutes.mfaVerify()}`]: answerChallenge,
    [`POST ${unpublishedRoutes.helpFeedback()}`]: recordFeedback,
    [`POST ${unpublishedRoutes.supportTickets()}`]: createTicket,
    [`POST ${unpublishedRoutes.supportTicketsMine()}`]: listTickets,
};

const randomLatency = () => MOCK_LATENCY_MS.min + Math.random() * (MOCK_LATENCY_MS.max - MOCK_LATENCY_MS.min);

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function mockRequest(request: MockRequest, latency = randomLatency()): Promise<MockResponse> {
    await pause(latency);
    const key = `${request.method.toUpperCase()} ${request.path.split("?")[0]}`;
    const handler = HANDLERS[key];
    return handler ? handler(request) : fail(404, `${NO_MOCK} ${key}`, request.path);
}

export const toResponse = ({ status, body, headers }: MockResponse) =>
    new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...headers } });
