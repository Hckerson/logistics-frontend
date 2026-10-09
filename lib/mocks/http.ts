import type { MockResponse } from "@/lib/types";

const SUCCESS = "Success";

const ERRORS: Record<number, string> = {
    400: "BadRequestException",
    401: "UnauthorizedException",
    404: "NotFoundException",
    409: "ConflictException",
    422: "UnprocessableEntityException",
    429: "ThrottlerException",
    503: "ServiceUnavailableException",
};

export const ok = (status: number, data: unknown): MockResponse => ({
    status,
    body: { statusCode: status, message: SUCCESS, data, timestamp: new Date().toISOString() },
});

export const fail = (status: number, message: string, path: string, headers?: Record<string, string>): MockResponse => ({
    status,
    headers,
    body: {
        statusCode: status,
        message,
        error: ERRORS[status] ?? "HttpException",
        path,
        timestamp: new Date().toISOString(),
    },
});
