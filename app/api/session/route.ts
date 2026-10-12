import { NextResponse, type NextRequest } from "next/server";
import { backendFetch, readJson, relay } from "@/lib/api-server";
import { HTTP_STATUS, INVALID_CREDENTIALS, SESSION_COOKIE } from "@/lib/constants";
import { routes } from "@/lib/contract/routes";
import { startChallenge, startSession } from "@/lib/utils/session";
import { withHandler } from "@/lib/utils/with-action";
import { loginSchema } from "@/lib/validations/auth";

const rejected = (status: number) =>
    NextResponse.json({ message: INVALID_CREDENTIALS }, { status });

const passesThrough = (status: number) =>
    status === HTTP_STATUS.tooManyRequests || status >= HTTP_STATUS.serverError;

export const POST = withHandler(async (request: NextRequest) => {
    const credentials = loginSchema.safeParse(await readJson(request));
    if (!credentials.success) return rejected(HTTP_STATUS.badRequest);

    const upstream = await backendFetch(routes.authLogin(), {
        method: "POST",
        body: JSON.stringify(credentials.data),
    });
    if (passesThrough(upstream.status)) return relay(upstream);

    return (
        (await startChallenge(upstream.clone())) ??
        (await startSession(upstream)) ??
        rejected(HTTP_STATUS.unauthorized)
    );
});

export const DELETE = withHandler(async () => {
    const response = new NextResponse(null, { status: 204 });
    response.cookies.delete(SESSION_COOKIE);
    return response;
});
