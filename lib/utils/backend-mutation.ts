import "server-only";
import type { z } from "zod";
import { actionFailure, backendPost, readJson } from "@/lib/api-server";
import { HTTP_STATUS } from "@/lib/constants";
import { preconditionFailedDtoSchema } from "@/lib/contract/schemas";
import type { ActionResult } from "@/lib/types";
import { contractFailure } from "@/lib/utils/action-result";

const staleDetails = async (upstream: Response) => {
    if (upstream.status !== HTTP_STATUS.preconditionFailed) return {};
    const body = preconditionFailedDtoSchema.safeParse(await readJson(upstream));
    return body.success && body.data.changedBy && body.data.changedAt ? { changedBy: body.data.changedBy, changedAt: body.data.changedAt } : {};
};

export const backendMutation = async <T>(path: string, body: unknown, envelope: z.ZodType<{ data: T }>): Promise<ActionResult<T>> => {
    const upstream = await backendPost(path, body);
    if (!upstream.ok) return { ...actionFailure(upstream), ...(await staleDetails(upstream)) };

    const parsed = envelope.safeParse(await readJson(upstream));
    return parsed.success ? { ok: true, data: parsed.data.data } : contractFailure();
};

export const pathSegment = (value: string) => encodeURIComponent(value);
