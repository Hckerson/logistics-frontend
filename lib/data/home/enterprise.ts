import type { EnterpriseItem, SceneReadout } from "@/lib/types";

export const ENTERPRISE_COPY = {
    label: "Enterprise",
    title: "Ready for the security review before the first load.",
    lead: "The controls a large shipper asks for are launch scope, not a roadmap slide.",
    note: "Planned scope for a design study. SOC 2 Type II is a target, not a certification.",
    log: { label: "Audit export", summary: "Sample audit log showing four recent account events with actor and time." },
} as const;

export const ENTERPRISE_ITEMS: readonly EnterpriseItem[] = [
    { id: "sso", title: "Single sign-on and provisioning", body: "SAML sign-on with automated user provisioning, so access follows your directory." },
    { id: "approvals", title: "Spend approvals", body: "Loads above a threshold wait for the approver you name, with the reason on record." },
    { id: "integrations", title: "API and EDI", body: "Tender, status and invoice messages into the systems your team already runs." },
    { id: "residency", title: "US hosting", body: "Frontend and backend run in US regions on infrastructure with SOC 2 and ISO 27001 reports." },
];

export const AUDIT_LOG: readonly SceneReadout[] = [
    { id: "a1", label: "load.booked · HL-48213 · m.reyes", value: "09:08:14" },
    { id: "a2", label: "approval.granted · HL-48213 · j.okafor", value: "09:07:52" },
    { id: "a3", label: "user.provisioned · scim · t.nguyen", value: "08:41:03" },
    { id: "a4", label: "session.started · sso · m.reyes", value: "08:39:27" },
];
