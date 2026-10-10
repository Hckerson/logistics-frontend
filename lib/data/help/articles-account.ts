import type { HelpArticle } from "@/lib/types";

export const ACCOUNT_ARTICLES: readonly HelpArticle[] = [
    {
        slug: "reset-password",
        category: "account",
        title: "Reset your password",
        summary: "Request a reset link and choose a new password.",
        updated: "2026-10-08",
        steps: [
            { id: "request", title: "Request a reset link", body: ["Choose Forgot password on the sign-in page and enter your work email."] },
            { id: "open", title: "Open the link", body: ["Reset links work once, for 30 minutes. If it has expired, request a new one and use the newest email."] },
            { id: "choose", title: "Choose a new password", body: ["Use at least 8 characters. Saving signs your account out on every other device."] },
        ],
        related: ["two-step-sign-in", "verify-email"],
    },
    {
        slug: "two-step-sign-in",
        category: "account",
        title: "Sign in with a two-step code",
        summary: "Enter the code from your authenticator app, or a backup code.",
        updated: "2026-10-09",
        steps: [
            { id: "code", title: "Enter the 6-digit code", body: ["After your password, open your authenticator app and type the current code. It submits when the sixth digit is in."] },
            { id: "backup", title: "Use a backup code", body: ["Lost your phone? Choose Use a backup code instead. Each backup code works once."] },
            { id: "locked", title: "If you're locked out", body: ["Five wrong codes pause sign-in for a few minutes. If you have no codes left, contact support to recover the account."] },
        ],
        related: ["reset-password", "manage-access"],
    },
    {
        slug: "verify-email",
        category: "account",
        title: "Verify your email address",
        summary: "Confirm the address you signed up with.",
        updated: "2026-10-08",
        steps: [
            { id: "open", title: "Open the verification email", body: ["The link works for 24 hours, on any device."] },
            { id: "resend", title: "Send it again", body: ["Didn't get it? Check spam, then resend from the verification page after the short wait."] },
        ],
        related: ["create-account", "reset-password"],
    },
    {
        slug: "manage-access",
        category: "administration",
        title: "Manage who can access your organisation",
        summary: "Invite members, assign roles and remove access.",
        updated: "2026-09-25",
        steps: [
            { id: "invite", title: "Invite a member", body: ["Admins invite people by email from Members. The invitation lasts 7 days."] },
            { id: "roles", title: "Assign roles", body: ["Roles decide what each member can see and do. Approvers and finance roles require two-step sign-in."] },
            { id: "remove", title: "Remove access", body: ["Removing a member signs them out everywhere within 5 minutes."] },
        ],
        related: ["two-step-sign-in", "api-access"],
    },
];
