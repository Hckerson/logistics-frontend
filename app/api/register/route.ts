import { NextResponse, type NextRequest } from "next/server";
import { backendFetch, readJson, relay } from "@/lib/api-server";
import { INVALID_REQUEST, SESSION_UNAVAILABLE } from "@/lib/constants";
import { routes } from "@/lib/contract/routes";
import { startSession } from "@/lib/utils/session";
import { registerSchema } from "@/lib/validations/auth";

export const POST = async (request: NextRequest) => {
    const input = registerSchema.safeParse(await readJson(request));
    if (!input.success) {
        return NextResponse.json({ message: INVALID_REQUEST }, { status: 400 });
    }

    const upstream = await backendFetch(routes.authRegister(), {
        method: "POST",
        body: JSON.stringify(input.data),
    });
    if (!upstream.ok) return relay(upstream);

    return (
        (await startSession(upstream)) ??
        NextResponse.json({ message: SESSION_UNAVAILABLE }, { status: 502 })
    );
};
