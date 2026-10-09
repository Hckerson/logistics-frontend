"use server";
import { actionFailure, backendPost, readJson } from "@/lib/api-server";
import { unpublishedRoutes } from "@/lib/api-routes";
import { HTTP_STATUS, INVALID_REQUEST, REQUEST_FAILED } from "@/lib/constants";
import type { ActionResult } from "@/lib/types/api";
import { emailEnvelopeSchema, linkTokenSchema, resetPasswordSchema } from "@/lib/validations/auth";

export const checkResetToken = async (token: string): Promise<string | null> => {
    const parsed = linkTokenSchema.safeParse({ token });
    if (!parsed.success) return null;

    const upstream = await backendPost(unpublishedRoutes.passwordResetCheck(), parsed.data);
    if (upstream.status >= HTTP_STATUS.serverError) throw new Error(REQUEST_FAILED);

    const account = emailEnvelopeSchema.safeParse(await readJson(upstream));
    return upstream.ok && account.success ? account.data.data.email : null;
};

export const resetPassword = async (token: string, password: string): Promise<ActionResult<null>> => {
    const parsed = resetPasswordSchema.safeParse({ token, password });
    if (!parsed.success) return { ok: false, status: HTTP_STATUS.badRequest, message: INVALID_REQUEST };

    const upstream = await backendPost(unpublishedRoutes.passwordResetConfirm(), parsed.data);
    return upstream.ok ? { ok: true, data: null } : actionFailure(upstream);
};
