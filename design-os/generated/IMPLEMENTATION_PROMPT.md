# Implementation Prompt — Haulr

`Version 1.3.6` · `2026-10-12` · Start: [START_HERE](./START_HERE.md) · Setup: [SETUP-CHECKLIST](./SETUP-CHECKLIST.md) · Index: [DESIGN-OS-COMPLETE](./DESIGN-OS-COMPLETE.md)

Copy this entire file into a new Claude Code session at the repository root, then name the sprint, page or feature to build.

## Table of Contents

1. [Overview](#1-overview)
2. [Required Reading — Phases 1–6](#2-required-reading--phases-16)
3. [Visual Design Hand-off](#visual-design-hand-off)
4. [Operating Rules](#4-operating-rules)
5. [Phase 7 Implementation — Architecture Setup](#5-phase-7-implementation--architecture-setup)
6. [Phase 8 Implementation — Sprint Breakdown](#6-phase-8-implementation--sprint-breakdown)
7. [Phase 9 Implementation — QA Checklist](#7-phase-9-implementation--qa-checklist)
8. [Code Patterns and Standards](#8-code-patterns-and-standards)
9. [Testing Strategy](#9-testing-strategy)
10. [Per-Page Build Procedure](#10-per-page-build-procedure)
11. [Pre-merge Checklist](#11-pre-merge-checklist)
12. [Deployment Readiness](#12-deployment-readiness)
13. [Reference Lookup](#13-reference-lookup)

---

## 1. Overview

**What this prompt does.** It turns the Haulr design OS (`design-os/generated/`) into working code in this Next.js 16 App Router repository, one sprint, page or feature at a time. It synthesises all nine phases into engineering instructions. Where it summarises a phase, the phase file is authoritative.

**You are** a senior Next.js engineer working in this repository. You build what the blueprints specify, in the places Phase 7 specifies, following `.claude/CLAUDE.md` without exception.

**How to use it.**

1. The user names a target: a sprint (`Sprint 3`), a page (`PG-27`), a section (`SC-40.9`), a contract (`IC-12`) or a flow (`XF-02`).
2. Look the target up in [Phase 8 §16](./phase-8-implementation-roadmap.md#16-solo-build-order), the active solo build order, and [Phase 8 §9](./phase-8-implementation-roadmap.md#9-per-feature-build-status) to confirm it is Scheduled, and to find its dependencies.
3. Follow the [Per-Page Build Procedure](#10-per-page-build-procedure) for each page. It begins with the Visual Design Hand-off.
4. Finish with the [Pre-merge Checklist](#11-pre-merge-checklist) and update Phase 8 §9.

**What Haulr is.** A US road freight marketplace. Shippers quote and post loads; approved carriers search, bid, book and sign; drivers run each stop and capture proof of delivery; everyone tracks the load; invoices and carrier settlements follow automatically. Haulr is the broker of record (Phase 1 A2).

---

## 2. Required Reading — Phases 1–6

Read the parts relevant to your target before writing code.

| Phase | Read | Why |
| --- | --- | --- |
| [Phase 1 — Product Vision](./phase-1-product-vision.md) | §1 Assumptions, §7.4 Roles, §9 Business rules, §12 Constraints, §13 Principles | Rules and roles constrain every page; principles PP-01 … PP-09 are behavioural requirements |
| [Phase 2 — Experience Maps](./phase-2-experience-maps.md) | The XF-/XD-/XS- map(s) your target serves; §5–6 state machines; §7 cross-experience rules | Failure and recovery paths are requirements, not suggestions |
| [Phase 3 — Information Architecture](./phase-3-information-architecture.md) | §3 Sitemap row for your page; §5 Permissions; §7 Labels; §10 Filters; §14 Fallbacks | Route, access, labels and URL parameter names are fixed here |
| [Phase 4 — Page Blueprints](./phase-4-page-blueprints.md) | §2 Shared state behaviour; your page's blueprint | Acceptance criteria for the page |
| [Phase 5 — Section Blueprints](./phase-5-section-blueprints.md) | §1 Rules; your page's sections; any SH- they instance | Units of work, data hooks and states |
| [Phase 6 — Interaction Contracts](./phase-6-interaction-contracts.md) | §1 Global rules; every IC- your sections cite | Keyboard, ARIA, validation and error behaviour |

---

## Visual Design Hand-off

This design OS defines what each page must do, not how it looks. The look of each page is decided when it is built: before coding a page, run a visual concept for it with the repo's UI skills, present it to the owner, and build only after approval. Review the rendered page before marking it Built.

**Applying it in this repo.**

- House mechanics for every React UI (tokens, primitives, structure, icons, accessibility) come from `.claude/CLAUDE.md`. The repo's UI skill is `.claude/skills/cinematic-web` (motion-led marketing register, for PG-01 and other public acquisition pages only if the owner chooses that register); load it before producing a concept in that register.
- A concept responds to the page's Phase 4 purpose, primary tasks and device needs and to its Phase 5 sections. It must not remove or merge sections, change behaviour defined in Phase 6, or add scope.
- Present the concept and wait for explicit approval. Record the approval (link or note) in the pull request.
- After implementation, render the page (`pnpm dev`) and have the owner review the result before the status moves to **Built**.
- Styling follows the host token system (`styles/tokens.css`, `styles/globals.css`); visual choices are never written back into this design OS.

---

## 4. Operating Rules

These bind every change. Host rules come from `.claude/CLAUDE.md` and win over anything here.

### 4.1 Host rules (summary; read the file)

1. **No hardcoding.** Routes, durations, enums and repeated copy live in `lib/constants.ts` or `lib/<feature>/constants.ts`. Endpoints come from `lib/contract` (generated) or `lib/api-routes.ts`. Shapes come from Zod. Seed data lives in `lib/data/`.
2. **Match the architecture.** Do not invent patterns or locations. Phase 7 decisions D-1 … D-14 are the only sanctioned extensions.
3. **Single source of truth.** Define once, reference everywhere.
4. **Minimise lines of code.** Shortest maintainable solution.
5. **No `console.*` or debug statements.**
6. **Never delete a feature because it is not built.**
7. **One component per file**, kebab-case filename matching the export. **Absolute `@/` imports.** **Split any file over ~150 lines.**
8. **Pages compose sections and hold page-level state only.** No inline data arrays, no inline sub-components.
9. **Components consume hooks, never transport.** Authenticated mutations go through Server Actions in `lib/actions/`.
10. **`lib/contract/` is generated; never edit it.** Regenerate with `pnpm contract`.
11. **IDs with `nanoid`.** Never `uuid` or `Date.now()`.

### 4.2 Design OS rules

- **Scope preservation.** Build what is specified. Unfinished work changes status in Phase 8 §9; it is never removed from Phases 1–7. Removal requires the maintainer naming the feature.
- **No visual prescription flows back.** Never write colours, layouts, placement or component lists into `design-os/generated/`.
- **Deviation record.** If you must depart from a phase, stop, state the reason, and record it as a decision in that phase before merging.
- **Library Selection Policy.** Reuse installed libraries first. For anything marked **Proposed** in [Phase 7 §15](./phase-7-frontend-architecture.md#15-shared-libraries), propose the package and reason, and wait for approval before `pnpm add`. Never hand-edit `package.json`.
- **Traceability.** Cite IDs in branch names, commit messages and PR titles: `feat(PG-27): lane step (SC-27.2)`.

### 4.3 Behavioural invariants (from Phases 1–6)

- Shipper price and carrier pay never appear in the other side's responses (BR-05). The server shapes responses; the client never filters sensitive fields.
- Only legal load and bid transitions are offered (Phase 2 §5–6), derived from `lib/loads/transitions.ts`.
- Every irreversible action uses IC-12; every payment uses IC-43 (PP-01, PP-05).
- Every live value states source and age (PP-03).
- Every multi-step entry persists drafts (PP-06, SH-13).
- Every task works by keyboard, with a screen reader and without the map (PP-08).
- A record the user cannot access returns not found, never access denied (Phase 3 §5.2).
- Every state is one of the named classes in [Phase 4 §2](./phase-4-page-blueprints.md#2-shared-state-behaviour): LS- (loading), E- (error), EM- (empty), SU- (success). Never ship a bare "loading", "retry" or empty screen; implement exactly what the page and section blueprints specify for each class.
- Money-committing actions go through spend authority (BR-23): the server decides whether they complete or enter `PendingApproval`; the client never hides the action.
- Booked terms change only through amendments the carrier accepts (BR-25).
- Every mutation carries the record version (SSB-8, D-12) and is audited server-side (SSB-9, BR-26); reason-required actions (Phase 1 §11) cannot submit without a reason.
- View-as sessions are read-only unless consented and never touch payout, security, keys or exports (BR-27).
- Tenant isolation: caches keyed by organisation and purged per SSB-10; no organisation ID is ever accepted from the client (SEC-5).
- Telemetry carries no PII (NFR-PRIV-3); only catalogued analytics events are emitted (Phase 7 §27).

---

## 5. Phase 7 Implementation — Architecture Setup

Authoritative source: [Phase 7](./phase-7-frontend-architecture.md).

### 5.1 Folder structure (exact paths)

```text
app/
  layout.tsx  page.tsx (exist; page.tsx moves into (public)/)
  global-not-found.tsx  error.tsx  global-error.tsx  forbidden.tsx (exist)  sitemap.ts  robots.ts
  api/session/  api/register/                                   (exist)
  api/tracking/[token]/  api/loads/[loadId]/positions/  api/loads/[loadId]/bids/
  api/exceptions/  api/threads/[threadId]/messages/  api/notifications/  api/rate-estimate/
  api/imports/[batchId]/  api/exports/  api/approvals/  api/attention/
  api/webhooks/[endpointId]/deliveries/  api/auth/sso/[...step]/  api/quote-requests/  api/fleet-plan/
  auth/  (public)/  (workspace)/  (internal)/
components/ui/  components/common/  components/wrappers/  components/providers/   (flat)
components/home/  components/auth/                              (exist; page-domain, D-14)
lib/actions/  lib/contract/ (generated)  lib/data/  lib/enums/  lib/hooks/  lib/types/
lib/utils/  lib/validations/  lib/loads/  lib/tracking/  lib/billing/  lib/compliance/  lib/ops/
lib/home/  lib/auth/                                            (exist)
lib/constants.ts  lib/api-client.ts  lib/api-routes.ts  lib/api-server.ts
instrumentation.ts  proxy.ts
```

### 5.2 Route structure (exact routes)

| Route | File | Page |
| --- | --- | --- |
| `/` | `app/(public)/page.tsx` (exists as `app/page.tsx`; move in S1) | PG-01 |
| `/track/[token]` | `app/(public)/track/[token]/page.tsx` | PG-02 |
| `/carriers/[carrierId]` | `app/(public)/carriers/[carrierId]/page.tsx` | PG-03 |
| `/tools/rate-estimator` | `app/(public)/tools/rate-estimator/page.tsx` | PG-05 |
| `/help` | `app/(public)/help/page.tsx` | PG-06 |
| `/help/[slug]` | `app/(public)/help/[slug]/page.tsx` | PG-07 |
| `/support` | `app/(public)/support/page.tsx` | PG-08 |
| `/legal/[document]` | `app/(public)/legal/[document]/[[...version]]/page.tsx` (exists) | PG-09 |
| `/auth/login` | `app/auth/login/page.tsx` (exists) | PG-10 |
| `/auth/register` | `app/auth/register/page.tsx` | PG-11 |
| `/auth/forgot-password` | `app/auth/forgot-password/page.tsx` | PG-12 |
| `/auth/reset-password` | `app/auth/reset-password/page.tsx` | PG-13 |
| `/auth/verify` | `app/auth/verify/page.tsx` | PG-14 |
| `/auth/invite/[token]` | `app/auth/invite/[token]/page.tsx` | PG-15 |
| `/dashboard` | `app/(workspace)/dashboard/page.tsx` | redirect |
| `/onboarding/shipper` | `app/(workspace)/onboarding/shipper/page.tsx` | PG-16 |
| `/onboarding/carrier` | `app/(workspace)/onboarding/carrier/page.tsx` | PG-17 |
| `/shipper` | `app/(workspace)/shipper/page.tsx` | PG-18 |
| `/carrier` | `app/(workspace)/carrier/page.tsx` | PG-19 |
| `/driver` | `app/(workspace)/driver/page.tsx` | PG-20 |
| `/shipper/loads` | `app/(workspace)/shipper/loads/page.tsx` | PG-26 |
| `/shipper/loads/new` | `app/(workspace)/shipper/loads/new/page.tsx` | PG-27 |
| `/shipper/loads/[loadId]/bids` | `app/(workspace)/shipper/loads/[loadId]/bids/page.tsx` | PG-28 |
| `/shipper/carriers` | `app/(workspace)/shipper/carriers/page.tsx` | PG-29 |
| `/shipper/invoices` | `app/(workspace)/shipper/invoices/page.tsx` | PG-30 |
| `/shipper/invoices/[invoiceId]` | `app/(workspace)/shipper/invoices/[invoiceId]/page.tsx` | PG-31 |
| `/shipper/locations` | `app/(workspace)/shipper/locations/page.tsx` | PG-32 |
| `/carrier/load-board` | `app/(workspace)/carrier/load-board/page.tsx` | PG-33 |
| `/carrier/load-board/[loadId]/book` | `app/(workspace)/carrier/load-board/[loadId]/book/page.tsx` | PG-34 |
| `/carrier/loads` | `app/(workspace)/carrier/loads/page.tsx` | PG-35 |
| `/carrier/saved` | `app/(workspace)/carrier/saved/page.tsx` | PG-36 |
| `/carrier/fleet` | `app/(workspace)/carrier/fleet/page.tsx` | PG-37 |
| `/carrier/settlements` | `app/(workspace)/carrier/settlements/page.tsx` | PG-38 |
| `/carrier/plan` | `app/(workspace)/carrier/plan/page.tsx` | PG-65 |
| `/driver/trips/[loadId]` | `app/(workspace)/driver/trips/[loadId]/page.tsx` | PG-39 |
| `/loads/[loadId]` | `app/(workspace)/loads/[loadId]/page.tsx` | PG-40 |
| `/messages` | `app/(workspace)/messages/page.tsx` | PG-41 |
| `/notifications` | `app/(workspace)/notifications/page.tsx` | PG-42 |
| `/documents` | `app/(workspace)/documents/page.tsx` | PG-43 |
| `/claims` | `app/(workspace)/claims/page.tsx` | PG-44 |
| `/claims/new`, `/claims/[claimId]` | `app/(workspace)/claims/new/page.tsx`, `app/(workspace)/claims/[claimId]/page.tsx` | PG-45 |
| `/profile` | `app/(workspace)/profile/page.tsx` | PG-46 |
| `/settings` | `app/(workspace)/settings/page.tsx` | PG-47 |
| `/settings/organization` | `app/(workspace)/settings/organization/page.tsx` | PG-48 |
| `/settings/billing` | `app/(workspace)/settings/billing/page.tsx` | PG-49 |
| `/shippers/[shipperId]` | `app/(workspace)/shippers/[shipperId]/page.tsx` | PG-04 |
| `/ops` | `app/(internal)/ops/page.tsx` | PG-21 |
| `/ops/exceptions` | `app/(internal)/ops/exceptions/page.tsx` | PG-50 |
| `/ops/quotes` | `app/(internal)/ops/quotes/page.tsx` | PG-66 |
| `/compliance` | `app/(internal)/compliance/page.tsx` | PG-22 |
| `/compliance/carriers/[carrierId]` | `app/(internal)/compliance/carriers/[carrierId]/page.tsx` | PG-51 |
| `/finance` | `app/(internal)/finance/page.tsx` | PG-23 |
| `/support-console` | `app/(internal)/support-console/page.tsx` | PG-24 |
| `/admin` | `app/(internal)/admin/page.tsx` | PG-25 |
| `/admin/accounts` | `app/(internal)/admin/accounts/page.tsx` | PG-52 |
| `/shipper/loads/import` | `app/(workspace)/shipper/loads/import/page.tsx` | PG-56 |
| `/shipper/templates` | `app/(workspace)/shipper/templates/page.tsx` | PG-57 |
| `/shipper/approvals` | `app/(workspace)/shipper/approvals/page.tsx` | PG-58 |
| `/shipper/reports` | `app/(workspace)/shipper/reports/page.tsx` | PG-59 |
| `/settings/security` | `app/(workspace)/settings/security/page.tsx` | PG-60 |
| `/settings/integrations` | `app/(workspace)/settings/integrations/page.tsx` | PG-61 |
| `/settings/privacy` | `app/(workspace)/settings/privacy/page.tsx` | PG-62 |
| `/settings/audit` | `app/(workspace)/settings/audit/page.tsx` | PG-63 |
| `/loads/[loadId]/amendments/[amendmentId]` | `app/(workspace)/loads/[loadId]/amendments/[amendmentId]/page.tsx` | PG-64 |
| — | `app/global-not-found.tsx`, `app/error.tsx`, `app/global-error.tsx`, `app/forbidden.tsx` (exist) | PG-53, PG-54, PG-55 |

Every data-bearing segment adds `loading.tsx` and `error.tsx`; each route group adds `not-found.tsx`.

### 5.3 Providers and contexts

- Keep `components/providers/provider.tsx` (Query client, `MotionConfig reducedMotion="user"`). Compose new providers inside it.
- Add `announcer-provider.tsx` (single live region for IC-14), `session-provider.tsx` (read-only session: user, role, organisation), `offline-queue-provider.tsx` (mounted only in `driver/layout.tsx`).
- `auth-signal-provider.tsx` exists: sign-in step state for the access pages, mounted by `components/auth/auth-shell.tsx`, never app-wide.
- No global store (D-6). No context holds server data.

### 5.4 Guards

- Extend `PROTECTED_ROUTE_PREFIXES` in `lib/constants.ts` to every workspace prefix (`/dashboard`, `/onboarding`, `/shipper`, `/carrier`, `/driver`, `/loads`, `/messages`, `/notifications`, `/documents`, `/claims`, `/profile`, `/settings`, `/shippers`) and add `INTERNAL_ROUTE_PREFIXES` (`/ops`, `/compliance`, `/finance`, `/support-console`, `/admin`).
- In `proxy.ts`, reject non-internal roles on internal prefixes (D-7).
- Role layouts (`shipper/`, `carrier/`, `driver/`, `(internal)/`) re-check role on the server and call `forbidden()`.
- Every Server Action and Route Handler is wrapped by `withAction` / `withHandler` (D-13), which re-checks session, role and record membership, attaches the correlation ID and maps errors to Phase 4 §2.2 classes.
- `org.security`-only users resolve to PG-60; organisation security policy (idle timeout, IP allow-list, SSO enforcement) is enforced server-side (BR-24).

### 5.5 Hooks organisation

One file per resource in `lib/hooks/use-<resource>.ts`, exporting that resource's query and mutation hooks and its query-key factory. The complete mapping from Phase 5 hook names to files is [Phase 7 §8](./phase-7-frontend-architecture.md#8-hooks). Existing hooks (`use-login`, `use-logout`, `use-register`, `use-create-user`, `use-debounced-search`) are kept. So are the access hooks, one file per hook (`use-request-password-reset`, `use-reset-password`, `use-verify-email`, `use-resend-verification`, `use-mfa-challenge`), and the existing hooks without transport: the step flows (`use-sign-in-flow`, `use-forgot-flow`, `use-reset-flow`, `use-verify-flow`, `use-register-flow`, `use-mfa-flow`), `use-caps-lock` (IC-03), `use-countdown` (IC-46), `use-form-problems` (IC-02), `use-side` (SC-01.1), `use-reduced`, and the PG-01 and access-page presentation hooks (Phase 7 §8).

Transport per hook (D-2, confirmed 2026-10-10): every read goes through a Server Component or a GET Route Handler via `local`; every mutation wraps a Server Action; live positions and ETAs stream over Server-Sent Events from a Route Handler, with polling as the fallback; anonymous public reads use Route Handlers.

### 5.6 Component organisation

| Folder | Holds | Built from |
| --- | --- | --- |
| `components/ui/` | Domain-free primitives, one per Phase 6 contract, built on React Aria Components (Phase 7 §15); `button.tsx`, `input.tsx` exist | Phase 6 |
| `components/common/` | Shared sections (SH-01 … SH-15) and page sections, domain-prefixed filenames | Phase 5 |
| `components/home/`, `components/auth/` | Sections used by one public or access page (exist; D-14) | Phase 5 |
| `components/wrappers/` | `section-boundary.tsx` (Suspense + error boundary per section), `motion-wrapper.tsx` (exists) | Phase 4 SSB-1, SSB-3 |
| `components/providers/` | §5.3 | Phase 7 §5 |

A section used by two pages lives once in `components/common/`. Page sections also live in `components/common/` (pages may not define components).

---

## 6. Phase 8 Implementation — Sprint Breakdown

**The active plan is the solo build order in [Phase 8 §16](./phase-8-implementation-roadmap.md#16-solo-build-order)**: seven stages, about 71 weeks for one engineer, pattern-first; everything else is Specified and queued after stage 7, and nothing is Deferred. The sprints below are the staffed plan, kept for reference. Authoritative source: [Phase 8 §3](./phase-8-implementation-roadmap.md#3-sprint-breakdown). 16 weeks, 8 sprints, starting 2026-10-05, with a parallel enterprise track from Sprint 2. Stories enter a sprint only when they meet the Definition of Ready ([Phase 8 §11](./phase-8-implementation-roadmap.md#11-definition-of-ready-and-definition-of-done)).

### Sprint 1 — Foundations (2026-10-05 → 2026-10-16)

- **Build:**
  - Route groups and layouts; guards (§5.4); `appRoutes`.
  - `lib/enums/` (role key, load status); `lib/loads/constants.ts` and `transitions.ts` with tests.
  - Env validation (D-9), `instrumentation.ts` and `report-error` (D-10), `lib/flags.ts` (D-11), `withAction`/`withHandler` (D-13).
  - Error taxonomy wiring (`errorCopy`, `section-state`, Query retry policy); CSP nonces and security headers.
  - Announcer and session providers; `section-boundary`.
- **Contracts:** IC-01, IC-02, IC-03, IC-04, IC-07, IC-09, IC-11 (extend `button.tsx`), IC-12, IC-14, IC-41, IC-51, IC-52, IC-59, IC-60.
- **Pages and flows:** PG-10 (extend with MFA hand-off and role resolution), PG-11 … PG-15, PG-53 … PG-55, dashboard redirect. Flow XS-01.
- **Sequencing:** env, observability and guards → taxonomy and providers → primitives → access pages → system pages.
- **Close:** D-2 confirmation; forms, testing and observability library approvals; `forbidden()` check (R-08).

### Sprint 2 — Accounts and onboarding (2026-10-19 → 2026-10-30)

- **Contracts:** IC-05, IC-13, IC-15, IC-24, IC-26, IC-38, IC-39, IC-58, IC-63, IC-67.
- **Shared sections:** SH-03 document set, SH-06 account standing, SH-13 step progression.
- **Pages and flows:** PG-16, PG-17, PG-46, PG-47 (SC-47.1, SC-47.2), PG-48, PG-09. Enterprise track: PG-60, SC-10.3. Flows XS-02, XF-13, XF-12 (carrier side), XS-13.
- **Sequencing:** SH-13 before PG-16/PG-17; SH-03 before SC-17.4; IC-67 before any editable record ships.
- **Milestone M1 (2026-10-30):** both sides register, verify, onboard and invite; guards enforced; SSO tested against Okta and Entra ID.

### Sprint 3 — Posting (2026-11-02 → 2026-11-13)

- **Contracts:** IC-08, IC-19, IC-20, IC-21, IC-22, IC-23, IC-32, IC-40, IC-46, IC-56, IC-57.
- **Shared sections:** SH-01 timeline, SH-05 record collection, SH-14 money breakdown.
- **Pages and flows:** PG-27 (including SC-27.7), PG-32, PG-26 (SC-26.1), PG-40 (SC-40.1, 40.2, 40.3, 40.7, 40.8), PG-05, PG-01, PG-66. Enterprise track: PG-57. Flows XF-01, XS-10, XS-11, XF-14 (templates), XS-18.
- **Sequencing:** PG-32 facilities → PG-27 posting → PG-40 core → PG-26 collection; PG-66 with SC-27.7, so every custom quote request has an answer; PG-05 and PG-01 in parallel; PG-57 after PG-27 schemas.

### Sprint 4 — Marketplace (2026-11-16 → 2026-11-27)

- **Contracts:** IC-18, IC-27, IC-28, IC-33, IC-34, IC-61, IC-62.
- **Shared sections:** SH-09 scorecard.
- **Pages and flows:** PG-33, PG-34, PG-36, PG-28, PG-29, PG-03, PG-04, PG-35 (SC-35.1), PG-22, PG-51, PG-40 (SC-40.4, SC-40.17). Enterprise track: PG-58, PG-56, SC-48.4. Flows XF-02, XF-03, XF-04, XS-09, XF-12 (compliance side), XD-05, XF-16, XF-14 (bulk import).
- **Sequencing:** PG-51 and PG-22 early (approved carriers are needed to book); PG-33 → PG-34; PG-28 with SC-40.4; SC-48.4 → PG-58 → SC-40.17; PG-56 after PG-58 (imports route to approvals).
- **Milestone M2 (2026-11-27):** a load goes from quote to booked with a signed rate confirmation by an approved carrier; a 500-row import posts; approvals complete the original action.

### Sprint 5 — Execution and tracking (2026-11-30 → 2026-12-11)

- **Contracts:** IC-06, IC-10, IC-25, IC-29, IC-30, IC-31, IC-44, IC-55, IC-66.
- **Shared sections:** SH-02 live position and ETA, SH-15 assignment.
- **Pages and flows:** PG-37, PG-35 (SC-35.2), PG-20, PG-39, PG-02, PG-40 (SC-40.5, 40.6, 40.12, 40.15, 40.16), PG-26 (SC-26.2, 26.3). Enterprise track: PG-64. Flows XF-05, XF-06, XF-07, XF-09 (capture), XD-03, XF-15.
- **Sequencing:** PG-37 → SH-15 → PG-39 (with offline queue) → SH-02 → PG-02; SC-40.16 → PG-64.
- **Map base layer:** approved (MapLibre with Protomaps tiles; Phase 7 §15).

### Sprint 6 — Money (2026-12-14 → 2027-01-08, holiday weeks excluded)

- **Contracts:** IC-42, IC-43, IC-65.
- **Shared sections:** SH-11 audit.
- **Pages and flows:** PG-30, PG-31, PG-38, PG-49, PG-43, PG-44, PG-45, PG-40 (SC-40.9, 40.10, 40.13), PG-23 (SC-23.1). Enterprise track: PG-62, PG-63. Flows XF-09 (verification), XF-10, XF-11, XS-06, XS-08, XS-12, XS-15, XS-17.
- **Sequencing:** PG-49 → PG-31 → PG-30 → PG-38; claims after invoices; SH-11 → PG-63; IC-65 → PG-62.
- **Needs:** processor SDK approval.
- **Milestone M3 (2027-01-08):** a load goes from quote to paid and settled, with tracking, POD and an accepted amendment; the audit log shows every step.

### Sprint 7 — Communication, dashboards and offline (2027-01-11 → 2027-01-22)

- **Contracts:** IC-16, IC-17, IC-35, IC-36, IC-37, IC-45, IC-50, IC-53, IC-54, IC-68.
- **Shared sections:** SH-04 conversation, SH-07 attention queue, SH-08 metrics, SH-10 rating, SH-12 guidance.
- **Pages and flows:** PG-41, PG-42, PG-47 (SC-47.3), PG-18, PG-19, PG-06, PG-07, PG-08, PG-40 (SC-40.11, 40.14), PG-65 (after SC-19.3 recommended loads); driver service worker caching. Enterprise track: PG-59, PG-61. Flows XS-03, XS-04, XS-05, XS-07, XD-01, XD-02, XS-14, XF-17.
- **Needs:** chart and product-analytics approvals.
- **Milestone M5 (2027-01-22):** enterprise capabilities Verified (Phase 9 QA-217 … QA-247).

### Sprint 8 — Operations and launch (2027-01-25 → 2027-02-05)

- **Contracts:** IC-47, IC-48, IC-49, IC-64.
- **Pages and flows:** PG-21, PG-23 (remaining), PG-24 (including SC-24.4), PG-25, PG-50, PG-52 (including SC-52.4). Flows XF-08, XD-04, XD-06, XD-07, XD-08, XS-16.
- **Hardening:**
  - Full Phase 9 pass.
  - Load test and dependency-failure drills.
  - Penetration test remediation.
  - Accessibility audit and VPAT.
  - Browser matrix.
  - Go/no-go ([Phase 8 §15](./phase-8-implementation-roadmap.md#15-gono-go-and-hypercare)).
- **Milestone M4 (2027-02-05):** every page Verified; launch gate passed.

**Capacity warning.** Phase 8 §13 estimates a shortfall of about 21% at the stated team size. Raise it at every milestone; never absorb it by skipping states, tests or accessibility.

### Dependencies and sequencing rules

- Backend endpoints land one sprint ahead. Until an endpoint exists, the real call path is answered by a mock handler on its contract route in `lib/mocks/`, with fixtures in `lib/data/mocks/` (R-01; host "The mocked backend"). The page does not change when the endpoint arrives.
- Visual concepts for next sprint's pages are produced and approved during the current sprint (R-10).
- If a stage slips, its items stay **Scheduled** and move to the next stage. **Deferred** is only for an item with a named blocker (a decision only the maintainer can make, missing access, an upstream bug), recorded in Phase 8 §9.6 with its revisit trigger. Never delete them.

---

## 7. Phase 9 Implementation — QA Checklist

Authoritative source: [Phase 9](./phase-9-qa-checklist.md). A feature is **Verified** only when every applicable blocking item passes. The complete list follows, organised by category (270 items; **[B]** marks blocking).

### 7.1 Accessibility

- [ ] **QA-001** Every task in Phase 4 "Primary tasks" can be completed with keyboard only _(PP-08)_ **[B]**
- [ ] **QA-002** Every task can be completed with NVDA + Firefox _(PP-08)_ **[B]**
- [ ] **QA-003** Every task can be completed with VoiceOver + Safari iOS _(PP-08)_ **[B]**
- [ ] **QA-004** Every task on PG-26, PG-33, PG-40, PG-02 can be completed without the map _(IC-30, SH-02)_ **[B]**
- [ ] **QA-005** Focus moves to the main heading after route change _(SSB-6)_ **[B]**
- [ ] **QA-006** Focus stays on or returns to the triggering element after mutations and dialogs _(SSB-6, IC-41)_ **[B]**
- [ ] **QA-007** Every outcome of a mutation is announced through the live region _(SSB-5, IC-14)_ **[B]**
- [ ] **QA-008** Only one live region announces at a time; no duplicate announcements _(IC-14)_
- [ ] **QA-009** Loading states are announced only after 1 s _(SSB-1)_
- [ ] **QA-010** Every form error summary receives focus and links to fields _(IC-02)_ **[B]**
- [ ] **QA-011** Every combobox follows the WAI-ARIA combobox pattern _(IC-05, IC-06, IC-50)_ **[B]**
- [ ] **QA-012** Every dialog traps focus, is labelled and restores focus on close _(IC-41)_ **[B]**
- [ ] **QA-013** Every reorder is possible without dragging and announces position _(IC-40)_ **[B]**
- [ ] **QA-014** Every chart has a data-table equivalent and text summary _(IC-45)_ **[B]**
- [ ] **QA-015** Countdown timers announce only at thresholds _(IC-46)_
- [ ] **QA-016** Status is never conveyed by colour alone _(G-3, IC-59)_ **[B]**
- [ ] **QA-017** Disabled actions expose their reason _(G-5)_
- [ ] **QA-018** Industry terms have an accessible explanation available _(IC-56, PP-07)_
- [ ] **QA-019** Driver workflow targets meet 44 × 44 CSS px _(G-2)_ **[B]**
- [ ] **QA-020** Camera capture relies on native file input with capture _(IC-25)_ **[B]**
- [ ] **QA-021** Payment processor entry passes an axe scan (approved, Phase 7 §15) and a keyboard pass _(IC-42)_ **[B]**
- [ ] **QA-022** Keyboard shortcuts can be turned off or are scoped to focus _(IC-49)_ **[B]**
- [ ] **QA-023** Skip link present on every page and moves focus to the main landmark _(IC-52)_ **[B]**
- [ ] **QA-024** Session timeout warns 2 minutes ahead and allows extension _(IC-54)_ **[B]**
- [ ] **QA-025** Every page has exactly one level-one heading and a logical heading outline _(SSB-6)_
- [ ] **QA-268** Every dispatch board action (open an entry, move a load, fill a window, mark a truck unavailable) works by keyboard alone and without dragging, and each move announces its start, target and result _(IC-68, 2.5.7)_ **[B]**

### 7.2 WCAG 2.2 AA Compliance

- [ ] **QA-026** Non-text content has text alternatives _(1.1.1)_ **[B]**
- [ ] **QA-027** Info and relationships are programmatic (tables, lists, fieldsets) _(1.3.1)_ **[B]**
- [ ] **QA-028** Meaningful sequence preserved in the accessibility tree _(1.3.2)_ **[B]**
- [ ] **QA-029** Input purpose tokens set for personal data _(1.3.5)_ **[B]**
- [ ] **QA-030** Use of colour is not the only means of conveying information _(1.4.1)_ **[B]**
- [ ] **QA-031** Text contrast meets 4.5:1 (3:1 large) _(1.4.3)_ **[B]**
- [ ] **QA-032** Text resizes to 200% without loss _(1.4.4)_ **[B]**
- [ ] **QA-033** Content reflows at 320 CSS px without two-dimensional scrolling (tables and maps excepted) _(1.4.10)_ **[B]**
- [ ] **QA-034** Non-text contrast meets 3:1 for controls and focus indicators _(1.4.11)_ **[B]**
- [ ] **QA-035** Text spacing overrides do not break content _(1.4.12)_
- [ ] **QA-036** Content on hover or focus is dismissible, hoverable, persistent _(1.4.13)_ **[B]**
- [ ] **QA-037** All functionality operable by keyboard _(2.1.1)_ **[B]**
- [ ] **QA-038** No keyboard trap _(2.1.2)_ **[B]**
- [ ] **QA-039** Character key shortcuts can be turned off or remapped _(2.1.4)_ **[B]**
- [ ] **QA-040** Timing adjustable (quote validity re-quote, session extension) _(2.2.1)_ **[B]**
- [ ] **QA-041** Auto-updating content (polling) can be paused where it moves or is announced _(2.2.2)_ **[B]**
- [ ] **QA-042** Bypass blocks (skip link, skip map) _(2.4.1)_ **[B]**
- [ ] **QA-043** Page titles descriptive (`<Page> · Haulr`) _(2.4.2)_ **[B]**
- [ ] **QA-044** Focus order preserves meaning _(2.4.3)_ **[B]**
- [ ] **QA-045** Link purpose clear in context _(2.4.4)_ **[B]**
- [ ] **QA-046** Focus visible and not obscured _(2.4.7, 2.4.11)_ **[B]**
- [ ] **QA-047** Dragging movements have single-pointer alternatives _(2.5.7)_ **[B]**
- [ ] **QA-048** Target size minimum 24 × 24 _(2.5.8)_ **[B]**
- [ ] **QA-049** Error identification, suggestion and prevention for money and legal steps _(3.3.1, 3.3.3, 3.3.4)_ **[B]**
- [ ] **QA-050** Redundant entry avoided; accessible authentication (paste and password managers allowed) _(3.3.7, 3.3.8)_ **[B]**
- [ ] **QA-267** Help routes repeated across pages (PG-06, PG-08 with context; Phase 3 §8) keep the same order relative to other page content _(3.2.6)_ **[B]**

### 7.3 Behavioural Consistency

- [ ] **QA-051** Every irreversible action uses IC-12 with a consequence statement _(PP-05)_ **[B]**
- [ ] **QA-052** Every money commitment states amount, fees and method before confirmation _(PP-01, IC-43)_ **[B]**
- [ ] **QA-053** Every live value states its source and age _(PP-03)_ **[B]**
- [ ] **QA-054** Status labels are identical for the same state across pages _(IC-59)_ **[B]**
- [ ] **QA-055** Action labels are verb-first and specific; no "Submit" or "OK" _(Phase 3 §7)_
- [ ] **QA-056** Filters use the same parameter names on every page _(Phase 3 §10)_ **[B]**
- [ ] **QA-057** Filters, sort, view and cursor survive open-record-and-return _(IC-20)_ **[B]**
- [ ] **QA-058** Reference numbers link to their record everywhere _(IA-P1)_
- [ ] **QA-059** Multi-party flows state whose turn it is and by when _(Phase 2 §7)_ **[B]**
- [ ] **QA-060** Offered load actions match the (role, state) mapping everywhere _(SC-40.2)_ **[B]**
- [ ] **QA-061** Empty states distinguish "none at all" from "none matching" _(SH-05)_
- [ ] **QA-062** Draft persistence works the same in every multi-step flow _(SH-13, PP-06)_ **[B]**
- [ ] **QA-063** Retry behaviour is identical across sections _(IC-60)_
- [ ] **QA-064** Pagination behaves identically across collections _(IC-21)_
- [ ] **QA-065** Time zones for appointments are always the facility's _(IC-08)_ **[B]**
- [ ] **QA-066** Every notification routes to its subject _(XS-03)_ **[B]**

### 7.4 Responsiveness

- [ ] **QA-067** Every Phase 4 "Device needs" statement is achievable on the named device _(Phase 4)_ **[B]**
- [ ] **QA-068** PG-39 completes a full trip one-handed on a 360 px wide phone _(PG-39)_ **[B]**
- [ ] **QA-069** PG-33 search, compare and book complete on a phone _(PG-33, PG-34)_ **[B]**
- [ ] **QA-070** PG-11 carrier registration completes on a phone _(PG-11)_ **[B]**
- [ ] **QA-071** PG-17 document capture completes on a phone _(SC-17.4)_ **[B]**
- [ ] **QA-072** PG-28 single bid acceptance completes from a phone notification _(PG-28)_
- [ ] **QA-073** Tabular collections provide an equivalent on narrow viewports _(IC-22)_ **[B]**
- [ ] **QA-074** On-screen keyboard never hides the focused entry _(SH-13)_ **[B]**
- [ ] **QA-075** Orientation is not locked _(WCAG 1.3.4)_ **[B]**
- [ ] **QA-076** Touch and pointer both work on hybrid devices _(IC-30, IC-40)_
- [ ] **QA-077** Desktop keyboard entry of a load completes without pointer _(PG-27)_ **[B]**
- [ ] **QA-078** Web Share is used on phones where available, copy elsewhere _(IC-44)_

### 7.5 Scalability

- [ ] **QA-079** No collection fetches unbounded data; all use cursor pagination _(IC-21)_ **[B]**
- [ ] **QA-080** Collections of 10,000+ records remain responsive with filters _(SH-05)_ **[B]**
- [ ] **QA-081** Map with 500 in-transit loads stays interactive _(SC-26.2)_
- [ ] **QA-082** Positions subscribed only for loads in view _(SH-02)_ **[B]**
- [ ] **QA-083** Polling pauses when the tab is hidden _(Phase 7 §13)_ **[B]**
- [ ] **QA-084** Totals come from the server, never summed client-side _(Phase 7 §18)_ **[B]**
- [ ] **QA-085** Search queries hit the index endpoints, not collection scans _(Phase 3 §9)_ **[B]**
- [ ] **QA-086** Query keys include every parameter (no cache collisions) _(Phase 7 §8)_ **[B]**
- [ ] **QA-087** Thread with 1,000 messages loads latest page only _(SH-04)_
- [ ] **QA-088** Timeline with 500 events paginates _(SH-01)_

### 7.6 Performance

- [ ] **QA-089** LCP ≤ 2.5 s p75 on every page (PG-01 ≤ 2.0 s) _(Phase 7 §18)_ **[B]**
- [ ] **QA-090** INP ≤ 200 ms p75 _(Phase 7 §18)_ **[B]**
- [ ] **QA-091** CLS ≤ 0.1 _(Phase 7 §18)_ **[B]**
- [ ] **QA-092** Initial JS per route within budget (public 170 KB, workspace 250 KB, driver 150 KB) _(Phase 7 §18)_ **[B]**
- [ ] **QA-093** Map library loads only on pages that use it _(Phase 7 §17)_ **[B]**
- [ ] **QA-094** Chart library loads only on pages that use it _(Phase 7 §17)_ **[B]**
- [ ] **QA-095** Processor SDK loads only on payment pages _(Phase 7 §17)_ **[B]**
- [ ] **QA-096** Server components prefetch initial data; no client waterfall on load _(Phase 7 §8)_ **[B]**
- [ ] **QA-097** Sections stream independently _(SSB-1)_ **[B]**
- [ ] **QA-098** Images use Next.js Image with correct sizing _(Phase 7 §14)_ **[B]**
- [ ] **QA-099** Fonts load through `next/font` without layout shift _(Phase 7 §14)_
- [ ] **QA-100** Public pages are static or ISR as specified _(Phase 3 §3.1)_ **[B]**
- [ ] **QA-101** POD images are downscaled before upload _(IC-25)_
- [ ] **QA-102** Debounced inputs never fire more than once per settle _(IC-05, IC-19)_
- [ ] **QA-103** No polled read runs through a Server Action (D-2) _(Phase 7 §1)_ **[B]**

### 7.7 State Coverage

- [ ] **QA-104** Every page implements its Phase 4 loading state _(Phase 4)_ **[B]**
- [ ] **QA-105** Every page implements its Phase 4 empty state _(Phase 4)_ **[B]**
- [ ] **QA-106** Every page implements its Phase 4 error state _(Phase 4)_ **[B]**
- [ ] **QA-107** Every page implements its Phase 4 success state _(Phase 4)_ **[B]**
- [ ] **QA-108** Every section implements its Phase 5 loading, empty and error states _(Phase 5)_ **[B]**
- [ ] **QA-109** Every contract implements every state it lists _(Phase 6)_ **[B]**
- [ ] **QA-110** Every load state in Phase 2 §5 renders correctly on PG-40 for every role _(BR-01)_ **[B]**
- [ ] **QA-111** Every bid state in Phase 2 §6 renders correctly on PG-28 and PG-40 _(BR-02)_ **[B]**
- [ ] **QA-112** Every illegal transition is absent from the offered actions _(Phase 2 §5)_ **[B]**
- [ ] **QA-113** Offline state handled on PG-20 and PG-39 _(SSB-4)_ **[B]**
- [ ] **QA-114** Stale tracking state handled with last known position and age _(SH-02)_ **[B]**
- [ ] **QA-115** Expired tracking link state on PG-02 _(BR-21)_ **[B]**
- [ ] **QA-116** Expired quote state on PG-27 with re-quote keeping entries _(BR-06)_ **[B]**
- [ ] **QA-117** Ineligible carrier state on PG-33 and PG-34 _(BR-03)_ **[B]**
- [ ] **QA-118** Onboarding-incomplete redirects per Phase 3 §14 _(Phase 3 §14)_ **[B]**
- [ ] **QA-119** Compliance hold state on carrier pages _(SH-06)_ **[B]**
- [ ] **QA-120** Partial batch payment state on PG-30 _(SC-30.3)_ **[B]**
- [ ] **QA-121** Undo window for stop events _(IC-29)_ **[B]**
- [ ] **QA-122** Claim window closed state _(BR-17)_
- [ ] **QA-123** New-organisation guidance appears and disappears correctly _(SH-12)_

### 7.8 Error Handling

- [ ] **QA-124** A failing section never takes down its page _(SSB-3)_ **[B]**
- [ ] **QA-125** 401 redirects to sign-in with a validated return path _(Phase 3 §14)_ **[B]**
- [ ] **QA-126** 403/404 on a record renders PG-53 without confirming existence _(Phase 3 §5.2)_ **[B]**
- [ ] **QA-127** 409 on booking renders "load taken" and similar loads _(IC-27)_ **[B]**
- [ ] **QA-128** 409 on a state transition refreshes and explains the new state _(SC-40.2)_ **[B]**
- [ ] **QA-129** 429 explains the wait _(Phase 4 §2.2, Phase 7 §28)_
- [ ] **QA-130** 5xx offers retry; after 3 failures, a support route with context _(IC-60)_ **[B]**
- [ ] **QA-131** Error messages come from constants; no raw server text is shown _(SSB-3)_ **[B]**
- [ ] **QA-132** Form entries are never lost on error _(IC-02)_ **[B]**
- [ ] **QA-133** Failed messages remain with retry _(SH-04)_ **[B]**
- [ ] **QA-134** Failed uploads are retryable per file _(IC-24)_ **[B]**
- [ ] **QA-135** Offline queue replays in order and de-duplicates _(Phase 7 §13)_ **[B]**
- [ ] **QA-136** Map failure falls back to the text equivalent _(IC-30)_ **[B]**
- [ ] **QA-137** Processor errors map to plain messages _(IC-42)_ **[B]**
- [ ] **QA-138** Segment `error.tsx` exists for every data-bearing route _(Phase 7 §3)_ **[B]**

### 7.9 Loading Behavior

- [ ] **QA-139** Every data-bearing segment has `loading.tsx` _(Phase 7 §3)_ **[B]**
- [ ] **QA-140** Refetches keep previous data visible (placeholder data) _(SSB-2)_ **[B]**
- [ ] **QA-141** Pending actions block duplicate activation _(G-6)_ **[B]**
- [ ] **QA-142** Optimistic updates roll back on failure with announcement _(IC-33, IC-36)_ **[B]**
- [ ] **QA-143** Polling intervals match Phase 7 §13 constants _(Phase 7 §13)_
- [ ] **QA-144** New bids and messages arrive without moving focus _(SC-28.2, SH-04)_ **[B]**
- [ ] **QA-145** Map updates do not reset zoom or pan _(IC-30)_
- [ ] **QA-146** Driver trip renders from cache before network _(PG-39)_ **[B]**
- [ ] **QA-147** Upload progress is exposed per file _(IC-24)_
- [ ] **QA-148** Route transitions never render a blank page _(SSB-1)_ **[B]**

### 7.10 Frontend Readiness

- [ ] **QA-149** Every page file exists at its Phase 7 §3 path _(Phase 7 §3)_ **[B]**
- [ ] **QA-150** `page.tsx` files compose only (ESLint `page-composes-only`) _(Phase 7 §20)_ **[B]**
- [ ] **QA-151** Components never call transport directly (ESLint `api-access-boundary`) _(Phase 7 §20)_ **[B]**
- [ ] **QA-152** Every hook listed in Phase 7 §8 exists with its named exports _(Phase 7 §8)_ **[B]**
- [ ] **QA-153** Every Server Action follows the `create-user.ts` pattern and returns `ActionResult` _(Phase 7 §11)_ **[B]**
- [ ] **QA-154** Every Route Handler re-verifies session and role _(Phase 7 §19)_ **[B]**
- [ ] **QA-155** Enums derive from the generated contract _(Phase 7 §10)_ **[B]**
- [ ] **QA-156** `PROTECTED_ROUTE_PREFIXES` covers every workspace and internal prefix _(D-7)_ **[B]**
- [ ] **QA-157** Internal prefixes reject non-internal roles at the edge _(D-7)_ **[B]**
- [ ] **QA-158** `appRoutes` used for every internal path (ESLint rule proposed in Phase 7 §20) _(IC-51, Phase 7 §20)_ **[B]**
- [ ] **QA-159** Idempotency keys generated with `nanoid` for book, accept, pay, quick pay _(Phase 7 §19)_ **[B]**
- [ ] **QA-160** Mock handlers live only in `lib/mocks/`, registered under contract routes, with fixtures in `lib/data/mocks/` _(Phase 7 §11)_ **[B]**
- [ ] **QA-161** Every shared section in Phase 5 has one implementation in `components/common/` _(Phase 7 §12)_ **[B]**
- [ ] **QA-162** Every Phase 6 contract has one implementation in `components/ui/` or is native _(Phase 7 §12)_ **[B]**
- [ ] **QA-163** Library additions match approved Phase 7 §15 entries only _(Phase 7 §15)_ **[B]**

### 7.11 Developer Experience

- [ ] **QA-164** `pnpm type-check` passes _(Host)_ **[B]**
- [ ] **QA-165** `pnpm lint` passes with no disabled rules added _(Host)_ **[B]**
- [ ] **QA-166** `pnpm test` passes _(Host)_ **[B]**
- [ ] **QA-167** `pnpm contract:check` passes _(Host)_ **[B]**
- [ ] **QA-168** New ESLint rules have colocated tests _(Phase 7 §20)_ **[B]**
- [ ] **QA-169** Query key factories exported and used for invalidation _(Phase 7 §8)_
- [ ] **QA-170** PR titles cite design OS IDs _(Phase 7 §16)_
- [ ] **QA-171** Phase 8 §9 status updated in the same PR _(Phase 8 §7)_ **[B]**
- [ ] **QA-172** Local development works with mocks on and no backend; setting `NEXT_PUBLIC_API_MOCKS=off` changes nothing else _(Phase 7 §11)_
- [ ] **QA-173** SETUP-CHECKLIST steps reproduce a working environment _(SETUP-CHECKLIST)_

### 7.12 SEO Readiness

- [ ] **QA-174** `sitemap.ts` lists exactly the indexable tiers _(Phase 3 §11)_ **[B]**
- [ ] **QA-175** `robots.ts` blocks workspace, internal and tracking routes _(Phase 3 §11)_ **[B]**
- [ ] **QA-176** PG-02 sends `noindex, nofollow` _(Phase 3 §11)_ **[B]**
- [ ] **QA-177** Every indexable page has unique title and description from constants _(SSB-7)_ **[B]**
- [ ] **QA-178** Canonical URLs set per Phase 3 §11 _(Phase 3 §11)_ **[B]**
- [ ] **QA-179** Structured data validates (Organization, WebSite, FAQPage/Article, BreadcrumbList, WebApplication) _(Phase 3 §11)_
- [ ] **QA-180** AggregateRating only when ≥ 5 ratings _(PG-03)_ **[B]**
- [ ] **QA-181** Unapproved carriers return 404, not indexable pages _(PG-03)_ **[B]**
- [ ] **QA-182** Public pages render meaningful HTML without JavaScript _(Master prompt › Functional Standards (progressive enhancement))_ **[B]**
- [ ] **QA-183** Open Graph metadata present on public pages _(Phase 3 §11)_

### 7.13 Maintainability

- [ ] **QA-184** No file exceeds ~150 lines _(Host)_ **[B]**
- [ ] **QA-185** One component per file, kebab-case matching export _(Host)_ **[B]**
- [ ] **QA-186** Shared domain types live in `lib/types/` and are re-exported _(Host)_ **[B]**
- [ ] **QA-187** No inline copy repeated twice; copy in constants _(Host rule 1)_ **[B]**
- [ ] **QA-188** No `console.*` or debug statements _(Host rule 5)_ **[B]**
- [ ] **QA-189** No deep-relative imports _(Host)_ **[B]**
- [ ] **QA-190** `lib/contract/` untouched by hand _(Host)_ **[B]**
- [ ] **QA-191** Validations compose over contract schemas instead of restating them _(Host)_ **[B]**
- [ ] **QA-192** Deviations from Phases 1–7 recorded as decisions _(Phase 8 §7)_ **[B]**
- [ ] **QA-193** No specified feature removed without a maintainer instruction naming it _(Scope Preservation)_ **[B]**

### 7.14 Cross-Browser Compatibility

- [ ] **QA-194** Core flows pass on current and previous Chrome _(Phase 1 §12)_ **[B]**
- [ ] **QA-195** Core flows pass on current and previous Edge _(Phase 1 §12)_ **[B]**
- [ ] **QA-196** Core flows pass on current and previous Firefox _(Phase 1 §12)_ **[B]**
- [ ] **QA-197** Core flows pass on current and previous Safari (macOS) _(Phase 1 §12)_ **[B]**
- [ ] **QA-198** Driver and carrier flows pass on Safari iOS 16+ _(Phase 1 §12)_ **[B]**
- [ ] **QA-199** Driver and carrier flows pass on Chrome Android 10+ _(Phase 1 §12)_ **[B]**
- [ ] **QA-200** Camera capture, geolocation, Web Share and IndexedDB degrade gracefully where unsupported _(IC-25, IC-44, Phase 7 §13)_ **[B]**
- [ ] **QA-201** Native `dialog` behaviour consistent across the matrix _(IC-41)_ **[B]**

### 7.15 Business Rules and Security

- [ ] **QA-202** Shippers never receive carrier pay in any response; carriers never receive shipper price _(BR-05)_ **[B]**
- [ ] **QA-203** Public tracking payload contains no rates, contacts or documents _(BR-21)_ **[B]**
- [ ] **QA-204** Quote honoured for 30 minutes only for its lane, equipment and dates _(BR-06)_ **[B]**
- [ ] **QA-205** Ineligible carriers cannot book or bid, even by direct request _(BR-03)_ **[B]**
- [ ] **QA-206** Rate confirmation acceptance records user, time, IP and version _(BR-04)_ **[B]**
- [ ] **QA-207** Accepting a bid expires all other open bids _(BR-02)_ **[B]**
- [ ] **QA-208** Tender waterfall respects exclusive windows _(BR-08)_ **[B]**
- [ ] **QA-209** Detention accrual starts after free time from recorded arrival _(BR-11)_ **[B]**
- [ ] **QA-210** Disputes hold only the disputed amount _(BR-16)_ **[B]**
- [ ] **QA-211** Driver location collected only for active assigned trips with consent _(Phase 1 §12)_ **[B]**
- [ ] **QA-212** Sensitive changes require re-authentication within 10 minutes _(XS-11, IC-13)_ **[B]**
- [ ] **QA-213** No raw payment data in Haulr code, logs or network calls to Haulr _(A6)_ **[B]**
- [ ] **QA-214** Return paths cannot redirect off-site _(Phase 3 §14, Phase 7 §19)_ **[B]**
- [ ] **QA-215** Rate limits enforced on anonymous endpoints _(Phase 8 §10)_ **[B]**
- [ ] **QA-216** CSP blocks non-allow-listed origins _(Phase 7 §19)_ **[B]**
- [ ] **QA-269** A custom quote request is answered or escalated by its BR-31 deadline; a price below the margin floor is refused; carrier pay never reaches the shipper _(BR-31, BR-05)_ **[B]**
- [ ] **QA-270** The dispatch board shows ELD hours exactly as reported and only to the carrier's own users: no hours warning, override or stored hours decision exists, and no analytics, audit or error payload carries hours values _(XF-17, SC-65.2, CMP-12, NFR-PRIV-3)_ **[B]**

### 7.16 Enterprise, Compliance and Operations

- [ ] **QA-217** SAML and OIDC sign-in succeed with Okta, Entra ID, Google Workspace and OneLogin test tenants _(SEC-2, R-13)_ **[B]**
- [ ] **QA-218** Enforced SSO disables password sign-in for members except the break-glass admin _(BR-24)_ **[B]**
- [ ] **QA-219** SCIM create, update and deactivate reflect within 5 minutes; deactivation ends all sessions _(BR-24)_ **[B]**
- [ ] **QA-220** SSO enforcement is refused without a passing test sign-in in the last 24 h _(SC-60.4)_ **[B]**
- [ ] **QA-221** SSO discovery responses are indistinguishable for unknown and password-only domains _(SC-10.3, SEC-10)_ **[B]**
- [ ] **QA-222** Idle timeout follows organisation policy and warns 2 minutes ahead _(BR-24, IC-54)_ **[B]**
- [ ] **QA-223** IP allow-list refuses admin access from other addresses and cannot lock out the configuring admin _(SC-60.4)_ **[B]**
- [ ] **QA-224** Actions above a member's spend limit enter `PendingApproval` via UI, bulk import, API and EDI _(BR-23, Phase 2 §7)_ **[B]**
- [ ] **QA-225** Approvers cannot approve their own requests, including admins _(BR-23, IC-62)_ **[B]**
- [ ] **QA-226** Approval of a still-valid request completes the original action within 5 s _(PG-58)_ **[B]**
- [ ] **QA-227** Approval after quote or bid expiry is refused and the requester is prompted to re-quote _(XF-16)_ **[B]**
- [ ] **QA-228** Amendments bind only after carrier acceptance with signature evidence; previous versions remain retrievable _(BR-25, CMP-3, CMP-4)_ **[B]**
- [ ] **QA-229** Amendments cannot change completed stops; one open amendment per load _(Phase 2 §5.1)_ **[B]**
- [ ] **QA-230** Lapsed amendments raise an operations exception _(XF-15)_ **[B]**
- [ ] **QA-231** Bulk import of 500 rows validates and prices within 60 s; nothing posts before confirmation _(BR-28, NFR-CAP-3)_ **[B]**
- [ ] **QA-232** Every imported row has exactly one outcome in the results file _(IC-61)_ **[B]**
- [ ] **QA-233** Recurrence occurrences above the guardrail become drafts and notify the owner _(SC-57.3)_
- [ ] **QA-234** API key secrets are shown once and never appear in storage, logs, analytics or query cache _(IC-63, SEC-8)_ **[B]**
- [ ] **QA-235** Revoked API keys fail within 60 s; rotation overlap ends at the chosen time _(BR-29)_ **[B]**
- [ ] **QA-236** Webhooks are signed, retried for 24 h, and refused for non-HTTPS or private addresses _(BR-29, SC-61.2)_ **[B]**
- [ ] **QA-237** Every mutation produces an audit event visible to the organisation within 60 s with actor type _(BR-26, SSB-9)_ **[B]**
- [ ] **QA-238** No role, including `internal.admin`, can edit or delete audit events _(BR-26)_ **[B]**
- [ ] **QA-239** Audit and data exports include manifests with row counts and checksums, and are themselves audited _(IC-65)_ **[B]**
- [ ] **QA-240** Export download links require a session and expire after 24 h _(IC-65)_ **[B]**
- [ ] **QA-241** Privacy requests are acknowledged within 7 days and fulfilled within 45; outcome reports state retained data and legal basis _(BR-30, CMP-7)_ **[B]**
- [ ] **QA-242** View-as requires a linked ticket, is read-only without consent, never writes payout, security, key or export settings, and ends at 60 minutes _(BR-27)_ **[B]**
- [ ] **QA-243** View-as actions appear in the organisation audit log attributed to the staff member _(BR-27, XS-17)_ **[B]**
- [ ] **QA-244** View-as state is announced on every page and cannot be dismissed _(IC-64)_ **[B]**
- [ ] **QA-245** Every resource returns not found across tenants for read, list and mutate _(SEC-5, R-14)_ **[B]**
- [ ] **QA-246** Query cache, drafts and offline queue are purged on sign-out, view-as start and end, and deprovisioning _(SSB-10)_ **[B]**
- [ ] **QA-247** Stale edits return E-PRECONDITION and IC-67 preserves the user's input in every path _(SSB-8, IC-67)_ **[B]**
- [ ] **QA-248** Every page and section implements the Phase 4 §2 state classes it cites; no bare "retry" or "loading" behaviour _(Phase 4 §2)_ **[B]**
- [ ] **QA-249** Every E-SERVER and E-CONTRACT shows a correlation ID that locates the trace _(NFR-OBS-1, Phase 7 §21)_ **[B]**
- [ ] **QA-250** Analytics and error payloads contain no PII (automated scan) _(NFR-PRIV-3)_ **[B]**
- [ ] **QA-251** Only catalogued analytics events are emitted; every KPI's source events arrive in staging _(Phase 7 §27)_ **[B]**
- [ ] **QA-252** Load test meets NFR-CAP-1 … 3 and NFR-PERF-3 … 5 at 1.5× peak _(NFR-CAP, NFR-PERF)_ **[B]**
- [ ] **QA-253** Each dependency failure degrades only its capability, with E-UNAVAILABLE messaging _(NFR-AV-4, OPS-4)_ **[B]**
- [ ] **QA-254** Restore drill meets RPO ≤ 5 min and RTO ≤ 1 h _(NFR-AV-5)_ **[B]**
- [ ] **QA-255** Offline stop events queued up to 7 days replay without loss _(NFR-AV-6)_ **[B]**
- [ ] **QA-256** No open critical or high findings from DAST or penetration test _(SEC-7, SEC-9)_ **[B]**
- [ ] **QA-257** Security headers (CSP nonces, HSTS, frame-ancestors, Permissions-Policy) present on every route _(Phase 7 §19)_ **[B]**
- [ ] **QA-258** Server Actions reject cross-origin requests _(SEC-7)_ **[B]**
- [ ] **QA-259** Passwords checked against breached lists; MFA required for the roles listed in SEC-1 _(SEC-1)_ **[B]**
- [ ] **QA-260** VPAT published and consistent with Phase 9 §1–2 results _(NFR-A11Y-1)_ **[B]**
- [ ] **QA-261** Broker MC number appears on rate confirmations, invoices and legal pages _(CMP-1)_ **[B]**
- [ ] **QA-262** OFAC screening runs at onboarding and on payout-method change _(CMP-11)_ **[B]**
- [ ] **QA-263** Environment validation fails the deploy on missing or malformed variables _(D-9)_ **[B]**
- [ ] **QA-264** Expired feature flags fail CI _(Phase 7 §22)_
- [ ] **QA-265** Copy survives 40% text expansion and pseudo-localisation without truncating meaning _(NFR-I18N-1)_
- [ ] **QA-266** Runbooks exist and were rehearsed for every E-UNAVAILABLE dependency _(OPS-4)_ **[B]**

### 7.17 Accessibility verification procedure

1. Automated: axe via Playwright on every page state (loading, empty, error, success) — zero serious or critical violations.
2. Keyboard: complete every Phase 4 primary task without a pointer; check focus order, visibility and return.
3. Screen readers: NVDA + Firefox and VoiceOver + Safari iOS for every flow in the sprint.
4. Zoom and reflow: 200% text, 320 px viewport, text-spacing override.
5. Map independence: complete PG-02, PG-26, PG-33 and PG-40 tasks via text equivalents only.

### 7.18 Performance targets

| Metric (p75, mid-range phone, 4G) | Target |
| --- | --- |
| LCP | ≤ 2.5 s (PG-01 ≤ 2.0 s) |
| INP | ≤ 200 ms |
| CLS | ≤ 0.1 |
| Initial JS | public ≤ 170 KB, workspace ≤ 250 KB, driver ≤ 150 KB |

### 7.19 Browser compatibility

Current and previous Chrome, Edge, Firefox, Safari; Safari iOS 16+; Chrome Android 10+. Camera, geolocation, Web Share and IndexedDB degrade gracefully.

### 7.20 Responsive behaviour verification

For each page, confirm every "Device needs" statement in Phase 4 is achievable on the named device. Behaviour only; visual responsiveness is judged in the owner review.

### 7.21 Interaction contract completeness

For each IC- used: every listed state is reachable and tested; keyboard support matches; ARIA matches; validation, loading and error behaviour match; content rules hold.

---

## 8. Code Patterns and Standards

Templates follow the starter's style: 4-space indentation, double quotes, `@/` imports, default-exported function components with an `interface Props`, no code comments. JSX inside templates is structural only; what a section contains and how it looks come from the approved visual concept.

### 8.1 Component structure template (a section)

```tsx
"use client";
import SectionState from "@/components/common/section-state";
import { useLoadTimeline } from "@/lib/hooks/use-load-timeline";
import { TIMELINE_COPY } from "@/lib/loads/constants";

interface Props {
    loadId: string;
}

export default function LoadTimeline({ loadId }: Props) {
    const timeline = useLoadTimeline(loadId);

    return (
        <section aria-labelledby="load-timeline-heading">
            <h2 id="load-timeline-heading">{TIMELINE_COPY.heading}</h2>
            <SectionState
                query={timeline}
                empty={TIMELINE_COPY.empty}
                failed={TIMELINE_COPY.failed}
            >
                {(events) => (
                    <ol>
                        {events.map((event) => (
                            <li key={event.id}>{event.label}</li>
                        ))}
                    </ol>
                )}
            </SectionState>
        </section>
    );
}
```

Rules: one section per file; copy from constants; data from exactly one hook per resource; loading, empty and error handled through one shared state helper so every section behaves identically (SSB-1 … SSB-3).

### 8.2 Page template

```tsx
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import SectionBoundary from "@/components/wrappers/section-boundary";
import LoadIdentity from "@/components/common/load-identity";
import LoadTimeline from "@/components/common/load-timeline";
import { backendFetch, readJson } from "@/lib/api-server";
import { routes } from "@/lib/contract";
import { loadKeys } from "@/lib/hooks/use-loads";

interface Props {
    params: Promise<{ loadId: string }>;
}

export default async function LoadPage({ params }: Props) {
    const { loadId } = await params;
    const queryClient = new QueryClient();
    await queryClient.prefetchQuery({
        queryKey: loadKeys.detail(loadId),
        queryFn: async () => readJson(await backendFetch(routes.loadsFindOne(loadId))),
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <main id="main">
                <SectionBoundary>
                    <LoadIdentity loadId={loadId} />
                </SectionBoundary>
                <SectionBoundary>
                    <LoadTimeline loadId={loadId} />
                </SectionBoundary>
            </main>
        </HydrationBoundary>
    );
}
```

Rules: the page composes its Phase 5 sections and holds page-level state only; each data section sits in its own `SectionBoundary`; prefetch on the server with the same read the Route Handler relays (D-2); `generateMetadata` sets `<Page> · Haulr` from constants. Which sections render, and in what arrangement, follows the page's Phase 5 inventory and approved concept.

### 8.3 Hook patterns

```ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { local } from "@/lib/api-client";
import { apiRoutes } from "@/lib/api-routes";
import { transitionLoad } from "@/lib/actions/transition-load";
import { unwrap } from "@/lib/utils/action-result";
import type { LoadDto, LoadTransitionDto } from "@/lib/contract/schemas";

export const loadKeys = {
    all: ["loads"] as const,
    list: (params: Record<string, string>) =>
        [...loadKeys.all, "list", params] as const,
    detail: (loadId: string) => [...loadKeys.all, "detail", loadId] as const,
};

export const useLoad = (loadId: string) =>
    useQuery({
        queryKey: loadKeys.detail(loadId),
        queryFn: () => local.get<LoadDto>(apiRoutes.load(loadId)),
    });

export const useLoadActions = (loadId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: LoadTransitionDto) =>
            unwrap(await transitionLoad(loadId, input)),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: loadKeys.all }),
    });
};
```

Polled read (Route Handler, D-2):

```ts
import { useQuery } from "@tanstack/react-query";
import { local } from "@/lib/api-client";
import { apiRoutes } from "@/lib/api-routes";
import { POSITION_REFRESH_MS } from "@/lib/tracking/constants";
import type { LoadPositionsDto } from "@/lib/contract/schemas";

export const useLoadPositions = (loadId: string) =>
    useQuery({
        queryKey: ["loads", "positions", loadId],
        queryFn: () => local.get<LoadPositionsDto>(apiRoutes.loadPositions(loadId)),
        refetchInterval: POSITION_REFRESH_MS,
        refetchIntervalInBackground: false,
        placeholderData: (previous) => previous,
    });
```

Rules: key factories exported for invalidation; intervals from constants; `placeholderData` keeps previous data during refetch (SSB-2); optimistic updates only where Phase 5 says so.

### 8.4 API integration patterns

**Server Action** (follows `lib/actions/create-user.ts`, wrapped by `withAction` per D-13):

```ts
"use server";
import { backendFetch, readJson } from "@/lib/api-server";
import { routes } from "@/lib/contract/routes";
import {
    apiEnvelopeDtoSchema,
    bookLoadDtoSchema,
    rateConfirmationDtoSchema,
    type BookLoadDto,
    type RateConfirmationDto,
} from "@/lib/contract/schemas";
import { toActionResult } from "@/lib/utils/action-result";
import { withAction } from "@/lib/utils/with-action";

const bookedSchema = apiEnvelopeDtoSchema.extend({
    data: rateConfirmationDtoSchema,
});

export const bookLoad = withAction(
    { capability: "load.book", input: bookLoadDtoSchema },
    async ({ input, context }, loadId: string) => {
        const upstream = await backendFetch(routes.loadsBook(loadId), {
            method: "POST",
            body: JSON.stringify(input),
            headers: {
                "Idempotency-Key": input.idempotencyKey,
                "If-Match": input.version,
                "x-request-id": context.correlationId,
            },
        });
        return toActionResult<RateConfirmationDto>(
            upstream.status,
            await readJson(upstream),
            bookedSchema,
        );
    },
);
```

`withAction` validates `input` against the schema (E-VALIDATION), resolves the session and checks the capability (E-AUTH, E-FORBIDDEN), and supplies `context` (organisation, role, correlation ID, reason). It also times the call and reports failures through `report-error`. `toActionResult` maps status and schema parse results to the Phase 4 §2.2 error classes, including 409 → E-CONFLICT, 412 → E-PRECONDITION, 429 → E-RATE-LIMIT and parse failure → E-CONTRACT. The action never trusts an organisation ID from the client (SEC-5).

**Route Handler relay** (polled reads):

```ts
import { backendFetch, relay } from "@/lib/api-server";
import { routes } from "@/lib/contract/routes";

export const GET = async (
    _request: Request,
    { params }: { params: Promise<{ loadId: string }> },
) => {
    const { loadId } = await params;
    return relay(await backendFetch(routes.loadsPositions(loadId)));
};
```

Route Handlers use `withHandler` the same way. Route names such as `routes.loadsBook` come from the generated contract once the backend publishes them; until then the hook reads seed data (§6).

### 8.5 Error handling

- Map `ActionResult` failures by status in one helper (`lib/utils/action-result.ts`): 400/422 → field errors (IC-02); 401 → sign-in with return path; 403/404 → `notFound()` on pages, "not available" in sections; 409 → state conflict: refresh and explain (IC-27, SC-40.2); 429 → wait message; 5xx → retry (IC-60).
- Every message comes from constants; never render server text directly.
- Sections fail independently inside `SectionBoundary`; segment `error.tsx` offers `reset()`; root failures reach `global-error.tsx`.
- Never log with `console.*`; report through the observability service.
- Never clear user entries on error (IC-02).

### 8.6 Loading states

- Server components stream; each section has its own Suspense boundary (`SectionBoundary`).
- Client refetches keep previous data (`placeholderData`).
- Pending actions set `aria-busy` and block re-activation (G-6).
- Loading is announced only after 1 s (SSB-1).
- The driver trip renders from cache before network (PG-39).

### 8.7 Empty states

- Distinguish "none at all" (guidance from Phase 3 §13) from "none matching" (clear criteria) in every collection (SH-05).
- Each section's empty copy is the Phase 5 "Empty states" text, stored in constants.
- An empty state always offers the next useful step named in Phase 4 or 5.

---

## 9. Testing Strategy

Authoritative source: [Phase 8 §8](./phase-8-implementation-roadmap.md#8-testing-strategy).

### 9.1 Unit test coverage targets

- `lib/` ≥ 90% line coverage.
- 100% of rows in the Phase 2 §5 and §6 transition tables covered by `lib/loads/transitions.test.ts` and `bid-transitions.test.ts`.
- `fast-check` properties: no illegal transition reachable; money formatting round-trips; date windows never invert.
- Every Zod schema in `lib/validations/` has valid and invalid cases.

### 9.2 Integration test priorities

1. Server Actions for booking, bid acceptance, payment and quick pay (idempotency, conflict handling).
2. Route Handlers re-verify session and role.
3. Error mapping helper for every status in §8.5.
4. `proxy.ts` prefix and role enforcement (extend `proxy.test.ts`).
5. Response shaping assumptions (BR-05) against the mock fixtures.

### 9.3 End-to-end scenarios

| Scenario | Flows | Pages |
| --- | --- | --- |
| Register, verify, onboard shipper, invite member | XS-01, XF-13, XS-02 | PG-11, PG-14, PG-16, PG-48, PG-15 |
| Register and onboard carrier; compliance approves | XF-12 | PG-11, PG-17, PG-51 |
| Quote and post a load; quote expiry and re-quote | XF-01 | PG-27, PG-40 |
| Search, book and sign; lose a booking race | XF-02 | PG-33, PG-34 |
| Bid, counter, accept; other bids close | XF-03 | PG-40, PG-28 |
| Preferred tender waterfall to open market | XF-04 | PG-29, PG-27, PG-40 |
| Assign driver; driver runs trip offline and replays | XF-05, XF-06 | PG-35, PG-39 |
| Track load; share link; consignee views; link expires | XF-07 | PG-40, PG-02 |
| POD capture rejected then accepted; invoice issued | XF-09 | PG-39, PG-23, PG-31 |
| Batch pay invoices with one failure | XF-10 | PG-30 |
| Quick pay settlement | XF-11 | PG-38 |
| File and resolve a claim | XS-06 | PG-45 |
| Exception raised, claimed, resolved | XF-08 | PG-50, PG-40 |
| Import a file with duplicate references and unknown columns; post from a template | XF-14 | PG-56, PG-57 |
| Amend a booked load; carrier accepts; a second amendment arrives past the affected stop | XF-15 | PG-40, PG-64 |
| Over-limit post routes to approval; approval after quote expiry re-quotes | XF-16 | PG-27, PG-58 |
| Enforce SSO without locking out the configuring admin; SCIM deactivation ends open sessions | XS-13 | PG-60, PG-10 |
| Create an API key (reveal once); webhook endpoint fails and deliveries retry | XS-14 | PG-61 |
| Request an organisation export; download link expires and is re-issued | XS-15 | PG-62 |
| View-as without a linked ticket is refused; with consent, a write is audited | XS-16 | PG-24 |
| Filter the audit log beyond retention; export the result | XS-17 | PG-63 |
| Plan the week: fill an open window from the load board; move a load to another truck by keyboard; no hours figure without an ELD, and no hours warning or override anywhere | XF-17 | PG-65, PG-33, PG-34 |
| Request a custom quote; operations price it; the shipper posts on it; a below-floor price is refused; an overdue request escalates | XS-18 | PG-27, PG-66, PG-50 |
| Permission boundaries: every role against every prefix | Phase 3 §5 | All |

### 9.4 Accessibility testing

- axe in every E2E scenario, at every state.
- Component tests assert each contract's keyboard and ARIA behaviour.
- Manual screen reader pass per sprint (§7.17).

---

## 10. Per-Page Build Procedure

For each page in the current sprint:

1. **Confirm status.** The page is Scheduled for this sprint in Phase 8 §9. Set it to **In progress** in your branch.
2. **Read.** Phase 4 blueprint → Phase 5 sections (and SH- they instance) → Phase 6 contracts they cite → Phase 3 row (route, roles) → Phase 2 flows served.
3. **Check dependencies.** Primitives for the cited contracts exist; hooks exist; every route the page calls has a mock handler, or its DTO is published so one can be written.
4. **Visual concept.** Load the UI skill, produce the concept, present it to the owner, wait for approval ([Visual Design Hand-off](#visual-design-hand-off)).
5. **Scaffold.** `page.tsx`, `loading.tsx`, `error.tsx` at the Phase 7 path; `generateMetadata`; route guard via the role layout.
6. **Build sections.** One file each in `components/common/` (or the page-domain folder for a public or access page, D-14); reuse SH- implementations; wrap each in `SectionBoundary`.
7. **Wire data.** Hooks from Phase 7 §8; Server Actions or Route Handlers per D-2; a mock handler for every endpoint the page calls.
8. **Implement every state.** Loading, empty, error, success from Phase 4 and 5, with copy in constants.
9. **Test.** Unit (logic), component (contracts), E2E (flows), axe.
10. **Owner review.** Render the page; the owner reviews the result.
11. **Update status.** Set **Built** in Phase 8 §9; **Verified** once Phase 9 checks pass.

---

## 11. Pre-merge Checklist

- [ ] PR title cites IDs: `feat(PG-xx): … (SC-xx.x, IC-xx)`.
- [ ] Visual concept approval linked.
- [ ] `pnpm type-check`, `pnpm lint`, `pnpm test`, `pnpm contract:check` pass locally (hooks are disabled; run them by hand).
- [ ] No file over ~150 lines; one component per file; kebab-case names.
- [ ] No inline copy, routes, durations or enums; all in constants, `appRoutes`, `lib/enums/`.
- [ ] No `console.*`; no edits to `lib/contract/`.
- [ ] Components use hooks only; no transport calls in components.
- [ ] Every Phase 4 and 5 state implemented for the page's sections.
- [ ] Every cited Phase 6 contract's keyboard and ARIA behaviour verified.
- [ ] Applicable Phase 9 blocking items pass.
- [ ] No dependency added without recorded approval.
- [ ] No specified feature removed; unfinished items keep their status, and Deferred is used only with a named blocker.
- [ ] Deviations recorded as decisions in the affected phase.
- [ ] Every endpoint the page calls has a mock handler returning contract-shaped data (host rule).
- [ ] Phase 8 §9 status updated.

---

## 12. Deployment Readiness

Authoritative source: [Phase 8 §10](./phase-8-implementation-roadmap.md#10-deployment-readiness).

- Environment variables per environment: `NEXT_PUBLIC_API_URL`, `JWT_PUBLIC_KEY`, map and processor keys; none committed.
- `next.config.ts`: CSP and security headers; `images.remotePatterns`.
- `sitemap.ts` and `robots.ts` match Phase 3 §11 tiers.
- Observability: Web Vitals, error reporting service, action and handler error rates, KPI events (Phase 1 §10).
- Rate limits verified on anonymous endpoints (PG-05, PG-08, PG-12).
- Rollout: internal network from M3; invited pilot after M4.
- Launch gate: every page Verified or formally Deferred; Phase 9 §1, §2, §8, §15 and §16 pass; owner sign-off on every page; go/no-go per [Phase 8 §15](./phase-8-implementation-roadmap.md#15-gono-go-and-hypercare).

---

## 13. Reference Lookup

| Need | Source |
| --- | --- |
| Personas, roles, rules, KPIs, assumptions | [Phase 1](./phase-1-product-vision.md) |
| Journeys, failure paths, state machines | [Phase 2](./phase-2-experience-maps.md) |
| Routes, permissions, labels, filters, SEO, fallbacks | [Phase 3](./phase-3-information-architecture.md) |
| Page purpose, tasks, data, states | [Phase 4](./phase-4-page-blueprints.md) |
| Section responsibilities, hooks, states | [Phase 5](./phase-5-section-blueprints.md) |
| Interaction behaviour | [Phase 6](./phase-6-interaction-contracts.md) |
| Files, hooks, transport, libraries, performance, security | [Phase 7](./phase-7-frontend-architecture.md) |
| Sprints, risks, status | [Phase 8](./phase-8-implementation-roadmap.md) |
| QA items and sign-off | [Phase 9](./phase-9-qa-checklist.md) |
| Orientation | [START_HERE](./START_HERE.md), [README](./README.md) |
| Everything, indexed | [DESIGN-OS-COMPLETE](./DESIGN-OS-COMPLETE.md), [ARTIFACT_INDEX](./ARTIFACT_INDEX.md) |
| Setup | [SETUP-CHECKLIST](./SETUP-CHECKLIST.md) |
| Host conventions | `.claude/CLAUDE.md` |

---

Start: [START_HERE](./START_HERE.md) · Index: [DESIGN-OS-COMPLETE](./DESIGN-OS-COMPLETE.md)
