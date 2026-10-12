"use server";
import { actionFailure, backendPost, readJson } from "@/lib/api-server";
import { unpublishedRoutes } from "@/lib/api-routes";
import { HTTP_STATUS, SESSION_REQUIRED } from "@/lib/constants";
import type { MfaAnswer, MfaResult } from "@/lib/types";
import { contractFailure, failureOf, invalidInput } from "@/lib/utils/action-result";
import { completeChallenge, endChallenge, readChallenge } from "@/lib/utils/session";
import { withAction } from "@/lib/utils/with-action";
import { mfaAnswerSchema, mfaRefusalSchema } from "@/lib/validations/auth";

const ENDS_CHALLENGE: readonly number[] = [HTTP_STATUS.notFound, HTTP_STATUS.tooManyRequests];

export const answerMfaChallenge = withAction(async (_context, answer: MfaAnswer): Promise<MfaResult> => {
    const parsed = mfaAnswerSchema.safeParse(answer);
    if (!parsed.success) return invalidInput();

    const challenge = await readChallenge();
    if (!challenge) return failureOf(HTTP_STATUS.notFound, { message: SESSION_REQUIRED });

    const upstream = await backendPost(unpublishedRoutes.mfaVerify(), { challenge, ...parsed.data });
    const body = await readJson(upstream);
    if (upstream.ok) return (await completeChallenge(body)) ? { ok: true, data: null } : contractFailure();

    if (ENDS_CHALLENGE.includes(upstream.status)) await endChallenge();
    const refusal = mfaRefusalSchema.safeParse(body);
    return { ...actionFailure(upstream), attemptsRemaining: refusal.success ? refusal.data.attemptsRemaining : undefined };
});
