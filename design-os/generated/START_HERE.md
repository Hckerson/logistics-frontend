# Start Here — Haulr Design OS

`Version 1.2.0` · `2026-10-09` · Next: [README](./README.md)

Welcome. This folder is the complete specification for **Haulr**, a road freight marketplace where shippers post loads, carriers bid on and book them, drivers run each trip and everyone gets paid. It tells you what the product does and how the code is organised. How each page looks is decided when that page is built, with the owner.

Read this page first (about 3 minutes). It shows you where everything is and how to begin.

---

## What's Inside

The design OS has nine phases. Each one builds on the one before it.

- [x] **Phase 1 — Product Vision:** who Haulr serves, its business rules and how success is measured
- [x] **Phase 2 — Experience Maps:** 43 journeys end to end, including how each fails and recovers
- [x] **Phase 3 — Information Architecture:** 66 pages, their routes, and who can reach each one
- [x] **Phase 4 — Page Blueprints:** what each page is for and how it behaves in every state
- [x] **Phase 5 — Section Blueprints:** 238 sections, one job each
- [x] **Phase 6 — Interaction Contracts:** 68 contracts defining how every interactive element behaves
- [x] **Phase 7 — Frontend Architecture:** folders, routes, hooks, libraries, reconciled with this repo
- [x] **Phase 8 — Implementation Roadmap:** 8 sprints over 16 weeks, plus build status for every feature
- [x] **Phase 9 — QA Checklist:** 270 checks a feature must pass before it counts as Verified

Plus six guides, including this one.

---

## Files

| File | What it's for |
| --- | --- |
| [START_HERE.md](./START_HERE.md) | This page: orientation and the quick path |
| [README.md](./README.md) | A 5-minute overview of the whole system |
| [DESIGN-OS-COMPLETE.md](./DESIGN-OS-COMPLETE.md) | Master index: every deliverable and how the phases connect |
| [ARTIFACT_INDEX.md](./ARTIFACT_INDEX.md) | Detailed index: who needs each phase, when and why |
| [SETUP-CHECKLIST.md](./SETUP-CHECKLIST.md) | Step-by-step environment and project setup |
| [IMPLEMENTATION_PROMPT.md](./IMPLEMENTATION_PROMPT.md) | Self-contained engineering prompt for building Haulr |
| [phase-1-product-vision.md](./phase-1-product-vision.md) | Vision, personas, business rules, KPIs, assumptions |
| [phase-2-experience-maps.md](./phase-2-experience-maps.md) | Journeys, failure paths, load and bid state machines |
| [phase-3-information-architecture.md](./phase-3-information-architecture.md) | Sitemap, routes, permissions, taxonomy, SEO |
| [phase-4-page-blueprints.md](./phase-4-page-blueprints.md) | 66 page blueprints |
| [phase-5-section-blueprints.md](./phase-5-section-blueprints.md) | 238 section blueprints |
| [phase-6-interaction-contracts.md](./phase-6-interaction-contracts.md) | 68 interaction contracts |
| [phase-7-frontend-architecture.md](./phase-7-frontend-architecture.md) | Code organisation and library decisions |
| [phase-8-implementation-roadmap.md](./phase-8-implementation-roadmap.md) | Sprints, milestones, risks, build status |
| [phase-9-qa-checklist.md](./phase-9-qa-checklist.md) | 270 QA items |

---

## The Quick Path: Read → Copy → Execute

### 1. Read (20 minutes)

Read these three, in this sequence:

1. [Phase 1 §1 Assumptions](./phase-1-product-vision.md#1-assumptions) — what was decided for you and what was assumed. Challenge anything wrong here, before any code exists.
2. [Phase 3 §3 Sitemap](./phase-3-information-architecture.md#3-sitemap) — every page and route.
3. [Phase 8 §3 Sprint Breakdown](./phase-8-implementation-roadmap.md#3-sprint-breakdown) — what gets built when.

### 2. Copy

Open [IMPLEMENTATION_PROMPT.md](./IMPLEMENTATION_PROMPT.md) and copy its whole contents.

### 3. Execute

Paste it into a new Claude Code session at the repository root, then name the sprint or page to build, for example:

> Build Sprint 1 from the implementation prompt, starting with PG-11 Register.

The prompt tells the session to produce a visual concept for each page and get it approved before coding. That step is deliberate; don't skip it.

---

## Next Session Instructions

When you come back to this work:

1. Open [Phase 8 §9 Per-Feature Build Status](./phase-8-implementation-roadmap.md#9-per-feature-build-status) to see where things stand.
2. Copy [IMPLEMENTATION_PROMPT.md](./IMPLEMENTATION_PROMPT.md) into a fresh session.
3. Name the next **Scheduled** item.
4. When the feature merges, update its status in Phase 8 §9 in the same pull request.

---

## Quick Reference

| I want to… | Go to… |
| --- | --- |
| Understand the business | [Phase 1](./phase-1-product-vision.md) |
| See who the users are | [Phase 1 §7 Personas](./phase-1-product-vision.md#7-personas) |
| Check a business rule (BR-) | [Phase 1 §9](./phase-1-product-vision.md#9-business-rules) |
| Follow a user journey (XF-, XD-, XS-) | [Phase 2](./phase-2-experience-maps.md) |
| Know which load transitions are legal | [Phase 2 §5](./phase-2-experience-maps.md#5-load-state-machine) |
| Find a page's route | [Phase 3 §3](./phase-3-information-architecture.md#3-sitemap) |
| Check who may do what | [Phase 3 §5](./phase-3-information-architecture.md#5-permissions) |
| Know what a page must do (PG-) | [Phase 4](./phase-4-page-blueprints.md) |
| Know what a section must do (SC-, SH-) | [Phase 5](./phase-5-section-blueprints.md) |
| Know how a control behaves (IC-) | [Phase 6](./phase-6-interaction-contracts.md) |
| Find where code goes | [Phase 7 §2](./phase-7-frontend-architecture.md#2-folder-structure) |
| Find which hook to use | [Phase 7 §8](./phase-7-frontend-architecture.md#8-hooks) |
| See which libraries are approved | [Phase 7 §15](./phase-7-frontend-architecture.md#15-shared-libraries) |
| See what's in this sprint | [Phase 8 §3](./phase-8-implementation-roadmap.md#3-sprint-breakdown) |
| Update a feature's status | [Phase 8 §9](./phase-8-implementation-roadmap.md#9-per-feature-build-status) |
| Verify a feature | [Phase 9](./phase-9-qa-checklist.md) |
| Set up my machine | [SETUP-CHECKLIST](./SETUP-CHECKLIST.md) |
| Find everything | [DESIGN-OS-COMPLETE](./DESIGN-OS-COMPLETE.md) |

---

## Three Things to Know Before You Start

1. **This spec never decides how anything looks.** You won't find colours, layouts or component lists here. Each page's look is proposed, approved and built one page at a time.
2. **The repo's own rules win.** `.claude/CLAUDE.md` governs code conventions. Phase 7 was reconciled against it, and any extension is recorded as a decision (D-1 … D-14) that you can challenge.
3. **Nothing gets deleted for being unbuilt.** If a feature isn't done, its status changes in Phase 8. It is never removed from the spec.

---

## Links

All links in this design OS are relative, so they work in your editor, on GitHub and in any markdown viewer. The files have not been published online.

---

Next: [README](./README.md)
