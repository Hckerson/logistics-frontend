import type { AuthLink } from "@/lib/types";
import { AUTH_COPY } from "@/lib/data/auth/shared";

export const HOLDING_COPY = {
    label: "Workspace",
    title: ["You're", "signed in."],
    lead: "Your workspace opens here as it comes online.",
    status: {
        origin: "Signed in",
        midway: "Signed in",
        pending: "Signing out",
        arrived: "Signed in",
        held: "Held",
    },
    outcome: {
        label: "Signed in",
        body: "Shipper and carrier workspaces open here as they're built. You'll land on yours automatically.",
    },
    signOut: "Sign out",
    pending: "Signing out…",
    footer: {
        label: "Other options",
        links: [AUTH_COPY.links.home, AUTH_COPY.links.help] satisfies AuthLink[],
    },
} as const;
