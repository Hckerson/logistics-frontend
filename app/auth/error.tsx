"use client";
import ServerError from "@/components/auth/server-error";
import type { RouteError } from "@/lib/types";

export default function AuthError({ error, unstable_retry }: RouteError) {
    return <ServerError digest={error.digest} retry={unstable_retry} />;
}
