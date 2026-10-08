import type { AccountSide } from "@/lib/types";

export const DATE_VALUE_FORMAT = "yyyy-MM-dd";

export const SESSION_COOKIE = "session";

export const AUTH_ROUTE_PREFIX = "/auth";

export const LOGIN_ROUTE = `${AUTH_ROUTE_PREFIX}/login`;

export const HOME_ROUTE = "/";

export const REGISTER_ROUTE = `${AUTH_ROUTE_PREFIX}/register`;

export const FORGOT_PASSWORD_ROUTE = `${AUTH_ROUTE_PREFIX}/forgot-password`;

export const VERIFY_ROUTE = `${AUTH_ROUTE_PREFIX}/verify`;

export const RATE_ESTIMATOR_ROUTE = "/tools/rate-estimator";

export const HELP_ROUTE = "/help";

export const SUPPORT_ROUTE = "/support";

export const legalRoute = (document: string) => `/legal/${document}`;

export const ACCOUNT_SIDES = ["shipper", "carrier"] as const satisfies readonly AccountSide[];

export const registerRoute = (side: AccountSide) => `${REGISTER_ROUTE}?side=${side}`;

export const PROTECTED_ROUTE_PREFIXES = ["/dashboard"];

export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5100";

export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export const INVALID_CREDENTIALS = "Email or password is incorrect";

export const INVALID_REQUEST = "The request body is invalid";

export const REQUEST_FAILED = "The request could not be completed";

export const SESSION_UNAVAILABLE = "The account was created but sign-in failed";

export const PASSWORD_MIN_LENGTH = 8;

export const MOTION_DURATION = {
    fast: 0.2,
    normal: 0.35,
    slow: 0.6,
    slower: 0.8,
} as const;

export const MOTION_SPRING = {
    type: "spring",
    stiffness: 100,
    damping: 30,
} as const;
