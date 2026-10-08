import type { AuthLink } from "@/lib/types";
import { FORGOT_PASSWORD_ROUTE, HELP_ROUTE, INVALID_CREDENTIALS, REGISTER_ROUTE } from "@/lib/constants";

export const SIGN_IN_COPY = {
    label: "Sign in",
    title: "Welcome back.",
    lead: "Shippers and carriers sign in here.",
    fields: {
        email: { name: "email", label: "Email", type: "email", autoComplete: "username" },
        password: { name: "password", label: "Password", autoComplete: "current-password" },
    },
    reveal: "Show password",
    submit: "Sign in",
    pending: "Signing in…",
    errors: {
        email: { missing: "Enter your email address.", invalid: "Enter an email address like name@company.com." },
        password: { missing: "Enter your password." },
        credentials: `${INVALID_CREDENTIALS}.`,
        rateLimit: "Too many attempts. Try again in {minutes} min.",
        rateLimitUnknown: "Too many attempts. Wait a few minutes, then try again.",
        network: "We couldn't reach Haulr. Check your connection, then try again.",
    },
    summary: { heading: "There's a problem", one: "1 problem", other: "{count} problems" },
    recovery: {
        label: "Trouble signing in",
        links: [
            { id: "reset", label: "Reset your password", href: FORGOT_PASSWORD_ROUTE },
            { id: "register", label: "Create an account", href: REGISTER_ROUTE },
            { id: "help", label: "Get help signing in", href: HELP_ROUTE },
        ] satisfies AuthLink[],
    },
    aside: {
        title: ["Back on", "the lane."],
        body: "Every load you price, book, track or haul is waiting on the same record you left it on.",
        route: { from: "CHI", to: "DAL" },
    },
} as const;
