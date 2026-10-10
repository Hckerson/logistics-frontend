"use server";
import { actionFailure, backendPost } from "@/lib/api-server";
import { unpublishedRoutes } from "@/lib/api-routes";
import { HTTP_STATUS, INVALID_REQUEST } from "@/lib/constants";
import type { ActionResult, ArticleFeedback } from "@/lib/types";
import { articleFeedbackSchema } from "@/lib/validations/help";

export const sendArticleFeedback = async (input: ArticleFeedback): Promise<ActionResult<null>> => {
    const parsed = articleFeedbackSchema.safeParse(input);
    if (!parsed.success) return { ok: false, status: HTTP_STATUS.badRequest, message: INVALID_REQUEST };

    const upstream = await backendPost(unpublishedRoutes.helpFeedback(), parsed.data);
    return upstream.ok ? { ok: true, data: null } : actionFailure(upstream);
};
