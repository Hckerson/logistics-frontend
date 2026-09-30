# Haulr Design OS

`Version 1.1.0` · `2026-09-30` · Start: [START_HERE](./START_HERE.md) · Index: [DESIGN-OS-COMPLETE](./DESIGN-OS-COMPLETE.md)

## In 30 Seconds

This is the complete, implementation-ready specification for **Haulr**, a US road freight marketplace. Shippers get instant quotes and post loads. Vetted carriers search, bid on and book them. Drivers run each stop from their phone. Everyone follows the load live, and payment flows automatically once delivery is proven.

The design OS defines **what the product does**: its users, journeys, pages, sections, interactive behaviour, data, permissions, architecture, plan and quality bar. It deliberately leaves **how it looks** to the build. Each page's visual design is proposed and approved with the owner when that page is built.

## Quick Start

- **New here?** Read [START_HERE](./START_HERE.md), then [Phase 1 §1 Assumptions](./phase-1-product-vision.md#1-assumptions).
- **Building?** Follow [SETUP-CHECKLIST](./SETUP-CHECKLIST.md), then run [IMPLEMENTATION_PROMPT](./IMPLEMENTATION_PROMPT.md) sprint by sprint.
- **Checking progress?** [Phase 8 §9](./phase-8-implementation-roadmap.md#9-per-feature-build-status) is the only place status lives.

---

## Files

### Phases 1–9

| File | Purpose |
| --- | --- |
| [phase-1-product-vision.md](./phase-1-product-vision.md) | Vision, goals, 13 personas, permission roles, jobs to be done, 30 business rules, KPIs and North Star, governance, constraints, principles, non-goals, assumptions, and the enterprise baseline: non-functional requirements, compliance, identity and security, privacy, operational readiness |
| [phase-2-experience-maps.md](./phase-2-experience-maps.md) | 16 primary flows, 8 role dashboards and 17 supporting flows, each with failure and recovery paths; load, amendment and bid state machines |
| [phase-3-information-architecture.md](./phase-3-information-architecture.md) | Sitemap of 64 pages with routes and route groups, role reachability, capability matrix, taxonomy, labelling, search, filtering, SEO, breadcrumbs, fallbacks |
| [phase-4-page-blueprints.md](./phase-4-page-blueprints.md) | The shared state taxonomy (loading, error, empty, success, device context, freshness, audit) and, for each of the 64 pages, purpose, objectives, primary tasks, data, permissions, device needs, every state and measurable acceptance criteria |
| [phase-5-section-blueprints.md](./phase-5-section-blueprints.md) | 15 shared and 215 page sections, each with one job, its data, interaction model, accessibility and states |
| [phase-6-interaction-contracts.md](./phase-6-interaction-contracts.md) | 67 behavioural contracts: states, keyboard, ARIA, validation, loading, errors, content rules |
| [phase-7-frontend-architecture.md](./phase-7-frontend-architecture.md) | Folder and route structure, layouts, providers, hooks, API organisation, real-time and offline, libraries, naming, performance, security, enforcement, observability, flags, caching, tenancy, i18n, concurrency, analytics catalogue, error taxonomy |
| [phase-8-implementation-roadmap.md](./phase-8-implementation-roadmap.md) | 8 sprints, 5 milestones, dependencies, 17 risks, testing strategy, per-feature build status with sizing, deployment readiness, Definition of Ready and Done, RACI, capacity, release management, go/no-go and hypercare |
| [phase-9-qa-checklist.md](./phase-9-qa-checklist.md) | 266 QA items across 16 categories, with sign-off rules |

### Guides

| File | Purpose |
| --- | --- |
| [START_HERE.md](./START_HERE.md) | Orientation and the Read → Copy → Execute path |
| [README.md](./README.md) | This overview |
| [DESIGN-OS-COMPLETE.md](./DESIGN-OS-COMPLETE.md) | Master index of every deliverable and cross-reference |
| [ARTIFACT_INDEX.md](./ARTIFACT_INDEX.md) | Deep index by role and use case, reading paths, build status roll-up |
| [SETUP-CHECKLIST.md](./SETUP-CHECKLIST.md) | Environment, dependencies, testing and workflow setup |
| [IMPLEMENTATION_PROMPT.md](./IMPLEMENTATION_PROMPT.md) | The self-contained prompt that turns this spec into code |

---

## How to Use It, by Role

### Product

- Own [Phase 1](./phase-1-product-vision.md) and [Phase 2](./phase-2-experience-maps.md). Change business rules (BR-) only with compliance sign-off (Phase 1 §11).
- Use [Phase 4](./phase-4-page-blueprints.md) to accept or reject a page: it must meet its purpose, primary tasks and states.
- Keep [Phase 8 §9](./phase-8-implementation-roadmap.md#9-per-feature-build-status) honest. Defer, never delete.

### Designers

- Start each page from its [Phase 4](./phase-4-page-blueprints.md) blueprint and [Phase 5](./phase-5-section-blueprints.md) sections. They say what the page must do, never how it looks. That part is yours, decided with the owner.
- Respect the behaviour in [Phase 6](./phase-6-interaction-contracts.md): keyboard, focus, announcements, confirmations. Visual treatment is open; behaviour is fixed.
- Produce each page's concept one sprint ahead (Phase 8 R-10).

### Engineers

- Set up with [SETUP-CHECKLIST](./SETUP-CHECKLIST.md).
- Put code where [Phase 7](./phase-7-frontend-architecture.md) says; it is reconciled with `.claude/CLAUDE.md`.
- Build sprint by sprint with [IMPLEMENTATION_PROMPT](./IMPLEMENTATION_PROMPT.md). Cite IDs (PG-, SC-, IC-) in PR titles.

### QA

- Verify against [Phase 9](./phase-9-qa-checklist.md). Blocking items stop a feature from reaching **Verified**.
- Test flows from [Phase 2](./phase-2-experience-maps.md), including every failure path, not just the happy path.

---

## Key Statistics

| Measure | Count |
| --- | --- |
| Phases | 9 (+ 6 guides = 15 files) |
| Personas | 13 (3 primary, 5 secondary, 5 internal) |
| Permission roles | 14 |
| Business rules | 30 |
| Experiences | 41 (16 primary flows, 8 dashboards, 17 supporting flows) |
| Pages | 64 |
| Sections | 230 (15 shared, 215 page) |
| Interaction contracts | 67 |
| Timeline | 16 weeks, 8 sprints, 5 milestones |
| QA items | 266 |
| Non-functional, compliance and security requirements | 45 (NFR-, CMP-, SEC-, NFR-PRIV-, OPS-) |

---

## Getting Started in 5 Minutes

1. **Minute 1:** Skim [Phase 1 §2–5](./phase-1-product-vision.md#2-business-vision) for the vision and value proposition.
2. **Minute 2:** Check [Phase 1 §1 Assumptions](./phase-1-product-vision.md#1-assumptions). Flag anything wrong.
3. **Minute 3:** Scan the [Phase 3 sitemap](./phase-3-information-architecture.md#3-sitemap).
4. **Minute 4:** Read one full journey: [XF-02 Find and book a load](./phase-2-experience-maps.md#xf-02--find-and-book-a-load).
5. **Minute 5:** Open [Phase 8 §3](./phase-8-implementation-roadmap.md#3-sprint-breakdown) and find your sprint.

---

## Design OS Philosophy

- **No ambiguity.** Every page, section and interactive element has a written purpose, data needs, permissions and states. If an engineer has to guess, the spec is wrong. Fix the spec.
- **No reinvention.** Shared sections (SH-) and contracts (IC-) are defined once and reused. The host repo's conventions are followed, not replaced.
- **Production-ready.** Accessibility (WCAG 2.2 AA), performance budgets, security and failure handling are specified up front, not added later.
- **Traceable.** IDs connect every decision: a QA item cites a contract, which serves a section, which belongs to a page, which serves a journey, which serves a persona's job.
- **Behaviour, not appearance.** The spec defines what the product does. How each page looks is designed per page, with the owner, at build time.
- **Scope is preserved.** Unbuilt is a status, not a reason to delete.

---

## Assumptions Worth Knowing

The maintainer chose **freight marketplace** and the name **Haulr**. Everything else (US-only launch, Haulr as broker of record, full truckload first, backend still to be built, 16 weeks) is an assumption listed in [Phase 1 §1](./phase-1-product-vision.md#1-assumptions). Library choices marked **Proposed** in [Phase 7 §15](./phase-7-frontend-architecture.md#15-shared-libraries) are not installed and need approval.

---

Start: [START_HERE](./START_HERE.md) · Next: [DESIGN-OS-COMPLETE](./DESIGN-OS-COMPLETE.md)
