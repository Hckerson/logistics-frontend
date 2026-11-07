import { Dashboard, Help, Logout } from "@carbon/icons-react";
import { appRoutes } from "@/lib/app-routes";
import type { MenuEntry, QuickFindType } from "@/lib/types";

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
    quickFind: {
        trigger: "Find a load",
        title: "Quick find",
        label: "Load reference, PO or BOL number",
        placeholder: "HL-7K2M9QXA, PO or BOL",
        results: "Search results",
        keys: { apple: ["⌘", "K"], other: ["Ctrl", "K"] },
        groups: { load: "Loads", facility: "Facilities", member: "People", organization: "Organisations" } satisfies Record<QuickFindType, string>,
        recent: "Recent searches",
        hint: "Type a load reference, PO or BOL number.",
        short: "Type at least 2 characters.",
        none: "Nothing matches “{term}”. Load references look like HL-7K2M9QXA.",
        found: { one: "1 result", other: "{count} results" },
        slow: "Still searching…",
        offline: "Searching needs a connection.",
    },
    connectivity: {
        offline: "You're offline since {time}. What you see may be out of date, and changes need a connection.",
        back: "Back online. Refreshing what you see.",
    },
    session: {
        title: "Still there?",
        kicker: "Session",
        body: "You've been inactive for a while. For your security you'll be signed out in {time} unless you stay signed in.",
        timer: "Time left",
        stay: "Stay signed in",
        extending: "Extending…",
        signOut: "Sign out",
        failed: "We couldn't extend your session. Save anything you need, then sign in again.",
    },
} as const;
