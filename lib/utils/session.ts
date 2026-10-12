import "server-only";
import { z } from "zod";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { readJson } from "@/lib/api-server";
import { authResponseDtoSchema } from "@/lib/contract/schemas";
import { HTTP_STATUS, MFA_CHALLENGE_MINUTES, MFA_COOKIE, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/constants";
import {
    verifySessionToken,
    type SessionPayload,
} from "@/lib/utils/verify-session-token";
import { mfaChallengeSchema } from "@/lib/validations/auth";

const SECONDS_PER_MINUTE = 60;

const authEnvelopeSchema = z.object({
    data: authResponseDtoSchema.extend({ accessToken: z.string().min(1) }),
});

const cookieOptions = (maxAge: number) => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
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
    response.cookies.set(SESSION_COOKIE, accessToken, cookieOptions(SESSION_MAX_AGE));
    return response;
};

export const startChallenge = async (upstream: Response): Promise<NextResponse | null> => {
    const reply = mfaChallengeSchema.safeParse(await readJson(upstream));
    if (!upstream.ok || !reply.success) return null;

    const response = NextResponse.json({ challenge: true }, { status: HTTP_STATUS.accepted });
    response.cookies.set(MFA_COOKIE, reply.data.data.challenge, cookieOptions(MFA_CHALLENGE_MINUTES * SECONDS_PER_MINUTE));
    return response;
};

export const readChallenge = async () => (await cookies()).get(MFA_COOKIE)?.value ?? null;

export const endChallenge = async () => {
    (await cookies()).delete(MFA_COOKIE);
};

export const openSession = async (body: unknown): Promise<boolean> => {
    const envelope = authEnvelopeSchema.safeParse(body);
    if (!envelope.success) return false;

    (await cookies()).set(SESSION_COOKIE, envelope.data.data.accessToken, cookieOptions(SESSION_MAX_AGE));
    return true;
};

export const completeChallenge = async (body: unknown): Promise<boolean> => {
    if (!(await openSession(body))) return false;

    (await cookies()).delete(MFA_COOKIE);
    return true;
};
