"use server";
import { actionFailure, backendPost } from "@/lib/api-server";
import { unpublishedRoutes } from "@/lib/api-routes";
import type { ActionResult } from "@/lib/types/api";
import { invalidInput } from "@/lib/utils/action-result";
import { withAction } from "@/lib/utils/with-action";
import { resetPasswordSchema } from "@/lib/validations/auth";

export const resetPassword = withAction(async (_context, token: string, password: string): Promise<ActionResult<null>> => {
    const parsed = resetPasswordSchema.safeParse({ token, password });
    if (!parsed.success) return invalidInput();

    const upstream = await backendPost(unpublishedRoutes.passwordResetConfirm(), parsed.data);
    return upstream.ok ? { ok: true, data: null } : actionFailure(upstream);
});
