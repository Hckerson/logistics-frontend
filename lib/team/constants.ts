import type { RoleKey } from "@/lib/types";

export const TEAM_ROLES = ["shipper.admin", "shipper.member", "carrier.admin", "carrier.dispatcher", "carrier.driver"] as const satisfies readonly RoleKey[];

export const DRIVER_ROLE = "carrier.driver" satisfies RoleKey;

export const INVITATION_STATUSES = ["open", "accepted", "expired", "revoked"] as const;

export const INVITED_ACCOUNTS = ["new", "existing", "elsewhere"] as const;

export const INVITATION_DAYS = 7;

export const LOCATION_DECISIONS = ["granted", "declined"] as const;

export const LOCATION_CONSENT_VERSION = "1.0";

export const CONSENT_QUEUE_KEY = "haulr.location-consent.pending";

export const PERMISSION_PROBE = { timeout: 10_000, maximumAge: Infinity, enableHighAccuracy: false } as const;

export const ACCEPT_REFUSAL = {
    accepted: "Invitation already accepted",
    elsewhere: "Account belongs to another organisation",
    sso: "Organisation requires single sign-on",
    gone: "Invitation is no longer valid",
    existing: "An account already exists for this email",
    mismatch: "Invitation belongs to a different account",
} as const;
