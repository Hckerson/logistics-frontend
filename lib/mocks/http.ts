import { signMockToken } from "@/lib/mocks/session-token";
import type { MockErrorDetails, MockResponse, MockScenario, MockUser } from "@/lib/types";

const SUCCESS = "Success";

const ERRORS: Record<number, string> = {
    400: "BadRequestException",
    401: "UnauthorizedException",
    403: "ForbiddenException",
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

export const fail = (
    status: number,
    message: string,
    path: string,
    headers?: Record<string, string>,
    details?: MockErrorDetails,
): MockResponse => ({
    status,
    headers,
    body: {
        statusCode: status,
        message,
        error: ERRORS[status] ?? "HttpException",
        path,
        timestamp: new Date().toISOString(),
        ...details,
    },
});

export const UNAVAILABLE = "Service temporarily unavailable";

const TOO_MANY = "Too many requests";

export const playScenario = (found: MockScenario | undefined, path: string): MockResponse | null => {
    if (!found) return null;
    if (found.kind === "rate-limited") return fail(429, TOO_MANY, path, { "Retry-After": String(found.retryAfter) });
    return fail(503, UNAVAILABLE, path);
};

const publicUser = ({ id, name, email, role, roles }: MockUser) => ({ id, name, email, role, roles });

export const issueSession = async (status: number, user: MockUser) =>
    ok(status, { user: publicUser(user), accessToken: await signMockToken(user) });
