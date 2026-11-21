"use client";
import AuthFrame from "@/components/auth/auth-frame";
import ServerError from "@/components/auth/server-error";
import { useEffect } from "react";
import type { RouteError } from "@/lib/types";
import { reportError } from "@/lib/utils/report-error";

export default function RootError({ error, unstable_retry }: RouteError) {
    useEffect(() => {
        reportError(error, { route: window.location.pathname, errorClass: "server", correlationId: error.digest });
    }, [error]);

    return (
        <AuthFrame>
            <ServerError digest={error.digest} retry={unstable_retry} />
        </AuthFrame>
    );
}
