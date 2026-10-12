import { appRoutes, INTERNAL_ROUTE_PREFIXES, ROUTE_PREFIXES, WORKSPACE_ROUTE_PREFIXES } from "@/lib/app-routes";
import type { AccountSide, MfaMethod, SupportContext } from "@/lib/types";

export const DATE_VALUE_FORMAT = "yyyy-MM-dd";

export const SESSION_COOKIE = "session";

export const MFA_COOKIE = "mfa_challenge";

export const AUTH_ROUTE_PREFIX = ROUTE_PREFIXES.auth;

export const LOGIN_ROUTE = appRoutes.login();

export const HOME_ROUTE = appRoutes.home();

export const DASHBOARD_ROUTE = appRoutes.dashboard();

export const REGISTER_ROUTE = appRoutes.register();

export const FORGOT_PASSWORD_ROUTE = appRoutes.forgotPassword();

export const RESET_PASSWORD_ROUTE = appRoutes.resetPassword();

export const VERIFY_ROUTE = appRoutes.verify();

export const INVITE_ROUTE = `${AUTH_ROUTE_PREFIX}/invite`;

export const inviteRoute = appRoutes.invite;

export const DRIVER_HOME_ROUTE = appRoutes.driverHome();

export const RATE_ESTIMATOR_ROUTE = appRoutes.rateEstimator();

export const HELP_ROUTE = appRoutes.help();

export const SUPPORT_ROUTE = appRoutes.support();

export const legalRoute = appRoutes.legal;

export const ACCOUNT_SIDES = ["shipper", "carrier"] as const satisfies readonly AccountSide[];

export const registerRoute = (side: AccountSide) => `${REGISTER_ROUTE}?side=${side}`;

export const loginRoute = (next: string) => `${LOGIN_ROUTE}?next=${encodeURIComponent(next)}`;

export const MFA_STEP = "code";

export const mfaRoute = (next: string) => `${VERIFY_ROUTE}?step=${MFA_STEP}&next=${encodeURIComponent(next)}`;

export const helpArticleRoute = appRoutes.helpArticle;

export const POST_LOAD_ROUTE = appRoutes.postLoad();

export const postLoadRoute = (lane: string, quote?: "custom") =>
    `${POST_LOAD_ROUTE}?lane=${encodeURIComponent(lane)}${quote ? `&quote=${quote}` : ""}`;

export const supportRoute = (context: SupportContext) => {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(context)) if (value) query.set(key, value);
    return `${SUPPORT_ROUTE}?${query}`;
};

export const ACCOUNT_RECOVERY_ROUTE = supportRoute({ topic: "account" });

export const ERROR_RETRY_LIMIT = 3;

export const MAIN_CONTENT_ID = "main";

export const PROTECTED_ROUTE_PREFIXES: readonly string[] = [...WORKSPACE_ROUTE_PREFIXES, ...INTERNAL_ROUTE_PREFIXES];

export const SIGNED_IN_ACCESS_ROUTES = [VERIFY_ROUTE, INVITE_ROUTE];

export const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5100";

export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export const API_MOCKS = process.env.NEXT_PUBLIC_API_MOCKS !== "off";

export const MOCK_LATENCY_MS = { min: 300, max: 800 } as const;

export const TIME_MS = { second: 1_000, minute: 60_000, hour: 3_600_000, day: 86_400_000 } as const;

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
    ok: 200,
    created: 201,
    accepted: 202,
    badRequest: 400,
    unauthorized: 401,
    forbidden: 403,
    notFound: 404,
    requestTimeout: 408,
    conflict: 409,
    preconditionFailed: 412,
    unprocessable: 422,
    tooManyRequests: 429,
    serverError: 500,
    badGateway: 502,
    serviceUnavailable: 503,
    gatewayTimeout: 504,
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
