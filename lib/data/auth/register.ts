import type { AuthLink } from "@/lib/types";
import {
    FORGOT_PASSWORD_ROUTE,
    HELP_ROUTE,
    LOGIN_ROUTE,
    PASSWORD_MIN_LENGTH,
    SESSION_UNAVAILABLE,
    legalRoute,
} from "@/lib/constants";

const signIn = { id: "sign-in", label: "Sign in", href: LOGIN_ROUTE };
const reset = { id: "reset", label: "Reset your password", href: FORGOT_PASSWORD_ROUTE };
const terms = { id: "terms", label: "Terms of service", href: legalRoute("terms") };

export const REGISTER_COPY = {
    label: "Create account",
    title: ["Ship it.", "Or haul it."],
    lead: "One Haulr account, set up for the side of the load you're on.",
    status: {
        origin: "Step 1 of 2",
        midway: "Step 2 of 2",
        pending: "Creating",
        arrived: "Created",
        held: "Held",
    },
    side: {
        legend: "How will you use Haulr?",
        next: "Continue",
        options: [
            { value: "shipper", title: "I ship freight", detail: "Price lanes, post loads and track every truck." },
            { value: "carrier", title: "I haul freight", detail: "Find loads and book them at the posted rate." },
        ],
        identity: "Account side",
        names: { shipper: "Shipper", carrier: "Carrier" },
        change: "Change",
        changeLabel: "Change account side",
    },
    fields: {
        fullName: { name: "fullName", label: "Full name", autoComplete: "name" },
        email: {
            name: "email",
            label: "Work email",
            type: "email",
            autoComplete: "email",
            placeholder: "name@company.com",
        },
        password: { name: "password", label: "Password", autoComplete: "new-password" },
    },
    rule: `At least ${PASSWORD_MIN_LENGTH} characters`,
    consent: {
        lead: "I agree to the",
        and: "and",
        read: ", and I have read the",
        end: ".",
        documents: {
            shipper: [terms, { id: "shipper-terms", label: "Shipper terms", href: legalRoute("shipper-terms") }],
            carrier: [terms, { id: "carrier-agreement", label: "Carrier agreement", href: legalRoute("carrier-agreement") }],
        },
        privacy: { id: "privacy", label: "Privacy policy", href: legalRoute("privacy") },
    },
    submit: "Create account",
    pending: "Creating your account…",
    arrived: "Account created",
    errors: {
        side: { missing: "Choose whether you ship or haul freight." },
        fullName: { missing: "Enter your full name." },
        email: { missing: "Enter your email address.", invalid: "Enter an email address like name@company.com." },
        password: { missing: "Create a password.", short: `Use at least ${PASSWORD_MIN_LENGTH} characters.` },
        consent: { missing: "Agree to the terms to create your account." },
        conflict: "An account already uses this email.",
        session: `${SESSION_UNAVAILABLE}. Sign in to continue.`,
        rejected: "We couldn't create the account. Check your details, then try again.",
    },
    conflictLinks: [signIn, reset] satisfies AuthLink[],
    sessionLinks: [signIn] satisfies AuthLink[],
    footer: {
        label: "Already registered",
        links: [
            { id: "sign-in", label: "Already have an account? Sign in", href: LOGIN_ROUTE },
            { id: "help", label: "Get help", href: HELP_ROUTE },
        ] satisfies AuthLink[],
    },
} as const;
