import type { AuthLink } from "@/lib/types";
import { HELP_ROUTE, LOGIN_ROUTE, REGISTER_ROUTE, RESET_LINK_MINUTES } from "@/lib/constants";

export const FORGOT_COPY = {
    label: "Reset password",
    title: ["Locked", "out?"],
    lead: `Send yourself a reset link. It works for ${RESET_LINK_MINUTES} minutes.`,
    status: {
        origin: "Request link",
        midway: "Request link",
        pending: "Sending",
        arrived: "Link sent",
        held: "Held",
    },
    email: {
        name: "email",
        index: "01",
        label: "Work email",
        type: "email",
        autoComplete: "email",
        placeholder: "name@company.com",
    },
    submit: "Send reset link",
    pending: "Sending link…",
    sent: {
        label: "Check your inbox",
        body: "If an account exists for this email, a reset link is on its way.",
        countdown: "Link valid for",
        expired: "Link expired",
        expiry: `The link works for ${RESET_LINK_MINUTES} minutes. Check your spam folder if it isn't there in a few minutes.`,
        back: "Back to sign in",
        resend: "Send it again",
        resent: "Sent again",
    },
    errors: {
        email: { missing: "Enter your email address.", invalid: "Enter an email address like name@company.com." },
    },
    footer: {
        label: "Other options",
        links: [
            { id: "sign-in", label: "Back to sign in", href: LOGIN_ROUTE },
            { id: "register", label: "Create an account", href: REGISTER_ROUTE },
            { id: "help", label: "Get help", href: HELP_ROUTE },
        ] satisfies AuthLink[],
    },
} as const;
