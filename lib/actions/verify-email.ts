"use server";
import { actionFailure, backendPost, readJson } from "@/lib/api-server";
import { unpublishedRoutes } from "@/lib/api-routes";
import { HTTP_STATUS, INVALID_REQUEST, REQUEST_FAILED, SESSION_REQUIRED } from "@/lib/constants";
import type { ActionResult } from "@/lib/types/api";
import { getSession } from "@/lib/utils/session";
import { emailEnvelopeSchema, linkTokenSchema } from "@/lib/validations/auth";

export const verifyEmail = async (token: string): Promise<ActionResult<string>> => {
    const parsed = linkTokenSchema.safeParse({ token });
    if (!parsed.success) return { ok: false, status: HTTP_STATUS.badRequest, message: INVALID_REQUEST };

    const upstream = await backendPost(unpublishedRoutes.verifyEmail(), parsed.data);
    if (!upstream.ok) return actionFailure(upstream);

    const verified = emailEnvelopeSchema.safeParse(await readJson(upstream));
    return verified.success
        ? { ok: true, data: verified.data.data.email }
        : { ok: false, status: HTTP_STATUS.badGateway, message: REQUEST_FAILED };
};

export const resendVerification = async (): Promise<ActionResult<null>> => {
    const session = await getSession();
    if (!session) return { ok: false, status: HTTP_STATUS.unauthorized, message: SESSION_REQUIRED };

    const upstream = await backendPost(unpublishedRoutes.verifyEmailResend(), { email: session.email });
    return upstream.ok ? { ok: true, data: null } : actionFailure(upstream);
};
