import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { API_BASE_URL, SESSION_COOKIE } from "@/lib/constants";

export const backendFetch = async (path: string, init: RequestInit = {}) => {
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

export const relay = (upstream: Response) =>
    new NextResponse(upstream.body, {
        status: upstream.status,
        headers: { "Content-Type": "application/json" },
    });
