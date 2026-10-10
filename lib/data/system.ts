import type { AuthLink, AuthSignal, SystemView } from "@/lib/types";
import { DASHBOARD_ROUTE } from "@/lib/constants";
import { AUTH_COPY } from "@/lib/data/auth/shared";

const statusOf = (held: string): Record<AuthSignal, string> => ({
    origin: held,
    midway: held,
    pending: "Retrying",
    arrived: "Recovered",
    held,
});

export const SYSTEM_COPY = {
    notFound: {
        code: "404",
        label: "Not found",
        status: statusOf("Off route"),
        title: ["Off the", "map."],
        lead: "This page isn't on any route we run.",
        outcome: {
            label: "Route not found",
            body: "The address may be mistyped, or the page may have moved. Head back and pick up from there.",
        },
    } satisfies SystemView,
    serverError: {
        code: "500",
        label: "Server error",
        status: statusOf("Fault"),
        title: ["Engine", "trouble."],
        lead: "Something broke on our side. It wasn't anything you did.",
        outcome: {
            label: "Something went wrong",
            body: "Try again. If it keeps happening, contact support and quote the reference.",
        },
    } satisfies SystemView,
    forbidden: {
        code: "403",
        label: "Access denied",
        status: statusOf("Restricted"),
        title: ["Restricted", "lane."],
        lead: "This area isn't part of your role.",
        outcome: {
            label: "No access",
            body: "Your role doesn't include this area. Ask your organisation admin if you need it.",
        },
    } satisfies SystemView,
    exhausted: {
        label: "Still not working",
        body: "We've tried a few times. Contact support and quote the reference so we can trace what happened.",
    },
    reference: "Reference",
    retry: "Try again",
    retrying: "Trying again…",
    support: AUTH_COPY.links.support.label,
    back: {
        signedIn: { label: "Go to your dashboard", href: DASHBOARD_ROUTE },
        signedOut: { label: AUTH_COPY.links.home.label, href: AUTH_COPY.links.home.href },
    },
    footer: {
        label: "Other options",
        links: [AUTH_COPY.links.help, AUTH_COPY.links.support] satisfies AuthLink[],
    },
} as const;
