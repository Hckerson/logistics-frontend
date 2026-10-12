import "server-only";
import { unstable_rethrow } from "next/navigation";
import { NextResponse, type NextRequest } from "next/server";
import { HTTP_STATUS, REQUEST_FAILED } from "@/lib/constants";
import { CORRELATION_HEADER } from "@/lib/errors/constants";
import { hasAnyRole } from "@/lib/auth/roles";
import type { ActionResult, RoleKey, SessionUser } from "@/lib/types";
import { failureOf } from "@/lib/utils/action-result";
import { withCorrelation } from "@/lib/utils/correlation";
import { getSession } from "@/lib/utils/session";
import { toSessionUser } from "@/lib/utils/session-user";

interface ServerContext<U> {
    user: U;
    correlationId: string;
}

type Roles = readonly RoleKey[];
type Action<U, A extends unknown[], T> = (context: ServerContext<U>, ...args: A) => Promise<ActionResult<T>>;
type Handler<U, R> = (request: NextRequest, context: ServerContext<U>, route: R | undefined) => Promise<Response>;

const currentUser = async () => toSessionUser(await getSession());

const denialOf = (user: SessionUser | null, roles: Roles | undefined) => {
    if (!user) return HTTP_STATUS.unauthorized;
    return roles && !hasAnyRole(user.roles, roles) ? HTTP_STATUS.forbidden : null;
};

const refusal = (status: number, correlationId: string) => NextResponse.json({ message: REQUEST_FAILED, correlationId }, { status });

export const withAction =
    <A extends unknown[], T>(run: Action<SessionUser | null, A, T>) =>
    async (...args: A): Promise<ActionResult<T>> =>
        withCorrelation(async (correlationId) => {
            try {
                const result = await run({ user: await currentUser(), correlationId }, ...args);
                return result.ok ? result : { ...result, correlationId: result.correlationId ?? correlationId };
            } catch (error) {
                unstable_rethrow(error);
                return failureOf(HTTP_STATUS.serverError, { correlationId });
            }
        });

export const withSessionAction = <A extends unknown[], T>(run: Action<SessionUser, A, T>, roles?: Roles) =>
    withAction<A, T>(async ({ user, correlationId }, ...args) => {
        const denied = denialOf(user, roles);
        return user && !denied ? run({ user, correlationId }, ...args) : failureOf(denied ?? HTTP_STATUS.unauthorized);
    });

export const withHandler =
    <R>(run: Handler<SessionUser | null, R>) =>
    async (request: NextRequest, route?: R): Promise<Response> =>
        withCorrelation(async (correlationId) => {
            const response = await run(request, { user: await currentUser(), correlationId }, route).catch((error: unknown) => {
                unstable_rethrow(error);
                return refusal(HTTP_STATUS.serverError, correlationId);
            });
            response.headers.set(CORRELATION_HEADER, correlationId);
            return response;
        });

export const withSessionHandler = <R>(run: Handler<SessionUser, R>, roles?: Roles) =>
    withHandler<R>(async (request, { user, correlationId }, route) => {
        const denied = denialOf(user, roles);
        return user && !denied ? run(request, { user, correlationId }, route) : refusal(denied ?? HTTP_STATUS.unauthorized, correlationId);
    });
