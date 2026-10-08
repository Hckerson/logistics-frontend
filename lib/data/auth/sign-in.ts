import type { AuthLink } from "@/lib/types";
import { FORGOT_PASSWORD_ROUTE, HELP_ROUTE, INVALID_CREDENTIALS, REGISTER_ROUTE } from "@/lib/constants";

export const SIGN_IN_COPY = {
    label: "Sign in",
    title: ["Welcome", "back."],
    lead: "Shippers and carriers sign in here.",
    status: {
        origin: "Step 1 of 2",
        midway: "Step 2 of 2",
        pending: "Checking",
        arrived: "Signed in",
        held: "Held",
    },
    email: {
        name: "email",
        label: "Work email",
        type: "email",
        autoComplete: "username",
        placeholder: "name@company.com",
        next: "Continue",
    },
    password: {
        name: "password",
        label: "Password",
        autoComplete: "current-password",
        identity: "Signing in as",
        change: "Change",
        changeLabel: "Change email address",
        forgot: "Forgot password?",
    },
    submit: "Sign in",
    pending: "Signing in…",
    arrived: "Signed in",
    errors: {
        email: { missing: "Enter your email address.", invalid: "Enter an email address like name@company.com." },
        password: { missing: "Enter your password." },
        credentials: `${INVALID_CREDENTIALS}.`,
    },
    recovery: {
        label: "Trouble signing in",
        links: [
            { id: "reset", label: "Reset your password", href: FORGOT_PASSWORD_ROUTE },
            { id: "register", label: "Create an account", href: REGISTER_ROUTE },
            { id: "help", label: "Get help signing in", href: HELP_ROUTE },
        ] satisfies AuthLink[],
    },
} as const;
