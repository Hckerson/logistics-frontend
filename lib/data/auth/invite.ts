import type { AuthLink, TeamRole } from "@/lib/types";
import { ACCOUNT_RECOVERY_ROUTE, DASHBOARD_ROUTE, DRIVER_HOME_ROUTE, LOGIN_ROUTE } from "@/lib/constants";
import { AUTH_COPY } from "@/lib/data/auth/shared";
import { REGISTER_COPY } from "@/lib/data/auth/register";
import { INVITATION_DAYS } from "@/lib/team/constants";

const signIn = { id: "sign-in", label: "Sign in", href: LOGIN_ROUTE } satisfies AuthLink;

export const INVITE_COPY = {
    label: "Invitation",
    status: { origin: "Invited", midway: "Invited", pending: "Joining", arrived: "Joined", held: "Held" },
    roles: {
        "shipper.admin": "an admin",
        "shipper.member": "a member",
        "carrier.admin": "an admin",
        "carrier.dispatcher": "a dispatcher",
        "carrier.driver": "a driver",
    } satisfies Record<TeamRole, string>,
    titles: {
        "shipper.admin": "Admin",
        "shipper.member": "Member",
        "carrier.admin": "Admin",
        "carrier.dispatcher": "Dispatcher",
        "carrier.driver": "Driver",
    } satisfies Record<TeamRole, string>,
    eyebrow: "{organisation} · {title}",
    title: ["You're", "invited."],
    lead: "{inviter} invited you to join the team on Haulr.",
    invited: "Invited email",
    signedInAs: "Signed in as",
    fields: {
        fullName: { name: "name", index: "01", label: "Full name", autoComplete: "name" },
        password: { name: "password", index: "02", label: "Create a password", autoComplete: "new-password" },
    },
    rule: REGISTER_COPY.rule,
    submit: "Join {organisation}",
    accept: "Accept and join",
    pending: "Joining…",
    joined: "Joined",
    errors: {
        fullName: REGISTER_COPY.errors.fullName,
        password: REGISTER_COPY.errors.password,
        consent: { missing: "Agree to the terms to join." },
    },
    refusals: {
        gone: { message: "This invitation stopped working. Ask {inviter} to send a new one." },
        accepted: { message: "This invitation was already accepted.", links: [signIn] },
        existing: { message: "An account already uses this email. Sign in to accept.", links: [signIn] },
        elsewhere: { message: "This email belongs to another company on Haulr.", links: [signIn] },
        sso: { message: "{organisation} signs in through your company. Use company sign-in to join." },
        mismatch: { message: "This invitation is for a different account. Switch account to accept." },
    },
    states: {
        unknown: {
            title: ["Link not", "found."],
            lead: "This invitation link doesn't work.",
            label: "Link not recognised",
            body: "Open the newest invitation email or text, or ask the person who invited you to send it again.",
            action: { label: "Get help", href: ACCOUNT_RECOVERY_ROUTE },
        },
        expired: {
            title: ["Invite", "expired."],
            lead: `Invitations work for ${INVITATION_DAYS} days.`,
            label: "Invitation expired",
            body: "Ask {inviter} to send you a new invitation to {organisation}.",
            action: { label: "Get help", href: ACCOUNT_RECOVERY_ROUTE },
        },
        revoked: {
            title: ["Invite", "withdrawn."],
            lead: "The company took this invitation back.",
            label: "Invitation withdrawn",
            body: "Ask {inviter} if you still need access to {organisation}.",
            action: { label: "Get help", href: ACCOUNT_RECOVERY_ROUTE },
        },
        accepted: {
            title: ["Already", "joined."],
            lead: "This invitation has been used.",
            label: "Already accepted",
            body: "{email} is already a member of {organisation}. Sign in to carry on.",
            action: { label: "Sign in", href: LOGIN_ROUTE },
        },
        elsewhere: {
            title: ["Already", "on a team."],
            lead: "A Haulr account belongs to one company at a time.",
            label: "Account belongs to another company",
            body: "{email} already works with another company on Haulr. Ask {inviter} to invite a different email, or contact support to move the account.",
            action: { label: "Contact support", href: ACCOUNT_RECOVERY_ROUTE },
        },
        sso: {
            label: "Company sign-in",
            body: "{organisation} signs in through your company's identity provider, so there's no Haulr password to set.",
            action: { label: "Continue with company sign-in", href: LOGIN_ROUTE },
        },
        signIn: { label: "You already have an account", body: "Sign in as {email} to accept. You'll come straight back here.", action: "Sign in to accept" },
        switch: {
            label: "Signed in as someone else",
            pending: "Signing out…",
            existing: { body: "This invitation is for {email}. You're signed in as {viewer}.", action: "Switch account" },
            new: { body: "This invitation is for {email}, who doesn't have a Haulr account yet. You're signed in as {viewer}.", action: "Sign out and join" },
        },
        done: { label: "You're in", body: "You're now {role} at {organisation}.", action: { label: "Continue to your workspace", href: DASHBOARD_ROUTE } },
    },
    location: {
        heading: "Location while you drive",
        points: [
            "Haulr collects your location only during trips you're assigned to.",
            "Shippers following a load see the nearest city, never your exact position.",
            "You can turn it off from any trip.",
        ],
        allow: "Share location on assigned trips",
        decline: "Not now",
        pending: "Saving…",
        failed: "Couldn't save your choice. Try again.",
        outcomes: {
            on: { label: "Location on", body: "Your location will be shared during assigned trips." },
            declined: { label: "Location off", body: "Trips will rely on your ELD or check calls. You can turn location on from any trip." },
            blocked: { label: "Location blocked in this browser", body: "Allow location for this site in your browser's settings. Until then, trips use your ELD or check calls." },
            queued: { label: "Saved on this phone", body: "You're offline. Your choice will be sent as soon as you're back online." },
        },
        next: { label: "Continue to your trips", href: DRIVER_HOME_ROUTE },
    },
    footer: AUTH_COPY.recovery,
} as const;
