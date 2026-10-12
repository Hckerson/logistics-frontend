"use server";
import { actionFailure, backendPost, readJson } from "@/lib/api-server";
import { unpublishedRoutes } from "@/lib/api-routes";
import { HTTP_STATUS, INVALID_REQUEST, REQUEST_FAILED, SESSION_REQUIRED } from "@/lib/constants";
import type { ActionResult, LaneQuery } from "@/lib/types";
import { getSession } from "@/lib/utils/session";
import { saveEstimateSchema, savedEnvelopeSchema } from "@/lib/validations/lane";

export const saveEstimate = async (lane: LaneQuery, rate: number): Promise<ActionResult<string>> => {
    const session = await getSession();
    if (!session) return { ok: false, status: HTTP_STATUS.unauthorized, message: SESSION_REQUIRED };

    const input = saveEstimateSchema.safeParse({ email: session.email, lane, rate });
    if (!input.success) return { ok: false, status: HTTP_STATUS.badRequest, message: INVALID_REQUEST };

    const upstream = await backendPost(unpublishedRoutes.pricingSaved(), input.data);
    if (!upstream.ok) return actionFailure(upstream);

    const saved = savedEnvelopeSchema.safeParse(await readJson(upstream));
    return saved.success
        ? { ok: true, data: saved.data.data.id }
        : { ok: false, status: HTTP_STATUS.badGateway, message: REQUEST_FAILED };
};
