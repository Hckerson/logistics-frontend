import "server-only";
import { backendFetch, readJson } from "@/lib/api-server";
import { HTTP_STATUS, REQUEST_FAILED } from "@/lib/constants";
import { routes } from "@/lib/contract/routes";
import type { TrackingRead } from "@/lib/types";
import { trackingEnvelopeSchema } from "@/lib/validations/tracking";

const RETRY_AFTER = "Retry-After";

export const readTracking = async (token: string): Promise<TrackingRead> => {
    const upstream = await backendFetch(routes.publicTrackingFind(encodeURIComponent(token)));
    if (upstream.status === HTTP_STATUS.notFound) return { kind: "missing" };
    if (upstream.status === HTTP_STATUS.tooManyRequests) {
        return { kind: "rate-limited", wait: Number(upstream.headers.get(RETRY_AFTER)) || 0 };
    }

    const envelope = trackingEnvelopeSchema.safeParse(await readJson(upstream));
    if (!upstream.ok || !envelope.success) throw new Error(REQUEST_FAILED);
    return { kind: "found", snapshot: { data: envelope.data.data, readAt: new Date().getTime() } };
};
