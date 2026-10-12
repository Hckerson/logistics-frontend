import type { ErrorClass } from "@/lib/types";

export const ERROR_CLASSES = [
    "validation",
    "auth",
    "forbidden",
    "not-found",
    "conflict",
    "precondition",
    "rate-limit",
    "unavailable",
    "server",
    "timeout",
    "offline",
    "contract",
] as const;

export const ERROR_COPY = {
    validation: "Check the highlighted entries.",
    auth: "Your session ended. Sign in again to carry on.",
    forbidden: "Your role doesn't include this.",
    "not-found": "This is no longer available.",
    conflict: "This changed while you were looking. Here's where it stands now.",
    precondition: "Someone changed this first. Reload to see it; your entries are kept.",
    "rate-limit": "Too many attempts. Wait a few minutes, then try again.",
    unavailable: "Part of Haulr is down for a moment. What you see may be out of date.",
    server: "Something went wrong on our side. Try again.",
    timeout: "This is taking longer than it should. Try again.",
    offline: "We couldn't reach Haulr. Check your connection, then try again.",
    contract: "Something went wrong on our side. Try again.",
} as const satisfies Record<ErrorClass, string>;

export const RATE_LIMIT_WAIT = "Too many attempts. Try again in {minutes} min.";

export const SECTION_COPY = {
    loading: "Loading {label}",
    slow: "Still loading {label}. You can keep working.",
    failed: "Couldn't load {label}.",
    retry: "Try again",
    reference: "Reference",
} as const;

export const READ_RETRY_DELAYS_MS: Partial<Record<ErrorClass, readonly number[]>> = {
    server: [1000, 3000],
    timeout: [1000, 3000],
    unavailable: [2000, 6000],
};

export const LOADING_ANNOUNCE_MS = 1000;

export const LOADING_SLOW_MS = 5000;

export const CORRELATION_HEADER = "x-request-id";
