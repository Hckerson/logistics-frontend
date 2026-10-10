import clsx from "clsx";
import SystemPage from "@/components/auth/system-page";
import AuthSignalProvider from "@/components/providers/auth-signal-provider";
import { AUTH_COLUMNS } from "@/lib/auth/constants";
import { ENTRY_TIMELINE } from "@/lib/auth/entry";
import { SYSTEM_COPY } from "@/lib/data/system";
import { getSession } from "@/lib/utils/session";

const { notFound, back } = SYSTEM_COPY;

export default async function PublicNotFound() {
    const session = await getSession();

    return (
        <div
            style={ENTRY_TIMELINE}
            className={clsx("haulr-shell grid items-center gap-y-8 pt-[calc(var(--haulr-header)+4rem)] pb-20", AUTH_COLUMNS)}
        >
            <AuthSignalProvider>
                <SystemPage view={notFound} back={session ? back.signedIn : back.signedOut} />
            </AuthSignalProvider>
        </div>
    );
}
