"use server";
import { backendFetch } from "@/lib/api-server";
import { unpublishedRoutes } from "@/lib/api-routes";
import { INVALID_REQUEST, REQUEST_FAILED } from "@/lib/constants";
import type { ActionResult } from "@/lib/types/api";
import { resetRequestSchema } from "@/lib/validations/auth";

const RETRY_AFTER = "Retry-After";

export const requestPasswordReset = async (email: string): Promise<ActionResult<null>> => {
    const parsed = resetRequestSchema.safeParse({ email });
    if (!parsed.success) return { ok: false, status: 400, message: INVALID_REQUEST };

    const upstream = await backendFetch(unpublishedRoutes.passwordReset(), {
        method: "POST",
        body: JSON.stringify(parsed.data),
    });
    if (upstream.ok) return { ok: true, data: null };

    const retryAfter = Number(upstream.headers.get(RETRY_AFTER)) || undefined;
    return { ok: false, status: upstream.status, message: REQUEST_FAILED, retryAfter };
};
