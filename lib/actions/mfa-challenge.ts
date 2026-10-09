"use server";
import { actionFailure, backendPost, readJson } from "@/lib/api-server";
import { unpublishedRoutes } from "@/lib/api-routes";
import { HTTP_STATUS, INVALID_REQUEST, REQUEST_FAILED, SESSION_REQUIRED } from "@/lib/constants";
import type { MfaAnswer, MfaResult, MfaStatus } from "@/lib/types";
import { completeChallenge, endChallenge, readChallenge } from "@/lib/utils/session";
import { mfaAnswerSchema, mfaRefusalSchema, mfaStatusSchema } from "@/lib/validations/auth";

const ENDS_CHALLENGE: readonly number[] = [HTTP_STATUS.notFound, HTTP_STATUS.tooManyRequests];

export const checkMfaChallenge = async (): Promise<MfaStatus | null> => {
    const challenge = await readChallenge();
    if (!challenge) return null;

    const upstream = await backendPost(unpublishedRoutes.mfaChallenge(), { challenge });
    if (upstream.status >= HTTP_STATUS.serverError) throw new Error(REQUEST_FAILED);

    const status = mfaStatusSchema.safeParse(await readJson(upstream));
    return upstream.ok && status.success ? status.data.data : null;
};

export const answerMfaChallenge = async (answer: MfaAnswer): Promise<MfaResult> => {
    const parsed = mfaAnswerSchema.safeParse(answer);
    if (!parsed.success) return { ok: false, status: HTTP_STATUS.badRequest, message: INVALID_REQUEST };

    const challenge = await readChallenge();
    if (!challenge) return { ok: false, status: HTTP_STATUS.notFound, message: SESSION_REQUIRED };

    const upstream = await backendPost(unpublishedRoutes.mfaVerify(), { challenge, ...parsed.data });
    const body = await readJson(upstream);
    if (upstream.ok) {
        return (await completeChallenge(body))
            ? { ok: true, data: null }
            : { ok: false, status: HTTP_STATUS.badGateway, message: REQUEST_FAILED };
    }

    if (ENDS_CHALLENGE.includes(upstream.status)) await endChallenge();
    const refusal = mfaRefusalSchema.safeParse(body);
    return { ...actionFailure(upstream), attemptsRemaining: refusal.success ? refusal.data.attemptsRemaining : undefined };
};
