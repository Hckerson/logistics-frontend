import type { AuthLink, ResetField } from "@/lib/types";
import { FORGOT_PASSWORD_ROUTE, RESET_LINK_MINUTES } from "@/lib/constants";
import { AUTH_COPY } from "@/lib/data/auth/shared";

const requestLink = { id: "request", label: "Request a new link", href: FORGOT_PASSWORD_ROUTE } satisfies AuthLink;

export const RESET_FIELDS: readonly ResetField[] = ["password", "confirm"];

export const RESET_COPY = {
    label: "Reset password",
    title: ["Back on", "the road."],
    lead: "Choose a new password for your Haulr account.",
    status: {
        origin: "New password",
        midway: "New password",
        pending: "Saving",
        arrived: "Saved",
        held: "Held",
    },
    account: "Account",
    fields: {
        password: {
            name: "password",
            index: "01",
            label: "New password",
            autoComplete: "new-password",
            revealLabel: "Show new password",
        },
        confirm: {
            name: "confirm",
            index: "02",
            label: "Confirm password",
            autoComplete: "new-password",
            revealLabel: "Show confirmation",
        },
    },
    rules: { password: AUTH_COPY.password.rule, confirm: "Matches" },
    notice: "Saving signs this account out on every other device.",
    submit: "Save password",
    pending: "Saving…",
    arrived: "Password saved",
    saved: {
        label: "Password saved",
        body: "Other devices were signed out. Sign in with your new password.",
        action: "Sign in",
    },
    expired: {
        title: AUTH_COPY.link.expired,
        lead: `Reset links work once, for ${RESET_LINK_MINUTES} minutes.`,
        label: AUTH_COPY.link.dead,
        body: "This reset link expired or was already used. Request a new one, then open the newest email.",
        action: requestLink.label,
        href: requestLink.href,
    },
    errors: {
        password: {
            missing: "Enter a new password.",
            short: AUTH_COPY.password.short,
            breached: "This password has appeared in a data breach. Choose a different one.",
        },
        confirm: { missing: "Confirm your new password.", mismatch: "Passwords don't match." },
    },
    dead: { message: "This reset link stopped working.", links: [requestLink] },
    footer: AUTH_COPY.recovery,
} as const;
