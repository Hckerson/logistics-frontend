import type { NextConfig } from "next";
import { DRIVER_HEADERS, DRIVER_PATHS, SECURITY_HEADERS } from "./lib/security/headers";

const nextConfig: NextConfig = {
    poweredByHeader: false,
    experimental: { authInterrupts: true, globalNotFound: true },
    headers: async () => [
        { source: "/:path*", headers: SECURITY_HEADERS },
        { source: DRIVER_PATHS, headers: DRIVER_HEADERS },
    ],
};

export default nextConfig;
