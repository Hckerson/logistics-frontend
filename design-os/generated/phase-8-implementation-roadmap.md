# Phase 8 — Implementation Roadmap

`Haulr Design OS` · `Version 1.2.0` · `2026-10-09` · Previous: [Phase 7 — Frontend Architecture](./phase-7-frontend-architecture.md) · Next: [Phase 9 — QA Checklist](./phase-9-qa-checklist.md)

The plan for building Phases 1–7 in 16 weeks (8 two-week sprints), plus the single record of build status for every page, section, interaction contract and flow. Status lives here and nowhere else; the blueprints in Phases 1–7 record intent and are never edited to reflect progress (Critical Rules › Scope Preservation).

## Table of Contents

1. [Development Phases](#1-development-phases)
2. [Priority Order](#2-priority-order)
3. [Sprint Breakdown](#3-sprint-breakdown)
4. [Milestones](#4-milestones)
5. [Dependencies](#5-dependencies)
6. [Risk Assessment](#6-risk-assessment)
7. [Technical Debt Prevention](#7-technical-debt-prevention)
8. [Testing Strategy](#8-testing-strategy)
9. [Per-Feature Build Status](#9-per-feature-build-status)
10. [Deployment Readiness](#10-deployment-readiness)
11. [Definition of Ready and Definition of Done](#11-definition-of-ready-and-definition-of-done)
12. [Roles and Responsibilities](#12-roles-and-responsibilities)
13. [Estimation and Capacity](#13-estimation-and-capacity)
14. [Release Management](#14-release-management)
15. [Go/No-Go and Hypercare](#15-gono-go-and-hypercare)

**Planning assumptions.**

- **Team:** eight frontend engineers (six on the core track, two on the enterprise track from S2), one QA engineer and one software engineer in test, one product designer working with the owner on per-page visual concepts, and a part-time security engineer from S2.
- **Backend:** delivered by the NestJS team one sprint ahead of each frontend sprint.
- **Dates:** Sprint 1 starts 2026-10-05; Sprint 8 ends 2027-02-05. The two holiday weeks starting 2026-12-21 and 2026-12-28 are excluded, so Sprint 6 runs 2026-12-14 → 2026-12-18 and 2027-01-04 → 2027-01-08.
- **Capacity:** checked in §13.

---

## 1. Development Phases

| Phase | Sprints | Outcome |
| --- | --- | --- |
| A — Foundations | S1 | Route groups, guards, providers, env validation, observability, flags, constants, enums, error taxonomy, core primitives, access pages, system pages, test tooling |
| B — Accounts and onboarding | S2 | Both sides can register, onboard, invite and manage their organisation |
| C — Posting | S3 | Shippers can quote, post and follow loads; operations answer custom quotes; public estimator and home |
| D — Marketplace | S4 | Carriers can search, bid, book and sign; shippers compare bids and tender; compliance can approve carriers |
| E — Execution | S5 | Dispatch, driver workflow, POD capture, live tracking, public tracking |
| F — Money | S6 | Invoices, payment, settlements, quick pay, accessorials, claims, documents |
| G — Communication and dashboards | S7 | Messages, notifications, preferences, help, role dashboards, the carrier dispatch board, driver offline hardening |
| H — Operations and launch | S8 | Internal tools, exception handling, view-as, full QA pass, performance, security and accessibility sign-off |
| **X — Enterprise track** (parallel) | S2–S8 | SSO and SCIM (S2), templates (S3), approvals and bulk import (S4), amendments (S5), audit and data export (S6), reports and integrations (S7), view-as (S8) |

## 2. Priority Order

Priority follows the North Star (Phase 1 §10): a load must be able to go from quote to paid before anything that optimises it. Enterprise capabilities that are purchase preconditions for launch-segment buyers (A9) run in parallel rather than after.

1. **Access and safety:** XS-01, XS-02, XS-13, XF-12, XF-13 (nobody transacts without them; enterprise buyers do not start without SSO).
2. **Core lifecycle:** XF-01 (with XS-18 custom quotes) → XF-02 → XF-05 → XF-06 → XF-07 → XF-09 → XF-10 → XF-11.
3. **Control:** XF-16, XF-15, XS-17 (spend authority, binding amendments, audit).
4. **Market efficiency:** XF-03, XF-04, XF-14, XF-17, XS-09, XS-10.
5. **Resilience:** XF-08, XS-06, offline driver workflow.
6. **Integration and governance:** XS-14, XS-15, XS-16.
7. **Engagement and support:** XS-03, XS-04, XS-05, XS-07, XS-11, XS-12, dashboards XD-01 … XD-08, reports.

## 3. Sprint Breakdown

Every page is built from its Phase 4 blueprint, Phase 5 sections and Phase 6 contracts. Before coding a page, its visual concept is produced with the repo's UI skills and approved by the owner (see [IMPLEMENTATION_PROMPT › Visual Design Hand-off](./IMPLEMENTATION_PROMPT.md#visual-design-hand-off)). No story enters a sprint without meeting the Definition of Ready (§11).

### Sprint 1 — Foundations (2026-10-05 → 2026-10-16)

- **Architecture:**
  - Route groups and layouts (Phase 7 §3–4).
  - `PROTECTED_ROUTE_PREFIXES` and internal-role guard in `proxy.ts` (D-7).
  - `appRoutes`, `lib/enums/` and feature constants folders.
  - Env validation (D-9), `instrumentation.ts` and `report-error` (D-10), `lib/flags.ts` (D-11).
  - `withAction`/`withHandler` (D-13), error taxonomy (`errorCopy`, `section-state`, Query retry policy; Phase 7 §28).
  - CSP with nonces and security headers (Phase 7 §19).
  - Announcer and session providers; `section-boundary`.
- **Contracts:** IC-01, IC-02, IC-03, IC-04, IC-07, IC-09, IC-11, IC-12, IC-14, IC-41, IC-51, IC-52, IC-59, IC-60.
- **Pages:** PG-10 (extend), PG-11, PG-12, PG-13, PG-14, PG-15, PG-53, PG-54, PG-55, dashboard redirect.
- **Flows:** XS-01.
- **Decisions to close:** D-2 confirmation; library approvals for forms, testing and observability; `forbidden()` availability (R-08).

### Sprint 2 — Accounts and onboarding (2026-10-19 → 2026-10-30)

- **Contracts:** IC-05, IC-13, IC-15, IC-24, IC-26, IC-38, IC-39, IC-58, IC-63, IC-67.
- **Shared sections:** SH-03, SH-06, SH-13.
- **Pages:** PG-16, PG-17, PG-46, PG-47 (password, MFA, sessions), PG-48, PG-09; enterprise track: PG-60, SC-10.3.
- **Flows:** XS-02, XF-13, XF-12 (carrier side), XS-13.

### Sprint 3 — Posting (2026-11-02 → 2026-11-13)

- **Contracts:** IC-08, IC-19, IC-20, IC-21, IC-22, IC-23, IC-32, IC-40, IC-46, IC-56, IC-57.
- **Shared sections:** SH-01, SH-05, SH-14.
- **Pages:** PG-27, PG-32, PG-26 (collection), PG-40 (SC-40.1, 40.2, 40.3, 40.7, 40.8), PG-05, PG-01, PG-66; enterprise track: PG-57.
- **Flows:** XF-01, XS-10, XS-11, XF-14 (templates), XS-18.

### Sprint 4 — Marketplace (2026-11-16 → 2026-11-27)

- **Contracts:** IC-18, IC-27, IC-28, IC-33, IC-34, IC-61, IC-62.
- **Shared sections:** SH-09.
- **Pages:** PG-33, PG-34, PG-36, PG-28, PG-29, PG-03, PG-04, PG-35 (collection), PG-22, PG-51, PG-40 (SC-40.4, SC-40.17); enterprise track: PG-58, PG-56, SC-48.4.
- **Flows:** XF-02, XF-03, XF-04, XS-09, XF-12 (compliance side), XD-05, XF-16, XF-14 (bulk import).

### Sprint 5 — Execution and tracking (2026-11-30 → 2026-12-11)

- **Contracts:** IC-06, IC-10, IC-25, IC-29, IC-30, IC-31, IC-44, IC-55, IC-66.
- **Shared sections:** SH-02, SH-15.
- **Pages:** PG-37, PG-35 (assignment), PG-20, PG-39, PG-02, PG-40 (SC-40.5, 40.6, 40.12, 40.15, 40.16), PG-26 (map, sharing); enterprise track: PG-64.
- **Flows:** XF-05, XF-06, XF-07, XF-09 (capture), XD-03, XF-15.
- **Library approval needed:** map base layer (deck.gl is installed and reused; Phase 7 §15).

### Sprint 6 — Money (2026-12-14 → 2027-01-08, holiday weeks excluded)

- **Contracts:** IC-42, IC-43, IC-65.
- **Shared sections:** SH-11.
- **Pages:** PG-30, PG-31, PG-38, PG-49, PG-43, PG-44, PG-45, PG-40 (SC-40.9, 40.10, 40.13), PG-23 (SC-23.1 POD queue); enterprise track: PG-62, PG-63.
- **Flows:** XF-09 (verification), XF-10, XF-11, XS-06, XS-08, XS-12, XS-15, XS-17.
- **Library approval needed:** processor SDK.

### Sprint 7 — Communication, dashboards and offline (2027-01-11 → 2027-01-22)

- **Contracts:** IC-16, IC-17, IC-35, IC-36, IC-37, IC-45, IC-50, IC-53, IC-54, IC-68.
- **Shared sections:** SH-04, SH-07, SH-08, SH-10, SH-12.
- **Pages:** PG-41, PG-42, PG-47 (notification preferences), PG-18, PG-19, PG-06, PG-07, PG-08, PG-40 (SC-40.11, 40.14), PG-65; driver service worker caching; enterprise track: PG-59, PG-61.
- **Flows:** XS-03, XS-04, XS-05, XS-07, XD-01, XD-02, XS-14, XF-17.
- **Library approval needed:** charts, product analytics.

### Sprint 8 — Operations and launch (2027-01-25 → 2027-02-05)

- **Contracts:** IC-47, IC-48, IC-49, IC-64.
- **Pages:** PG-21, PG-23 (remaining), PG-24 (including SC-24.4), PG-25, PG-50, PG-52 (including SC-52.4).
- **Flows:** XF-08, XD-04, XD-06, XD-07, XD-08, XS-16.
- **Hardening:** full [Phase 9](./phase-9-qa-checklist.md) pass, load test against NFR-CAP, dependency-failure drills (NFR-AV-4), penetration test remediation (SEC-9), accessibility audit and VPAT (NFR-A11Y-1), cross-browser matrix, go/no-go (§15).

## 4. Milestones

| ID | Milestone | Date | Exit criteria |
| --- | --- | --- | --- |
| M1 | Accounts ready | 2026-10-30 | Both sides register, verify, onboard, invite; guards enforced; SSO tested with Okta and Entra ID in staging; Phase 9 §1, §15 items for access pass |
| M2 | Marketplace alpha | 2026-11-27 | A load goes from quote to booked with signed rate confirmation by a compliance-approved carrier; a 500-row import posts; approvals complete the original action |
| M3 | Lifecycle beta | 2027-01-08 | A load goes from quote to paid and settled, with tracking, POD and an accepted amendment, on the internal test network; audit log shows every step |
| M4 | Launch candidate | 2027-02-05 | All pages Verified; Phase 9 blocking items pass; performance, security and accessibility sign-off; go/no-go passed (§15) |
| M5 | Enterprise ready | 2027-01-22 | SSO enforced with SCIM, approvals, bulk import, templates, amendments, audit export, data export, reports and API keys Verified; security questionnaire answerable from evidence (OPS-5) |

## 5. Dependencies

| Dependency | Needed by | Owner | Fallback |
| --- | --- | --- | --- |
| Backend modules with `@ApiEnvelope` DTOs: auth extensions (MFA, reset, invites), organisations | S1–S2 | Backend | Seed data in `lib/data/` behind the same hooks (Phase 7 §11) |
| Identity service: SAML/OIDC, SCIM, domain verification, session policy | S2 | Backend, security | Staging identity-provider tenants (Okta developer, Entra ID test) |
| Loads, quotes, custom quote requests, facilities, stats, templates | S3 | Backend | Same seed-data fallback |
| Bids, tenders, load board search index, compliance, e-signature, approvals, import jobs | S4 | Backend | Same seed-data fallback; e-signature stubbed with a recorded acceptance |
| Fleet, trips, stop events, positions, tracking tokens, documents, amendments | S5 | Backend | Same seed-data fallback; positions simulated from seed tracks |
| Invoices, settlements, payments processor, claims, audit store, export jobs | S6 | Backend, finance | Processor sandbox |
| Messages, notifications, metrics, tickets, reporting service, API keys, webhooks, fleet plan and truck availability | S7 | Backend | Same seed-data fallback |
| Exceptions, admin config, view-as sessions | S8 | Backend | Same seed-data fallback |
| Library approvals (Phase 7 §15) | S1 forms, tests, observability; S5 map base layer; S6 processor SDK; S7 charts, analytics | Maintainer | Build contracts without the library only where the host allows (for example native form handling) |
| Per-page visual concept approval | Before each page starts | Owner, designer | Page is not started until approved |
| `pnpm contract` regeneration after each backend change | Continuous | Frontend | `pnpm contract:check` fails the gate |
| Legal: carrier agreement, shipper terms, privacy notice, DPA, sub-processor list | S2 (agreements), S6 (DPA) | Legal | Launch blocked without them (CMP-4, CMP-7) |
| Penetration test vendor | Booked by S5, executed S7 | Security | Launch blocked on unresolved critical or high findings |
| Legal review of the dispatch board's hours display: ELD hours shown as reported, never evaluated, no carrier hours decision stored (XF-17) | S7 | Legal, product | PG-65 ships without hours until cleared |

## 6. Risk Assessment

| ID | Risk | Likelihood | Impact | Mitigation | Owner |
| --- | --- | --- | --- | --- | --- |
| R-01 | Backend endpoints lag frontend sprints | High | High | Seed data behind hook signatures; contract-first DTO reviews one sprint ahead | Engineering manager |
| R-02 | Library approvals delay forms, maps or tests | Medium | Medium | Request approvals in S1; list alternatives in Phase 7 §15 | Tech lead |
| R-03 | Server Actions serialise polled reads (D-2) | High if D-2 rejected | Medium | Route Handler relays for polled reads; measure INP on PG-40 | Tech lead |
| R-04 | Map accessibility gaps | Medium | High | Text equivalent is the reference (PP-08); map is additive | Accessibility lead |
| R-05 | Mobile browsers restrict background location | High | High | Tracking prefers ELD; driver web collects only while open; check-call fallback; native app in Phase 1 §16 | Product |
| R-06 | Payments processor not selected in time | Medium | High | Sandbox integration behind IC-42; decision due by S4 | Finance lead |
| R-07 | 66 pages in 16 weeks exceeds capacity | High | High | Capacity check in §13; enterprise track staffed separately; deferral candidates pre-agreed with the maintainer; never deletion | Engineering manager |
| R-08 | `forbidden()` requires an experimental flag in Next.js 16 | Medium | Low | Fallback: `notFound()` for access-denied routes plus the PG-55 route | Tech lead |
| R-09 | Contract drift between backend and frontend | Medium | High | `pnpm contract:check` in CI | Tech lead |
| R-10 | Visual concept approval becomes a bottleneck | Medium | Medium | Concepts produced one sprint ahead for the next sprint's pages | Designer |
| R-11 | Offline replay conflicts with geofence events | Medium | Medium | Server wins; driver told (IC-29) | Tech lead |
| R-12 | Fraud (carrier impersonation) exploits onboarding | Medium | High | Compliance review (PG-51) required before booking; fraud signals (SC-51.3); OFAC screening (CMP-11) | Compliance lead |
| R-13 | Identity-provider variance breaks SSO for some customers | Medium | High | Interop tests with Okta, Entra ID, Google Workspace, OneLogin; diagnostics in SC-60.2; break-glass admin | Security engineer |
| R-14 | Cross-tenant data exposure | Low | Critical | Server-side scoping (SEC-5), automated isolation tests per resource (§8), organisation in query keys (Phase 7 §23), SSB-10 purges | Security engineer |
| R-15 | SOC 2 evidence gaps discovered late | Medium | High | Controls mapped to CI, audit log and access reviews from S1; readiness assessment at M5 | Security engineer |
| R-16 | Poor-quality customer import files flood support | Medium | Medium | Column dictionary, saved mappings, row-level outcomes and a results file (IC-61); import help articles | Product |
| R-17 | Amendments dispute rates rise because carriers feel squeezed | Medium | Medium | Materiality rules, penalty-free cancellation (BR-25), time-to-decision tracked | Product |

## 7. Technical Debt Prevention

- **Gates:** `pnpm type-check`, `pnpm lint`, `pnpm contract:check`, `pnpm test` run in CI on every PR (host hooks are disabled locally, so CI is the gate).
- **ESLint rules** in Phase 7 §20 enforce page composition, file shape, type homes, transport boundaries, `withAction` wrapping and the analytics catalogue; proposed rules added in S1.
- **150-line rule:** any file approaching the limit is split in the same PR.
- **No inline copy or paths:** constants and `appRoutes` only.
- **Feature flag hygiene:** every flag has an owner and removal date (Phase 7 §22); expired flags fail CI.
- **Traceability:** every PR title cites the design OS ID it implements (Phase 7 §16) and updates §9 status.
- **Deviation record:** any departure from Phases 1–7 is recorded as a decision in the phase it changes, with its reason, before merge.
- **Seed data retirement:** each `lib/data/` seed used as a backend fallback has an owner and is removed only when the endpoint ships and the maintainer names it for removal.
- **Dependency hygiene:** automated update PRs weekly; critical vulnerabilities within 7 days (SEC-9).
- **Scope preservation:** unfinished work changes status here; it is never deleted from Phases 1–7.

## 8. Testing Strategy

| Level | Tool | Scope | Target |
| --- | --- | --- | --- |
| Unit | Vitest (installed) | `lib/loads/transitions.ts` against Phase 2 §5, §5.1 and §6 tables, formatters, reducers, schemas, query-string, offline queue, error-class mapping, flags | 90% line coverage in `lib/` |
| Property | fast-check (installed) | State machines (no illegal transition reachable), money formatting, date windows, import row validation | Every state machine |
| Component | Testing Library (proposed) | Every Phase 6 contract's states, keyboard support and ARIA | Every IC- contract |
| Integration | Vitest + mocked `backendFetch` | Server Actions and Route Handlers: parsing, error mapping (Phase 4 §2.2), `withAction` guards, version handling (IC-67) | Every action and handler |
| End-to-end | Playwright (proposed) | Every XF- and XS- flow's happy path plus listed failure paths | Every flow in Phase 2 |
| Accessibility | axe with Playwright (proposed) + manual screen reader passes (NVDA + Firefox, VoiceOver + Safari iOS) | Every page, every state class | Zero serious or critical violations; VPAT at launch |
| Performance | Lighthouse CI (proposed) + field RUM | Budgets in Phase 7 §18 | All budgets met at p75 |
| Load | k6 (proposed) against staging | NFR-CAP-1 … 3, NFR-PERF-3 … 5 | Targets met at 1.5× peak |
| Resilience | Dependency failure injection in staging | Pricing, maps, registry, processor, e-signature, SMS each down in turn | Only the dependent capability degrades (NFR-AV-4) |
| Security | OWASP ZAP (proposed) in CI against preview; ASVS L2 checklist; third-party penetration test | SEC-1 … SEC-10 | No open critical or high findings |
| Tenant isolation | Integration suite with two seeded organisations | Every resource: read, list, mutate across tenants | 100% of resources return not found across tenants |
| SSO interop | Staging tenants for Okta, Entra ID, Google Workspace, OneLogin | SAML and OIDC sign-in, SCIM create, update, deactivate | All pass before M1 and M5 |
| Privacy | Automated scan of analytics and error payloads | NFR-PRIV-3 | No PII fields detected |
| Contract | `pnpm contract:check` | Generated contract matches backend | Always green |

## 9. Per-Feature Build Status

### 9.1 Build Status Vocabulary

Every page, section, interaction contract and flow carries exactly one status:

- **Specified** — defined in the blueprints, not yet scheduled.
- **Scheduled** — assigned to a sprint or milestone.
- **In progress** — implementation started.
- **Built** — implemented and merged.
- **Verified** — implemented and passing the Phase 9 checks.
- **Deferred** — deliberately postponed. Carries a reason and a revisit trigger (a date, a milestone, or a dependency).

A feature with no implementation is **Specified**, not absent. Status is never resolved by deletion.

**Baseline as of 2026-09-30:** the starter already contains a sign-in page (`app/auth/login`), login form, session and register route handlers, login/register/logout hooks and a button primitive. Those items are **In progress** (they exist but need Haulr extensions and Phase 9 verification). Everything else is **Scheduled**.

**Update 2026-10-09:**

- **PG-01 Home** was built ahead of its S3 slot at `app/page.tsx`, so it is **In progress** with SC-01.1, SC-01.2 and SC-01.4. Still open: SC-01.2 suggestions use a static list, not IC-05 (`use-location-suggestions`), and SC-01.4 is not yet session-aware. SC-01.3 stays **Scheduled**. The page states product targets, not the network statistics SC-01.3 requires from the `stats` endpoint.
- **PG-10 Sign In** is now identity-first (email, then password), the shape SC-10.3 needs for SSO discovery. SC-10.2 is **In progress** (`components/auth/recovery-nav.tsx`). IC-01, IC-02 and IC-03 are **In progress**: `components/ui/input.tsx`, `components/common/panel-field.tsx` (label, error wiring and reveal), `components/common/error-summary.tsx` and `lib/hooks/use-caps-lock.ts`.

### 9.2 Flows

| ID | Status | Sprint | ID | Status | Sprint |
| --- | --- | --- | --- | --- | --- |
| XF-01 | Scheduled | S3 | XD-01 | Scheduled | S7 |
| XF-02 | Scheduled | S4 | XD-02 | Scheduled | S7 |
| XF-03 | Scheduled | S4 | XD-03 | Scheduled | S5 |
| XF-04 | Scheduled | S4 | XD-04 | Scheduled | S8 |
| XF-05 | Scheduled | S5 | XD-05 | Scheduled | S4 |
| XF-06 | Scheduled | S5 | XD-06 | Scheduled | S8 |
| XF-07 | Scheduled | S5 | XD-07 | Scheduled | S8 |
| XF-08 | Scheduled | S8 | XD-08 | Scheduled | S8 |
| XF-09 | Scheduled | S5–S6 | XS-01 | In progress | S1 |
| XF-10 | Scheduled | S6 | XS-02 | Scheduled | S2 |
| XF-11 | Scheduled | S6 | XS-03 | Scheduled | S7 |
| XF-12 | Scheduled | S2, S4 | XS-04 | Scheduled | S7 |
| XF-13 | Scheduled | S2 | XS-05 | Scheduled | S7 |
| XF-14 | Scheduled | S3–S4 | XS-06 | Scheduled | S6 |
| XF-15 | Scheduled | S5 | XS-07 | Scheduled | S7 |
| XF-16 | Scheduled | S4 | XS-08 | Scheduled | S6 |
| XF-17 | Scheduled | S7 | XS-09 | Scheduled | S4 |
| | | | XS-10 | Scheduled | S3 |
| | | | XS-11 | Scheduled | S3 |
| | | | XS-12 | Scheduled | S6 |
| | | | XS-13 | Scheduled | S2 |
| | | | XS-14 | Scheduled | S7 |
| | | | XS-15 | Scheduled | S6 |
| | | | XS-16 | Scheduled | S8 |
| | | | XS-17 | Scheduled | S6 |
| | | | XS-18 | Scheduled | S3 |

### 9.3 Pages

Size: **S** ≈ 2 engineer-days, **M** ≈ 5, **L** ≈ 10, **XL** ≈ 15, excluding shared sections and contracts (§13).

| ID | Page | Size | Status | Sprint | ID | Page | Size | Status | Sprint |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PG-01 | Home | M | In progress | S3 (started early) | PG-33 | Load Board | L | Scheduled | S4 |
| PG-02 | Public Tracking | M | Scheduled | S5 | PG-34 | Book Load | M | Scheduled | S4 |
| PG-03 | Carrier Public Profile | S | Scheduled | S4 | PG-35 | My Loads (carrier) | M | Scheduled | S4–S5 |
| PG-04 | Shipper Public Profile | S | Scheduled | S4 | PG-36 | Saved Loads and Searches | S | Scheduled | S4 |
| PG-05 | Lane Rate Estimator | M | Scheduled | S3 | PG-37 | Fleet | M | Scheduled | S5 |
| PG-06 | Help Center | S | Scheduled | S7 | PG-38 | Settlements | M | Scheduled | S6 |
| PG-07 | Help Article | S | Scheduled | S7 | PG-39 | Driver Trip | XL | Scheduled | S5 |
| PG-08 | Contact Support | S | Scheduled | S7 | PG-40 | Load Details | XL | Scheduled | S3–S7 |
| PG-09 | Legal | S | Scheduled | S2 | PG-41 | Messages | M | Scheduled | S7 |
| PG-10 | Sign In | S | In progress | S1 | PG-42 | Notifications | S | Scheduled | S7 |
| PG-11 | Register | S | In progress | S1 | PG-43 | Documents | M | Scheduled | S6 |
| PG-12 | Forgot Password | S | Scheduled | S1 | PG-44 | Claims | S | Scheduled | S6 |
| PG-13 | Reset Password | S | Scheduled | S1 | PG-45 | Claim Detail | M | Scheduled | S6 |
| PG-14 | Verify | S | Scheduled | S1 | PG-46 | Profile | S | Scheduled | S2 |
| PG-15 | Accept Invitation | S | Scheduled | S1 | PG-47 | Settings | M | Scheduled | S2, S7 |
| PG-16 | Shipper Onboarding | M | Scheduled | S2 | PG-48 | Organization and Team | M | Scheduled | S2, S4 |
| PG-17 | Carrier Onboarding | L | Scheduled | S2 | PG-49 | Payment and Payout Methods | M | Scheduled | S6 |
| PG-18 | Shipper Dashboard | M | Scheduled | S7 | PG-50 | Exception Queue | L | Scheduled | S8 |
| PG-19 | Carrier Dashboard | M | Scheduled | S7 | PG-51 | Carrier Vetting Review | M | Scheduled | S4 |
| PG-20 | Driver Home | S | Scheduled | S5 | PG-52 | Accounts | M | Scheduled | S8 |
| PG-21 | Operations Dashboard | M | Scheduled | S8 | PG-53 | Not Found | S | Scheduled | S1 |
| PG-22 | Compliance Dashboard | S | Scheduled | S4 | PG-54 | Server Error | S | Scheduled | S1 |
| PG-23 | Finance Operations Dashboard | M | Scheduled | S6, S8 | PG-55 | Access Denied | S | Scheduled | S1 |
| PG-24 | Support Console | L | Scheduled | S8 | PG-56 | Bulk Load Import | L | Scheduled | S4 |
| PG-25 | Admin Dashboard | M | Scheduled | S8 | PG-57 | Templates and Recurring Loads | M | Scheduled | S3 |
| PG-26 | Shipments | L | Scheduled | S3, S5 | PG-58 | Approvals | M | Scheduled | S4 |
| PG-27 | Post a Load | XL | Scheduled | S3 | PG-59 | Reports | L | Scheduled | S7 |
| PG-28 | Compare Bids | M | Scheduled | S4 | PG-60 | Security and SSO | L | Scheduled | S2 |
| PG-29 | Preferred Carriers | M | Scheduled | S4 | PG-61 | Integrations | L | Scheduled | S7 |
| PG-30 | Invoices | M | Scheduled | S6 | PG-62 | Data and Privacy | M | Scheduled | S6 |
| PG-31 | Invoice Detail and Pay | M | Scheduled | S6 | PG-63 | Audit Log | S | Scheduled | S6 |
| PG-32 | Locations | M | Scheduled | S3 | PG-64 | Review Amendment | M | Scheduled | S5 |
| PG-65 | Dispatch Board | L | Scheduled | S7 | PG-66 | Quote Desk | M | Scheduled | S3 |

### 9.4 Sections

Each section appears once. Where a group of sections shares one status and sprint, they are listed together.

| Sections | Status | Sprint |
| --- | --- | --- |
| SH-03, SH-06, SH-13 | Scheduled | S2 |
| SH-01, SH-05, SH-14 | Scheduled | S3 |
| SH-09 | Scheduled | S4 |
| SH-02, SH-15 | Scheduled | S5 |
| SH-11 | Scheduled | S6 |
| SH-04, SH-07, SH-08, SH-10, SH-12 | Scheduled | S7 |
| SC-10.1, SC-10.2 | In progress | S1 |
| SC-11.2 | In progress | S1 |
| SC-01.1, SC-01.2, SC-01.4 | In progress | S3 (started early) |
| SC-11.1, SC-12.1, SC-13.1, SC-14.1, SC-14.2, SC-15.1, SC-15.2, SC-53.1, SC-54.1, SC-55.1 | Scheduled | S1 |
| SC-09.1, SC-10.3, SC-16.1 … SC-16.4, SC-17.1 … SC-17.6, SC-46.1, SC-46.2, SC-47.1, SC-47.2, SC-48.1 … SC-48.3, SC-60.1 … SC-60.5 | Scheduled | S2 |
| SC-01.3, SC-05.1 … SC-05.4, SC-26.1, SC-27.1 … SC-27.7, SC-32.1, SC-32.2, SC-40.1, SC-40.2, SC-40.3, SC-40.7, SC-40.8, SC-57.1 … SC-57.3, SC-66.1 … SC-66.3 | Scheduled | S3 |
| SC-03.1 … SC-03.3, SC-04.1, SC-04.2, SC-22.1 … SC-22.3, SC-28.1 … SC-28.4, SC-29.1, SC-29.2, SC-33.1 … SC-33.5, SC-34.1 … SC-34.4, SC-35.1, SC-36.1, SC-36.2, SC-40.4, SC-40.17, SC-48.4, SC-51.1 … SC-51.5, SC-56.1 … SC-56.4, SC-58.1 … SC-58.4 | Scheduled | S4 |
| SC-02.1 … SC-02.3, SC-20.1 … SC-20.3, SC-26.2, SC-26.3, SC-35.2, SC-37.1, SC-37.2, SC-39.1 … SC-39.7, SC-40.5, SC-40.6, SC-40.12, SC-40.15, SC-40.16, SC-64.1 … SC-64.4 | Scheduled | S5 |
| SC-23.1, SC-30.1 … SC-30.3, SC-31.1 … SC-31.4, SC-38.1 … SC-38.4, SC-40.9, SC-40.10, SC-40.13, SC-43.1, SC-43.2, SC-44.1, SC-44.2, SC-45.1 … SC-45.4, SC-49.1 … SC-49.3, SC-62.1, SC-62.2, SC-63.1, SC-63.2 | Scheduled | S6 |
| SC-06.1 … SC-06.3, SC-07.1 … SC-07.3, SC-08.1, SC-08.2, SC-18.1 … SC-18.5, SC-19.1 … SC-19.5, SC-40.11, SC-40.14, SC-41.1, SC-41.2, SC-42.1, SC-42.2, SC-47.3, SC-59.1 … SC-59.3, SC-61.1 … SC-61.3, SC-65.1 … SC-65.4 | Scheduled | S7 |
| SC-21.1 … SC-21.4, SC-23.2 … SC-23.5, SC-24.1 … SC-24.4, SC-25.1 … SC-25.3, SC-50.1 … SC-50.4, SC-52.1 … SC-52.4 | Scheduled | S8 |

Check: 15 shared + 223 page sections = 238, matching [Phase 5 §13](./phase-5-section-blueprints.md#13-section-inventory).

### 9.5 Interaction Contracts

| Contracts | Status | Sprint |
| --- | --- | --- |
| IC-11 | In progress (starter `button.tsx`) | S1 |
| IC-01, IC-02, IC-03 | In progress (`input.tsx`, `panel-field.tsx`, `error-summary.tsx`, `use-caps-lock.ts`) | S1 |
| IC-04, IC-07, IC-09, IC-12, IC-14, IC-41, IC-51, IC-52, IC-59, IC-60 | Scheduled | S1 |
| IC-05, IC-13, IC-15, IC-24, IC-26, IC-38, IC-39, IC-58, IC-63, IC-67 | Scheduled | S2 |
| IC-08, IC-19, IC-20, IC-21, IC-22, IC-23, IC-32, IC-40, IC-46, IC-56, IC-57 | Scheduled | S3 |
| IC-18, IC-27, IC-28, IC-33, IC-34, IC-61, IC-62 | Scheduled | S4 |
| IC-06, IC-10, IC-25, IC-29, IC-30, IC-31, IC-44, IC-55, IC-66 | Scheduled | S5 |
| IC-42, IC-43, IC-65 | Scheduled | S6 |
| IC-16, IC-17, IC-35, IC-36, IC-37, IC-45, IC-50, IC-53, IC-54, IC-68 | Scheduled | S7 |
| IC-47, IC-48, IC-49, IC-64 | Scheduled | S8 |

Check: 68 contracts, matching [Phase 6 §13](./phase-6-interaction-contracts.md#13-contract-usage-index).

### 9.6 Deferred register

Empty at version 1.1.1. An entry requires: the item's ID, the reason, the revisit trigger (date, milestone or dependency) and the maintainer who approved the deferral. Pre-agreed deferral candidates if capacity (§13) falls short are listed there; they remain **Scheduled** until the maintainer approves a deferral.

## 10. Deployment Readiness

- **Environments:** local, preview (per PR), staging (backend staging, identity-provider test tenants, processor sandbox), production. Variables validated by `lib/validations/env.ts` (D-9).
- **Configuration:** CSP and security headers (Phase 7 §19); `images.remotePatterns` for storage; map tile, processor and telemetry keys as environment variables, never committed; flags per environment (Phase 7 §22).
- **Observability:** tracing, error reporting, RUM and SLO alerts live before M3 (Phase 7 §21, NFR-OBS-1 … 4); KPI events from the Phase 7 §27 catalogue verified in staging.
- **SEO:** `sitemap.ts`, `robots.ts`, metadata and structured data per Phase 3 §11 verified in staging.
- **Security:** dependency audit; DAST in CI; third-party penetration test with no open critical or high findings; rate limits verified on anonymous and authentication endpoints (SEC-10).
- **Compliance:** VPAT published (NFR-A11Y-1); privacy notice and sub-processor list published (NFR-PRIV-7); DPA template available (OPS-5); broker MC number displayed (CMP-1).
- **Support readiness:** runbooks for every dependency (OPS-4); support tiers staffed (OPS-1); status page live (OPS-3); help centre articles for every Phase 2 flow.
- **Rollout:** internal test network (Haulr staff as shipper and carrier) from M3; limited pilot with invited shippers and carriers after M4; enterprise pilots after M5 with SSO enforced; progressive expansion by flag (§14).
- **Rollback:** each deployment immutable; previous deployment promotable in under 5 minutes; database-coupled changes coordinated with backend migrations (expand, migrate, contract); flags as kill switches.
- **Launch gate:** §15.

## 11. Definition of Ready and Definition of Done

**Definition of Ready** (a page or section may enter a sprint when):

1. Its Phase 4 blueprint and Phase 5 sections have no open questions, and every thin field has been resolved to the Phase 4 §2 taxonomy.
2. Every contract it cites exists in Phase 6 and is Built, or is scheduled in the same sprint ahead of it.
3. The backend DTOs are published in the contract, or seed data with the same shape exists in `lib/data/`.
4. The visual concept is approved by the owner.
5. Analytics events are in the Phase 7 §27 catalogue and audit actions are agreed with the backend.
6. Acceptance criteria in the Phase 4 implementation notes are testable.

**Definition of Done** (Built → Verified requires all of these):

1. Code merged with CI green (type-check, lint, test, contract check, DAST baseline).
2. Every Phase 4 and Phase 5 state class implemented and tested (LS, E, EM, SU).
3. Every cited contract passes its component tests; axe shows zero serious or critical violations; the screen-reader pass is recorded.
4. E2E tests for the served flows pass, including failure paths.
5. Acceptance criteria pass; analytics and audit events verified in staging.
6. Tenant-isolation and permission tests pass for every new resource.
7. Performance budget met on the page's route.
8. Owner reviewed the rendered page.
9. Help article updated or created.
10. §9 status updated in the same PR.

## 12. Roles and Responsibilities

R = responsible, A = accountable, C = consulted, I = informed.

| Activity | Product | Design | Frontend lead | Backend lead | QA | Security | Compliance / legal | Owner |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Phases 1–3 changes | A/R | C | C | C | I | C | C | I |
| Per-page visual concept | C | R | C | — | I | — | — | A |
| Phases 4–6 changes | A | C | R | C | C | C | — | I |
| Phase 7 decisions | C | — | A/R | C | I | C | — | I |
| Sprint scope and §9 status | A | C | R | R | C | — | — | I |
| Library approvals | I | — | R | C | — | C | — | A |
| Security controls (SEC-*) | I | — | R | R | C | A | C | I |
| Compliance obligations (CMP-*) | C | — | C | R | I | C | A | I |
| Verification (Phase 9) | I | C | C | C | A/R | C | C | I |
| Go/no-go | R | C | C | C | C | C | C | A |

## 13. Estimation and Capacity

| Work | Basis | Engineer-days |
| --- | --- | --- |
| Pages (§9.3 sizes: 22 S, 31 M, 10 L, 3 XL) | S 2, M 5, L 10, XL 15 | 344 |
| Shared sections SH-01 … SH-15 | ≈ 3 each | 45 |
| Interaction contracts IC-01 … IC-68 | ≈ 1.5 each | 102 |
| Foundations (guards, taxonomy, observability, flags, env, security headers, providers) | Fixed | 40 |
| Hardening and defect fixing | 15% of the preceding rows | 80 |
| **Total** | | **≈ 611** |

Capacity: 8 engineers × 16 weeks × 5 days × 0.75 focus factor ≈ **480 engineer-days**.

**Result: a shortfall of roughly 130 engineer-days (about 21%).** This is stated so it can be managed, not hidden. Options, in the order recommended:

1. Add one engineer to the enterprise track from S3 (+ ≈ 50 days) and one to the core track from S5 (+ ≈ 30 days).
2. Pre-agree deferral candidates with the maintainer, to be applied only if the burn-down at M2 confirms the gap: EDI connections (SC-61.3), recurring schedules (SC-57.3), report schedules (SC-59.3), personal-throughput metrics (SC-21.4), saved report views, and the dispatch board (PG-65 with SC-65.1 … SC-65.4, IC-68 and XF-17; about 13 engineer-days with hardening, and off the quote-to-paid path). The quote desk (PG-66) is not a candidate: without it, custom quote requests in XF-01 have no answer. Deferred items keep their specs and move to §9.6 with a revisit trigger of "M4 + 4 weeks".
3. Extend the timeline by one sprint (to 2027-02-19).

Burn-down is reviewed at every milestone; the decision among these options is due at M2.

## 14. Release Management

- **Trunk-based development** on `development`; releases promoted to `main` weekly after staging verification; hotfixes branch from `main` and merge back.
- **Feature flags** (Phase 7 §22) ship unfinished capabilities dark. Enterprise capabilities roll out per organisation during pilots.
- **Versioning:** release tags `vYYYY.MM.DD.n`; each release records its design OS version and the §9 status snapshot.
- **Change communication:** release notes for customers by role; enterprise admins are notified 14 days ahead of changes to security, integration or approval behaviour (OPS-5).
- **API and webhook compatibility:** backwards-compatible changes only within a major API version; deprecations announced 6 months ahead (BR-29).

## 15. Go/No-Go and Hypercare

**Go/no-go criteria for M4 (all required):**

1. Every page **Verified** or formally **Deferred** with maintainer approval.
2. Phase 9 blocking items pass, including §15 (business rules and security) and §16 (enterprise).
3. NFR-AV, NFR-PERF and NFR-CAP targets met in staging load tests.
4. No open critical or high security findings; SOC 2 readiness gaps have owners and dates.
5. VPAT published; privacy notice, terms, carrier agreement and sub-processor list published.
6. Runbooks, on-call rota and status page live; support staffed per OPS-1.
7. Rollback rehearsed within the last 7 days.

**Hypercare (4 weeks after launch):**

- Daily triage of errors, SLO burn and support tickets.
- Named on-call engineer per role family (shipper, carrier, driver, internal).
- A weekly review of KPI-01 … KPI-12 against targets with product.
- A freeze on non-critical changes to money and identity flows.
- Exit when there are two consecutive weeks within SLO with no severity-1 incidents.
