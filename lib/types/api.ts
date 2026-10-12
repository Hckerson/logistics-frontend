import type { ApiEnvelopeDto } from "@/lib/contract/schemas";
import type { ErrorClass } from "@/lib/types/errors";

export type Endpoint<TResponse = unknown> = string & {
    readonly __response?: TResponse;
};

export type ApiResponse<TData> = ApiEnvelopeDto & { data: TData };

export interface ActionFailure {
    ok: false;
    status: number;
    errorClass: ErrorClass;
    message: string;
    retryAfter?: number;
    correlationId?: string;
}

export type ActionResult<TData> = { ok: true; data: TData } | ActionFailure;

export interface RouteError {
    error: Error & { digest?: string };
    unstable_retry: () => void;
}
