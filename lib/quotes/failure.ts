import { isAxiosError } from "axios";
import { z } from "zod";
import { HTTP_STATUS } from "@/lib/constants";
import { UNRESOLVED_LOCATION } from "@/lib/quotes/constants";
import type { EstimateFailure } from "@/lib/types";

const TIMED_OUT = "ECONNABORTED";
const refusal = z.object({ message: z.string() });

export function estimateFailure(error: unknown): EstimateFailure {
    if (!isAxiosError(error)) return { kind: "server" };
    if (error.code === TIMED_OUT) return { kind: "timeout" };
    const status = error.response?.status;
    if (status === HTTP_STATUS.tooManyRequests) return { kind: "rate-limited", wait: Number(error.response?.headers["retry-after"]) || 0 };
    if (status === HTTP_STATUS.serviceUnavailable) return { kind: "unavailable" };
    const message = refusal.safeParse(error.response?.data).data?.message;
    if (status === HTTP_STATUS.unprocessable && message === UNRESOLVED_LOCATION.origin) return { kind: "unresolved", field: "origin" };
    if (status === HTTP_STATUS.unprocessable && message === UNRESOLVED_LOCATION.destination) return { kind: "unresolved", field: "destination" };
    return { kind: "server" };
}
