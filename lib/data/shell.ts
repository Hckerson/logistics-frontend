import { Dashboard, Help, Logout } from "@carbon/icons-react";
import { appRoutes } from "@/lib/app-routes";
import type { MenuEntry } from "@/lib/types";

export const SHELL_COPY = {
    skipToContent: "Skip to content",
    account: "Account",
    signedOut: "Signed out.",
    signOutId: "sign-out",
    menu: [
        { id: "dashboard", label: "Dashboard", icon: Dashboard, href: appRoutes.dashboard() },
        { id: "help", label: "Help center", icon: Help, href: appRoutes.help() },
        { id: "sign-out", label: "Sign out", icon: Logout },
    ] satisfies MenuEntry[],
} as const;
