import "server-only";
import { z } from "zod";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { readJson } from "@/lib/api-server";
import { authResponseDtoSchema } from "@/lib/contract/schemas";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/constants";
import {
    verifySessionToken,
    type SessionPayload,
} from "@/lib/utils/verify-session-token";

const authEnvelopeSchema = z.object({
    data: authResponseDtoSchema.extend({ accessToken: z.string().min(1) }),
});

export const getSession = async (): Promise<SessionPayload | null> => {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    return token ? await verifySessionToken(token) : null;
};

export const startSession = async (
    upstream: Response,
): Promise<NextResponse | null> => {
    const envelope = authEnvelopeSchema.safeParse(await readJson(upstream));
    if (!upstream.ok || !envelope.success) return null;

    const { user, accessToken } = envelope.data.data;
    const response = NextResponse.json({ user }, { status: upstream.status });

    response.cookies.set(SESSION_COOKIE, accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_MAX_AGE,
    });

    return response;
};
