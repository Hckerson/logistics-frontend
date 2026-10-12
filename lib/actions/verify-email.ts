"use server";
import { actionFailure, backendPost, readJson } from "@/lib/api-server";
import { unpublishedRoutes } from "@/lib/api-routes";
import type { ActionResult } from "@/lib/types/api";
import { contractFailure, invalidInput } from "@/lib/utils/action-result";
import { withAction, withSessionAction } from "@/lib/utils/with-action";
import { emailEnvelopeSchema, linkTokenSchema } from "@/lib/validations/auth";

export const verifyEmail = withAction(async (_context, token: string): Promise<ActionResult<string>> => {
    const parsed = linkTokenSchema.safeParse({ token });
    if (!parsed.success) return invalidInput();

    const upstream = await backendPost(unpublishedRoutes.verifyEmail(), parsed.data);
    if (!upstream.ok) return actionFailure(upstream);

    const verified = emailEnvelopeSchema.safeParse(await readJson(upstream));
    return verified.success ? { ok: true, data: verified.data.data.email } : contractFailure();
});

export const resendVerification = withSessionAction(async ({ user }): Promise<ActionResult<null>> => {
    const upstream = await backendPost(unpublishedRoutes.verifyEmailResend(), { email: user.email });
    return upstream.ok ? { ok: true, data: null } : actionFailure(upstream);
});
