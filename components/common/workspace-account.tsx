"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import Menu from "@/components/ui/menu";
import { useAnnounce } from "@/components/providers/announcer-provider";
import { useSession } from "@/components/providers/session-provider";
import { hasAnyRole, ROLE_GROUPS } from "@/lib/auth/roles";
import { LOGIN_ROUTE } from "@/lib/constants";
import { DRIVER_COPY } from "@/lib/data/driver/copy";
import { SHELL_COPY } from "@/lib/data/shell";
import { ERROR_COPY } from "@/lib/errors/constants";
import { useLogout } from "@/lib/hooks/use-logout";
import { offlineQueue } from "@/lib/utils/offline-queue";
import { pluralize } from "@/lib/utils/plural";

const { sync } = DRIVER_COPY;

export default function WorkspaceAccount() {
    const user = useSession();
    const router = useRouter();
    const logout = useLogout();
    const announce = useAnnounce();
    const [waiting, setWaiting] = useState(0);
    const driver = hasAnyRole(user?.roles ?? [], ROLE_GROUPS.driver);

    const signOut = () => {
        setWaiting(0);
        if (driver && user) void offlineQueue.clearCache(user.id).catch(() => undefined);
        logout.mutate(undefined, {
            onSuccess: () => {
                announce({ message: SHELL_COPY.signedOut });
                router.push(LOGIN_ROUTE);
                router.refresh();
            },
            onError: () => announce({ message: ERROR_COPY.offline, tone: "assertive" }),
        });
    };

    const act = async (id: string) => {
        if (id !== SHELL_COPY.signOutId || logout.isPending || !user) return;
        if (!driver) return signOut();
        await offlineQueue.load(user.id).catch(() => undefined);
        const pending = offlineQueue.snapshot().entries.filter((entry) => !entry.failure).length;
        if (pending > 0) setWaiting(pending);
        else signOut();
    };

    if (!user) return null;

    return (
        <>
            <Menu label={SHELL_COPY.account} text={user.email} items={SHELL_COPY.menu} onAction={(id) => void act(id)} tone="ghost" size="sm" pending={logout.isPending} />
            <ConfirmDialog
                isOpen={waiting > 0}
                onOpenChange={(open) => {
                    if (!open) setWaiting(0);
                }}
                title={sync.signOutTitle}
                consequence={pluralize(waiting, sync.signOutBody)}
                confirmLabel={sync.signOutAnyway}
                cancelLabel={sync.stay}
                onConfirm={signOut}
                pending={logout.isPending}
            />
        </>
    );
}
