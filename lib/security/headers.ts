const TWO_YEARS_SECONDS = 63072000;

export const NONCE_HEADER = "x-nonce";

export const CSP_HEADER = "Content-Security-Policy";

export const LOCATION_PATHS = ["/driver/:path*", "/auth/invite/:path*"] as const;

export const MAP_ORIGINS = { tiles: "https://api.protomaps.com", assets: "https://protomaps.github.io" } as const;

export const SECURITY_HEADERS = [
    { key: "Strict-Transport-Security", value: `max-age=${TWO_YEARS_SECONDS}; includeSubDomains; preload` },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=()" },
];

export const LOCATION_HEADERS = [{ key: "Permissions-Policy", value: "camera=(self), geolocation=(self), microphone=()" }];

export const contentSecurityPolicy = (nonce: string, development: boolean) =>
    [
        "default-src 'self'",
        `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${development ? " 'unsafe-eval'" : ""}`,
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' blob: data:",
        "font-src 'self' data:",
        `connect-src 'self' ${MAP_ORIGINS.tiles} ${MAP_ORIGINS.assets}`,
        "worker-src 'self' blob:",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        ...(development ? [] : ["upgrade-insecure-requests"]),
    ].join("; ");
