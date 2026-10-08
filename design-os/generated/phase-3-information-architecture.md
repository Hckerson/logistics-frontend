# Phase 3 — Information Architecture

`Haulr Design OS` · `Version 1.1.1` · `2026-10-09` · Previous: [Phase 2 — Experience Maps](./phase-2-experience-maps.md) · Next: [Phase 4 — Page Blueprints](./phase-4-page-blueprints.md)

This phase fixes which pages exist, how they relate, which route group each belongs to and who can reach each one. It describes structure and reachability only. What any layout shows, and how, is decided when each page is built.

Page IDs (`PG-`) defined here are used by every later phase. Experience IDs (`XF-`, `XD-`, `XS-`) come from [Phase 2](./phase-2-experience-maps.md); role keys come from [Phase 1 §7.4](./phase-1-product-vision.md#74-permission-roles).

## Table of Contents

1. [Structural Principles](#1-structural-principles)
2. [Navigation Hierarchy](#2-navigation-hierarchy)
3. [Sitemap](#3-sitemap)
4. [Role-Based Navigation](#4-role-based-navigation)
5. [Permissions](#5-permissions)
6. [Content Taxonomy](#6-content-taxonomy)
7. [Labeling Conventions](#7-labeling-conventions)
8. [Cross-Linking](#8-cross-linking)
9. [Search Hierarchy](#9-search-hierarchy)
10. [Filtering Hierarchy](#10-filtering-hierarchy)
11. [SEO Hierarchy](#11-seo-hierarchy)
12. [Breadcrumb Strategy](#12-breadcrumb-strategy)
13. [Empty Routes](#13-empty-routes)
14. [Fallback Routes](#14-fallback-routes)
15. [Future Expansion Strategy](#15-future-expansion-strategy)

---

## 1. Structural Principles

- **IA-P1 — The load is the hub.** Every operational page leads to a load (PG-40), and every load leads out to its bids, documents, conversation, invoice, settlement and claims. This follows PP-02 (one record, many views).
- **IA-P2 — Role-scoped workspaces, shared records.** Each organisation side has its own workspace prefix (`/shipper`, `/carrier`, `/driver`) for the collections it owns. Records that several roles act on (loads, messages, documents, claims) live at one shared, role-neutral URL, and the server shapes what each role receives (BR-05).
- **IA-P3 — Internal tools are separate.** Haulr staff tools live in their own route group and prefixes. They never share a URL with customer pages, so access is enforced by prefix at the edge.
- **IA-P4 — Every view is addressable.** Filters, sort, view mode, selected sub-view and pagination cursor are URL parameters (Phase 1 §14).
- **IA-P5 — Shallow paths.** Maximum depth is four segments. A record is always reachable from its collection in one step, and from a notification in one step.

## 2. Navigation Hierarchy

Levels describe depth of reachability, not presentation.

| Level | Meaning | Examples |
| --- | --- | --- |
| L0 — Public | Reachable without an account | PG-01, PG-02, PG-03, PG-05 … PG-09 |
| L0a — Access | Authentication and invitation | PG-10 … PG-15 |
| L1 — Workspace root | The role's starting point after sign-in | PG-18 … PG-25 |
| L2 — Collection | A set of records the role owns or works | PG-26, PG-33, PG-35, PG-30, PG-44, PG-50 |
| L3 — Record | One record | PG-40, PG-31, PG-45, PG-51 |
| L4 — Transaction | A step that changes a record's state | PG-27, PG-28, PG-34, PG-39 |
| Utility | Reachable from every workspace level | PG-41, PG-42, PG-43, PG-46 … PG-49, PG-06 |

## 3. Sitemap

Route groups use the App Router's native parenthesised folders, which organise code without changing URLs. Existing starter routes (`app/auth/login`, `app/api/session`, `app/api/register`) keep their paths.

### 3.1 Public — group `(public)`

| ID | Page | Route | Rendering | Roles |
| --- | --- | --- | --- | --- |
| PG-01 | Home | `/` | Static | Everyone |
| PG-02 | Public Tracking | `/track/[token]` | Dynamic, no index | `public.tracking` (token) |
| PG-03 | Carrier Public Profile | `/carriers/[carrierId]` | ISR (1 hour) | Everyone; extended data when signed in as shipper or internal |
| PG-05 | Lane Rate Estimator | `/tools/rate-estimator` | Static shell, dynamic estimate | Everyone |
| PG-06 | Help Center | `/help` | Static | Everyone |
| PG-07 | Help Article | `/help/[slug]` | Static (generated params) | Everyone |
| PG-08 | Contact Support | `/support` | Dynamic | Everyone; ticket history when signed in |
| PG-09 | Legal | `/legal/[document]` | Static | Everyone |

### 3.2 Access — existing folder `app/auth`

| ID | Page | Route | Roles |
| --- | --- | --- | --- |
| PG-10 | Sign In | `/auth/login` | Signed-out |
| PG-11 | Register | `/auth/register` | Signed-out |
| PG-12 | Forgot Password | `/auth/forgot-password` | Signed-out |
| PG-13 | Reset Password | `/auth/reset-password` | Holder of reset token |
| PG-14 | Verify (email, MFA) | `/auth/verify` | Partially authenticated |
| PG-15 | Accept Invitation | `/auth/invite/[token]` | Holder of invitation token |

### 3.3 Workspace — group `(workspace)`, authenticated

| ID | Page | Route | Roles |
| --- | --- | --- | --- |
| — | Dashboard redirect | `/dashboard` | Any authenticated; redirects to the role root |
| PG-16 | Shipper Onboarding | `/onboarding/shipper` | `shipper.admin` |
| PG-17 | Carrier Onboarding | `/onboarding/carrier` | `carrier.admin` |
| PG-18 | Shipper Dashboard | `/shipper` | `shipper.*` |
| PG-19 | Carrier Dashboard | `/carrier` | `carrier.admin`, `carrier.dispatcher` |
| PG-20 | Driver Home | `/driver` | `carrier.driver` |
| PG-26 | Shipments (list and map) | `/shipper/loads` | `shipper.member`, `shipper.admin` |
| PG-27 | Post a Load | `/shipper/loads/new` | `shipper.member`, `shipper.admin` |
| PG-28 | Compare Bids | `/shipper/loads/[loadId]/bids` | `shipper.member`, `shipper.admin` |
| PG-29 | Preferred Carriers | `/shipper/carriers` | `shipper.member` (read), `shipper.admin` |
| PG-30 | Invoices | `/shipper/invoices` | `shipper.finance`, `shipper.admin` |
| PG-31 | Invoice Detail and Pay | `/shipper/invoices/[invoiceId]` | `shipper.finance`, `shipper.admin` |
| PG-32 | Locations | `/shipper/locations` | `shipper.member`, `shipper.admin` |
| PG-33 | Load Board | `/carrier/load-board` | `carrier.dispatcher`, `carrier.admin` |
| PG-34 | Book Load | `/carrier/load-board/[loadId]/book` | `carrier.dispatcher`, `carrier.admin` |
| PG-35 | My Loads (carrier) | `/carrier/loads` | `carrier.dispatcher`, `carrier.admin` |
| PG-36 | Saved Loads and Searches | `/carrier/saved` | `carrier.dispatcher`, `carrier.admin` |
| PG-37 | Fleet | `/carrier/fleet` | `carrier.dispatcher` (read), `carrier.admin` |
| PG-38 | Settlements | `/carrier/settlements` | `carrier.admin`, `carrier.dispatcher` (read) |
| PG-39 | Driver Trip | `/driver/trips/[loadId]` | `carrier.driver` (assigned only) |
| PG-40 | Load Details | `/loads/[loadId]` | Parties to the load; all internal roles |
| PG-41 | Messages | `/messages` (`?thread=`) | All authenticated |
| PG-42 | Notifications | `/notifications` | All authenticated |
| PG-43 | Documents | `/documents` | All authenticated except `carrier.driver` (drivers reach documents through PG-39) |
| PG-44 | Claims | `/claims` | `shipper.*`, `carrier.admin`, `carrier.dispatcher`, `internal.finance`, `internal.support` |
| PG-45 | Claim Detail | `/claims/new`, `/claims/[claimId]` | As PG-44 |
| PG-46 | Profile | `/profile` | All authenticated |
| PG-47 | Settings | `/settings` | All authenticated |
| PG-48 | Organization and Team | `/settings/organization` | `shipper.admin`, `carrier.admin` (edit); other members (read) |
| PG-49 | Payment and Payout Methods | `/settings/billing` | `shipper.admin`, `shipper.finance`, `carrier.admin` |
| PG-04 | Shipper Public Profile | `/shippers/[shipperId]` | `carrier.*` (not drivers), internal roles |
| PG-56 | Bulk Load Import | `/shipper/loads/import` | `shipper.member`, `shipper.admin`; `internal.support` (read, with ticket) |
| PG-57 | Templates and Recurring Loads | `/shipper/templates` | `shipper.member` (own and shared), `shipper.admin`; `internal.support` (read, with ticket) |
| PG-58 | Approvals | `/shipper/approvals` | `shipper.approver`, `shipper.admin`; requesters read their own requests |
| PG-59 | Reports | `/shipper/reports` | `shipper.admin`, `shipper.approver`, `shipper.finance` (spend reports only) |
| PG-60 | Security and SSO | `/settings/security` | `org.security`, `shipper.admin`, `carrier.admin` |
| PG-61 | Integrations | `/settings/integrations` | `org.security`, `shipper.admin` |
| PG-62 | Data and Privacy | `/settings/privacy` | Organisation exports: `org.security`, `shipper.admin`, `carrier.admin`. Personal data requests: every authenticated user |
| PG-63 | Audit Log | `/settings/audit` | `org.security`, `shipper.admin`, `carrier.admin`; `internal.support` (read, with ticket), `internal.admin` (read) |
| PG-64 | Review Amendment | `/loads/[loadId]/amendments/[amendmentId]` | Carrier: `carrier.dispatcher`, `carrier.admin` of the booked carrier (act). Shipper roles and internal roles (read, withdraw) |

### 3.4 Internal — group `(internal)`, Haulr staff

| ID | Page | Route | Roles |
| --- | --- | --- | --- |
| PG-21 | Operations Dashboard | `/ops` | `internal.ops`, `internal.admin` |
| PG-50 | Exception Queue | `/ops/exceptions` | `internal.ops`; `internal.compliance` and `internal.finance` (their own exception types, §5.1) |
| PG-22 | Compliance Dashboard | `/compliance` | `internal.compliance` |
| PG-51 | Carrier Vetting Review | `/compliance/carriers/[carrierId]` | `internal.compliance` |
| PG-23 | Finance Operations Dashboard | `/finance` | `internal.finance` |
| PG-24 | Support Console | `/support-console` | `internal.support` |
| PG-25 | Admin Dashboard | `/admin` | `internal.admin` |
| PG-52 | Accounts | `/admin/accounts` | `internal.admin` |

### 3.5 System pages

| ID | Page | Mechanism | Roles |
| --- | --- | --- | --- |
| PG-53 | Not Found (404) | `app/not-found.tsx`, plus per-group `not-found.tsx` and `notFound()` | Everyone |
| PG-54 | Server Error (500) | `app/global-error.tsx` and per-segment `error.tsx` | Everyone |
| PG-55 | Access Denied (403) | `forbidden()` with `app/forbidden.tsx` | Authenticated without permission |

**Totals:** 64 pages (PG-01 … PG-64) plus one redirect route. PG-56 … PG-64 were added in version 1.1.0 for enterprise requirements (Phase 1 §18–22); they follow the same group, guard and fallback rules as their neighbours.

## 4. Role-Based Navigation

The set of global destinations each role can reach from anywhere in its workspace. Order and presentation are decided at build time. Record pages (L3) and transactions (L4) are reached from their collections, not globally.

| Role | Global destinations |
| --- | --- |
| `shipper.member` | PG-18, PG-26, PG-27, PG-56, PG-57, PG-29, PG-32, PG-44, PG-41, PG-42, PG-43, PG-05, PG-06 |
| `shipper.admin` | `shipper.member` set, plus PG-58, PG-59, PG-30, PG-48, PG-49, PG-60, PG-61, PG-62, PG-63 |
| `shipper.approver` | PG-58, PG-59, plus the set of any other role the user holds |
| `org.security` | PG-60, PG-61, PG-62, PG-63, PG-48 (read), PG-06 |
| `shipper.finance` | PG-18, PG-30, PG-59, PG-44, PG-43, PG-49, PG-41, PG-42, PG-06 |
| `carrier.dispatcher` | PG-19, PG-33, PG-35, PG-36, PG-37, PG-38, PG-44, PG-41, PG-42, PG-43, PG-06 |
| `carrier.admin` | `carrier.dispatcher` set, plus PG-17 (until approved), PG-48, PG-49, PG-60, PG-62, PG-63 |
| `carrier.driver` | PG-20, PG-41, PG-42, PG-06 |
| `internal.ops` | PG-21, PG-50, PG-41, PG-42 (plus any PG-40) |
| `internal.compliance` | PG-22, PG-41, PG-42 (plus any PG-51, PG-03) |
| `internal.finance` | PG-23, PG-44, PG-43, PG-41, PG-42 |
| `internal.support` | PG-24, PG-41, PG-42 (read access to PG-40, PG-44) |
| `internal.admin` | PG-25, PG-52, PG-21 |
| Every authenticated role | PG-46, PG-47, sign out |

**Role resolution.** `/dashboard` and a successful sign-in resolve to the role root: shipper roles to PG-18, carrier admin and dispatcher to PG-19, drivers to PG-20, a user holding only `org.security` to PG-60, each internal role to its own root. Users holding several roles resolve by the sequence shipper, carrier, driver, security, and can switch roots from any workspace page. A user whose organisation has not finished onboarding resolves to PG-16 or PG-17 instead.

## 5. Permissions

Enforcement happens at three layers: edge (`proxy.ts`, by route prefix), server (every page and Server Action checks role and record membership) and backend (authoritative). The frontend never relies on hiding alone.

### 5.1 Capability matrix

`A` = act, `R` = read, `—` = no access. "Own" means records of the user's organisation; "assigned" means the driver's own trips.

| Capability | shipper.member | shipper.admin | shipper.finance | carrier.dispatcher | carrier.admin | carrier.driver | internal.ops | internal.compliance | internal.finance | internal.support | internal.admin |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Quote and post a load | A (own) | A (own) | — | — | — | — | A | — | — | — | — |
| Cancel a load | A (own) | A (own) | — | A (own, booked) | A (own, booked) | — | A | — | — | — | — |
| View shipper price | A (own) | A (own) | R (own) | — | — | — | R | — | R | R | — |
| View carrier pay | — | — | — | R (own) | R (own) | — | R | — | R | R | — |
| Search load board | — | — | — | A | A | — | R | — | — | R | — |
| Bid, counter, book | — | — | — | A | A | — | A (on behalf) | — | — | — | — |
| Accept or decline bids | A (own) | A (own) | — | — | — | — | A | — | — | — | — |
| Manage preferred carriers | R | A | — | — | — | — | R | — | — | — | — |
| Assign driver and truck | — | — | — | A | A | — | A | — | — | — | — |
| Record stop events | — | — | — | A (own) | A (own) | A (assigned) | A | — | — | — | — |
| Capture or upload POD | — | — | — | A (own) | A (own) | A (assigned) | A | — | A | — | — |
| Verify POD | — | — | — | — | — | — | — | — | A | — | — |
| View live location | A (own) | A (own) | — | A (own) | A (own) | R (assigned) | R | — | — | R | — |
| Share tracking link | A (own) | A (own) | — | — | — | — | A | — | — | A | — |
| Pay invoices | — | A | A | — | — | — | — | — | — | — | — |
| Dispute invoice or settlement | A (own) | A (own) | A (own) | — | A (own) | — | — | — | A | — | — |
| Request quick pay | — | — | — | — | A | — | — | — | A | — | — |
| Manage payment or payout methods | — | A | A | — | A | — | — | — | — | — | — |
| File or respond to a claim | A (own) | A (own) | A (own) | A (own) | A (own) | — | — | — | A | R | — |
| Manage fleet | — | — | — | R | A | — | R | — | — | — | — |
| Invite and manage members | — | A | — | A (drivers) | A | — | — | — | — | — | A |
| Rate counter-party | A (own) | A (own) | — | A (own) | A (own) | — | — | — | — | — | — |
| Vet carriers | — | — | — | — | — | — | — | A | — | — | — |
| Resolve exceptions | — | — | — | — | — | — | A | A (compliance type) | A (finance type) | — | — |
| Handle tickets | — | — | — | — | — | — | — | — | — | A | — |
| Platform configuration | — | — | — | — | — | — | — | — | — | — | A |

### 5.1a Enterprise capabilities

Roles not listed in a row have no access to that capability, with two exceptions: every authenticated user can request access to or deletion of their own personal data (PG-62, BR-30), and `internal.ops` can propose and withdraw amendments on any load (XF-15, Phase 2 §5.1). `shipper.approver` and `org.security` add only the capabilities below to whatever other roles the user holds.

| Capability | shipper.member | shipper.admin | shipper.approver | shipper.finance | carrier.admin | org.security | internal.support | internal.admin |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Bulk import and templates | A (own) | A (own) | — | — | — | — | R | — |
| Set member spend limits | — | A | — | — | — | — | — | — |
| Approve or reject spend (posts, bid acceptances, amendments, accessorials above the requester's limit) | — | A (not own requests) | A (not own requests) | — | — | — | — | — |
| Propose an amendment | A (own) | A (own) | — | — | — | — | — | — |
| Accept or decline an amendment | — | — | — | — | A (carrier.dispatcher also) | — | — | — |
| View reports | — | A | A | R (spend only) | — | — | — | — |
| Configure SSO, SCIM, session policy | — | A | — | — | A | A | — | A (support override, audited) |
| Manage API keys and webhooks | — | A | — | — | — | A | — | — |
| Read and export organisation audit log | — | A | — | — | A | A | R (with ticket) | R |
| Request organisation data export | — | A | — | — | A | A | — | — |
| Request personal data access or deletion | A (self) | A (self) | A (self) | A (self) | A (self) | A (self) | — | A (fulfil) |
| Start view-as | — | — | — | — | — | — | A (with ticket, BR-27) | A (with ticket) |

### 5.2 Record-level rules

- **Load membership.** A user can reach PG-40 for a load only if their organisation is the shipper of record or the booked carrier, or they are internal. A driver reaches only loads assigned to them, through PG-39.
- **Load board visibility.** Loads in `Posted` state appear on PG-33. Private-tendered loads are visible only to the carrier currently holding the tender (BR-08).
- **Response shaping.** The server removes fields the role cannot read (BR-05). Hidden fields are absent from responses, not merely hidden in the UI.
- **Unauthorised record access.** A record the user cannot access returns PG-53 (not found), never PG-55. This prevents confirming that a record exists. PG-55 is used only when the whole route is outside the user's role.
- **Tenant isolation.** Every collection and record request is scoped to the session's organisation on the server (SEC-5). Identifiers are never guessable (`nanoid` or UUID on the backend); sequential IDs never appear in URLs.
- **View-as.** During a view-as session (XS-16) the effective permissions are the viewed member's, reduced to read-only unless write consent exists, and never including payout methods, security settings, API keys or data export.
- **Spend-limited members.** Members with a spend limit can still start any money-committing action; the server decides whether it completes or enters `PendingApproval` (BR-23). The client never hides an action because of a limit.
- **API and EDI principals.** API keys act as a named service principal of the organisation with their scopes, never as a human member. Their actions appear in the audit log under the key's name.

## 6. Content Taxonomy

| Type | Key | Parent | Lifecycle source | Home page |
| --- | --- | --- | --- | --- |
| Organisation | `org` | — | XF-12, XF-13 | PG-48, PG-03, PG-04 |
| Member | `member` | Organisation | XS-02 | PG-48 |
| Load | `load` | Shipper organisation | BR-01 | PG-40 |
| Stop | `stop` | Load | XF-06 | PG-40, PG-39 |
| Quote | `quote` | Shipper organisation | BR-06 | PG-27, PG-05 |
| Tender | `tender` | Load | BR-08 | PG-40 |
| Bid | `bid` | Load | BR-02 | PG-28, PG-40 |
| Rate confirmation | `rateConfirmation` | Load | BR-04 | PG-34, PG-40 |
| Location update | `position` | Load | BR-10 | PG-40, PG-02 |
| Stop event | `stopEvent` | Stop | XF-06 | PG-40, PG-39 |
| Exception | `exception` | Load | XF-08 | PG-50, PG-40 |
| Accessorial | `accessorial` | Load | BR-11 | PG-40, PG-31 |
| Document | `document` | Load or Organisation | XS-12 | PG-43 |
| Invoice | `invoice` | Load, Shipper organisation | BR-14 | PG-31 |
| Settlement | `settlement` | Load, Carrier organisation | BR-15 | PG-38 |
| Claim | `claim` | Load | BR-17 | PG-45 |
| Thread | `thread` | Load or Ticket | BR-19 | PG-41 |
| Notification | `notification` | Member | XS-03 | PG-42 |
| Rating | `rating` | Load | BR-22 | PG-03, PG-04 |
| Facility | `facility` | Shipper organisation | XS-11 | PG-32 |
| Vehicle | `vehicle` | Carrier organisation | XF-05 | PG-37 |
| Driver | `driver` | Carrier organisation | XF-05 | PG-37 |
| Saved search | `savedSearch` | Member | XS-09 | PG-36 |
| Ticket | `ticket` | Member | XS-07 | PG-08, PG-24 |
| Help article | `article` | Help category | XS-07 | PG-07 |
| Payment method | `paymentMethod` | Organisation | XS-08 | PG-49 |
| Import batch | `importBatch` | Shipper organisation | XF-14, BR-28 | PG-56 |
| Load template | `loadTemplate` | Shipper organisation | XF-14 | PG-57 |
| Recurrence | `recurrence` | Load template | XF-14 | PG-57 |
| Approval request | `approvalRequest` | Load, bid, amendment or accessorial | XF-16, BR-23 | PG-58 |
| Amendment | `amendment` | Load | XF-15, BR-25 | PG-64, PG-40 |
| Report | `report` | Shipper organisation | XD-01 | PG-59 |
| SSO connection | `ssoConnection` | Organisation | XS-13, BR-24 | PG-60 |
| Verified domain | `verifiedDomain` | Organisation | XS-13 | PG-60 |
| API key | `apiKey` | Organisation | XS-14, BR-29 | PG-61 |
| Webhook endpoint | `webhookEndpoint` | Organisation | XS-14 | PG-61 |
| EDI connection | `ediConnection` | Organisation | XS-14 | PG-61 |
| Export job | `exportJob` | Organisation or member | XS-15, XS-17 | PG-62, PG-63 |
| Privacy request | `privacyRequest` | Member | XS-15, BR-30 | PG-62 |
| Audit event | `auditEvent` | Organisation | BR-26 | PG-63 |
| View-as session | `viewAsSession` | Ticket | XS-16, BR-27 | PG-24 |

**Help categories:** Getting started · Shipping with Haulr · Hauling with Haulr · Drivers · Billing and payments · Tracking · Claims · Account and security · Compliance · Integrations and API · Security and administration.

**Enumerations** (single source in `lib/enums/`, mirrored from the contract): load status (including `PendingApproval`), bid status, amendment status, approval status, equipment type, stop type, accessorial type, document type, exception type and severity, invoice status, settlement status, claim type and status, compliance status, notification event type, role key, API scope, webhook event type, export dataset, import row outcome, audit action, audit actor type, ticket status and urgency, facility type.

## 7. Labeling Conventions

- **One name per concept.** "Load" everywhere, never "shipment" in the product UI. The exception is the shipper collection, labelled "Shipments" because shippers call it that; it is still made of loads. Each label is defined once in constants (Phase 7).
- **Reference numbers.** Loads display as `HL-` plus 8 characters (from `nanoid` with a custom alphabet that excludes ambiguous characters). Invoices use `INV-`, settlements `STL-`, claims `CLM-`, tickets `TKT-`.
- **Status labels.** Machine states from Phase 2 §5 map to plain labels ("AtPickup" → "At pickup"). Mapping lives in one constant.
- **Money.** Always currency-formatted with cents; per-mile rates to cents; ranges as "low to high".
- **Time.** Appointment windows show the facility's local time zone with its abbreviation. Relative times ("12 min ago") are used for freshness (PP-03) with the absolute time available.
- **Distances and weights.** Miles and pounds (A1).
- **Industry terms.** TONU, POD, detention, lumper and OS&D are used as-is, with an explanation available in context (PP-07).
- **Actions.** Verb-first and specific: "Book load", "Accept bid", "Pay invoice", never "Submit" or "OK".

## 8. Cross-Linking

| From | To | Why |
| --- | --- | --- |
| Any load reference anywhere | PG-40 | IA-P1 |
| PG-40 | PG-28 (shipper), PG-34 (carrier, while posted), PG-39 (driver), PG-41 thread, PG-43 filtered by load, PG-31 invoice, PG-38 settlement, PG-45 claims, PG-03 / PG-04 counter-party | Load as hub |
| PG-05 Estimator | PG-27 with lane pre-filled (after sign-in) | XS-10 → XF-01 |
| PG-01 Home | PG-05, PG-11 (shipper or carrier intent), PG-06, PG-10 | Acquisition |
| PG-03 Carrier profile | PG-29 (add to preferred) | XF-04 |
| PG-33 Load Board | PG-36 (save search), PG-40 | XS-09 |
| Notifications (PG-42) | The subject record | XS-03 |
| Every workspace page | PG-06 contextual article, PG-08 with context | XS-07 |
| Compliance or payment notices | PG-17, PG-49 | XD-02 recovery |
| PG-50 exception | PG-40, the party's PG-03 / PG-04, PG-24 ticket if linked | XF-08 |
| PG-31 invoice line | PG-45 new claim or dispute | XS-06 |
| PG-02 Public Tracking | PG-01, PG-11 (conversion) | Acquisition |

## 9. Search Hierarchy

| Scope | Where | Indexed entities | Keys | Access filter |
| --- | --- | --- | --- | --- |
| Global quick find (workspace) | All workspace pages | Loads, invoices, settlements, claims, facilities, members | Reference number, PO/BOL numbers, facility name, city | Organisation membership |
| Load board search | PG-33 | Posted loads | Origin radius, destination region, dates, equipment | Eligibility and tender visibility (§5.2) |
| Collection search | PG-26, PG-35, PG-30, PG-38, PG-43, PG-44 | That collection | Reference, counter-party, city | Organisation |
| Internal search | PG-21, PG-24, PG-50, PG-52 | All entities | Reference, email, USDOT/MC, organisation | Internal role |
| Help search | PG-06 | Articles | Full text | Public |

A reference number typed anywhere resolves exactly (goes to the record). Free text returns grouped results by entity type.

## 10. Filtering Hierarchy

Filters are URL parameters with the same names on every page they apply to.

| Filter | Parameter | Applies to |
| --- | --- | --- |
| Status | `status` (multi) | PG-26, PG-35, PG-30, PG-38, PG-44, PG-50 |
| Date range (pickup, delivery, issued, due) | `from`, `to`, `dateField` | PG-26, PG-35, PG-30, PG-38, PG-43 |
| Origin / destination | `origin`, `originRadius`, `destination`, `destinationRadius` | PG-33, PG-26, PG-35 |
| Equipment | `equipment` (multi) | PG-33, PG-26, PG-35, PG-37 |
| Rate floor, rate per mile floor | `minRate`, `minRpm` | PG-33 |
| Weight ceiling | `maxWeight` | PG-33 |
| Counter-party | `carrier` / `shipper` | PG-26, PG-35, PG-30, PG-38, PG-43 |
| Exception type, severity, owner | `type`, `severity`, `owner` | PG-50 |
| Document type, load | `docType`, `load` | PG-43 |
| View mode | `view` (`list` or `map`) | PG-26, PG-33 |
| Sort | `sort` (field and direction) | All collections |
| Cursor | `cursor` | All collections |
| Late only | `late` (`true`) | PG-26, PG-35 |
| Exceptions only | `exceptions` (`true`) | PG-26, PG-35 |
| Needs assignment | `needsAssignment` (`true`) | PG-35 |
| Driver | `driver` | PG-35 |
| Whose turn | `turn` (`mine`, `theirs`) | PG-44, PG-58 |
| Facility type, city | `facilityType` (`pickup`, `delivery`, `both`), `city` | PG-32 |
| Import batch | `batch` | PG-26, PG-56 |
| Approval status and type | `status`, `type` (`post`, `bid`, `amendment`, `accessorial`) | PG-58 |
| Requester | `requester` | PG-58 |
| Audit actor, actor type, action, target, date range | `actor`, `actorType` (`member`, `staff`, `apiKey`, `system`), `action`, `targetType`, `targetId`, `from`, `to` | PG-63 |
| Acknowledged | `acknowledged` (`true`, `false`) | PG-22 (monitoring events) |
| Urgency | `urgency` (`urgent`, `high`, `normal`) | PG-24, PG-08 |
| Report period and dimensions | `from`, `to`, `lane`, `facility`, `carrier`, `equipment` | PG-59 |

Filter precedence: access filter (server, not user-editable) → saved search → URL parameters → defaults.

## 11. SEO Hierarchy

| Tier | Pages | Indexing | Canonical | Structured data |
| --- | --- | --- | --- | --- |
| Acquisition | PG-01 | Index | `/` | Organization, WebSite with SearchAction |
| Tool | PG-05 | Index | `/tools/rate-estimator` | WebApplication |
| Directory | PG-03 (approved carriers only) | Index | `/carriers/[carrierId]` | Organization with AggregateRating |
| Help | PG-06, PG-07 | Index | `/help`, `/help/[slug]` | FAQPage or Article, BreadcrumbList |
| Legal | PG-09 | Index | `/legal/[document]` | — |
| Access | PG-10 … PG-15 | No index | — | — |
| Tracking | PG-02 | No index, no follow | — | — |
| Workspace and internal | All others | No index; excluded from the sitemap and blocked in robots | — | — |

The sitemap (`app/sitemap.ts`) and robots (`app/robots.ts`) are generated natively by the framework from these tiers. Metadata comes from `generateMetadata` per page, using copy from constants.

## 12. Breadcrumb Strategy

- Breadcrumbs describe the path from the role root: role root → collection → record → transaction. Example: Shipper Dashboard → Shipments → HL-7K2M9QXA → Compare bids.
- Shared records (PG-40, PG-45, PG-64) take their trail from the viewer's role, not from the URL, so a shipper and a carrier each see a path through their own workspace.
- Help pages use the category path: Help → Category → Article (also emitted as BreadcrumbList structured data).
- L0a access pages (PG-10 … PG-15), PG-02 and system pages (PG-53 … PG-55) have no breadcrumbs.
- The trail is derived from route metadata defined once per route, never hand-written per page.

## 13. Empty Routes

Routes that exist but can legitimately have nothing to show, and what the user is told:

| Route | Empty condition | Guidance |
| --- | --- | --- |
| `/shipper/loads` | No loads yet | Start a quote (XF-01) |
| `/carrier/loads` | No booked loads | Search the load board (XF-02) |
| `/carrier/load-board` | No loads match | Widen the search or save it as an alert (XS-09) |
| `/carrier/saved` | Nothing saved | How saved searches and watched loads work |
| `/shipper/carriers` | No preferred carriers | How to add from a carrier profile or a past load |
| `/shipper/invoices`, `/carrier/settlements` | None yet | When the first one will appear (after POD verification) |
| `/messages`, `/notifications`, `/documents`, `/claims` | None | What will appear and when |
| `/driver` | No trip assigned | How to reach dispatch |
| `/ops/exceptions` | Queue clear | Last refresh time |
| `/shipper/locations`, `/carrier/fleet` | None added | Why to add them |
| `/shipper/templates` | No templates | How to save a load as a template |
| `/shipper/approvals` | Nothing awaiting approval | Last checked time; who else can approve |
| `/shipper/reports` | Not enough history | Which report becomes available after how many delivered loads |
| `/settings/integrations` | No keys or endpoints | Link to developer documentation (PG-07) |
| `/settings/audit` | No events for the filters | Retention boundary (BR-26) |

## 14. Fallback Routes

| Situation | Behaviour |
| --- | --- |
| Unknown path | PG-53 within the nearest route group, so a signed-in user keeps their workspace context |
| Record not found or not accessible | PG-53 (§5.2) |
| Route outside the user's role | PG-55 with a route to their role root |
| Unauthenticated request to a protected prefix | Redirect to PG-10 with a validated `next` parameter (`lib/utils/internal-path.ts`) |
| Authenticated request to an access page | Redirect to role root |
| Organisation not onboarded | Workspace routes redirect to PG-16 / PG-17, except PG-46, PG-47, PG-06, and PG-27 for quoting only (posting stays refused until the organisation is active, XF-13) |
| Segment render error | Segment `error.tsx` with retry; root failure → PG-54 |
| Expired tracking token | PG-02 expired state (BR-21), not PG-53 |
| Expired invitation or reset token | The page's own expired state with a resend path |
| Legacy `/dashboard` | Role-resolving redirect (§4) |

## 15. Future Expansion Strategy

- **New organisation side** (for example brokers or 3PL partners): add a prefix and role family (`/partner`, `partner.*`), reuse the shared record routes.
- **New modes** (partial, LTL): new equipment and load-type enumerations; routes unchanged.
- **Analytics** for shipper admins: delivered in version 1.1.0 as PG-59 (`/shipper/reports`) at L2 without changing L1; further report types extend PG-59 the same way.
- **Public API and EDI**: API keys, webhooks and EDI are launch scope through PG-61 (XS-14, BR-29); a public developer portal at `/developers` joins the public group later with its own SEO tier.
- **Localisation**: a locale segment can be introduced at the root of `(public)` and `(workspace)` without renaming inner routes.
- **Native driver app**: PG-39 remains as the web fallback; deep links map to the same `/driver/trips/[loadId]` path.

---

Previous: [Phase 2 — Experience Maps](./phase-2-experience-maps.md) · Next: [Phase 4 — Page Blueprints](./phase-4-page-blueprints.md)
