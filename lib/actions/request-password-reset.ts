"use server";
import { actionFailure, backendFetch } from "@/lib/api-server";
import { unpublishedRoutes } from "@/lib/api-routes";
import { INVALID_REQUEST } from "@/lib/constants";
import type { ActionResult } from "@/lib/types/api";
import { resetRequestSchema } from "@/lib/validations/auth";

export const requestPasswordReset = async (email: string): Promise<ActionResult<null>> => {
    const parsed = resetRequestSchema.safeParse({ email });
    if (!parsed.success) return { ok: false, status: 400, message: INVALID_REQUEST };

    const upstream = await backendFetch(unpublishedRoutes.passwordReset(), {
        method: "POST",
        body: JSON.stringify(parsed.data),
    });
    return upstream.ok ? { ok: true, data: null } : actionFailure(upstream);
};
