# Haulr Design OS — Complete

`Version 1.1.0` · `2026-09-30` · Status: **Complete, ready for engineering handoff** · Start: [START_HERE](./START_HERE.md) · Overview: [README](./README.md)

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

- **Why and for whom:** vision, 13 personas, 30 business rules, KPIs and a North Star (Phase 1).
- **What people do:** 41 journeys with their failures and recoveries, plus the load and bid state machines (Phase 2).
- **Where things live:** 64 pages with routes, access rules and SEO tiers (Phase 3).
- **What each page and section must do:** 64 page blueprints and 230 section blueprints (Phases 4–5).
- **How interaction behaves:** 67 interaction contracts at WCAG 2.2 AA (Phase 6).
- **How the code is organised:** architecture reconciled with this repo's `.claude/CLAUDE.md` (Phase 7).
- **How and when it gets built:** 16 weeks, 8 sprints, status for every feature (Phase 8).
- **How it's proven:** 266 QA checks (Phase 9).
- **How to get going:** six guides, including a self-contained implementation prompt (Phase 10).

It deliberately contains **no visual design**. Each page's look is decided when it is built, with the owner.

---

## 2. Deliverables — Phases 1–9

| # | File | Description |
| --- | --- | --- |
| 1 | [phase-1-product-vision.md](./phase-1-product-vision.md) | The single source of truth for Haulr's purpose, personas, jobs, business rules, metrics, governance, constraints, principles and assumptions. Every other phase cites its IDs. |
| 2 | [phase-2-experience-maps.md](./phase-2-experience-maps.md) | 41 end-to-end journeys (primary flows, role dashboards, supporting flows), each with intent, decision points, failure and recovery paths, and system behaviour. Defines the legal load and bid state transitions. |
| 3 | [phase-3-information-architecture.md](./phase-3-information-architecture.md) | Which 64 pages exist, their routes and route groups, who can reach each, the capability matrix, content taxonomy, labelling, search, filtering, SEO, breadcrumbs, empty routes and fallbacks. |
| 4 | [phase-4-page-blueprints.md](./phase-4-page-blueprints.md) | For every page: purpose, business and user objectives, primary tasks, required data, permissions, device needs, loading, empty, error and success states, dependencies and implementation notes. |
| 5 | [phase-5-section-blueprints.md](./phase-5-section-blueprints.md) | Every page broken into single-job sections: 15 shared sections reused across pages and 215 page sections, each with data, interaction model, accessibility and states. |
| 6 | [phase-6-interaction-contracts.md](./phase-6-interaction-contracts.md) | Behaviour of every interactive element: inputs, states, keyboard, ARIA, validation, loading, errors, content rules, do and don't. Seven global rules bind them all. |
| 7 | [phase-7-frontend-architecture.md](./phase-7-frontend-architecture.md) | Folder structure, route files, layouts, providers, hooks, utilities, constants, API organisation, real-time and offline strategy, libraries, naming, code splitting, performance, security and lint enforcement. |
| 8 | [phase-8-implementation-roadmap.md](./phase-8-implementation-roadmap.md) | Development phases, priority, sprint plan, milestones, dependencies, risks, technical debt prevention, testing strategy, deployment readiness and the build status of every feature. |
| 9 | [phase-9-qa-checklist.md](./phase-9-qa-checklist.md) | 266 functional QA checks across accessibility, WCAG, consistency, responsiveness, scalability, performance, state coverage, errors, loading, readiness, developer experience, SEO, maintainability, browsers, business rules and security. |

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
| Business rules | 30 | Phase 1 §9 |
| Non-functional, compliance, security, privacy and operations requirements | 45 | Phase 1 §18–22 |
| KPIs | 12 + North Star | Phase 1 §10 |
| Product principles | 9 | Phase 1 §13 |
| Primary flows | 16 | Phase 2 §2 |
| Role dashboards | 8 | Phase 2 §3 |
| Supporting flows | 17 | Phase 2 §4 |
| Load state transitions | 27 (+ 7 amendment transitions) | Phase 2 §5, §5.1 |
| Pages | 64 (+1 redirect route) | Phase 3 §3 |
| Capabilities in matrix | 26 core + 12 enterprise | Phase 3 §5.1, §5.1a |
| Shared sections | 15 | Phase 5 §2 |
| Page sections | 215 | Phase 5 §13 |
| Interaction contracts | 67 | Phase 6 |
| Architectural decisions | 13 (D-1 … D-13) | Phase 7 §1 |
| Hook files | 50 (5 existing) | Phase 7 §8 |
| Sprints / weeks | 8 / 16 | Phase 8 |
| Milestones | 5 | Phase 8 §4 |
| Risks | 17 | Phase 8 §6 |
| QA items | 266 | Phase 9 |

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
| `M1` … `M4` | Milestone | Phase 8 §4 |
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
| Phase 7 architecture | Host `.claude/CLAUDE.md` | Decisions D-1 … D-13 reconcile extensions |
| Phase 8 status | Phases 2–6 IDs | Every flow, page, section and contract has one status (Phase 8 §9) |
| Phase 9 checks | Phases 1–8 | Each QA item cites its source |
| IMPLEMENTATION_PROMPT | Phases 1–9 | Synthesises all into build steps |

Integrity checks run at generation: 64 pages defined in Phases 3, 4, 5 and 8; 230 sections defined in Phase 5 and statused in Phase 8; 67 contracts defined in Phase 6 and statused in Phase 8; 41 experiences defined in Phase 2 and statused in Phase 8.

---

## 8. What's Included

- Product strategy, personas, rules and metrics.
- Complete journeys with failure handling.
- Complete page inventory, routes and permissions.
- Functional blueprints for every page and section, including every state.
- Behavioural contracts for every interactive element, with accessibility.
- Code organisation reconciled with this repository.
- Library recommendations under the reuse-first, confirm-before-install policy.
- A dated 16-week plan, risks and dependencies.
- A 266-item QA checklist and sign-off rules.
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

| Item | Where | Needed by |
| --- | --- | --- |
| Confirm D-2 (Route Handlers for polled authenticated reads) | Phase 7 §1 | S1 |
| Approve forms and testing libraries | Phase 7 §15 | S1 |
| Confirm assumptions A1–A8 | Phase 1 §1 | S1 |
| Confirm D-3 (help and legal content in `lib/data/`) | Phase 7 §1 | S2 |
| Choose payments processor (with backend) | Phase 8 R-06 | S4 |
| Approve map library | Phase 7 §15 | S5 |
| Approve processor SDK | Phase 7 §15 | S6 |
| Approve chart library | Phase 7 §15 | S7 |
| Decide on a headless accessible-primitives library (optional) | Phase 7 §15 | S1 |
| Approve observability and error-reporting libraries (D-10) | Phase 7 §15 | S1 |
| Confirm field and collection limits | Phase 7 §10 | S1 |
| Confirm assumptions A9 (enterprise launch segment) and A10 (hosting, SOC 2 target) | Phase 1 §1 | S1 |
| Choose a capacity option: add engineers, pre-agreed deferrals or one extra sprint | Phase 8 §13 | M2 |
| Provision identity-provider test tenants (Okta, Entra ID, Google Workspace, OneLogin) | Phase 8 §5 | S2 |
| Book the penetration test vendor | Phase 8 §5 | S5 |
| Approve product analytics vendor after privacy review | Phase 7 §15 | S7 |

---

## 11. Version and Date

| Field | Value |
| --- | --- |
| Version | 1.1.0 (enterprise hardening; 1.0.0 was the initial generation) |
| Generated | 2026-09-30 |
| Seed prompt | `docs/MASTER_PROMPT_COMPLETE.md` |
| Output directory | `design-os/generated/` |
| Generation mode | 1.1.0 is a merge over 1.0.0: nothing removed; thin fields raised to the Phase 4 §2 taxonomy; enterprise scope added |
| Host conventions | `.claude/CLAUDE.md` (Next.js 16 App Router starter) |

### Version history

| Version | Change |
| --- | --- |
| 1.0.0 | Initial generation: 55 pages, 194 sections, 60 contracts, 33 experiences, 216 QA items |
| 1.1.0 | Enterprise hardening. Added a named state taxonomy (Phase 4 §2.1–2.8). About 2,300 thin field values across Phases 4–6 were rewritten against it. Added NFRs, compliance, identity and security, privacy and operations requirements (Phase 1 §18–22) and BR-23 … BR-30. Added nine enterprise pages, eight flows, 36 sections and seven contracts, and the amendment state machine. Phase 7 gained D-9 … D-13 and §21–28. Phase 8 gained sizing, capacity, Definition of Ready/Done, RACI, release, go/no-go and hypercare. Phase 9 gained 50 QA items. Nothing was removed. |

---

Start: [START_HERE](./START_HERE.md) · Detail: [ARTIFACT_INDEX](./ARTIFACT_INDEX.md)
