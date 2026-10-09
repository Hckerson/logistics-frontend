import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { API_BASE_URL, API_MOCKS, SESSION_COOKIE } from "@/lib/constants";

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
