"use client";
import "@/styles/globals.css";
import AuthFrame from "@/components/auth/auth-frame";
import ServerError from "@/components/auth/server-error";
import RootDocument from "@/components/common/root-document";
import { HAULR_BRAND } from "@/lib/data/home/brand";
import { useEffect } from "react";
import type { RouteError } from "@/lib/types";
import { reportError } from "@/lib/utils/report-error";

export default function GlobalError({ error, unstable_retry }: RouteError) {
    useEffect(() => {
        reportError(error, { route: window.location.pathname, errorClass: "server", correlationId: error.digest });
    }, [error]);

    return (
        <RootDocument>
            <title>{HAULR_BRAND.metaTitle}</title>
            <AuthFrame>
                <ServerError digest={error.digest} retry={unstable_retry} />
            </AuthFrame>
        </RootDocument>
    );
}
