import type { MockInvitation, MockOrganisation, MockScenario } from "@/lib/types";

export const MOCK_ORGANISATIONS: Record<string, MockOrganisation> = {
    northline: { name: "Northline Freight", side: "shipper", sso: false },
    ridgeway: { name: "Ridgeway Haulage", side: "carrier", sso: false },
    harbor: { name: "Harbor Foods", side: "shipper", sso: true },
};

export const MOCK_MEMBERSHIPS: Record<string, string> = {
    "dispatch@northline.example": "northline",
    "approver@northline.example": "northline",
};

const northline = { organisation: "northline", inviter: "Priya Raman", role: "shipper.member" } as const;

export const MOCK_INVITATIONS: Record<string, MockInvitation> = {
    inv_member: { ...northline, email: "ines@northline.example", status: "open" },
    inv_driver: { email: "tomas@ridgeway.example", organisation: "ridgeway", inviter: "Ray Okoro", role: "carrier.driver", status: "open" },
    inv_existing: { ...northline, email: "fresh@northline.example", status: "open" },
    inv_elsewhere: { email: "dispatch@northline.example", organisation: "ridgeway", inviter: "Ray Okoro", role: "carrier.dispatcher", status: "open" },
    inv_sso: { email: "lee@harborfoods.example", organisation: "harbor", inviter: "Sam Ortiz", role: "shipper.member", status: "open" },
    inv_used: { ...northline, email: "ana@northline.example", status: "accepted" },
    inv_expired: { ...northline, email: "omar@northline.example", status: "expired" },
    inv_revoked: { ...northline, email: "june@northline.example", status: "revoked" },
    inv_busy: { ...northline, email: "busy@northline.example", status: "open" },
    inv_down: { ...northline, email: "down@northline.example", status: "open" },
};

export const MOCK_INVITE_SCENARIOS: Record<string, MockScenario> = {
    inv_busy: { kind: "rate-limited", retryAfter: 120 },
    inv_down: { kind: "unavailable" },
};
