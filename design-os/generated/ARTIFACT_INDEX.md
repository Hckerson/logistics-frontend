# Artifact Index — Haulr Design OS

`Version 1.1.1` · `2026-10-09` · Start: [START_HERE](./START_HERE.md) · Master index: [DESIGN-OS-COMPLETE](./DESIGN-OS-COMPLETE.md)

A detailed guide to each phase: what it is, who needs it, when to open it, what it contains and how it feeds the phases after it.

## Table of Contents

1. [Phase 1 — Product Vision](#phase-1--product-vision)
2. [Phase 2 — Experience Maps](#phase-2--experience-maps)
3. [Phase 3 — Information Architecture](#phase-3--information-architecture)
4. [Phase 4 — Page Blueprints](#phase-4--page-blueprints)
5. [Phase 5 — Section Blueprints](#phase-5--section-blueprints)
6. [Phase 6 — Interaction Contracts](#phase-6--interaction-contracts)
7. [Phase 7 — Frontend Architecture](#phase-7--frontend-architecture)
8. [Phase 8 — Implementation Roadmap](#phase-8--implementation-roadmap)
9. [Phase 9 — QA Checklist](#phase-9--qa-checklist)
10. [Implementation Files in Detail](#implementation-files-in-detail)
11. [Reading Paths by Role](#reading-paths-by-role)
12. [Search Keywords](#search-keywords)
13. [Build Status Roll-up](#build-status-roll-up)

---

## Phase 1 — Product Vision

[phase-1-product-vision.md](./phase-1-product-vision.md)

**Description.** Phase 1 is the constitution of Haulr. It states the business vision (a self-serve freight network), the product's purpose, six business goals and the value for each side of the marketplace. It defines 13 personas and the 14 permission roles they map to, 17 jobs to be done, 30 numbered business rules covering the load lifecycle, pricing, tendering, accessorials, payment and data, and 12 KPIs under a North Star metric. Its enterprise baseline (§18–22) adds non-functional, compliance, identity and security, privacy and operational requirements. It also records every assumption made in resolving the master prompt, so they can be challenged in one place.

- **Who needs it:** everyone; product and compliance own it.
- **When to reference it:** before any scope discussion; whenever a rule question comes up ("can a shipper see carrier pay?" → BR-05); when instrumenting analytics (KPI-).
- **What it contains:** Assumptions (§1), vision and goals (§2–5), competitive positioning (§6), personas and roles (§7), JTBD (§8), business rules (§9), KPIs and North Star (§10), governance (§11), constraints (§12), principles PP-01 … PP-09 (§13), implementation philosophy (§14), non-goals (§15), future scale (§16), glossary (§17), non-functional requirements (§18), compliance (§19), identity and security (§20), privacy (§21), operational readiness (§22).
- **How it flows onward:** personas and jobs → Phase 2 experiences; roles → Phase 3 permissions; rules → Phase 2 state machines, Phase 4 states, Phase 9 §15 checks; principles → Phase 6 global rules.

## Phase 2 — Experience Maps

[phase-2-experience-maps.md](./phase-2-experience-maps.md)

**Description.** Phase 2 maps 41 experiences before any page exists. Sixteen primary flows cover the load lifecycle from quote to settlement, both onboarding journeys, and bulk import, amendments and spend approval. Eight role dashboards describe each role's working session, and seventeen supporting flows cover access, teams, notifications, messaging, ratings, claims, help, payment methods, saved searches, estimates, settings, documents, SSO and provisioning, integrations, data export, support view-as and audit review. Each map records intent, trigger, entry points, journey, decision points, emotional state, failure paths, recovery paths, system behaviour, completion criteria and dependencies. The phase ends with the authoritative load and bid state machines.

- **Who needs it:** product, designers, QA (for flow tests), engineers implementing state transitions.
- **When to reference it:** designing a page's behaviour; writing E2E tests; implementing `lib/loads/transitions.ts`.
- **What it contains:** XF-01 … XF-16, XD-01 … XD-08, XS-01 … XS-17, load state machine (§5), amendment states (§5.1), bid state machine (§6), cross-experience rules (§7), traceability (§8).
- **How it flows onward:** entry points name Phase 3 pages; failure and recovery paths become Phase 4 error states; state machines drive Phase 5 SC-40.2 and Phase 9 QA-110 … QA-112.

## Phase 3 — Information Architecture

[phase-3-information-architecture.md](./phase-3-information-architecture.md)

**Description.** Phase 3 fixes the structure: 64 pages across public, access, workspace, internal and system groups, each with a route and the roles that can reach it. It defines role-based reachability without saying how navigation is presented, a permission matrix of 26 core and 12 enterprise capabilities, record-level access rules, and the content taxonomy and enumerations. It also sets labelling conventions (including reference number formats), cross-links, search and filter hierarchies with shared URL parameter names, SEO tiers, breadcrumb derivation, empty routes and fallbacks.

- **Who needs it:** engineers (routes, guards), product (scope), SEO, QA (permissions).
- **When to reference it:** creating a route; adding a filter; deciding 403 versus 404; writing sitemap and robots.
- **What it contains:** structural principles IA-P1 … IA-P5, hierarchy, sitemap PG-01 … PG-64, role destinations, capability matrix, taxonomy, labels, cross-links, search, filters, SEO, breadcrumbs, empty routes, fallbacks, expansion.
- **How it flows onward:** page IDs → Phases 4, 5, 7, 8; routes → Phase 7 §3 files; filters → Phase 5 SH-05 and IC-20; SEO → Phase 9 §12.

## Phase 4 — Page Blueprints

[phase-4-page-blueprints.md](./phase-4-page-blueprints.md)

**Description.** Phase 4 gives each of the 64 pages a functional blueprint: why it exists for the business and the user, the goals users arrive with (in their own words), the data and permissions it needs, what each device must allow, and exactly what happens when it is loading, empty, failing or successful. Ten shared state behaviours (SSB-1 … SSB-10) and a named state taxonomy (§2.1–2.8) apply everywhere unless a page overrides them. The blueprints deliberately stop short of saying what a page contains or how it looks.

- **Who needs it:** designers (the brief for each page's concept), engineers (acceptance criteria), QA.
- **When to reference it:** before starting any page; when reviewing a page for acceptance.
- **What it contains:** SSB rules, 64 blueprints grouped by area, page-to-experience traceability, master-prompt template mapping.
- **How it flows onward:** each blueprint links to its Phase 5 sections; states → Phase 9 §7.

## Phase 5 — Section Blueprints

[phase-5-section-blueprints.md](./phase-5-section-blueprints.md)

**Description.** Phase 5 breaks every page into sections that each do one job. Fifteen shared sections (timeline, live position, documents, conversation, record collection, account standing, attention queue, metrics, scorecard, rating, audit, guidance, step progression, money breakdown, assignment) are specified once and reused by reference. 215 page sections specify the rest. Every section defines its purpose, responsibilities, data requirements (naming hooks), interaction model, device needs, accessibility requirements, loading, error and empty states, reuse potential and technical notes.

- **Who needs it:** engineers (unit of work), designers (behaviour constraints), QA.
- **When to reference it:** implementing a section; deciding whether something is shared; writing component tests.
- **What it contains:** section rules, SH-01 … SH-15, SC-01.1 … SC-64.4, inventory.
- **How it flows onward:** sections cite Phase 6 contracts and Phase 7 hooks; shared sections → `components/common/`; statuses in Phase 8 §9.4.

## Phase 6 — Interaction Contracts

[phase-6-interaction-contracts.md](./phase-6-interaction-contracts.md)

**Description.** Phase 6 defines the behaviour of every interactive element Haulr uses, from text inputs and comboboxes to freight-specific contracts such as booking, bidding, stop events, camera capture and payment confirmation. Each contract specifies inputs, states, accessibility, keyboard support, ARIA, interaction patterns, validation, loading and error behaviour, content rules, do and don't, and dependencies. Seven global rules cover focus visibility, target size, colour independence, reduced motion, explained disabling, duplicate prevention and server-side truth.

- **Who needs it:** engineers building `components/ui/`, accessibility reviewers, QA.
- **When to reference it:** building or reviewing any interactive element; writing component tests.
- **What it contains:** G-1 … G-7, IC-01 … IC-67, usage index.
- **How it flows onward:** contracts → Phase 7 §12 primitives; Phase 9 §1–2 checks.

## Phase 7 — Frontend Architecture

[phase-7-frontend-architecture.md](./phase-7-frontend-architecture.md)

**Description.** Phase 7 translates the specification into code organisation for this repository, reconciled with `.claude/CLAUDE.md`. It records fourteen architectural decisions (D-1 … D-14) where the plan extends a host convention, and gives the full folder and route tree for all 64 pages. It also defines layouts and guards, providers, feature folders under `lib/<feature>/`, 50 resource hook files mapped to the hooks named in Phase 5, API layering (contract, Server Actions, Route Handlers, hooks), real-time polling and offline strategy, library recommendations under the approval policy, naming, code splitting, performance budgets, security and lint enforcement.

- **Who needs it:** engineers; tech leads for approvals.
- **When to reference it:** creating any file; choosing a transport; adding a dependency.
- **What it contains:** §1 decisions, §2 folders, §3 routes, §4 layouts, §5 providers, §6 feature folders, §7 state, §8 hooks, §9 utilities, §10 constants and enums, §11 API, §12 components, §13 real-time and offline, §14 assets, §15 libraries, §16 naming, §17 splitting, §18 performance, §19 security, §20 enforcement, §21 observability, §22 flags and configuration, §23 caching, §24 tenancy, §25 internationalisation, §26 concurrency, §27 analytics catalogue, §28 error taxonomy.
- **How it flows onward:** sprint tasks in Phase 8; readiness checks in Phase 9 §10–11; setup in SETUP-CHECKLIST.

## Phase 8 — Implementation Roadmap

[phase-8-implementation-roadmap.md](./phase-8-implementation-roadmap.md)

**Description.** Phase 8 sequences the build into eight development phases and eight dated two-week sprints, prioritised by the North Star, with five milestones and explicit exit criteria. It lists backend, library and design-approval dependencies with fallbacks, seventeen risks with mitigations, technical debt controls and a layered testing strategy. It is also the only place build status lives: every flow, page, section and contract carries exactly one status from the fixed vocabulary.

- **Who needs it:** everyone planning or reporting progress.
- **When to reference it:** sprint planning; standups; deciding a deferral; release readiness.
- **What it contains:** phases, priority, sprints S1 … S8, milestones M1 … M5, dependencies, risks R-01 … R-17, debt prevention, testing, build status, deferred register, deployment readiness, Definition of Ready and Done, roles (RACI), estimation and capacity, release management, go/no-go and hypercare.
- **How it flows onward:** Verified status requires Phase 9 checks.

## Phase 9 — QA Checklist

[phase-9-qa-checklist.md](./phase-9-qa-checklist.md)

**Description.** Phase 9 is the functional quality bar. 267 checks across sixteen categories cite their source in earlier phases, name a verification method and state whether failure blocks a feature from becoming Verified. Visual quality is explicitly out of scope and is judged per page with the owner.

- **Who needs it:** QA, engineers before merge, the launch decision.
- **When to reference it:** before marking anything Verified; in CI design; at launch.
- **What it contains:** QA-001 … QA-267, sign-off rules.
- **How it flows onward:** results update Phase 8 §9.

---

## Implementation Files in Detail

Phases 7–9 are the implementation files: architecture, plan and proof.

| Need | Phase 7 | Phase 8 | Phase 9 |
| --- | --- | --- | --- |
| Where does this file go? | §2, §3, §12 | — | QA-149 |
| Which hook serves this section? | §8 | — | QA-152 |
| Can I add this library? | §15 | Dependencies (§5) | QA-163 |
| How do I call the backend? | §11 | R-01 fallback | QA-151, QA-153 |
| How is live data refreshed? | §13 | R-03 | QA-083, QA-103 |
| What must be fast? | §18 | — | §6 |
| What's in this sprint? | — | §3 | — |
| Is it done? | — | §9, §11 | §17 sign-off |

The [IMPLEMENTATION_PROMPT](./IMPLEMENTATION_PROMPT.md) packages all three, plus the behavioural phases, into one instruction set.

---

## Reading Paths by Role

| Role | Path |
| --- | --- |
| **Product manager** | README → Phase 1 → Phase 2 → Phase 3 §3–5 → Phase 8 §2–4 → Phase 9 §15 |
| **Product designer** | START_HERE → Phase 1 §7, §13 → Phase 2 (flows for your sprint) → Phase 4 (your pages) → Phase 5 (their sections) → Phase 6 → IMPLEMENTATION_PROMPT › Visual Design Hand-off |
| **Frontend engineer (new)** | START_HERE → SETUP-CHECKLIST → Phase 1 §1, §9 → Phase 3 §3, §5 → Phase 7 → Phase 6 §1 → IMPLEMENTATION_PROMPT |
| **Frontend engineer (feature)** | Phase 8 §3 (your sprint) → Phase 4 page → Phase 5 sections → Phase 6 contracts → Phase 7 §8 hooks → Phase 9 relevant checks |
| **Backend engineer** | Phase 1 §9 → Phase 2 §5–6 → Phase 3 §5.2, §6 → Phase 7 §11 → Phase 8 §5 |
| **QA engineer** | Phase 2 (failure paths) → Phase 4 states → Phase 6 → Phase 9 |
| **Accessibility reviewer** | Phase 1 PP-08 → Phase 6 §1 and all contracts → Phase 9 §1–2 |
| **Compliance / legal** | Phase 1 §9, §11, §12 → Phase 3 §5 → Phase 9 §15 |

---

## Search Keywords

| Phase | Keywords |
| --- | --- |
| 1 | vision, persona, shipper, carrier, driver, consignee, role, JTBD, business rule, BR-, quote validity, tender waterfall, detention, TONU, POD, quick pay, KPI, North Star, assumption, non-goal |
| 2 | journey, flow, dashboard, failure path, recovery, state machine, transition, bid, counter-offer, dispatch, check call, exception, onboarding, vetting |
| 3 | sitemap, route, route group, permission, capability, taxonomy, label, reference number, cross-link, search, filter, URL parameter, SEO, sitemap.ts, robots, breadcrumb, fallback, 404, 403 |
| 4 | page, purpose, primary tasks, required data, device needs, loading state, empty state, error state, success state, SSB |
| 5 | section, shared section, SH-, SC-, responsibilities, data requirements, interaction model, reuse |
| 6 | contract, IC-, keyboard, ARIA, focus, combobox, dialog, confirmation, upload, camera, signature, map, countdown, shortcut, live region |
| 7 | folder, app router, layout, provider, hook, Server Action, Route Handler, contract, enum, constants, polling, offline, IndexedDB, library, naming, bundle, CSP, ESLint |
| 8 | sprint, milestone, dependency, risk, testing, status, Scheduled, Verified, Deferred, deployment |
| 9 | QA, WCAG, accessibility, performance, LCP, INP, cross-browser, security, sign-off |

---

## Build Status Roll-up

A view over [Phase 8 §9](./phase-8-implementation-roadmap.md#9-per-feature-build-status) as of 2026-10-09. It summarises statuses and never substitutes for the phases: a feature missing here still exists if its phase defines it (Critical Rules › Scope Preservation).

| Artifact type | Total | Specified | Scheduled | In progress | Built | Verified | Deferred |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Flows (XF, XD, XS) | 41 | 0 | 40 | 1 | 0 | 0 | 0 |
| Pages | 64 | 0 | 61 | 3 | 0 | 0 | 0 |
| Sections | 230 | 0 | 224 | 6 | 0 | 0 | 0 |
| Interaction contracts | 67 | 0 | 63 | 4 | 0 | 0 | 0 |

**In progress items:** XS-01; PG-01, PG-10, PG-11; SC-01.1, SC-01.2, SC-01.4, SC-10.1, SC-10.2, SC-11.2; IC-01, IC-02, IC-03, IC-11. The starter supplied the sign-in page, register route and hook, session route and button primitive. PG-01 and the identity-first sign-in were built after 2026-09-30 ([Phase 8 §9.1](./phase-8-implementation-roadmap.md#91-build-status-vocabulary)). All need the remaining Haulr behaviour and Phase 9 verification.

**By sprint (pages, counted in the sprint where they start):** S1: 9 · S2: 7 · S3: 7 · S4: 12 · S5: 5 · S6: 10 · S7: 9 · S8: 5 — 64 in total.

---

Start: [START_HERE](./START_HERE.md) · Setup: [SETUP-CHECKLIST](./SETUP-CHECKLIST.md)
