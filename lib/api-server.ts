import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { API_BASE_URL, API_MOCKS, REQUEST_FAILED, SESSION_COOKIE } from "@/lib/constants";
import type { ActionFailure } from "@/lib/types/api";

const parseBody = (body: RequestInit["body"]): unknown => {
    if (typeof body !== "string") return body ?? null;
    try {
        return JSON.parse(body);
    } catch {
        return body;
    }
};

const mockFetch = async (path: string, init: RequestInit) => {
    const { mockRequest, toResponse } = await import("@/lib/mocks/router");
    return toResponse(await mockRequest({ method: init.method ?? "GET", path, body: parseBody(init.body) }));
};

export const backendFetch = async (path: string, init: RequestInit = {}) => {
    if (API_MOCKS) return mockFetch(path, init);

    const token = (await cookies()).get(SESSION_COOKIE)?.value;

    return fetch(`${API_BASE_URL}${path}`, {
        ...init,
        cache: "no-store",
        headers: {
            "Content-Type": "application/json",
            ...init.headers,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

export const actionFailure = (upstream: Response): ActionFailure => ({
    ok: false,
    status: upstream.status,
    message: REQUEST_FAILED,
    retryAfter: Number(upstream.headers.get(RETRY_AFTER)) || undefined,
});
