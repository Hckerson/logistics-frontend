import { NextResponse, type NextRequest } from "next/server";
import { backendFetch, readJson, relay } from "@/lib/api-server";
import { INVALID_CREDENTIALS, SESSION_COOKIE } from "@/lib/constants";
import { routes } from "@/lib/contract/routes";
import { startSession } from "@/lib/utils/session";
import { loginSchema } from "@/lib/validations/auth";

const RATE_LIMITED = 429;
const SERVER_ERROR = 500;

const rejected = (status: number) =>
    NextResponse.json({ message: INVALID_CREDENTIALS }, { status });

const passesThrough = (status: number) =>
    status === RATE_LIMITED || status >= SERVER_ERROR;

export const POST = async (request: NextRequest) => {
    const credentials = loginSchema.safeParse(await readJson(request));
    if (!credentials.success) return rejected(400);

    const upstream = await backendFetch(routes.authLogin(), {
        method: "POST",
        body: JSON.stringify(credentials.data),
    });
    if (passesThrough(upstream.status)) return relay(upstream);

    return (await startSession(upstream)) ?? rejected(401);
};

export const DELETE = () => {
    const response = new NextResponse(null, { status: 204 });
    response.cookies.delete(SESSION_COOKIE);
    return response;
};
