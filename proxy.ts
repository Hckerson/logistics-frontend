import { nanoid } from "nanoid";
import { NextResponse, type NextRequest } from "next/server";
import {
    AUTH_ROUTE_PREFIX,
    DASHBOARD_ROUTE,
    LOGIN_ROUTE,
    PROTECTED_ROUTE_PREFIXES,
    SESSION_COOKIE,
    SIGNED_IN_ACCESS_ROUTES,
} from "@/lib/constants";
import { contentSecurityPolicy, CSP_HEADER, NONCE_HEADER } from "@/lib/security/headers";
import { verifySessionToken } from "@/lib/utils/verify-session-token";

const NONCE_LENGTH = 32;

const covers = (pathname: string, prefix: string) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`);

const closedWhenSignedIn = (pathname: string) =>
    covers(pathname, AUTH_ROUTE_PREFIX) &&
    !SIGNED_IN_ACCESS_ROUTES.some((route) => covers(pathname, route));

const secured = (request: NextRequest) => {
    const nonce = nanoid(NONCE_LENGTH);
    const policy = contentSecurityPolicy(nonce, process.env.NODE_ENV === "development");
    const headers = new Headers(request.headers);
    headers.set(NONCE_HEADER, nonce);
    headers.set(CSP_HEADER, policy);
    const response = NextResponse.next({ request: { headers } });
    response.headers.set(CSP_HEADER, policy);
    return response;
};

export const proxy = async (request: NextRequest) => {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (session && closedWhenSignedIn(pathname)) {
        return NextResponse.redirect(new URL(DASHBOARD_ROUTE, request.url));
    }

    if (
        !session &&
        PROTECTED_ROUTE_PREFIXES.some((prefix) => covers(pathname, prefix))
    ) {
        const destination = new URL(LOGIN_ROUTE, request.url);
        destination.searchParams.set("next", pathname);

        const redirect = NextResponse.redirect(destination);
        if (token) redirect.cookies.delete(SESSION_COOKIE);
        return redirect;
    }

    return secured(request);
};

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
