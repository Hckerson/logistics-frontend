import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: { authInterrupts: true, globalNotFound: true },
};

export default nextConfig;
