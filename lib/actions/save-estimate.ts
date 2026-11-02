"use server";
import { actionFailure, backendPost, readJson } from "@/lib/api-server";
import { routes } from "@/lib/contract/routes";
import type { ActionResult, LaneQuery } from "@/lib/types";
import { contractFailure, invalidInput } from "@/lib/utils/action-result";
import { withSessionAction } from "@/lib/utils/with-action";
import { saveEstimateSchema, savedEnvelopeSchema } from "@/lib/validations/lane";

export const saveEstimate = withSessionAction(async ({ user }, lane: LaneQuery, rate: number): Promise<ActionResult<string>> => {
    const input = saveEstimateSchema.safeParse({ email: user.email, lane, rate });
    if (!input.success) return invalidInput();

    const upstream = await backendPost(routes.pricingSaveEstimate(), input.data);
    if (!upstream.ok) return actionFailure(upstream);

    const saved = savedEnvelopeSchema.safeParse(await readJson(upstream));
    return saved.success ? { ok: true, data: saved.data.data.id } : contractFailure();
});
