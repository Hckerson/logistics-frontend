"use server";
import { actionFailure, backendPost } from "@/lib/api-server";
import { unpublishedRoutes } from "@/lib/api-routes";
import type { ActionResult, ArticleFeedback } from "@/lib/types";
import { invalidInput } from "@/lib/utils/action-result";
import { withAction } from "@/lib/utils/with-action";
import { articleFeedbackSchema } from "@/lib/validations/help";

export const sendArticleFeedback = withAction(async (_context, input: ArticleFeedback): Promise<ActionResult<null>> => {
    const parsed = articleFeedbackSchema.safeParse(input);
    if (!parsed.success) return invalidInput();

    const upstream = await backendPost(unpublishedRoutes.helpFeedback(), parsed.data);
    return upstream.ok ? { ok: true, data: null } : actionFailure(upstream);
});
