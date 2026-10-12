import "server-only";
import type { z } from "zod";
import { actionFailure, backendPost, readJson } from "@/lib/api-server";
import type { ActionResult } from "@/lib/types";
import { contractFailure } from "@/lib/utils/action-result";

export const backendMutation = async <T>(path: string, body: unknown, envelope: z.ZodType<{ data: T }>): Promise<ActionResult<T>> => {
    const upstream = await backendPost(path, body);
    if (!upstream.ok) return actionFailure(upstream);

    const parsed = envelope.safeParse(await readJson(upstream));
    return parsed.success ? { ok: true, data: parsed.data.data } : contractFailure();
};

export const pathSegment = (value: string) => encodeURIComponent(value);
