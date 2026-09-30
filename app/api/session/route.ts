import { NextResponse, type NextRequest } from "next/server";
import { backendFetch, readJson } from "@/lib/api-server";
import { INVALID_CREDENTIALS, SESSION_COOKIE } from "@/lib/constants";
import { routes } from "@/lib/contract/routes";
import { startSession } from "@/lib/utils/session";
import { loginSchema } from "@/lib/validations/auth";

const rejected = (status: number) =>
    NextResponse.json({ message: INVALID_CREDENTIALS }, { status });

export const POST = async (request: NextRequest) => {
    const credentials = loginSchema.safeParse(await readJson(request));
    if (!credentials.success) return rejected(400);

    const upstream = await backendFetch(routes.authLogin(), {
        method: "POST",
        body: JSON.stringify(credentials.data),
    });

    return (await startSession(upstream)) ?? rejected(401);
};

export const DELETE = () => {
    const response = new NextResponse(null, { status: 204 });
    response.cookies.delete(SESSION_COOKIE);
    return response;
};
