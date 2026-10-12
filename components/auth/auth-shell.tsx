import type { ReactNode } from "react";
import AuthFrame from "@/components/auth/auth-frame";
import LaneScene from "@/components/auth/lane-scene";
import SessionProvider from "@/components/providers/session-provider";
import { getSession } from "@/lib/utils/session";
import { toSessionUser } from "@/lib/utils/session-user";

interface Props {
    children: ReactNode;
}

export default async function AuthShell({ children }: Props) {
    const user = toSessionUser(await getSession());

    return (
        <SessionProvider user={user}>
            <AuthFrame scene={<LaneScene />}>{children}</AuthFrame>
        </SessionProvider>
    );
}
