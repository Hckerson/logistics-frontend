import "server-only";
import type { z } from "zod";
import { NextResponse, type NextRequest } from "next/server";
import { backendFetch, relay } from "@/lib/api-server";
import { HTTP_STATUS, INVALID_REQUEST } from "@/lib/constants";
import { pathSegment } from "@/lib/utils/backend-mutation";
import { withSessionHandler } from "@/lib/utils/with-action";

interface Params<K extends string> {
    params: Promise<Record<K, string>>;
}

type PathOf<R> = (request: NextRequest, route: R | undefined) => Promise<string | null> | string | null;

export const paramOf = async <K extends string>(route: Params<K> | undefined, key: K) => {
    const value = (await route?.params)?.[key];
    return value ? pathSegment(value) : null;
};

export const validSearch = (request: NextRequest, schema: z.ZodType) =>
    schema.safeParse(Object.fromEntries(request.nextUrl.searchParams)).success ? request.nextUrl.search : null;

export const invalidRequest = () => NextResponse.json({ message: INVALID_REQUEST }, { status: HTTP_STATUS.badRequest });

export const relayRead = <R>(pathOf: PathOf<R>) =>
    withSessionHandler<R>(async (request, _context, route) => {
        const path = await pathOf(request, route);
        return path ? relay(await backendFetch(path)) : invalidRequest();
    });
