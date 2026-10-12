# Haulr Design OS — Complete

`Version 1.3.4` · `2026-10-10` · Status: **Complete, ready for engineering handoff** · Start: [START_HERE](./START_HERE.md) · Overview: [README](./README.md)

The master index. If something exists in this design OS, it is listed here.

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Deliverables — Phases 1–9](#2-deliverables--phases-19)
3. [Deliverables — Ancillary Documents](#3-deliverables--ancillary-documents)
4. [Deliverable Statistics](#4-deliverable-statistics)
5. [How to Use This Document](#5-how-to-use-this-document)
6. [ID Scheme](#6-id-scheme)
7. [Cross-References Between Phases](#7-cross-references-between-phases)
8. [What's Included](#8-whats-included)
9. [What's Not Included](#9-whats-not-included)
10. [Decisions Awaiting the Maintainer](#10-decisions-awaiting-the-maintainer)
11. [Version and Date](#11-version-and-date)

---

## 1. Executive Summary

You have a 15-file specification for **Haulr**, a road freight marketplace connecting shippers, carriers, drivers and consignees, with Haulr operations, compliance, finance, support and admin behind it.

It covers the product end to end:

- **Why and for whom:** vision, 13 personas, 31 business rules, KPIs and a North Star (Phase 1).
- **What people do:** 43 journeys with their failures and recoveries, plus the load and bid state machines (Phase 2).
- **Where things live:** 66 pages with routes, access rules and SEO tiers (Phase 3).
- **What each page and section must do:** 66 page blueprints and 238 section blueprints (Phases 4–5).
- **How interaction behaves:** 68 interaction contracts at WCAG 2.2 AA (Phase 6).
- **How the code is organised:** architecture reconciled with this repo's `.claude/CLAUDE.md` (Phase 7).
- **How and when it gets built:** an active solo build order of 7 stages (about 71 weeks), a staffed 16-week plan for reference, and status for every feature (Phase 8).
- **How it's proven:** 270 QA checks (Phase 9).
- **How to get going:** six guides, including a self-contained implementation prompt (Phase 10).

It deliberately contains **no visual design**. Each page's look is decided when it is built, with the owner.

---

## 2. Deliverables — Phases 1–9

| # | File | Description |
| --- | --- | --- |
| 1 | [phase-1-product-vision.md](./phase-1-product-vision.md) | The single source of truth for Haulr's purpose, personas, jobs, business rules, metrics, governance, constraints, principles and assumptions. Every other phase cites its IDs. |
| 2 | [phase-2-experience-maps.md](./phase-2-experience-maps.md) | 43 end-to-end journeys (primary flows, role dashboards, supporting flows), each with intent, decision points, failure and recovery paths, and system behaviour. Defines the legal load and bid state transitions. |
| 3 | [phase-3-information-architecture.md](./phase-3-information-architecture.md) | Which 66 pages exist, their routes and route groups, who can reach each, the capability matrix, content taxonomy, labelling, search, filtering, SEO, breadcrumbs, empty routes and fallbacks. |
| 4 | [phase-4-page-blueprints.md](./phase-4-page-blueprints.md) | For every page: purpose, business and user objectives, primary tasks, required data, permissions, device needs, loading, empty, error and success states, dependencies and implementation notes. |
| 5 | [phase-5-section-blueprints.md](./phase-5-section-blueprints.md) | Every page broken into single-job sections: 15 shared sections reused across pages and 223 page sections, each with data, interaction model, accessibility and states. |
| 6 | [phase-6-interaction-contracts.md](./phase-6-interaction-contracts.md) | Behaviour of every interactive element: inputs, states, keyboard, ARIA, validation, loading, errors, content rules, do and don't. Seven global rules bind them all. |
| 7 | [phase-7-frontend-architecture.md](./phase-7-frontend-architecture.md) | Folder structure, route files, layouts, providers, hooks, utilities, constants, API organisation, real-time and offline strategy, libraries, naming, code splitting, performance, security and lint enforcement. |
| 8 | [phase-8-implementation-roadmap.md](./phase-8-implementation-roadmap.md) | Development phases, priority, sprint plan, milestones, dependencies, risks, technical debt prevention, testing strategy, deployment readiness and the build status of every feature. |
| 9 | [phase-9-qa-checklist.md](./phase-9-qa-checklist.md) | 270 functional QA checks across accessibility, WCAG, consistency, responsiveness, scalability, performance, state coverage, errors, loading, readiness, developer experience, SEO, maintainability, browsers, business rules and security. |

## 3. Deliverables — Ancillary Documents

| # | File | Description |
| --- | --- | --- |
| 10 | [START_HERE.md](./START_HERE.md) | Entry point: contents checklist, Read → Copy → Execute, next-session steps, quick reference |
| 11 | [README.md](./README.md) | 5-minute overview: files, role guidance, statistics, philosophy |
| 12 | [DESIGN-OS-COMPLETE.md](./DESIGN-OS-COMPLETE.md) | This master index |
| 13 | [ARTIFACT_INDEX.md](./ARTIFACT_INDEX.md) | Deep index: per-phase audience, use cases, contents, dependencies, reading paths, keywords, build status roll-up |
| 14 | [SETUP-CHECKLIST.md](./SETUP-CHECKLIST.md) | Environment, project initialisation, dependencies, testing and workflow setup, verification |
| 15 | [IMPLEMENTATION_PROMPT.md](./IMPLEMENTATION_PROMPT.md) | Self-contained engineering prompt synthesising all nine phases into build instructions |

---

## 4. Deliverable Statistics

| Measure | Value | Source |
| --- | --- | --- |
| Files | 15 | This index |
| Personas | 13 | Phase 1 §7 |
| Permission roles | 14 | Phase 1 §7.4 |
| Business goals | 6 | Phase 1 §4 |
| Jobs to be done | 17 | Phase 1 §8 |
| Business rules | 31 | Phase 1 §9 |
| Non-functional, compliance, security, privacy and operations requirements | 56 | Phase 1 §18–22 |
| KPIs | 12 + North Star | Phase 1 §10 |
| Product principles | 9 | Phase 1 §13 |
| Primary flows | 17 | Phase 2 §2 |
| Role dashboards | 8 | Phase 2 §3 |
| Supporting flows | 18 | Phase 2 §4 |
| Load state transitions | 28 (+ 8 amendment transitions) | Phase 2 §5, §5.1 |
| Pages | 66 (+1 redirect route) | Phase 3 §3 |
| Capabilities in matrix | 29 core + 12 enterprise | Phase 3 §5.1, §5.1a |
| Shared sections | 15 | Phase 5 §2 |
| Page sections | 223 | Phase 5 §13 |
| Interaction contracts | 68 | Phase 6 |
| Architectural decisions | 14 (D-1 … D-14) | Phase 7 §1 |
| Hook files | 59 resource hook files (14 existing) + 20 existing hooks without transport | Phase 7 §8 |
| Build plan | Solo: 7 stages, about 71 weeks (active). Staffed: 8 sprints, 16 weeks | Phase 8 §16, §3 |
| Milestones | 5 | Phase 8 §4 |
| Risks | 17 | Phase 8 §6 |
| QA items | 270 | Phase 9 |

---

## 5. How to Use This Document

- **As a map.** Every deliverable is in §2–3. Follow the link.
- **As a lookup.** Know an ID? §6 tells you which phase defines it.
- **As an integrity check.** §7 lists every cross-phase reference type. If one breaks (a page cites a missing section, a section cites a missing contract), fix the spec before building.
- **As a boundary.** §8–9 say what this design OS does and does not decide.

---

## 6. ID Scheme

| Prefix | Meaning | Defined in |
| --- | --- | --- |
| `A` | Assumption | Phase 1 §1 |
| `BG-` | Business goal | Phase 1 §4 |
| `PR-` | Persona | Phase 1 §7 |
| `JTBD-` | Job to be done | Phase 1 §8 |
| `BR-` | Business rule | Phase 1 §9 |
| `KPI-` | Key performance indicator | Phase 1 §10 |
| `PP-` | Product principle | Phase 1 §13 |
| `XF-` / `XD-` / `XS-` | Primary flow / role dashboard / supporting flow | Phase 2 |
| `IA-P` | Information architecture principle | Phase 3 §1 |
| `PG-` | Page | Phase 3 §3, Phase 4 |
| `SSB-` | Shared state behaviour | Phase 4 §2 |
| `SH-` | Shared section | Phase 5 §2 |
| `SC-` | Page section (`SC-<page>.<n>`) | Phase 5 |
| `G-` | Global interaction rule | Phase 6 §1 |
| `IC-` | Interaction contract | Phase 6 |
| `D-` | Architectural decision | Phase 7 §1 |
| `S1` … `S8` | Sprint | Phase 8 §3 |
| `M1` … `M5` | Milestone | Phase 8 §4 |
| `R-` | Risk | Phase 8 §6 |
| `QA-` | QA item | Phase 9 |

---

## 7. Cross-References Between Phases

| From | To | Relationship |
| --- | --- | --- |
| Phase 2 experiences | Phase 1 personas, jobs, rules | Each experience serves named personas and jobs under named rules (Phase 2 §8) |
| Phase 3 pages | Phase 2 experiences | Each page exists to serve experiences (Phase 4 §13) |
| Phase 3 permissions | Phase 1 roles | Capability matrix uses the Phase 1 §7.4 role keys |
| Phase 4 pages | Phase 5 sections | Each blueprint links to its sections |
| Phase 4 states | Phase 4 §2 SSB rules | Pages inherit shared state behaviour |
| Phase 5 sections | Phase 6 contracts | Sections cite contracts by ID (Phase 6 §13) |
| Phase 5 sections | Phase 7 hooks | Data requirements name hooks (Phase 7 §8) |
| Phase 6 contracts | Phase 7 components | Contracts map to `components/ui/` primitives (Phase 7 §12) |
| Phase 7 architecture | Host `.claude/CLAUDE.md` | Decisions D-1 … D-14 reconcile extensions |
| Phase 8 status | Phases 2–6 IDs | Every flow, page, section and contract has one status (Phase 8 §9) |
| Phase 9 checks | Phases 1–8 | Each QA item cites its source |
| IMPLEMENTATION_PROMPT | Phases 1–9 | Synthesises all into build steps |

Integrity checks run at generation: 66 pages defined in Phases 3, 4, 5 and 8; 238 sections defined in Phase 5 and statused in Phase 8; 68 contracts defined in Phase 6 and statused in Phase 8; 43 experiences defined in Phase 2 and statused in Phase 8.

---

## 8. What's Included

- Product strategy, personas, rules and metrics.
- Complete journeys with failure handling.
- Complete page inventory, routes and permissions.
- Functional blueprints for every page and section, including every state.
- Behavioural contracts for every interactive element, with accessibility.
- Code organisation reconciled with this repository.
- Library recommendations under the reuse-first, confirm-before-install policy.
- A solo build order, a dated 16-week staffed plan, risks and dependencies.
- A 270-item QA checklist and sign-off rules.
- Guides and a self-contained implementation prompt.

## 9. What's Not Included

- **Visual design** of any kind: colour, type, spacing, layout, placement, imagery, motion, wireframes. Decided per page at build time with the owner.
- **Screen content inventories:** fields, buttons, links or headings per page, and component lists per page. Decided per page at build time.
- **Backend design:** the NestJS modules, database schema and processor integration Haulr needs (listed as dependencies in Phase 8 §5).
- **Marketing copy** beyond placeholders in constants.
- **Legal documents' text** (terms, privacy, carrier agreement); PG-09 publishes them once written.
- **Installed dependencies:** proposed libraries await approval (Phase 7 §15).

---

## 10. Decisions Awaiting the Maintainer

"Needed by" refers to the solo build order's stages ([Phase 8 §16](./phase-8-implementation-roadmap.md#16-solo-build-order)).

| Item | Where | Needed by |
| --- | --- | --- |
| Counsel confirms the dispatch board's hours design | Phase 8 §5 | Before launch |
| Book the penetration test vendor | Phase 8 §5 | Before launch |

### 10.1 Decided on 2026-10-09

| Decision | Outcome | Where |
| --- | --- | --- |
| D-14, page-domain component folders | Confirmed for public and access pages in the cinematic register; recorded in `.claude/CLAUDE.md` | Phase 7 §1 |
| BR-31 custom quote values | 2-business-hour response; validity set per quote, default 4 hours, cap 24 hours; margin floor 8% of the shipper price, refused below it, changed only by `internal.admin` | Phase 1 §9 |
| Driver hours on the dispatch board | Shown only to the carrier's own users, as the ELD reports them; never evaluated, warned on or stored. Based on *Montgomery v. Caribe Transport II* (2026), 49 CFR 390.6 and *Sperl v. C.H. Robinson*; safety rating and out-of-service checks added to BR-03 and BR-18; CMP-12 and CMP-13 added | Phase 1 §9, §19; Phase 2 XF-17 |
| Capacity | Solo build order: seven pattern-first stages against the mocked backend; everything else Specified and queued after stage 7 (1.3.1; 1.3.0 had marked it Deferred) | Phase 8 §16, §9.6 |
| Payment and payout method entry | Unblocked by the payments decision; Specified again | Phase 8 §9.6 |
| Analytics event names | Phase 4 names canonical; `<domain>.<object>.<verb>`, snake_case, past tense; one catalogue | Phase 7 §27 |
| View-as reach | Payout and payment methods, API keys and data export never shown; security settings read-only | Phase 3 §5.2 |
| Support read on Integrations (PG-61) | Allowed with a ticket; keys never shown | Phase 3 §5.1a |
| Operations agents and view-as | Removed from XS-16 at the maintainer's instruction | Phase 2 XS-16 |
| Carrier cancellation after booking | The load returns to `Posted` for re-tender and the carrier's reliability penalty applies | BR-12, Phase 2 §5 |
| Idle timeout | Organisations set 15–120 minutes for workspace roles (default 30); internal roles fixed at 15 | SEC-3, BR-24 |
| Scorecard threshold | Scorecard after 5 delivered loads; rating figure after 5 rated loads | Phase 4 PG-03, PG-04 |
| Help feedback | Anonymous yes or no plus an optional reason code; no free text | Phase 4 PG-07, SC-07.2 |
| Personal contact data | Classified Confidential | NFR-PRIV-1 |
| Suspended carriers | Reinstated through a new compliance review | Phase 2 XF-12, SC-51.4 |
| Carrier pay timing | "3 business days" everywhere | BG-03, BR-15 |
| Contact Support (PG-08) | Indexed for search | Phase 3 §11 |
| Form library (2026-10-10) | TanStack Form approved (type-safe field arrays, multi-step validation); the access forms move over when next changed | Phase 7 §15 |
| Testing libraries (2026-10-10) | Vitest Browser Mode for component tests; Playwright and axe end to end; none installed yet | Phase 7 §15 |
| Field and collection limits (2026-10-10) | Phase 7 §10 confirmed, with the values already in code recorded; the 128-character password maximum is not yet enforced | Phase 7 §10 |
| Accessible component library (2026-10-10) | React Aria Components under `components/ui/` | Phase 7 §15 |
| D-3, help and legal content (2026-10-10) | Typed modules in `lib/data/`; confirmed in practice by `lib/data/legal/` | Phase 7 §1 |
| Signed-in landing (2026-10-10) | `/dashboard` is an interim holding page until the workspace roots exist | Phase 8 §16, Phase 3 §4 |
| Network statistics (2026-10-10) | A stats mock on a contract route, labelled "Sample figures", until the backend reports them | Phase 8 §16 |
| Not Found (2026-10-10) | `app/global-not-found.tsx` for unknown URLs, segment `not-found.tsx` for records | Phase 7 §2, Phase 3 §3.5 |
| R-08, `forbidden()` flag (2026-10-10) | Resolved: `experimental.authInterrupts` and `globalNotFound` are enabled | Phase 8 §6 |
| D-2, reads and live data (2026-10-10) | Server Actions for mutations only; reads through Server Components or Route Handlers; positions and ETAs over Server-Sent Events | Phase 7 §1, §13 |
| Assumptions A1–A10 (2026-10-10) | Confirmed; A6 amended to two providers; A9 and A10 hold for the full product, not the slice | Phase 1 §1 |
| Maps and routing (2026-10-10) | MapLibre base map with Protomaps tiles under deck.gl; HERE truck routing and ETAs on the backend | Phase 7 §15 |
| Payments (2026-10-10) | Stripe for shipper payments; Triumph for carrier payments, QuickPay and factoring-company payouts | Phase 1 A6, Phase 7 §15 |
| Charts (2026-10-10) | visx | Phase 7 §15 |
| Enterprise SSO (2026-10-10) | WorkOS on the backend; its test provider replaces per-provider tenants | Phase 7 §15, Phase 8 §5 |
| Observability (2026-10-10) | OpenTelemetry and Sentry, before a public deployment | Phase 7 §15 |
| Product analytics and flags (2026-10-10) | PostHog after the privacy review; its flags back `lib/flags.ts` | Phase 7 §15 |

---

## 11. Version and Date

| Field | Value |
| --- | --- |
| Version | 1.3.4 (merit-based library and service decisions, help and support pages; 1.3.3 recorded the stage 1 decisions and system and legal pages; 1.3.2 synced statuses after the MFA step; 1.3.1 caught statuses up, relabelled unblocked items Specified and fixed code drift; 1.3.0 recorded the maintainer decisions, solo build order and mocked backend; 1.2.0 added the dispatch board and quote desk, 1.1.1 was the audit, 1.1.0 enterprise hardening, 1.0.0 the initial generation) |
| Generated | 2026-09-30 |
| Revised | 2026-10-10 |
| Seed prompt | `docs/MASTER_PROMPT_COMPLETE.md` |
| Output directory | `design-os/generated/` |
| Generation mode | 1.1.0 is a merge over 1.0.0: nothing removed; thin fields raised to the Phase 4 §2 taxonomy; enterprise scope added |
| Host conventions | `.claude/CLAUDE.md` (Next.js 16 App Router starter) |

### Version history

| Version | Change |
| --- | --- |
| 1.0.0 | Initial generation: 55 pages, 194 sections, 60 contracts, 33 experiences, 216 QA items |
| 1.1.0 | Enterprise hardening. Added a named state taxonomy (Phase 4 §2.1–2.8). About 2,300 thin field values across Phases 4–6 were rewritten against it. Added NFRs, compliance, identity and security, privacy and operations requirements (Phase 1 §18–22) and BR-23 … BR-30. Added nine enterprise pages, eight flows, 36 sections and seven contracts, and the amendment state machine. Phase 7 gained D-9 … D-13 and §21–28. Phase 8 gained sizing, capacity, Definition of Ready/Done, RACI, release, go/no-go and hypercare. Phase 9 gained 50 QA items. Nothing was removed. |
| 1.1.1 | Audit and code reconciliation. Phases 7–8 and the guides now match the code on `development`: PG-01 and the identity-first sign-in are In progress, deck.gl is reused for maps, D-14 records the page-domain component folders, and existing hooks and the auth signal provider are listed. Contradictions between Phases 2–6 were reconciled: state machines, permissions, refresh intervals, the offline queue, the contract usage index, and ARIA and keyboard behaviour per WAI-ARIA. Missing states and enumerations were filled in, placement and component wording was rewritten as behaviour, and QA-267 (WCAG 3.2.6) was added. No feature was removed. Duplicated passages now point to the section that owns them. |
| 1.2.0 | Added two pages the maintainer selected. **PG-65 Dispatch Board** (XF-17, SC-65.1 … SC-65.4, IC-68 planning grid) covers the "load plans" pattern the project brief names for Logistics; carriers plan trucks across days, fill open windows and record unavailable periods. **PG-66 Quote Desk** (XS-18, SC-66.1 … SC-66.3, BR-31) gives the custom quote requests already offered on PG-05, PG-27 and PG-56 an owner and a deadline; SC-27.7 gives shippers their side of the request. Also two Phase 4 §2.6 freshness rows, a quote request status enumeration, three capability rows, QA-268 … QA-270. Totals: 66 pages, 238 sections, 68 contracts, 43 experiences, 31 business rules, 270 QA items. Driver hours on the dispatch board are ELD-reported information only, pending legal review: no hours warning, override or stored decision. Custom quote validity is set per quote within a configured default and cap. The dispatch board is a pre-agreed deferral candidate (Phase 8 §13). Nothing removed. |
| 1.3.0 | Maintainer decisions recorded in §10.1. Carrier vetting now checks the FMCSA safety rating and out-of-service orders (BR-03, BR-18), after *Montgomery v. Caribe Transport II* (2026); CMP-12 (driver coercion) and CMP-13 (broker, not carrier) added; dispatch-board hours shown only to the carrier's own users. Custom quote values set (BR-31). View-as reach, support read on PG-61, carrier cancellation, idle timeout, scorecard threshold, help feedback, personal-data classification, carrier reinstatement and pay timing reconciled. The active plan is now the solo build order (Phase 8 §16): 17 pages, 10 flows, 67 sections and 42 contracts in seven pattern-first stages; everything else Deferred with its spec unchanged. The mocked backend from `.claude/CLAUDE.md` replaces the seed-data fallback. Analytics events normalised to one convention with a 240-event catalogue (Phase 7 §27.1). Operations agents removed from XS-16 at the maintainer's instruction; no other feature removed. |
| 1.3.1 | Statuses caught up with the code: Forgot Password, Reset Password and Verify (PG-12, PG-13, PG-14) and their sections are In progress in solo stage 1, with the MFA challenge (SC-14.2) started; the countdown (IC-46) is In progress and the one-time code input (IC-04) Scheduled. Items outside the slice relabelled from Deferred to Specified, because capacity alone is not a blocker (maintainer's fix-before-drop rule); only payment and payout method entry stays Deferred, blocked on the payments processor choice. Phase 7 brought up to date with the code: `board-field.tsx`, `field-error.tsx`, `board-cells.tsx`, `auth-links.tsx`, `assembly-provider.tsx`, one hook file per access action, the step-flow hooks and the access presentation hooks. Capacity options reordered so both fixes come before any deferral. Nothing removed. |
| 1.3.2 | Status sync with commits up to `bfbe4cc`: the MFA challenge (SC-14.2) now has its code step on `/auth/verify`; register's side selection (SC-11.1), the one-time code input (IC-04) and the consent checkbox (IC-38) are In progress. Phase 7 lists the new access files (`code-challenge.tsx`, `code-step.tsx`, `expired-panel.tsx`, `side-picker.tsx`, `consent-check.tsx`). No spec change. |
| 1.3.3 | Stage 1 decisions recorded: form library declined in favour of the native pattern, Playwright and axe approved, Testing Library later, field limits confirmed with the values in code, no headless component library, D-3 confirmed by `lib/data/legal/`. Statuses synced with the working tree: system pages (PG-53 … PG-55) and Legal (PG-09, ahead of the slice) In progress; `/dashboard` recorded as an interim holding page; network statistics to use a labelled stats mock; Not Found through `global-not-found.tsx`; R-08 resolved. Phase 7 lists `components/legal/`, the system components, `root-document.tsx` and `use-active-section.ts`. No spec change. |
| 1.3.4 | Decisions remade on merit rather than on what the repo already had: D-2 widened (Server Actions for mutations only; reads through Route Handlers or Server Components; positions and ETAs over Server-Sent Events); TanStack Form; Vitest Browser Mode with Playwright and axe; React Aria Components; MapLibre with Protomaps under deck.gl and HERE truck routing; Stripe for shippers and Triumph for carriers (A6 amended); visx; WorkOS; OpenTelemetry and Sentry; PostHog with flags. Assumptions confirmed. Payment method entry unblocked, so nothing is Deferred. Help Center, Help Article and Contact Support (PG-06 … PG-08) recorded as built ahead of the slice, with IC-09 and IC-19 In progress; the ticket list still reads through a Server Action, which D-2 moves to a Route Handler. No feature removed. |

---

Start: [START_HERE](./START_HERE.md) · Detail: [ARTIFACT_INDEX](./ARTIFACT_INDEX.md)
