import { isAxiosError } from "axios";
import { HTTP_STATUS, INVALID_REQUEST, REQUEST_FAILED } from "@/lib/constants";
import { CORRELATION_HEADER, ERROR_COPY, RATE_LIMIT_WAIT, READ_RETRY_DELAYS_MS } from "@/lib/errors/constants";
import type { ActionFailure, ActionResult, ErrorClass } from "@/lib/types";

const SECOND = 1000;
const SECONDS_PER_MINUTE = 60;

const BY_STATUS: Partial<Record<number, ErrorClass>> = {
    [HTTP_STATUS.badRequest]: "validation",
    [HTTP_STATUS.unprocessable]: "validation",
    [HTTP_STATUS.unauthorized]: "auth",
    [HTTP_STATUS.forbidden]: "forbidden",
    [HTTP_STATUS.notFound]: "not-found",
    [HTTP_STATUS.requestTimeout]: "timeout",
    [HTTP_STATUS.conflict]: "conflict",
    [HTTP_STATUS.preconditionFailed]: "precondition",
    [HTTP_STATUS.tooManyRequests]: "rate-limit",
    [HTTP_STATUS.serviceUnavailable]: "unavailable",
    [HTTP_STATUS.gatewayTimeout]: "timeout",
};

type FailureDetails = Partial<Pick<ActionFailure, "message" | "retryAfter" | "correlationId">>;

export const errorClassOf = (status: number): ErrorClass => BY_STATUS[status] ?? "server";

export const failureOf = (status: number, details: FailureDetails = {}): ActionFailure => ({
    ok: false,
    status,
    errorClass: errorClassOf(status),
    message: REQUEST_FAILED,
    ...details,
});

export const invalidInput = () => failureOf(HTTP_STATUS.badRequest, { message: INVALID_REQUEST });

export const contractFailure = (): ActionFailure => ({ ...failureOf(HTTP_STATUS.badGateway), errorClass: "contract" });

export const errorMessage = ({ errorClass, retryAfter }: Pick<ActionFailure, "errorClass" | "retryAfter">) =>
    errorClass === "rate-limit" && retryAfter
        ? RATE_LIMIT_WAIT.replace("{minutes}", String(Math.ceil(retryAfter / SECONDS_PER_MINUTE)))
        : ERROR_COPY[errorClass];

export class ActionError extends Error {
    readonly failure: ActionFailure;

    constructor(failure: ActionFailure) {
        super(failure.message);
        this.name = "ActionError";
        this.failure = failure;
    }
}

export const unwrap = <T>(result: ActionResult<T>): T => {
    if (!result.ok) throw new ActionError(result);
    return result.data;
};

export const failureFrom = (error: unknown): ActionFailure | null => {
    if (error instanceof ActionError) return error.failure;
    if (!isAxiosError(error) || !error.response) return null;
    const { status, headers } = error.response;
    return failureOf(status, {
        retryAfter: Number(headers["retry-after"]) || undefined,
        correlationId: typeof headers[CORRELATION_HEADER] === "string" ? headers[CORRELATION_HEADER] : undefined,
    });
};

export const readRetryDelays = (error: unknown): readonly number[] => {
    const failure = failureFrom(error);
    if (!failure) return [];
    if (failure.errorClass === "rate-limit") return failure.retryAfter ? [failure.retryAfter * SECOND] : [];
    return READ_RETRY_DELAYS_MS[failure.errorClass] ?? [];
};

export const READ_RETRY = {
    retry: (failureCount: number, error: unknown) => failureCount < readRetryDelays(error).length,
    retryDelay: (failureCount: number, error: unknown) => readRetryDelays(error)[failureCount] ?? 0,
} as const;
