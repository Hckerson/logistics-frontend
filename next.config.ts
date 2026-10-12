import type { NextConfig } from "next";
import { LOCATION_HEADERS, LOCATION_PATHS, SECURITY_HEADERS } from "./lib/security/headers";

const nextConfig: NextConfig = {
    poweredByHeader: false,
    experimental: { authInterrupts: true, globalNotFound: true },
    headers: async () => [
        { source: "/:path*", headers: SECURITY_HEADERS },
        ...LOCATION_PATHS.map((source) => ({ source, headers: LOCATION_HEADERS })),
    ],
};

export default nextConfig;
