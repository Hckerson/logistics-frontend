const TWO_YEARS_SECONDS = 63072000;

export const NONCE_HEADER = "x-nonce";

export const CSP_HEADER = "Content-Security-Policy";

export const DRIVER_PATHS = "/driver/:path*";

export const SECURITY_HEADERS = [
    { key: "Strict-Transport-Security", value: `max-age=${TWO_YEARS_SECONDS}; includeSubDomains; preload` },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=()" },
];

export const DRIVER_HEADERS = [{ key: "Permissions-Policy", value: "camera=(self), geolocation=(self), microphone=()" }];

export const contentSecurityPolicy = (nonce: string, development: boolean) =>
    [
        "default-src 'self'",
        `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${development ? " 'unsafe-eval'" : ""}`,
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' blob: data:",
        "font-src 'self' data:",
        "connect-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        ...(development ? [] : ["upgrade-insecure-requests"]),
    ].join("; ");
