import type { ROLE_KEYS } from "@/lib/enums/role-key";
import type { LOAD_STATUSES } from "@/lib/enums/load-status";
import type { BID_STATUSES } from "@/lib/enums/bid-status";
import type { AMENDMENT_STATUSES } from "@/lib/enums/amendment-status";
import type { INVOICE_STATUSES } from "@/lib/enums/invoice-status";
import type { CLAIM_TYPES } from "@/lib/enums/claim-type";
import type { CLAIM_STATUSES } from "@/lib/enums/claim-status";
import type { COMPLIANCE_STATUSES } from "@/lib/enums/compliance-status";
import type { AUDIT_ACTOR_TYPES } from "@/lib/enums/audit-actor-type";
import type { FACILITY_TYPES } from "@/lib/enums/facility-type";
import type { QUOTE_REQUEST_STATUSES } from "@/lib/enums/quote-request-status";
import type { LOAD_ACTORS } from "@/lib/loads/constants";

export type RoleKey = (typeof ROLE_KEYS)[number];

export type LoadStatus = (typeof LOAD_STATUSES)[number];

export type BidStatus = (typeof BID_STATUSES)[number];

export type AmendmentStatus = (typeof AMENDMENT_STATUSES)[number];

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export type ClaimType = (typeof CLAIM_TYPES)[number];

export type ClaimStatus = (typeof CLAIM_STATUSES)[number];

export type ComplianceStatus = (typeof COMPLIANCE_STATUSES)[number];

export type AuditActorType = (typeof AUDIT_ACTOR_TYPES)[number];

export type FacilityType = (typeof FACILITY_TYPES)[number];

export type QuoteRequestStatus = (typeof QUOTE_REQUEST_STATUSES)[number];

export type LoadActor = (typeof LOAD_ACTORS)[number];
