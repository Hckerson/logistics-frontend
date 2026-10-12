import type { AccountSide, MfaMethod, SupportContext } from "@/lib/types";

export const DATE_VALUE_FORMAT = "yyyy-MM-dd";

export const SESSION_COOKIE = "session";

export const MFA_COOKIE = "mfa_challenge";

export const AUTH_ROUTE_PREFIX = "/auth";

export const LOGIN_ROUTE = `${AUTH_ROUTE_PREFIX}/login`;

export const HOME_ROUTE = "/";

export const DASHBOARD_ROUTE = "/dashboard";

export const REGISTER_ROUTE = `${AUTH_ROUTE_PREFIX}/register`;

export const FORGOT_PASSWORD_ROUTE = `${AUTH_ROUTE_PREFIX}/forgot-password`;

export const RESET_PASSWORD_ROUTE = `${AUTH_ROUTE_PREFIX}/reset-password`;

export const VERIFY_ROUTE = `${AUTH_ROUTE_PREFIX}/verify`;

export const RATE_ESTIMATOR_ROUTE = "/tools/rate-estimator";

export const HELP_ROUTE = "/help";

export const SUPPORT_ROUTE = "/support";

export const legalRoute = (document: string, version?: string) => `/legal/${document}${version ? `/${version}` : ""}`;

export const ACCOUNT_SIDES = ["shipper", "carrier"] as const satisfies readonly AccountSide[];

export const registerRoute = (side: AccountSide) => `${REGISTER_ROUTE}?side=${side}`;

export const loginRoute = (next: string) => `${LOGIN_ROUTE}?next=${encodeURIComponent(next)}`;

export const MFA_STEP = "code";

export const mfaRoute = (next: string) => `${VERIFY_ROUTE}?step=${MFA_STEP}&next=${encodeURIComponent(next)}`;

export const helpArticleRoute = (slug: string) => `${HELP_ROUTE}/${slug}`;

export const POST_LOAD_ROUTE = "/shipper/loads/new";

export const postLoadRoute = (lane: string, quote?: "custom") =>
    `${POST_LOAD_ROUTE}?lane=${encodeURIComponent(lane)}${quote ? `&quote=${quote}` : ""}`;

export const supportRoute = (context: SupportContext) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(context)) if (value) query.set(key, value);
    return `${SUPPORT_ROUTE}?${query}`;
};

export const ACCOUNT_RECOVERY_ROUTE = supportRoute({ topic: "account" });

export const ERROR_RETRY_LIMIT = 3;

export const PROTECTED_ROUTE_PREFIXES = [DASHBOARD_ROUTE];

export const SIGNED_IN_ACCESS_ROUTES = [VERIFY_ROUTE];

export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5100";

export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export const API_MOCKS = process.env.NEXT_PUBLIC_API_MOCKS !== "off";

export const MOCK_LATENCY_MS = { min: 300, max: 800 } as const;

export const INVALID_CREDENTIALS = "Email or password is incorrect";

export const INVALID_REQUEST = "The request body is invalid";

export const REQUEST_FAILED = "The request could not be completed";

export const SESSION_UNAVAILABLE = "The account was created but sign-in failed";

export const SESSION_REQUIRED = "A session is required";

export const PASSWORD_MIN_LENGTH = 8;

export const RESET_LINK_MINUTES = 30;

export const VERIFICATION_LINK_HOURS = 24;

export const VERIFICATION_RESEND_COOLDOWN_S = 60;

export const MFA_CHALLENGE_MINUTES = 5;

export const MFA_CODE_LENGTH = 6;

export const MFA_BACKUP_CODE_LENGTH = 8;

export const MFA_METHODS = ["totp", "backup"] as const satisfies readonly MfaMethod[];

export const HTTP_STATUS = {
    accepted: 202,
    badRequest: 400,
    unauthorized: 401,
    notFound: 404,
    conflict: 409,
    unprocessable: 422,
    tooManyRequests: 429,
    serverError: 500,
    badGateway: 502,
    serviceUnavailable: 503,
} as const;

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
