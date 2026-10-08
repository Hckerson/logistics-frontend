# Setup Checklist — Haulr

`Version 1.1.0` · `2026-09-30` · Start: [START_HERE](./START_HERE.md) · Architecture: [Phase 7](./phase-7-frontend-architecture.md) · Build: [IMPLEMENTATION_PROMPT](./IMPLEMENTATION_PROMPT.md)

Step by step, from a fresh machine to a repository ready for Sprint 1. Tick each box as you go. Steps marked **Approval** need the maintainer's go-ahead before you run them (Library Selection Policy, [Phase 7 §15](./phase-7-frontend-architecture.md#15-shared-libraries)).

## Table of Contents

1. [Pre-implementation Prerequisites](#1-pre-implementation-prerequisites)
2. [Environment Setup](#2-environment-setup)
3. [Project Initialization](#3-project-initialization)
4. [Backend Pairing](#4-backend-pairing)
5. [Dependencies](#5-dependencies)
6. [Folder Structure Creation](#6-folder-structure-creation)
7. [Testing Setup](#7-testing-setup)
8. [Developer Workflow Setup](#8-developer-workflow-setup)
9. [Verification Checklist](#9-verification-checklist)

---

## 1. Pre-implementation Prerequisites

### 1.1 Read these phases first

- [ ] [Phase 1 — Product Vision](./phase-1-product-vision.md), especially §1 Assumptions, §7 Personas and roles, §9 Business rules.
- [ ] [Phase 3 — Information Architecture](./phase-3-information-architecture.md), especially §3 Sitemap and §5 Permissions.
- [ ] [Phase 7 — Frontend Architecture](./phase-7-frontend-architecture.md), all of it.
- [ ] The host rules: `.claude/CLAUDE.md`. They win over anything in this design OS.

### 1.2 Understand these concepts

- [ ] **Personas and roles.** Twelve personas map to twelve role keys (`shipper.member`, `carrier.driver`, `internal.ops`, …). Every page and capability is gated by these ([Phase 1 §7.4](./phase-1-product-vision.md#74-permission-roles)).
- [ ] **The load lifecycle.** Only the transitions in [Phase 2 §5](./phase-2-experience-maps.md#5-load-state-machine) are legal. The frontend never offers anything else.
- [ ] **Navigation as reachability.** Phase 3 defines which destinations each role can reach, not how navigation is presented ([Phase 3 §4](./phase-3-information-architecture.md#4-role-based-navigation)).
- [ ] **Interaction contracts.** Every interactive element follows a Phase 6 contract (IC-), and seven global rules (G-1 … G-7) apply to all of them ([Phase 6 §1](./phase-6-interaction-contracts.md#1-contract-format-and-global-rules)).
- [ ] **Shared sections.** SH-01 … SH-15 are built once in `components/common/` and reused ([Phase 5 §2](./phase-5-section-blueprints.md#2-shared-sections)).
- [ ] **Status lives in Phase 8.** Update [Phase 8 §9](./phase-8-implementation-roadmap.md#9-per-feature-build-status) in the same PR as the work.
- [ ] **No visual prescription.** This spec never says how anything looks. Each page gets a visual concept approved by the owner before it is coded.

### 1.3 Decisions to close before Sprint 1

- [ ] Maintainer confirms assumptions A1–A8 ([Phase 1 §1](./phase-1-product-vision.md#1-assumptions)).
- [ ] Maintainer confirms or rejects D-2 (Route Handlers for polled authenticated reads) ([Phase 7 §1](./phase-7-frontend-architecture.md#1-architectural-decisions)).
- [ ] Maintainer approves or declines the Sprint 1 libraries (§5.2 below).

---

## 2. Environment Setup

### 2.1 Runtime

- [ ] Install **Node.js 20.9 or later** (Next.js 16 minimum). Using the current LTS is recommended.
  ```bash
  node --version
  ```
- [ ] Enable **pnpm** through Corepack (the repo uses `pnpm-lock.yaml`):
  ```bash
  corepack enable
  pnpm --version
  ```
- [ ] Install **Git** and configure your name and email.

### 2.2 Editor

- [ ] VS Code (or equivalent) with:
  - [ ] ESLint extension (flat config in `eslint.config.ts`).
  - [ ] Prettier extension (with `prettier-plugin-tailwindcss`, already a dev dependency).
  - [ ] Tailwind CSS IntelliSense.
  - [ ] Format on save enabled for TS, TSX, CSS, MD.
- [ ] Set the workspace TypeScript version: use the repo's `typescript` from `node_modules`.

### 2.3 Browsers and assistive technology for testing

- [ ] Chrome, Edge, Firefox, Safari (current and previous majors) — [Phase 1 §12](./phase-1-product-vision.md#12-platform-constraints).
- [ ] NVDA with Firefox (Windows) and VoiceOver with Safari (macOS and iOS) — [Phase 9 §1](./phase-9-qa-checklist.md#1-accessibility).
- [ ] An Android 10+ phone and an iOS 16+ phone for driver and carrier flows.

---

## 3. Project Initialization

This repository is already a Next.js 16 App Router project. **Do not run `create-next-app`.**

### 3.1 Clone and install

- [ ] Clone the frontend repository and the paired backend repository side by side:
  ```text
  logistics/
    frontend/   (this repo)
    backend/    (NestJS API)
  ```
- [ ] Install dependencies:
  ```bash
  pnpm install
  ```
  Note: `prepare` unsets `core.hooksPath`, so git hooks stay disabled (see §8).

### 3.2 Environment variables

- [ ] Copy the example file:
  ```bash
  cp .env.example .env
  ```
- [ ] Set the variables the code reads:

| Variable | Purpose | Where it comes from |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Backend base URL (defaults to `http://localhost:5100`) | Backend `.env` port |
| `JWT_PUBLIC_KEY` | RS256 public key for session verification in `proxy.ts` and the session route | Backend `pnpm keys:generate` output |
| `CONTRACT_SOURCE` | Location of the backend `openapi.json` for `pnpm contract` | Path to `../backend/openapi.json` |

- [ ] Later sprints add: telemetry DSNs (S1), map tile key (S5), payments processor publishable key (S6), analytics key (S7). Never commit keys.
- [ ] Every variable is declared in `lib/validations/env.ts` (D-9); the app refuses to start when one is missing or malformed.
- [ ] For SSO work (S2), get access to the staging identity-provider tenants (Okta developer, Entra ID test, Google Workspace, OneLogin) from the security engineer (Phase 8 §5).

### 3.3 TypeScript configuration

- [ ] Confirm `tsconfig.json` has `strict: true` and the `@/*` path alias (absolute imports are a host rule).
- [ ] Run:
  ```bash
  pnpm type-check
  ```

### 3.4 Next.js configuration

- [ ] In `next.config.ts`, plan for (added in the sprint that needs them):
  - [ ] `images.remotePatterns` for document and avatar storage (S2).
  - [ ] Security headers including CSP ([Phase 7 §19](./phase-7-frontend-architecture.md#19-security)) (S1).
  - [ ] `experimental.authInterrupts` if `forbidden()` is adopted for PG-55 (S1, risk R-08).

---

## 4. Backend Pairing

- [ ] In `../backend`, follow its README: `pnpm install`, `cp .env.example .env`, `pnpm keys:generate`, `pnpm exec prisma migrate dev`, `pnpm db:seed`, `pnpm start:dev`.
- [ ] Confirm the API responds at `http://localhost:5100/api/health` and Swagger at `/api/docs`.
- [ ] Generate the contract here:
  ```bash
  pnpm contract
  pnpm contract:check
  ```
- [ ] Sign in with the seeded admin (`admin@example.com` / `password123`) at `/auth/login` to confirm the session flow works end to end.
- [ ] Understand the gap: the backend currently ships `auth`, `users`, `stats` and `health` only. Haulr domain endpoints arrive sprint by sprint ([Phase 8 §5](./phase-8-implementation-roadmap.md#5-dependencies)). Until then, hooks read typed seed data from `lib/data/` behind the same signatures ([Phase 7 §11](./phase-7-frontend-architecture.md#11-api-organization)).

---

## 5. Dependencies

### 5.1 Already installed (reuse, do not replace)

- [ ] `next` 16, `react` 19, `typescript` 5, `tailwindcss` 4
- [ ] `@tanstack/react-query` (+ devtools) — server state
- [ ] `zod` — schemas
- [ ] `axios` — transport inside `lib/api-client.ts`
- [ ] `motion` — animation
- [ ] `@carbon/icons-react` — the single icon set
- [ ] `date-fns` — dates
- [ ] `nanoid` — IDs and idempotency keys
- [ ] `jose` — session verification
- [ ] `vitest`, `fast-check` — unit and property tests
- [ ] `ts-morph`, `@typescript-eslint/*` — codemods and lint rules

### 5.2 Proposed — **Approval** required before installing

Propose each with its reason, wait for approval, then install. Never hand-edit `package.json`.

| Sprint | Package(s) | Purpose | Command after approval |
| --- | --- | --- | --- |
| S1 | `react-hook-form`, `@hookform/resolvers` | Forms with Zod | `pnpm add react-hook-form @hookform/resolvers` |
| S1 | `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `jsdom` | Component tests | `pnpm add -D @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom` |
| S1 | `@playwright/test`, `@axe-core/playwright` | E2E and accessibility tests | `pnpm add -D @playwright/test @axe-core/playwright` then `pnpm exec playwright install` |
| S5 | `maplibre-gl`, `react-map-gl` | Maps (IC-30) | `pnpm add maplibre-gl react-map-gl` |
| S6 | Processor React SDK | Payment method entry (IC-42) | Decided with the processor |
| S7 | `recharts` | Charts (IC-45) | `pnpm add recharts` |
| S1 | `@vercel/otel` (or `@opentelemetry/sdk-node`), `@sentry/nextjs` | Tracing and error reporting (D-10) | `pnpm add @vercel/otel @sentry/nextjs` |
| S7 | Product analytics SDK (after privacy review) | Event catalogue (Phase 7 §27) | Decided with the vendor |
| S8 | `k6` (CLI, not a package dependency), OWASP ZAP (CI container) | Load and security testing (Phase 8 §8) | Installed in CI images, not in `package.json` |
| Optional | Headless accessible primitives | Combobox, dialog, menu | Only if proposed and approved |

- [ ] Record each approval in the PR that installs the package.

---

## 6. Folder Structure Creation

Create folders only when their first file lands (empty folders are not committed). Target structure: [Phase 7 §2](./phase-7-frontend-architecture.md#2-folder-structure) and [Phase 7 §3](./phase-7-frontend-architecture.md#3-route-structure).

### 6.1 Sprint 1 creations

- [ ] `app/(public)/layout.tsx`, `app/(workspace)/layout.tsx`, `app/(internal)/layout.tsx`
- [ ] `app/auth/layout.tsx`; pages under `app/auth/` for PG-11 … PG-15
- [ ] `app/not-found.tsx`, `app/global-error.tsx`, `app/forbidden.tsx`
- [ ] `app/(workspace)/dashboard/page.tsx` (role-resolving redirect)
- [ ] `lib/enums/` with `role-key.ts` and `load-status.ts`
- [ ] `lib/loads/constants.ts`, `lib/loads/transitions.ts` (+ `.test.ts`)
- [ ] `lib/data/` (seed data home)
- [ ] `components/providers/announcer-provider.tsx`, `components/providers/session-provider.tsx`
- [ ] `components/wrappers/section-boundary.tsx`
- [ ] `components/ui/` primitives for the Sprint 1 contracts (IC-01, IC-02, IC-03, IC-04, IC-07, IC-09, IC-12, IC-14, IC-41, IC-52, IC-59, IC-60), extending the existing `button.tsx` for IC-11

### 6.2 Constants updates

- [ ] `lib/constants.ts`: add `appRoutes`, extend `PROTECTED_ROUTE_PREFIXES` to all workspace prefixes, add `INTERNAL_ROUTE_PREFIXES` (D-7).
- [ ] `proxy.ts`: add the internal-role check for `INTERNAL_ROUTE_PREFIXES`.

### 6.3 Naming check

- [ ] Kebab-case files matching exports; one component per file; hooks as `use-<resource>.ts`; actions as `<verb>-<noun>.ts` ([Phase 7 §16](./phase-7-frontend-architecture.md#16-naming-conventions)).

---

## 7. Testing Setup

### 7.1 Unit and property (ready now)

- [ ] Run the existing suite:
  ```bash
  pnpm test
  ```
- [ ] Add `lib/loads/transitions.test.ts` covering every row of [Phase 2 §5](./phase-2-experience-maps.md#5-load-state-machine), plus a `fast-check` property that no illegal transition is ever offered.

### 7.2 Component tests (after approval)

- [ ] Configure Vitest with a `jsdom` environment for `*.test.tsx` in `vitest.config.mts`.
- [ ] Add a setup file registering `@testing-library/jest-dom` matchers.
- [ ] Add one reference test per contract type (for example IC-12 confirmation: focus moves to heading, Escape cancels, focus returns).

### 7.3 End-to-end and accessibility (after approval)

- [ ] `pnpm exec playwright init` style config at the repo root: projects for Chromium, Firefox, WebKit, and mobile emulation (Pixel, iPhone).
- [ ] `e2e/` folder for flow specs named after Phase 2 IDs (`xs-01-register-and-sign-in.spec.ts`).
- [ ] Add an axe check helper that fails on serious or critical violations ([Phase 9 §2](./phase-9-qa-checklist.md#2-wcag-22-aa-compliance)).
- [ ] Add a `test:e2e` script (proposed in the approving PR).

### 7.4 Performance

- [ ] Plan Lighthouse CI against preview deployments with the budgets in [Phase 7 §18](./phase-7-frontend-architecture.md#18-performance-strategy).

---

## 8. Developer Workflow Setup

### 8.1 Git hooks (disabled by design)

- [ ] Understand that `.husky/` exists but is not installed: `prepare` unsets `core.hooksPath` on every install.
- [ ] Run the gate by hand before pushing:
  ```bash
  pnpm type-check
  pnpm lint
  pnpm contract:check
  pnpm test
  ```
- [ ] To re-enable hooks: set `prepare` back to `husky` and run `pnpm install` (host instruction).

### 8.2 Linting and formatting

- [ ] `pnpm lint` passes. Custom rules live in `tools/eslint/rules/` ([Phase 7 §20](./phase-7-frontend-architecture.md#20-enforcement)).
- [ ] `pnpm format` runs Prettier with the Tailwind plugin.
- [ ] No `console.*` in committed code; no code comments where the `no-comments` rule applies.

### 8.3 Branching and pull requests

- [ ] Work on feature branches off `development`; PRs target `development`; releases merge to `main`.
- [ ] PR title cites the design OS ID: `feat(PG-27): lane step (SC-27.2)`.
- [ ] PR updates [Phase 8 §9](./phase-8-implementation-roadmap.md#9-per-feature-build-status) status.
- [ ] PR description links the page's approved visual concept.
- [ ] Deviations from Phases 1–7 are recorded as decisions in the affected phase before merge.

### 8.4 Codemods

- [ ] Know the existing codemod: `pnpm codemod:extract-hooks` moves stray transport calls into hooks (dry run by default; `--write` to apply).

---

## 9. Verification Checklist

Everything installed and ready when all of these are true:

- [ ] `node --version` ≥ 20.9 and `pnpm --version` works.
- [ ] `pnpm install` completes without errors.
- [ ] `.env` has `NEXT_PUBLIC_API_URL`, `JWT_PUBLIC_KEY`, `CONTRACT_SOURCE`.
- [ ] Backend runs; `/api/health` responds.
- [ ] `pnpm contract:check` passes.
- [ ] `pnpm type-check` passes.
- [ ] `pnpm lint` passes.
- [ ] `pnpm test` passes.
- [ ] `pnpm dev` serves `http://localhost:3100`.
- [ ] Signing in at `/auth/login` with the seeded admin sets the session cookie, and a protected prefix redirects when signed out.
- [ ] Sprint 1 library approvals are recorded (approved or declined).
- [ ] D-2 and assumptions A1–A8 are confirmed or amended.
- [ ] You can find, for any page ID, its blueprint (Phase 4), sections (Phase 5), route file (Phase 7 §3) and status (Phase 8 §9).
- [ ] You have read the Visual Design Hand-off in [IMPLEMENTATION_PROMPT](./IMPLEMENTATION_PROMPT.md#visual-design-hand-off).

When every box is ticked, start Sprint 1 with the [IMPLEMENTATION_PROMPT](./IMPLEMENTATION_PROMPT.md).

---

Start: [START_HERE](./START_HERE.md) · Next: [IMPLEMENTATION_PROMPT](./IMPLEMENTATION_PROMPT.md)
