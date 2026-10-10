import type { HelpCategory, HelpCategoryKey } from "@/lib/types";

export const HELP_CATEGORIES: Record<HelpCategoryKey, Omit<HelpCategory, "key">> = {
    "getting-started": { title: "Getting started", summary: "Set up an account and find your way around." },
    shipping: { title: "Shipping with Haulr", summary: "Price, post and manage your loads." },
    hauling: { title: "Hauling with Haulr", summary: "Find loads, book them and get paid." },
    drivers: { title: "Drivers", summary: "Run a trip from the cab." },
    billing: { title: "Billing and payments", summary: "Invoices, settlements and charges." },
    tracking: { title: "Tracking", summary: "Follow a load and share where it is." },
    claims: { title: "Claims", summary: "Report damage, loss or shortage." },
    account: { title: "Account and security", summary: "Sign-in, passwords and two-step codes." },
    compliance: { title: "Compliance", summary: "Keep your documents and authority current." },
    integrations: { title: "Integrations and API", summary: "Connect Haulr to your own systems." },
    administration: { title: "Security and administration", summary: "Members, roles and access." },
};
