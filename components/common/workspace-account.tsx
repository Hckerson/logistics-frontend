"use client";
import { useRouter } from "next/navigation";
import Menu from "@/components/ui/menu";
import { useAnnounce } from "@/components/providers/announcer-provider";
import { useSession } from "@/components/providers/session-provider";
import { LOGIN_ROUTE } from "@/lib/constants";
import { SHELL_COPY } from "@/lib/data/shell";
import { ERROR_COPY } from "@/lib/errors/constants";
import { useLogout } from "@/lib/hooks/use-logout";

export default function WorkspaceAccount() {
    const user = useSession();
    const router = useRouter();
    const logout = useLogout();
    const announce = useAnnounce();

    const act = (id: string) => {
        if (id !== SHELL_COPY.signOutId || logout.isPending) return;
        logout.mutate(undefined, {
            onSuccess: () => {
                announce({ message: SHELL_COPY.signedOut });
                router.push(LOGIN_ROUTE);
                router.refresh();
            },
            onError: () => announce({ message: ERROR_COPY.offline, tone: "assertive" }),
        });
    };

    if (!user) return null;

    return <Menu label={SHELL_COPY.account} text={user.email} items={SHELL_COPY.menu} onAction={act} tone="ghost" size="sm" pending={logout.isPending} />;
}
