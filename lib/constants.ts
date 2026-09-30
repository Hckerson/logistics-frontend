export const DATE_VALUE_FORMAT = "yyyy-MM-dd";

export const SESSION_COOKIE = "session";

export const AUTH_ROUTE_PREFIX = "/auth";

export const LOGIN_ROUTE = `${AUTH_ROUTE_PREFIX}/login`;

export const HOME_ROUTE = "/";

export const PROTECTED_ROUTE_PREFIXES = ["/dashboard"];

export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

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
