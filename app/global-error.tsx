"use client";
import "@/styles/globals.css";
import AuthFrame from "@/components/auth/auth-frame";
import ServerError from "@/components/auth/server-error";
import RootDocument from "@/components/common/root-document";
import { HAULR_BRAND } from "@/lib/data/home/brand";
import type { RouteError } from "@/lib/types";

export default function GlobalError({ error, unstable_retry }: RouteError) {
    return (
        <RootDocument>
            <title>{HAULR_BRAND.metaTitle}</title>
            <AuthFrame>
                <ServerError digest={error.digest} retry={unstable_retry} />
            </AuthFrame>
        </RootDocument>
    );
}
