import type { VerifyStatus, VerifyView } from "@/lib/types";
import { LOGIN_ROUTE, VERIFICATION_LINK_HOURS, VERIFY_ROUTE } from "@/lib/constants";
import { AUTH_COPY } from "@/lib/data/auth/shared";

const lead = "Confirm your email to finish setting up Haulr.";

export const VERIFY_COPY = {
    label: "Verify email",
    status: {
        origin: "Check inbox",
        midway: "Check inbox",
        pending: "Verifying",
        arrived: "Verified",
        held: "Held",
    },
    states: {
        inbox: {
            tone: "accent",
            title: ["Check your", "inbox."],
            lead,
            label: "Link sent",
            body: `Open the link we emailed you, on any device. It works for ${VERIFICATION_LINK_HOURS} hours. Check spam if it isn't there in a few minutes.`,
        },
        verifying: {
            tone: "pending",
            title: ["Checking", "your link."],
            lead,
            label: "Verifying your email…",
            body: "This takes a moment.",
        },
        verified: {
            tone: "accent",
            title: ["Email", "verified."],
            lead: "You're cleared to roll.",
            label: "Email verified",
            body: "Your account is confirmed. Continue to finish setting up.",
        },
        already: {
            tone: "accent",
            title: ["Already", "verified."],
            lead: "This email was confirmed earlier.",
            label: "Already verified",
            body: "Nothing more to do here. Continue to Haulr.",
        },
        expired: {
            tone: "error",
            title: AUTH_COPY.link.expired,
            lead: `Verification links work for ${VERIFICATION_LINK_HOURS} hours.`,
            label: AUTH_COPY.link.dead,
            body: "Send a fresh link to your inbox, then open the newest email.",
        },
        failed: {
            tone: "error",
            title: ["Not verified", "yet."],
            lead: "We couldn't reach Haulr to confirm your email.",
            label: "Couldn't verify",
            body: "Your link still works. Try again in a moment.",
        },
    } satisfies Record<VerifyStatus, VerifyView>,
    resend: { ready: "Resend email", fresh: "Send a new link", wait: "Resend in {time}", pending: "Sending…", sent: "Sent again" },
    retry: "Try again",
    proceed: "Continue",
    signIn: {
        message: "Sign in to get a new verification link.",
        links: [{ id: "sign-in", label: "Sign in", href: `${LOGIN_ROUTE}?next=${encodeURIComponent(VERIFY_ROUTE)}` }],
    },
    footer: AUTH_COPY.recovery,
} as const;
