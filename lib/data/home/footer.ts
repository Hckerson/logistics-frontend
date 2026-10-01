import type { FooterGroup } from "@/lib/types";
import {
    HELP_ROUTE,
    LOGIN_ROUTE,
    RATE_ESTIMATOR_ROUTE,
    SUPPORT_ROUTE,
    legalRoute,
    registerRoute,
} from "@/lib/constants";

export const FOOTER_GROUPS: readonly FooterGroup[] = [
    {
        id: "shippers",
        label: "Shippers",
        links: [
            { id: "price", label: "Get a price", href: RATE_ESTIMATOR_ROUTE },
            { id: "ship", label: "Ship with Haulr", href: registerRoute("shipper") },
        ],
    },
    {
        id: "carriers",
        label: "Carriers",
        links: [
            { id: "haul", label: "Haul with Haulr", href: registerRoute("carrier") },
            { id: "sign-in", label: "Sign in", href: LOGIN_ROUTE },
        ],
    },
    {
        id: "company",
        label: "Help",
        links: [
            { id: "help", label: "Help center", href: HELP_ROUTE },
            { id: "support", label: "Contact support", href: SUPPORT_ROUTE },
            { id: "terms", label: "Terms", href: legalRoute("terms") },
            { id: "privacy", label: "Privacy", href: legalRoute("privacy") },
        ],
    },
];

export const FOOTER_COPY = {
    statement: "Haulr is a design study. Every figure, lane and load on this page is placeholder.",
    navLabel: "Footer",
} as const;
