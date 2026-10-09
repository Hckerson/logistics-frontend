import type { AuthLink } from "@/lib/types";
import { ACCOUNT_RECOVERY_ROUTE, LOGIN_ROUTE, MFA_BACKUP_CODE_LENGTH, MFA_CHALLENGE_MINUTES, MFA_CODE_LENGTH } from "@/lib/constants";
import { AUTH_COPY } from "@/lib/data/auth/shared";

export const MFA_COPY = {
    label: "Two-step sign-in",
    title: ["Enter your", "code."],
    lead: {
        totp: `Open your authenticator app for the ${MFA_CODE_LENGTH}-digit code.`,
        backup: "Each backup code works once.",
    },
    status: {
        origin: "Code needed",
        midway: "Code needed",
        pending: "Checking",
        arrived: "Signed in",
        held: "Held",
    },
    account: "Signing in as",
    fields: {
        totp: {
            name: "code",
            index: "01",
            label: "Authentication code",
            autoComplete: "one-time-code",
            inputMode: "numeric",
            pattern: "[0-9]*",
            maxLength: MFA_CODE_LENGTH,
        },
        backup: {
            name: "code",
            index: "01",
            label: "Backup code",
            autoComplete: "off",
            autoCapitalize: "characters",
            placeholder: "XXXX-XXXX",
        },
    },
    rules: { totp: `${MFA_CODE_LENGTH} digits`, backup: "Works once" },
    switch: { totp: "Use a backup code instead", backup: "Use your authenticator app" },
    help: { label: "Can't access your codes?", href: ACCOUNT_RECOVERY_ROUTE },
    submit: "Verify code",
    pending: "Checking code…",
    arrived: "Signed in",
    errors: {
        totp: { missing: `Enter the ${MFA_CODE_LENGTH}-digit code.`, invalid: `Enter all ${MFA_CODE_LENGTH} digits.` },
        backup: { missing: "Enter a backup code.", invalid: `Backup codes are ${MFA_BACKUP_CODE_LENGTH} letters and numbers.` },
        wrong: {
            one: "That code didn't work. 1 attempt left.",
            other: "That code didn't work. {count} attempts left.",
            unknown: "That code didn't work.",
        },
    },
    restart: [{ id: "sign-in", label: "Back to sign in", href: LOGIN_ROUTE }] satisfies AuthLink[],
    expired: {
        title: ["Sign-in", "timed out."],
        lead: `The code step stays open for ${MFA_CHALLENGE_MINUTES} minutes.`,
        label: "Sign-in expired",
        body: "For your security, sign in again to get a fresh code step.",
        action: "Sign in again",
    },
    footer: AUTH_COPY.recovery,
} as const;
