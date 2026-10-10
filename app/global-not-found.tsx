import "@/styles/globals.css";
import type { Metadata } from "next";
import AuthShell from "@/components/auth/auth-shell";
import SystemPage from "@/components/auth/system-page";
import RootDocument from "@/components/common/root-document";
import { HAULR_BRAND } from "@/lib/data/home/brand";
import { SYSTEM_COPY } from "@/lib/data/system";
import { getSession } from "@/lib/utils/session";

const { notFound, back } = SYSTEM_COPY;

export const metadata: Metadata = { title: HAULR_BRAND.metaTitle };

export default async function GlobalNotFound() {
    const session = await getSession();

    return (
        <RootDocument>
            <AuthShell>
                <SystemPage view={notFound} back={session ? back.signedIn : back.signedOut} />
            </AuthShell>
        </RootDocument>
    );
}
