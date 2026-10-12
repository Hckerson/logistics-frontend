import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { API_BASE_URL, API_MOCKS, SESSION_COOKIE } from "@/lib/constants";
import { CORRELATION_HEADER } from "@/lib/errors/constants";
import type { ActionFailure } from "@/lib/types/api";
import { failureOf } from "@/lib/utils/action-result";
import { correlationId } from "@/lib/utils/correlation";

const parseBody = (body: RequestInit["body"]): unknown => {
    if (typeof body !== "string") return body ?? null;
    try {
        return JSON.parse(body);
    } catch {
        return body;
    }
};

const mockFetch = async (path: string, init: RequestInit, token: string | undefined) => {
    const { mockRequest, toResponse } = await import("@/lib/mocks/router");
    return toResponse(await mockRequest({ method: init.method ?? "GET", path, body: parseBody(init.body), token }));
};

export const backendFetch = async (path: string, init: RequestInit = {}) => {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (API_MOCKS) return mockFetch(path, init, token);

    const requestId = correlationId();

    return fetch(`${API_BASE_URL}${path}`, {
        ...init,
        cache: "no-store",
        headers: {
            "Content-Type": "application/json",
            ...init.headers,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(requestId ? { [CORRELATION_HEADER]: requestId } : {}),
        },
    });
};

export const backendPost = (path: string, body: unknown) =>
    backendFetch(path, { method: "POST", body: JSON.stringify(body) });

export const readJson = async (source: Request | Response): Promise<unknown> =>
    await source.json().catch(() => null);

const RETRY_AFTER = "Retry-After";

export const relay = (upstream: Response) => {
    const retryAfter = upstream.headers.get(RETRY_AFTER);
    return new NextResponse(upstream.body, {
        status: upstream.status,
        headers: { "Content-Type": "application/json", ...(retryAfter ? { [RETRY_AFTER]: retryAfter } : {}) },
    });
};

export const actionFailure = (upstream: Response): ActionFailure =>
    failureOf(upstream.status, {
        retryAfter: Number(upstream.headers.get(RETRY_AFTER)) || undefined,
        correlationId: upstream.headers.get(CORRELATION_HEADER) ?? correlationId(),
    });
