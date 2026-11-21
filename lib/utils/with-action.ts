import "server-only";
import { trace } from "@opentelemetry/api";
import { unstable_rethrow } from "next/navigation";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { HTTP_STATUS, OBSERVABILITY, REQUEST_FAILED } from "@/lib/constants";
import { AUDIT_REASON_HEADER, AUDIT_REASON_MAX, CORRELATION_HEADER, ERROR_CLASS_HEADER, TIMING_HEADER } from "@/lib/errors/constants";
import { hasAnyRole } from "@/lib/auth/roles";
import type { ActionResult, RoleKey, SessionUser } from "@/lib/types";
import { errorClassOf, failureOf } from "@/lib/utils/action-result";
import { withCorrelation } from "@/lib/utils/correlation";
import { reportError } from "@/lib/utils/report-error";
import { getSession } from "@/lib/utils/session";
import { toSessionUser } from "@/lib/utils/session-user";

interface ServerContext<U> {
    user: U;
    correlationId: string;
}

type Roles = readonly RoleKey[];
type Action<U, A extends unknown[], T> = (context: ServerContext<U>, ...args: A) => Promise<ActionResult<T>>;
type Handler<U, R> = (request: NextRequest, context: ServerContext<U>, route: R | undefined) => Promise<Response>;

const ACTION_SPAN = "server action";
const tracer = trace.getTracer(OBSERVABILITY.serviceName);
const reasonSchema = z.object({ reason: z.string().trim().min(1).max(AUDIT_REASON_MAX) });

const currentUser = async () => toSessionUser(await getSession());

const reasonOf = (args: readonly unknown[]) =>
    args.flatMap((arg) => {
        const parsed = reasonSchema.safeParse(arg);
        return parsed.success ? [parsed.data.reason] : [];
    })[0];

const decoded = (raw: string) => {
    try {
        return decodeURIComponent(raw);
    } catch {
        return raw;
    }
};

const headerReason = (request: NextRequest) => {
    const raw = request.headers.get(AUDIT_REASON_HEADER);
    if (!raw) return undefined;
    const parsed = reasonSchema.safeParse({ reason: decoded(raw) });
    return parsed.success ? parsed.data.reason : undefined;
};

const timed = <T>(name: string, correlationId: string, run: () => Promise<T>) =>
    tracer.startActiveSpan(name, async (span) => {
        span.setAttribute(CORRELATION_HEADER, correlationId);
        try {
            return await run();
        } finally {
            span.end();
        }
    });

const denialOf = (user: SessionUser | null, roles: Roles | undefined) => {
    if (!user) return HTTP_STATUS.unauthorized;
    return roles && !hasAnyRole(user.roles, roles) ? HTTP_STATUS.forbidden : null;
};

const refusal = (status: number, correlationId: string) => NextResponse.json({ message: REQUEST_FAILED, correlationId, errorClass: errorClassOf(status) }, { status });

export const withAction =
    <A extends unknown[], T>(run: Action<SessionUser | null, A, T>) =>
    async (...args: A): Promise<ActionResult<T>> =>
        withCorrelation(
            (correlationId) =>
                timed(ACTION_SPAN, correlationId, async () => {
                    const seen: { user: SessionUser | null } = { user: null };
                    try {
                        seen.user = await currentUser();
                        const result = await run({ user: seen.user, correlationId }, ...args);
                        return result.ok ? result : { ...result, correlationId: result.correlationId ?? correlationId };
                    } catch (error) {
                        unstable_rethrow(error);
                        reportError(error, { role: seen.user?.roles[0], errorClass: "server", correlationId });
                        return failureOf(HTTP_STATUS.serverError, { correlationId });
                    }
                }),
            reasonOf(args),
        );

export const withSessionAction = <A extends unknown[], T>(run: Action<SessionUser, A, T>, roles?: Roles) =>
    withAction<A, T>(async ({ user, correlationId }, ...args) => {
        const denied = denialOf(user, roles);
        return user && !denied ? run({ user, correlationId }, ...args) : failureOf(denied ?? HTTP_STATUS.unauthorized);
    });

export const withHandler =
    <R>(run: Handler<SessionUser | null, R>) =>
    async (request: NextRequest, route?: R): Promise<Response> =>
        withCorrelation(
            (correlationId) =>
                timed(`${request.method} ${request.nextUrl.pathname}`, correlationId, async () => {
                    const started = performance.now();
                    const user = await currentUser();
                    const response = await run(request, { user, correlationId }, route).catch((error: unknown) => {
                        unstable_rethrow(error);
                        reportError(error, { route: request.nextUrl.pathname, role: user?.roles[0], errorClass: "server", correlationId });
                        return refusal(HTTP_STATUS.serverError, correlationId);
                    });
                    response.headers.set(CORRELATION_HEADER, correlationId);
                    response.headers.set(TIMING_HEADER, `app;dur=${Math.round(performance.now() - started)}`);
                    if (!response.ok) response.headers.set(ERROR_CLASS_HEADER, errorClassOf(response.status));
                    return response;
                }),
            headerReason(request),
        );

export const withSessionHandler = <R>(run: Handler<SessionUser, R>, roles?: Roles) =>
    withHandler<R>(async (request, { user, correlationId }, route) => {
        const denied = denialOf(user, roles);
        return user && !denied ? run(request, { user, correlationId }, route) : refusal(denied ?? HTTP_STATUS.unauthorized, correlationId);
    });
