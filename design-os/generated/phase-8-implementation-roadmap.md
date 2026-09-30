# Phase 8 — Implementation Roadmap

`Haulr Design OS` · `Version 1.0.0` · `2026-09-30` · Previous: [Phase 7 — Frontend Architecture](./phase-7-frontend-architecture.md) · Next: [Phase 9 — QA Checklist](./phase-9-qa-checklist.md)

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

**Planning assumptions.** Six frontend engineers, one QA engineer, one product designer working with the owner on per-page visual concepts, backend delivered by the NestJS team one sprint ahead of each frontend sprint. Sprint 1 starts 2026-10-05; Sprint 8 ends 2027-02-05. The two holiday weeks starting 2026-12-21 and 2026-12-28 are excluded, so Sprint 6 runs 2026-12-14 → 2026-12-18 and 2027-01-04 → 2027-01-08.

---

## 1. Development Phases

| Phase | Sprints | Outcome |
| --- | --- | --- |
| A — Foundations | S1 | Route groups, guards, providers, constants, enums, core primitives, access pages, system pages, test tooling |
| B — Accounts and onboarding | S2 | Both sides can register, onboard, invite and manage their organisation |
| C — Posting | S3 | Shippers can quote, post and follow loads; public estimator and home |
| D — Marketplace | S4 | Carriers can search, bid, book and sign; shippers compare bids and tender; compliance can approve carriers |
| E — Execution | S5 | Dispatch, driver workflow, POD capture, live tracking, public tracking |
| F — Money | S6 | Invoices, payment, settlements, quick pay, accessorials, claims, documents |
| G — Communication and dashboards | S7 | Messages, notifications, preferences, help, role dashboards, driver offline hardening |
| H — Operations and launch | S8 | Internal tools, exception handling, full QA pass, performance and accessibility sign-off |

## 2. Priority Order

Priority follows the North Star (Phase 1 §10): a load must be able to go from quote to paid before anything that optimises it.

1. **Access and safety:** XS-01, XS-02, XF-12, XF-13 (nobody transacts without them).
2. **Core lifecycle:** XF-01 → XF-02 → XF-05 → XF-06 → XF-07 → XF-09 → XF-10 → XF-11.
3. **Market efficiency:** XF-03, XF-04, XS-09, XS-10.
4. **Resilience:** XF-08, XS-06, offline driver workflow.
5. **Engagement and support:** XS-03, XS-04, XS-05, XS-07, XS-11, XS-12, dashboards XD-01 … XD-08.

## 3. Sprint Breakdown

Every page is built from its Phase 4 blueprint, Phase 5 sections and Phase 6 contracts. Before coding a page, its visual concept is produced with the repo's UI skills and approved by the owner (see [IMPLEMENTATION_PROMPT › Visual Design Hand-off](./IMPLEMENTATION_PROMPT.md#visual-design-hand-off)).

### Sprint 1 — Foundations (2026-10-05 → 2026-10-16)

- **Architecture:** route groups and layouts (Phase 7 §3–4); `PROTECTED_ROUTE_PREFIXES` and internal-role guard in `proxy.ts` (D-7); `appRoutes`; `lib/enums/`; feature constants folders; announcer and session providers; `section-boundary`.
- **Contracts:** IC-01, IC-02, IC-03, IC-04, IC-07, IC-09, IC-11, IC-12, IC-14, IC-41, IC-51, IC-52, IC-59, IC-60.
- **Pages:** PG-10 (extend), PG-11, PG-12, PG-13, PG-14, PG-15, PG-53, PG-54, PG-55, dashboard redirect.
- **Flows:** XS-01.
- **Decisions to close:** D-2 confirmation; library approvals for forms and testing; `forbidden()` availability (R-08).

### Sprint 2 — Accounts and onboarding (2026-10-19 → 2026-10-30)

- **Contracts:** IC-05, IC-13, IC-15, IC-24, IC-26, IC-38, IC-39, IC-58.
- **Shared sections:** SH-03, SH-06, SH-13.
- **Pages:** PG-16, PG-17, PG-46, PG-47 (password, MFA, sessions), PG-48, PG-09.
- **Flows:** XS-02, XF-13, XF-12 (carrier side).

### Sprint 3 — Posting (2026-11-02 → 2026-11-13)

- **Contracts:** IC-08, IC-19, IC-20, IC-21, IC-22, IC-23, IC-32, IC-40, IC-46, IC-56, IC-57.
- **Shared sections:** SH-01, SH-05, SH-14.
- **Pages:** PG-27, PG-32, PG-26 (collection), PG-40 (SC-40.1, 40.2, 40.3, 40.7, 40.8), PG-05, PG-01.
- **Flows:** XF-01, XS-10, XS-11.

### Sprint 4 — Marketplace (2026-11-16 → 2026-11-27)

- **Contracts:** IC-18, IC-27, IC-28, IC-33, IC-34.
- **Shared sections:** SH-09.
- **Pages:** PG-33, PG-34, PG-36, PG-28, PG-29, PG-03, PG-04, PG-35 (collection), PG-22, PG-51, PG-40 (SC-40.4).
- **Flows:** XF-02, XF-03, XF-04, XS-09, XF-12 (compliance side), XD-05.

### Sprint 5 — Execution and tracking (2026-11-30 → 2026-12-11)

- **Contracts:** IC-06, IC-10, IC-25, IC-29, IC-30, IC-31, IC-44, IC-55.
- **Shared sections:** SH-02, SH-15.
- **Pages:** PG-37, PG-35 (assignment), PG-20, PG-39, PG-02, PG-40 (SC-40.5, 40.6, 40.12, 40.15), PG-26 (map, sharing).
- **Flows:** XF-05, XF-06, XF-07, XF-09 (capture), XD-03.
- **Library approval needed:** map library.

### Sprint 6 — Money (2026-12-14 → 2027-01-08, holiday weeks excluded)

- **Contracts:** IC-42, IC-43.
- **Pages:** PG-30, PG-31, PG-38, PG-49, PG-43, PG-44, PG-45, PG-40 (SC-40.9, 40.10, 40.13), PG-23 (SC-23.1 POD queue).
- **Flows:** XF-09 (verification), XF-10, XF-11, XS-06, XS-08, XS-12.
- **Library approval needed:** processor SDK.

### Sprint 7 — Communication, dashboards and offline (2027-01-11 → 2027-01-22)

- **Contracts:** IC-16, IC-17, IC-35, IC-36, IC-37, IC-45, IC-50, IC-53, IC-54.
- **Shared sections:** SH-04, SH-07, SH-08, SH-10, SH-12.
- **Pages:** PG-41, PG-42, PG-47 (notification preferences), PG-18, PG-19, PG-06, PG-07, PG-08, PG-40 (SC-40.11, 40.14); driver service worker caching.
- **Flows:** XS-03, XS-04, XS-05, XS-07, XD-01, XD-02.
- **Library approval needed:** charts.

### Sprint 8 — Operations and launch (2027-01-25 → 2027-02-05)

- **Contracts:** IC-47, IC-48, IC-49.
- **Shared sections:** SH-11.
- **Pages:** PG-21, PG-23 (remaining), PG-24, PG-25, PG-50, PG-52.
- **Flows:** XF-08, XD-04, XD-06, XD-07, XD-08.
- **Hardening:** full [Phase 9](./phase-9-qa-checklist.md) pass, performance budgets, accessibility audit, cross-browser matrix, security review, launch checklist (§10).

## 4. Milestones

| ID | Milestone | Date | Exit criteria |
| --- | --- | --- | --- |
| M1 | Accounts ready | 2026-10-30 | Both sides register, verify, onboard, invite; guards enforced; QA-A (access) items pass |
| M2 | Marketplace alpha | 2026-11-27 | A load goes from quote to booked with signed rate confirmation by a compliance-approved carrier |
| M3 | Lifecycle beta | 2027-01-08 | A load goes from quote to paid and settled, with tracking and POD, on the internal test network |
| M4 | Launch candidate | 2027-02-05 | All pages Verified; Phase 9 blocking items pass; performance and accessibility sign-off |

## 5. Dependencies

| Dependency | Needed by | Owner | Fallback |
| --- | --- | --- | --- |
| Backend modules with `@ApiEnvelope` DTOs: auth extensions (MFA, reset, invites), organisations | S1–S2 | Backend | Seed data in `lib/data/` behind the same hooks (Phase 7 §11) |
| Loads, quotes, facilities, stats | S3 | Backend | Same seed-data fallback |
| Bids, tenders, load board search index, compliance, e-signature | S4 | Backend | Same seed-data fallback; e-signature stubbed with a recorded acceptance |
| Fleet, trips, stop events, positions, tracking tokens, documents | S5 | Backend | Same seed-data fallback; positions simulated from seed tracks |
| Invoices, settlements, payments processor, claims | S6 | Backend, finance | Processor sandbox |
| Messages, notifications, metrics, tickets | S7 | Backend | Same seed-data fallback |
| Exceptions, audit, admin config | S8 | Backend | Same seed-data fallback |
| Library approvals (Phase 7 §15) | S1 forms, tests; S5 maps; S6 processor SDK; S7 charts | Maintainer | Build contracts without the library only where the host allows (for example native form handling) |
| Per-page visual concept approval | Before each page starts | Owner, designer | Page is not started until approved |
| `pnpm contract` regeneration after each backend change | Continuous | Frontend | `pnpm contract:check` fails the gate |

## 6. Risk Assessment

| ID | Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- | --- |
| R-01 | Backend endpoints lag frontend sprints | High | High | Seed data behind hook signatures; contract-first DTO reviews one sprint ahead |
| R-02 | Library approvals delay forms, maps or tests | Medium | Medium | Request approvals in S1; list alternatives in Phase 7 §15 |
| R-03 | Server Actions serialise polled reads (D-2) | High if D-2 rejected | Medium | Route Handler relays for polled reads; measure INP on PG-40 |
| R-04 | Map accessibility gaps | Medium | High | Text equivalent is the reference (PP-08); map is additive |
| R-05 | Mobile browsers restrict background location | High | High | Tracking prefers ELD; driver web collects only while open; check-call fallback; native app in Phase 1 §16 |
| R-06 | Payments processor not selected in time | Medium | High | Sandbox integration behind IC-42; decision due by S4 |
| R-07 | 55 pages in 16 weeks exceeds capacity | Medium | High | Shared sections (SH-) reduce unique work; if a sprint slips, items move to **Deferred** with a revisit trigger, never deleted |
| R-08 | `forbidden()` requires an experimental flag in Next.js 16 | Medium | Low | Fallback: `notFound()` for access-denied routes plus the PG-55 route |
| R-09 | Contract drift between backend and frontend | Medium | High | `pnpm contract:check` in the pre-push gate (host) |
| R-10 | Visual concept approval becomes a bottleneck | Medium | Medium | Concepts produced one sprint ahead for the next sprint's pages |
| R-11 | Offline replay conflicts with geofence events | Medium | Medium | Server wins; driver told (IC-29) |
| R-12 | Fraud (carrier impersonation) exploits onboarding | Medium | High | Compliance review (PG-51) required before booking; fraud signals (SC-51.3) |

## 7. Technical Debt Prevention

- **Gates:** `pnpm type-check`, `pnpm lint`, `pnpm contract:check`, `pnpm test` run before merge (host hooks are disabled, so CI runs them).
- **ESLint rules** in Phase 7 §20 enforce page composition, file shape, type homes and transport boundaries; proposed rules added in S1.
- **150-line rule:** any file approaching the limit is split in the same PR.
- **No inline copy or paths:** constants and `appRoutes` only.
- **Traceability:** every PR title cites the design OS ID it implements (Phase 7 §16) and updates §9 status.
- **Deviation record:** any departure from Phases 1–7 is recorded as a decision in the phase it changes, with its reason, before merge.
- **Seed data retirement:** each `lib/data/` seed used as a backend fallback has an owner and is removed only when the endpoint ships and the maintainer names it for removal.
- **Scope preservation:** unfinished work changes status here; it is never deleted from Phases 1–7.

## 8. Testing Strategy

| Level | Tool | Scope | Target |
| --- | --- | --- | --- |
| Unit | Vitest (installed) | `lib/loads/transitions.ts` against Phase 2 §5–6 tables, formatters, reducers, schemas, query-string, offline queue | 90% line coverage in `lib/` |
| Property | fast-check (installed) | State machines (no illegal transition reachable), money formatting, date windows | Every state machine |
| Component | Testing Library (proposed) | Every Phase 6 contract's states, keyboard support and ARIA | Every IC- contract |
| Integration | Vitest + mocked `backendFetch` | Server Actions and Route Handlers: parsing, error mapping (Phase 7 §11) | Every action and handler |
| End-to-end | Playwright (proposed) | Every XF- and XS- flow's happy path plus listed failure paths | Every flow in Phase 2 |
| Accessibility | axe with Playwright (proposed) + manual screen reader passes (NVDA + Firefox, VoiceOver + Safari iOS) | Every page | Zero serious or critical violations |
| Performance | Lighthouse CI + field RUM | Budgets in Phase 7 §18 | All budgets met at p75 |
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
| | | | XS-06 | Scheduled | S6 |
| | | | XS-07 | Scheduled | S7 |
| | | | XS-08 | Scheduled | S6 |
| | | | XS-09 | Scheduled | S4 |
| | | | XS-10 | Scheduled | S3 |
| | | | XS-11 | Scheduled | S3 |
| | | | XS-12 | Scheduled | S6 |

### 9.3 Pages

| ID | Page | Status | Sprint | ID | Page | Status | Sprint |
| --- | --- | --- | --- | --- | --- | --- | --- |
| PG-01 | Home | Scheduled | S3 | PG-29 | Preferred Carriers | Scheduled | S4 |
| PG-02 | Public Tracking | Scheduled | S5 | PG-30 | Invoices | Scheduled | S6 |
| PG-03 | Carrier Public Profile | Scheduled | S4 | PG-31 | Invoice Detail and Pay | Scheduled | S6 |
| PG-04 | Shipper Public Profile | Scheduled | S4 | PG-32 | Locations | Scheduled | S3 |
| PG-05 | Lane Rate Estimator | Scheduled | S3 | PG-33 | Load Board | Scheduled | S4 |
| PG-06 | Help Center | Scheduled | S7 | PG-34 | Book Load | Scheduled | S4 |
| PG-07 | Help Article | Scheduled | S7 | PG-35 | My Loads (carrier) | Scheduled | S4–S5 |
| PG-08 | Contact Support | Scheduled | S7 | PG-36 | Saved Loads and Searches | Scheduled | S4 |
| PG-09 | Legal | Scheduled | S2 | PG-37 | Fleet | Scheduled | S5 |
| PG-10 | Sign In | In progress | S1 | PG-38 | Settlements | Scheduled | S6 |
| PG-11 | Register | In progress | S1 | PG-39 | Driver Trip | Scheduled | S5 |
| PG-12 | Forgot Password | Scheduled | S1 | PG-40 | Load Details | Scheduled | S3–S7 |
| PG-13 | Reset Password | Scheduled | S1 | PG-41 | Messages | Scheduled | S7 |
| PG-14 | Verify | Scheduled | S1 | PG-42 | Notifications | Scheduled | S7 |
| PG-15 | Accept Invitation | Scheduled | S1 | PG-43 | Documents | Scheduled | S6 |
| PG-16 | Shipper Onboarding | Scheduled | S2 | PG-44 | Claims | Scheduled | S6 |
| PG-17 | Carrier Onboarding | Scheduled | S2 | PG-45 | Claim Detail | Scheduled | S6 |
| PG-18 | Shipper Dashboard | Scheduled | S7 | PG-46 | Profile | Scheduled | S2 |
| PG-19 | Carrier Dashboard | Scheduled | S7 | PG-47 | Settings | Scheduled | S2, S7 |
| PG-20 | Driver Home | Scheduled | S5 | PG-48 | Organization and Team | Scheduled | S2 |
| PG-21 | Operations Dashboard | Scheduled | S8 | PG-49 | Payment and Payout Methods | Scheduled | S6 |
| PG-22 | Compliance Dashboard | Scheduled | S4 | PG-50 | Exception Queue | Scheduled | S8 |
| PG-23 | Finance Operations Dashboard | Scheduled | S6, S8 | PG-51 | Carrier Vetting Review | Scheduled | S4 |
| PG-24 | Support Console | Scheduled | S8 | PG-52 | Accounts | Scheduled | S8 |
| PG-25 | Admin Dashboard | Scheduled | S8 | PG-53 | Not Found | Scheduled | S1 |
| PG-26 | Shipments | Scheduled | S3, S5 | PG-54 | Server Error | Scheduled | S1 |
| PG-27 | Post a Load | Scheduled | S3 | PG-55 | Access Denied | Scheduled | S1 |
| PG-28 | Compare Bids | Scheduled | S4 | | | | |

### 9.4 Sections

Each section appears once. Where a group of sections shares one status and sprint, they are listed together.

| Sections | Status | Sprint |
| --- | --- | --- |
| SH-03, SH-06, SH-13 | Scheduled | S2 |
| SH-01, SH-05, SH-14 | Scheduled | S3 |
| SH-09 | Scheduled | S4 |
| SH-02, SH-15 | Scheduled | S5 |
| SH-04, SH-07, SH-08, SH-10, SH-12 | Scheduled | S7 |
| SH-11 | Scheduled | S8 |
| SC-10.1 | In progress | S1 |
| SC-11.2 | In progress | S1 |
| SC-10.2, SC-11.1, SC-12.1, SC-13.1, SC-14.1, SC-14.2, SC-15.1, SC-15.2, SC-53.1, SC-54.1, SC-55.1 | Scheduled | S1 |
| SC-09.1, SC-16.1 … SC-16.4, SC-17.1 … SC-17.6, SC-46.1, SC-46.2, SC-47.1, SC-47.2, SC-48.1 … SC-48.3 | Scheduled | S2 |
| SC-01.1 … SC-01.4, SC-05.1 … SC-05.4, SC-26.1, SC-27.1 … SC-27.6, SC-32.1, SC-32.2, SC-40.1, SC-40.2, SC-40.3, SC-40.7, SC-40.8 | Scheduled | S3 |
| SC-03.1 … SC-03.3, SC-04.1, SC-04.2, SC-22.1 … SC-22.3, SC-28.1 … SC-28.4, SC-29.1, SC-29.2, SC-33.1 … SC-33.5, SC-34.1 … SC-34.4, SC-35.1, SC-36.1, SC-36.2, SC-40.4, SC-51.1 … SC-51.5 | Scheduled | S4 |
| SC-02.1 … SC-02.3, SC-20.1 … SC-20.3, SC-26.2, SC-26.3, SC-35.2, SC-37.1, SC-37.2, SC-39.1 … SC-39.7, SC-40.5, SC-40.6, SC-40.12, SC-40.15 | Scheduled | S5 |
| SC-23.1, SC-30.1 … SC-30.3, SC-31.1 … SC-31.4, SC-38.1 … SC-38.4, SC-40.9, SC-40.10, SC-40.13, SC-43.1, SC-43.2, SC-44.1, SC-44.2, SC-45.1 … SC-45.4, SC-49.1 … SC-49.3 | Scheduled | S6 |
| SC-06.1 … SC-06.3, SC-07.1 … SC-07.3, SC-08.1, SC-08.2, SC-18.1 … SC-18.5, SC-19.1 … SC-19.5, SC-40.11, SC-40.14, SC-41.1, SC-41.2, SC-42.1, SC-42.2, SC-47.3 | Scheduled | S7 |
| SC-21.1 … SC-21.4, SC-23.2 … SC-23.5, SC-24.1 … SC-24.3, SC-25.1 … SC-25.3, SC-50.1 … SC-50.4, SC-52.1 … SC-52.3 | Scheduled | S8 |

Check: 15 shared + 179 page sections = 194, matching [Phase 5 §13](./phase-5-section-blueprints.md#13-section-inventory).

### 9.5 Interaction Contracts

| Contracts | Status | Sprint |
| --- | --- | --- |
| IC-11 | In progress (starter `button.tsx`) | S1 |
| IC-01, IC-02, IC-03, IC-04, IC-07, IC-09, IC-12, IC-14, IC-41, IC-51, IC-52, IC-59, IC-60 | Scheduled | S1 |
| IC-05, IC-13, IC-15, IC-24, IC-26, IC-38, IC-39, IC-58 | Scheduled | S2 |
| IC-08, IC-19, IC-20, IC-21, IC-22, IC-23, IC-32, IC-40, IC-46, IC-56, IC-57 | Scheduled | S3 |
| IC-18, IC-27, IC-28, IC-33, IC-34 | Scheduled | S4 |
| IC-06, IC-10, IC-25, IC-29, IC-30, IC-31, IC-44, IC-55 | Scheduled | S5 |
| IC-42, IC-43 | Scheduled | S6 |
| IC-16, IC-17, IC-35, IC-36, IC-37, IC-45, IC-50, IC-53, IC-54 | Scheduled | S7 |
| IC-47, IC-48, IC-49 | Scheduled | S8 |

Check: 60 contracts, matching [Phase 6 §13](./phase-6-interaction-contracts.md#13-contract-usage-index).

### 9.6 Deferred register

Empty at version 1.0.0. An entry requires: the item's ID, the reason, the revisit trigger (date, milestone or dependency) and the maintainer who approved the deferral.

## 10. Deployment Readiness

- **Environments:** local, preview (per PR), staging (backend staging), production. `NEXT_PUBLIC_API_URL` and the session public key set per environment.
- **Configuration:** CSP headers (Phase 7 §19); `images.remotePatterns` for storage; map tile and processor keys as environment variables, never committed.
- **Observability:** Web Vitals reporting; error reporting through a service (not `console.*`); Server Action and Route Handler error rates; KPI events from Phase 1 §10 instrumented per feature.
- **SEO:** `sitemap.ts`, `robots.ts`, metadata and structured data per Phase 3 §11 verified in staging.
- **Security:** dependency audit; auth flows pen-tested; rate limits verified on anonymous endpoints (PG-05, PG-08, PG-12).
- **Rollout:** internal test network (Haulr staff as shipper and carrier) from M3; limited pilot with invited shippers and carriers after M4; progressive expansion.
- **Rollback:** each deployment immutable; previous deployment promotable; database-coupled changes coordinated with backend migrations.
- **Launch gate:** all pages **Verified** in §9; Phase 9 blocking items pass; owner sign-off on every page's rendered result.

---

Previous: [Phase 7 — Frontend Architecture](./phase-7-frontend-architecture.md) · Next: [Phase 9 — QA Checklist](./phase-9-qa-checklist.md)
