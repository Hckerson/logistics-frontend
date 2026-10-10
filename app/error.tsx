"use client";
import AuthFrame from "@/components/auth/auth-frame";
import ServerError from "@/components/auth/server-error";
import type { RouteError } from "@/lib/types";

export default function RootError({ error, unstable_retry }: RouteError) {
    return (
        <AuthFrame>
            <ServerError digest={error.digest} retry={unstable_retry} />
        </AuthFrame>
    );
}
