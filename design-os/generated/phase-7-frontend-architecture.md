# Phase 7 — Frontend Architecture

`Haulr Design OS` · `Version 1.1.0` · `2026-09-30` · Previous: [Phase 6 — Interaction Contracts](./phase-6-interaction-contracts.md) · Next: [Phase 8 — Implementation Roadmap](./phase-8-implementation-roadmap.md)

How the code is organised to deliver Phases 1–6. This phase names files and folders because its job is code organisation. It says nothing about how anything looks; styling organisation follows the host repo's conventions (`styles/tokens.css`, `styles/globals.css`) and is not specified here.

**The host `.claude/CLAUDE.md` wins.** Every decision below was reconciled against it. Where this phase extends a host convention, the extension and its reason are recorded as a decision (`D-n`).

## Table of Contents

1. [Architectural Decisions](#1-architectural-decisions)
2. [Folder Structure](#2-folder-structure)
3. [Route Structure](#3-route-structure)
4. [Layouts](#4-layouts)
5. [Providers](#5-providers)
6. [Feature Folders](#6-feature-folders)
7. [Contexts and Stores](#7-contexts-and-stores)
8. [Hooks](#8-hooks)
9. [Utilities](#9-utilities)
10. [Constants and Enums](#10-constants-and-enums)
11. [API Organization](#11-api-organization)
12. [Component Organization](#12-component-organization)
13. [Real-time and Offline](#13-real-time-and-offline)
14. [Asset Organization](#14-asset-organization)
15. [Shared Libraries](#15-shared-libraries)
16. [Naming Conventions](#16-naming-conventions)
17. [Code Splitting and Lazy Loading](#17-code-splitting-and-lazy-loading)
18. [Performance Strategy](#18-performance-strategy)
19. [Security](#19-security)
20. [Enforcement](#20-enforcement)
21. [Observability](#21-observability)
22. [Feature Flags and Configuration](#22-feature-flags-and-configuration)
23. [Caching and Revalidation](#23-caching-and-revalidation)
24. [Tenancy and Session Hygiene](#24-tenancy-and-session-hygiene)
25. [Internationalisation Readiness](#25-internationalisation-readiness)
26. [Concurrency](#26-concurrency)
27. [Analytics Event Catalogue](#27-analytics-event-catalogue)
28. [Error Taxonomy Implementation](#28-error-taxonomy-implementation)

---

## 1. Architectural Decisions

| ID | Decision | Reason | Host rule |
| --- | --- | --- | --- |
| D-1 | Route groups `(public)`, `(workspace)`, `(internal)` organise `app/`; URLs are unchanged | Distinct layouts and guards per audience without URL prefixes (IA-P2, IA-P3); groups are native App Router | "Nesting here is the URL" (groups do not alter URLs) |
| D-2 | Authenticated **mutations** use Server Actions in `lib/actions/`, wrapped by hooks. Authenticated **polled reads** (positions, bids, exceptions, messages, notifications) use Route Handlers in `app/api/<resource>/` that relay through `backendFetch`, consumed with the `local` client | Server Actions are POST-only, uncacheable and dispatched one at a time per client, so a page polling several sources would serialise. Route Handlers are already the host pattern for `app/api/session` and `app/api/register` | "A hook for an authenticated call wraps a Server Action." **Extension, needs maintainer confirmation** |
| D-3 | Help and legal content lives as typed modules in `lib/data/help/` and `lib/data/legal/` until a CMS exists | No new dependency (MDX would add one); content is static seed data | "Seed and sample data lives in `lib/data/`" |
| D-4 | `components/common/` stays flat; domain compositions use a domain prefix in the filename (`load-…`, `bid-…`) instead of subfolders | Host rule: `components/common` is flat | Folder structure table |
| D-5 | Feature-scoped constants and pure domain logic sit in `lib/<feature>/` (for example `lib/loads/constants.ts`); pure helpers without a feature home stay in `lib/utils/` | Host allows `lib/<feature>/constants.ts`; keeps the Phase 2 state machines next to their constants | "Feature-scoped `lib/<feature>/constants.ts`" |
| D-6 | No global store. Server state in TanStack Query; local state in `useState`/`useReducer`/URL; persistence via `useSyncExternalStore` + `localStorage`; the driver offline queue uses IndexedDB behind the same external-store interface | Host requires a stated reason for a global store; none of Phases 4–6 needs one | State management row |
| D-7 | `PROTECTED_ROUTE_PREFIXES` becomes the set of workspace and internal prefixes; role checks for internal prefixes happen in `proxy.ts` from the verified session's role claim | Edge enforcement by prefix (Phase 3 §5) | Uses the existing `proxy.ts` |
| D-8 | Status labels, industry glossary, notification copy and error copy are constants, never inline strings | Single source of truth; future i18n (Phase 1 §16) | Rule 1 and rule 3 |
| D-9 | Environment variables are parsed once at startup by a Zod schema in `lib/validations/env.ts`; the app fails fast on missing or malformed values | Misconfiguration is caught at deploy, not at first use; one typed source for config | Zod for shapes; constants for defaults |
| D-10 | Observability uses the framework-native `instrumentation.ts` with OpenTelemetry, and an error-reporting service wrapped in `lib/utils/report-error.ts`; nothing logs to the console | NFR-OBS-1 … 4; host rule 5 ("logging belongs in services") | Framework-native; wrapper is the service |
| D-11 | Feature flags are read server-side from one typed module `lib/flags.ts` backed by environment or a flag service, and passed to client components as props | Progressive rollout and kill switches for enterprise features without redeploying code paths; no client-side flag fetching | Single source of truth |
| D-12 | Mutations on mutable records send the record `version` (or ETag via `If-Match`); a 412 is mapped to E-PRECONDITION and handled by IC-67 | SSB-8; no last-write-wins in a multi-user enterprise tenant | Contract carries `version` on mutable DTOs |
| D-13 | Every Server Action and Route Handler is wrapped by one higher-order helper, `withAction` or `withHandler` in `lib/utils/`, which applies the session, role check, correlation ID, audit reason pass-through, error-class mapping and timing | One enforcement point for SEC-4, NFR-OBS-1 and Phase 4 §2.2; avoids copy-pasted guards | Extends the `create-user.ts` pattern rather than replacing it |

---

## 2. Folder Structure

Existing starter files are marked `(exists)`. Everything else is to be created. `lib/contract/` is generated and never edited.

```text
app/
  layout.tsx                         (exists) root layout: providers, skip link (IC-52)
  not-found.tsx                      PG-53
  global-error.tsx                   PG-54 (root)
  forbidden.tsx                      PG-55
  sitemap.ts, robots.ts              Phase 3 §11
  api/
    session/route.ts                 (exists)
    register/route.ts                (exists)
    tracking/[token]/route.ts        public polled read (PG-02)
    loads/[loadId]/positions/route.ts
    loads/[loadId]/bids/route.ts
    exceptions/route.ts
    threads/[threadId]/messages/route.ts
    notifications/route.ts
    rate-estimate/route.ts           anonymous, rate-limited (PG-05)
    imports/[batchId]/route.ts       polled batch status (PG-56)
    exports/route.ts                 polled export job status (PG-59, PG-62, PG-63)
    approvals/route.ts               polled approval queue (PG-58)
    attention/route.ts               polled attention queue (SH-07)
    webhooks/[endpointId]/deliveries/route.ts   polled delivery log (PG-61)
    auth/sso/[...step]/route.ts      SSO start and callback relay (SC-10.3)
instrumentation.ts                   OpenTelemetry registration (§21)
  auth/                              (exists) access pages, PG-10 … PG-15
    login/page.tsx                   (exists)
  (public)/  (workspace)/  (internal)/   see §3
components/
  ui/                                (exists, flat) domain-free primitives; button.tsx (exists)
  common/                            (exists, flat) shared compositions; login-form.tsx (exists)
  wrappers/                          (exists, flat) motion-wrapper.tsx (exists), boundaries
  providers/                         (exists, flat) provider.tsx (exists)
lib/
  actions/                           Server Actions (authenticated mutations and server reads)
  contract/                          (exists, generated) schemas.ts, routes.ts
  data/                              seed data, help and legal content (D-3)
  enums/                             enumerations mirrored from the contract
  hooks/                             (exists) use-<resource>.ts
  types/                             (exists) <domain>.ts + index.ts
  utils/                             (exists) pure helpers
  validations/                       (exists) Zod schemas composed over the contract
  loads/  tracking/  billing/  compliance/  ops/   feature constants and domain logic (D-5)
  constants.ts                       (exists) app-wide constants
  api-client.ts, api-routes.ts, api-server.ts      (exist) transport
proxy.ts                             (exists) edge guard (D-7)
styles/                              (exists) host styling system — not specified here
public/fonts/                        (exists)
tools/eslint/rules/ tools/codemods/ tools/contract/   (exist) enforcement and generation
design-os/generated/                 this design OS
```

---

## 3. Route Structure

Every page from [Phase 3 §3](./phase-3-information-architecture.md#3-sitemap), as files. Each `page.tsx` composes sections and holds page-level state only (host rule; ESLint `page-composes-only`).

```text
app/
  (public)/
    layout.tsx                                   public layout
    page.tsx                                     PG-01  /
    track/[token]/page.tsx                       PG-02
    carriers/[carrierId]/page.tsx                PG-03
    tools/rate-estimator/page.tsx                PG-05
    help/page.tsx                                PG-06
    help/[slug]/page.tsx                         PG-07
    support/page.tsx                             PG-08
    legal/[document]/page.tsx                    PG-09
  auth/                                          (exists)
    layout.tsx                                   access layout
    login/page.tsx                               PG-10 (exists)
    register/page.tsx                            PG-11
    forgot-password/page.tsx                     PG-12
    reset-password/page.tsx                      PG-13
    verify/page.tsx                              PG-14
    invite/[token]/page.tsx                      PG-15
  (workspace)/
    layout.tsx                                   authenticated workspace layout
    dashboard/page.tsx                           role-resolving redirect
    onboarding/shipper/page.tsx                  PG-16
    onboarding/carrier/page.tsx                  PG-17
    shipper/layout.tsx                           shipper role guard
    shipper/page.tsx                             PG-18
    shipper/loads/page.tsx                       PG-26
    shipper/loads/new/page.tsx                   PG-27
    shipper/loads/[loadId]/bids/page.tsx         PG-28
    shipper/carriers/page.tsx                    PG-29
    shipper/invoices/page.tsx                    PG-30
    shipper/invoices/[invoiceId]/page.tsx        PG-31
    shipper/locations/page.tsx                   PG-32
    shipper/loads/import/page.tsx                PG-56
    shipper/templates/page.tsx                   PG-57
    shipper/approvals/page.tsx                   PG-58
    shipper/reports/page.tsx                     PG-59
    carrier/layout.tsx                           carrier role guard
    carrier/page.tsx                             PG-19
    carrier/load-board/page.tsx                  PG-33
    carrier/load-board/[loadId]/book/page.tsx    PG-34
    carrier/loads/page.tsx                       PG-35
    carrier/saved/page.tsx                       PG-36
    carrier/fleet/page.tsx                       PG-37
    carrier/settlements/page.tsx                 PG-38
    driver/layout.tsx                            driver guard, offline provider
    driver/page.tsx                              PG-20
    driver/trips/[loadId]/page.tsx               PG-39
    loads/[loadId]/page.tsx                      PG-40
    loads/[loadId]/amendments/[amendmentId]/page.tsx   PG-64
    messages/page.tsx                            PG-41
    notifications/page.tsx                       PG-42
    documents/page.tsx                           PG-43
    claims/page.tsx                              PG-44
    claims/new/page.tsx                          PG-45 (create)
    claims/[claimId]/page.tsx                    PG-45
    profile/page.tsx                             PG-46
    settings/page.tsx                            PG-47
    settings/organization/page.tsx               PG-48
    settings/billing/page.tsx                    PG-49
    settings/security/page.tsx                   PG-60
    settings/integrations/page.tsx               PG-61
    settings/privacy/page.tsx                    PG-62
    settings/audit/page.tsx                      PG-63
    shippers/[shipperId]/page.tsx                PG-04
  (internal)/
    layout.tsx                                   internal-role guard
    ops/page.tsx                                 PG-21
    ops/exceptions/page.tsx                      PG-50
    compliance/page.tsx                          PG-22
    compliance/carriers/[carrierId]/page.tsx     PG-51
    finance/page.tsx                             PG-23
    support-console/page.tsx                     PG-24
    admin/page.tsx                               PG-25
    admin/accounts/page.tsx                      PG-52
```

Every data-bearing segment adds `loading.tsx` (SSB-1) and `error.tsx` (SSB-3, PG-54 behaviour). Each group adds `not-found.tsx` (Phase 3 §14).

**Route helpers.** All internal paths are built by `lib/api-routes.ts`-style helpers in a new `appRoutes` object in `lib/constants.ts` (for example `appRoutes.load(loadId)`), never string literals in components (IC-51).

---

## 4. Layouts

Layouts define structure and guards, not appearance.

| Layout | Responsibilities |
| --- | --- |
| `app/layout.tsx` (exists) | Providers, fonts, skip link (IC-52), live announcer (IC-14), default metadata |
| `(public)/layout.tsx` | Public metadata defaults; session-aware access routing (SC-01.4) |
| `auth/layout.tsx` | Redirects signed-in users (already in `proxy.ts`); no workspace data |
| `(workspace)/layout.tsx` | Server-side session and role read (`lib/utils/session.ts`); onboarding redirect (Phase 3 §14); global destinations per role (Phase 3 §4); quick find (IC-50); notifications count (IC-53); session timeout (IC-54); connectivity (IC-55) |
| `shipper/`, `carrier/`, `driver/` layouts | Role guard → `forbidden()`; role-specific providers (driver offline queue) |
| `(internal)/layout.tsx` | Internal-role guard; shortcut scope (IC-49) |

---

## 5. Providers

All providers live in `components/providers/` (flat), composed by the existing `provider.tsx`.

| Provider | File | Purpose |
| --- | --- | --- |
| Query client | `provider.tsx` (exists) | TanStack Query; adjust defaults: `refetchOnWindowFocus` true for workspace queries that need freshness (per-query override), keep `staleTime` 60 s default |
| Motion config | `provider.tsx` (exists) | `reducedMotion="user"` (G-4) |
| Announcer | `announcer-provider.tsx` | Single live region and queue for IC-14 |
| Session | `session-provider.tsx` | Exposes the server-read session (user, role, organisation) to client components; read-only |
| Offline queue | `offline-queue-provider.tsx` | Driver event and upload queue (D-6, §13); mounted only in `driver/layout.tsx` |

No provider holds server data other than through the Query cache.

---

## 6. Feature Folders

The host keeps `components/*` flat and `lib/` layered by kind, so "features" are expressed in two places (D-4, D-5):

1. **`lib/<feature>/`** — feature constants and pure domain logic:

| Folder | Contents |
| --- | --- |
| `lib/loads/` | `constants.ts` (status labels, refresh intervals, quote validity), `transitions.ts` (Phase 2 §5 state machine: `(role, state) → legal actions`), `bid-transitions.ts` (Phase 2 §6) |
| `lib/tracking/` | `constants.ts` (stale thresholds BR-10, refresh intervals), `eta.ts` (freshness helpers) |
| `lib/billing/` | `constants.ts` (payment copy, quick pay copy), `money.ts` (formatting, never computation of amounts) |
| `lib/compliance/` | `constants.ts` (status labels, reason codes) |
| `lib/ops/` | `constants.ts` (exception types, severities, shortcuts) |

2. **Filename prefixes** in `components/common/` group compositions by domain: `load-timeline.tsx`, `load-position.tsx`, `bid-comparison.tsx`, `invoice-charges.tsx`, `stop-event-action.tsx`.

Note: `SC-40.2` in Phase 5 names `lib/loads/transitions.ts`; that is this file.

---

## 7. Contexts and Stores

- **No global store** (D-6). A future proposal for Zustand must cite a need Phases 4–6 cannot meet with the patterns below.
- **URL state:** filters, sort, cursor, view, step, tab, selected thread/ticket/exception (Phase 3 §10). Parsed and serialised by `lib/utils/query-string.ts` (exists).
- **Local component state:** entry in progress, open disclosures, selection.
- **Reducers:** multi-step flows (SH-13) use `useReducer` with typed actions.
- **Persistence:** drafts and persistent dismissals through `useSyncExternalStore` over `lib/utils/local-storage.ts` (exists). Session-only dismissals (SH-06 non-blocking notices) use the same safe wrapper generalised to accept the storage area (`localStorage` or `sessionStorage`), rather than a second helper. The driver offline queue uses IndexedDB behind the same subscribe/getSnapshot interface.
- **Contexts:** only the providers in §5. No context holds server data.

---

## 8. Hooks

Every hook lives in `lib/hooks/use-<resource>.ts` (host rule), and components consume hooks, never the transport. Each file exports the query and mutation hooks for one resource. Existing hooks are kept.

| File | Hooks exported (as named in Phase 5) | Transport |
| --- | --- | --- |
| `use-login.ts` (exists) | `useLogin` | `local` → `app/api/session` |
| `use-logout.ts` (exists) | `useLogout` | `local` |
| `use-register.ts` (exists) | `useRegister` | `local` → `app/api/register` |
| `use-create-user.ts` (exists) | `useCreateUser` | Server Action |
| `use-debounced-search.ts` (exists) | `useDebouncedSearch` | — |
| `use-auth-recovery.ts` | `useRequestPasswordReset`, `useResetPassword`, `useVerifyEmail`, `useResendVerification`, `useMfaChallenge` | Server Actions |
| `use-mfa.ts` | `useMfa` | Server Actions |
| `use-sessions.ts` | `useSessions` | Server Actions |
| `use-profile.ts` | `useProfile`, `useChangeEmail`, `useChangePassword` | Server Actions |
| `use-organization.ts` | `useOrganization`, `useAccountStanding`, `useOnboarding`, `useCreditApplication`, `useCredit` | Server Actions |
| `use-members.ts` | `useMembers`, `useInvitations`, `useInvitation`, `useAcceptInvitation` | Server Actions |
| `use-facilities.ts` | `useFacilities` | Server Actions |
| `use-location-suggestions.ts` | `useLocationSuggestions` | Route Handler |
| `use-loads.ts` | `useLoads`, `useLoad`, `useLoadCounts`, `useLoadActions`, `usePostLoad`, `useExportLoads` | Server Actions |
| `use-load-timeline.ts` | `useLoadTimeline` | Server Action |
| `use-load-positions.ts` | `useLoadPositions`, `useTrackingHealth` | Route Handler (polled) |
| `use-tracking.ts` | `useTracking`, `useTrackingLinks` | Route Handler (public), Server Actions |
| `use-quote.ts` | `useQuote`, `useRateEstimate`, `useLaneTrend`, `useSavedEstimates` | Server Action, Route Handler (anonymous) |
| `use-bids.ts` | `useBids`, `useBidActions`, `useTenders`, `useTenderRules` | Route Handler (polled), Server Actions |
| `use-preferred-carriers.ts` | `usePreferredCarriers`, `useCarrierRelationship` | Server Actions |
| `use-load-board.ts` | `useLoadBoard`, `useRecommendedLoads`, `useBookLoad`, `useWatchedLoads` | Server Actions |
| `use-saved-searches.ts` | `useSavedSearches` | Server Actions |
| `use-fleet.ts` | `useFleet`, `useAssignLoad` | Server Actions |
| `use-trip.ts` | `useDriverTrips`, `useTrip`, `useStopEvents`, `useReportIssue`, `useLocationConsent` | Server Actions + offline queue |
| `use-documents.ts` | `useDocuments`, `useDocumentUpload`, `usePodUpload`, `useSignAgreement` | Server Actions (presigned upload) |
| `use-accessorials.ts` | `useAccessorials` | Server Actions |
| `use-invoices.ts` | `useInvoices`, `useInvoice`, `useInvoiceSummary`, `usePayInvoices` | Server Actions |
| `use-settlements.ts` | `useSettlements`, `useSettlement`, `useSettlementSummary`, `useQuickPay` | Server Actions |
| `use-payment-methods.ts` | `usePaymentMethods` | Server Actions |
| `use-claims.ts` | `useClaims`, `useClaim`, `useCreateClaim`, `useClaimActions` | Server Actions |
| `use-messages.ts` | `useThreads`, `useMessages`, `useSendMessage` | Route Handler (polled), Server Action |
| `use-notifications.ts` | `useNotifications`, `useNotificationPreferences` | Route Handler (polled), Server Actions |
| `use-attention-items.ts` | `useAttentionItems` | Route Handler (polled) |
| `use-metrics.ts` | `useMetrics`, `useScorecard` | Server Actions |
| `use-ratings.ts` | `useRateCounterparty` | Server Action |
| `use-profiles.ts` | `useCarrierProfile`, `useShipperProfile` | Server Actions |
| `use-exceptions.ts` | `useExceptions`, `useException`, `useExceptionSummary`, `useExceptionActions`, `useCoverageRisk` | Route Handler (polled), Server Actions |
| `use-compliance.ts` | `useComplianceStatus`, `useAuthorityLookup`, `useCarrierVetting`, `useVettingDecision`, `useMonitoringEvents` | Server Actions |
| `use-finance-queues.ts` | `usePodQueue`, `useVerifyPod`, `usePayoutFailures`, `useRetryPayout` | Server Actions |
| `use-tickets.ts` | `useTickets`, `useCreateTicket`, `useRequesterContext` | Server Actions |
| `use-admin.ts` | `useAccounts`, `usePlatformConfig`, `useUpdateConfig`, `useAuditLog` | Server Actions |
| `use-help.ts` | `useHelpSearch`, `useArticleFeedback` | Local index, Server Action |
| `use-quick-find.ts` | `useQuickFind` | Server Action |
| `use-bulk-import.ts` | `useImportBatch`, `useImportMappings`, `useImportRows`, `useUpdateImportRow`, `usePriceImportBatch`, `useConfirmImportBatch`, `useImportBatches` | Server Actions; Route Handler for batch status (polled) |
| `use-templates.ts` | `useLoadTemplates`, `useRecurrences` | Server Actions |
| `use-approvals.ts` | `useApprovalRequests`, `useApprovalRequest`, `useDecideApproval`, `useApprovalDelegations`, `useSpendPolicy` | Route Handler (polled queue), Server Actions |
| `use-reports.ts` | `useReport`, `useSavedReports`, `useReportSchedules` | Server Actions |
| `use-security.ts` | `useVerifiedDomains`, `useSsoConnection`, `useScim`, `useRoleMappings`, `useSessionPolicy` | Server Actions (all sensitive, IC-13) |
| `use-integrations.ts` | `useApiKeys`, `useWebhooks`, `useWebhookDeliveries`, `useEdiConnections` | Server Actions; Route Handler for deliveries (polled) |
| `use-privacy.ts` | `useExports`, `useRequestExport`, `usePrivacyRequests` | Server Actions; Route Handler for job status (polled) |

**Additions to existing hook files (version 1.1.0):** `use-loads.ts` gains `useAmendments`, `useAmendment`, `useProposeAmendment` and `useDecideAmendment`; `use-auth-recovery.ts` gains `useSsoDiscovery`; `use-tickets.ts` gains `useViewAs`.

**Naming across phases.** Phases 5 and 6 cite hooks in the kebab form used for files, with parameters (for example `use-account-standing()`). The export is always the camelCase equivalent (`useAccountStanding`), and it lives in the file listed in this table, which may group several related hooks (`useAccountStanding` is exported from `use-organization.ts`).

**Hook rules.**

- Query keys come from one factory per resource (`loadKeys.list(params)`, `loadKeys.detail(id)`), defined in the hook file and exported for invalidation.
- Mutations invalidate by key factory. Optimistic updates only where Phase 5 says so (SH-04, IC-29, IC-33, IC-36).
- Server components prefetch the initial data with the same action functions and pass it through TanStack Query's `HydrationBoundary`, so the first render never waits on the client.
- Polling uses `refetchInterval` from feature constants and `refetchIntervalInBackground: false`.

---

## 9. Utilities

Pure, framework-free helpers in `lib/utils/` (existing files kept):

| File | Purpose |
| --- | --- |
| `date-formatter.ts` (exists) | Facility-zone and relative time formatting |
| `date-parser.ts` (exists) | Typed date entry parsing (IC-08) |
| `internal-path.ts` (exists) | Return-path validation |
| `local-storage.ts` (exists) | Safe storage access (try/catch) |
| `query-string.ts` (exists) | URL parameter parsing and serialisation |
| `session.ts` (exists) | Server session read |
| `verify-session-token.ts` (exists) | RS256 verification |
| `reference-id.ts` | `nanoid` custom alphabet for `HL-`, `CLM-`, `TKT-` client-generated references and idempotency keys |
| `currency.ts` | Currency and per-mile formatting (display only) |
| `units.ts` | Miles, pounds, temperature formatting |
| `action-result.ts` | Map `ActionResult` failures to user-facing constants |
| `offline-queue.ts` | IndexedDB-backed queue with external-store interface (§13) |
| `with-action.ts` | `withAction` and `withHandler` wrappers: session, role, correlation ID, reason pass-through, error-class mapping, timing (D-13) |
| `report-error.ts` | Single error-reporting entry point with PII scrubbing (D-10, §21) |

---

## 10. Constants and Enums

- **`lib/constants.ts`** (exists) gains app-wide values: `appRoutes`, `PROTECTED_ROUTE_PREFIXES` (all workspace and internal prefixes), `INTERNAL_ROUTE_PREFIXES`, page size (default 50, maximum 200), upload limits, session warning lead time, `errorCopy` per error class (Phase 4 §2.2), the analytics event catalogue (§27), loading and freshness thresholds (Phase 4 §2.1, §2.6), metadata title template.
- **Feature constants** in `lib/<feature>/constants.ts` (§6): status labels, refresh intervals, thresholds (BR-06, BR-08, BR-10, BR-11), glossary definitions (IC-56), notification copy.
- **`lib/enums/`** holds one file per enumeration from Phase 3 §6 (`load-status.ts`, `bid-status.ts`, `equipment-type.ts`, `stop-type.ts`, `accessorial-type.ts`, `document-type.ts`, `exception-type.ts`, `invoice-status.ts`, `settlement-status.ts`, `claim-type.ts`, `claim-status.ts`, `compliance-status.ts`, `notification-event.ts`, `role-key.ts`). Each derives from the generated contract enum where one exists, so a backend change breaks type-checking here.
- **Configurable values.** Where the platform configuration (SC-25.2) owns a value, the constant is the fallback and the server value wins.
- **Field and collection limits** live in one `LIMITS` map in `lib/constants.ts`, mirrored by the backend DTO validators so that the contract enforces them (G-7). Defaults below are proposed and need confirmation by product and backend before Sprint 1:

| Limit | Default | Limit | Default |
| --- | --- | --- | --- |
| Single-line text | 200 chars | Password | 8–128 chars |
| Email | 254 chars | Reason (reason-required actions) | 1–1,000 chars |
| Notes, instructions | 500 chars | Handoff note | 2,000 chars |
| Message | 4,000 chars | Rating comment | 1,000 chars |
| Signed name | 200 chars | Search query | 2–200 chars |
| Saved search name | 1–80 chars | Saved searches per user | 25 |
| Watched loads per user | 200 | Bulk selection | 500 records |
| Upload | 20 MB per file, 10 files per selection | Camera capture | 1–10 pages |
| Import file | 5 MB, 500 rows (BR-28) | Invitations per send | 20 |
| Share recipients | 10 | Tender waterfall | 1–10 carriers |
| Load board radius | 10–500 mi, step 5 | Page size | 50 default, 200 maximum |
| Seal number | 30 chars | Pieces | 0–99,999 |

---

## 11. API Organization

| Layer | Location | Rule |
| --- | --- | --- |
| Contract | `lib/contract/` (generated) | Never edited; regenerate with `pnpm contract`; `pnpm contract:check` in the gate |
| Endpoints not in the contract | `lib/api-routes.ts` (exists) | Only for same-origin route handlers (`session`, `register`, new polled reads) |
| Browser transport | `lib/api-client.ts` (exists) | `local` gains `get` for same-origin Route Handlers (D-2); `query` remains for unauthenticated backend calls |
| Server transport | `lib/api-server.ts` (exists) | `backendFetch` attaches the session token; `relay` passes responses through |
| Server Actions | `lib/actions/<verb>-<noun>.ts` | One action per file, following `create-user.ts`: parse input with the contract schema, call `backendFetch(routes.x())`, parse the envelope, return `ActionResult<T>` |
| Route Handlers | `app/api/<resource>/route.ts` | Authenticated polled reads; verify session, `backendFetch`, `relay` |
| Hooks | `lib/hooks/use-<resource>.ts` | Wrap actions or `local` calls in TanStack Query |

**Backend dependency.** Every Haulr resource above requires a NestJS module in the backend with `@ApiEnvelope(Dto)` annotations so its response types reach the contract. Until then, hooks may read typed seed data from `lib/data/` behind the same hook signature, so pages do not change when the backend arrives.

**Error mapping.** `ActionResult` failures map to constants by status: 400 → field errors (IC-02), 401 → sign-in redirect, 403/404 → not found (Phase 3 §5.2), 409 → state conflict (IC-27, SC-40.2), 422 → validation, 429 → rate limit, 5xx → retry (IC-60).

---

## 12. Component Organization

| Folder | What goes there | Examples (names only; appearance decided at build) |
| --- | --- | --- |
| `components/ui/` | Domain-free primitives implementing Phase 6 contracts | `button.tsx` (exists, IC-11), `text-field.tsx` (IC-01), `combobox.tsx` (IC-05/07), `date-window-field.tsx` (IC-08), `dialog.tsx` (IC-41), `confirm-dialog.tsx` (IC-12), `tabs.tsx` (IC-16), `file-drop.tsx` (IC-24), `switch.tsx` (IC-36), `data-table.tsx` (IC-22), `pagination.tsx` (IC-21), `status-label.tsx` (IC-59), `countdown.tsx` (IC-46), `toggletip.tsx` (IC-56), `menu.tsx` (IC-57), `skip-link.tsx` (IC-52) |
| `components/common/` | Shared compositions implementing shared sections (SH-) and repeated page sections | `record-collection.tsx` (SH-05), `load-timeline.tsx` (SH-01), `load-position.tsx` (SH-02), `document-set.tsx` (SH-03), `conversation.tsx` (SH-04), `account-standing.tsx` (SH-06), `attention-queue.tsx` (SH-07), `metric-set.tsx` (SH-08), `scorecard.tsx` (SH-09), `money-breakdown.tsx` (SH-14), `assignment-picker.tsx` (SH-15), `step-flow.tsx` (SH-13), `section-state.tsx` (one loading, empty and error handler for every section, SSB-1 … SSB-3), `login-form.tsx` (exists) |
| `components/wrappers/` | Behavioural wrappers | `motion-wrapper.tsx` (exists), `section-boundary.tsx` (error + suspense per section, SSB-1/3), `role-gate.tsx` (render by capability, never security) |
| `components/providers/` | Providers (§5) | — |

**Rules.** One component per file, kebab-case matching the export (host). A section used on two pages is promoted from the page to `components/common/` (host). Page-only sections also live in `components/common/` with a page-domain prefix, because pages may not define components (host rule, ESLint `page-composes-only`). Any file over ~150 lines is split.

---

## 13. Real-time and Offline

**Transport choice for live data.** Polling through TanStack Query `refetchInterval` via Route Handlers (D-2) at launch, with intervals from constants:

| Data | Interval | Pause when hidden |
| --- | --- | --- |
| Load positions (PG-40, PG-26 map) | 60 s | Yes |
| Public tracking (PG-02) | 120 s | Yes |
| Bids (PG-28) | 20 s | Yes |
| Load board results (PG-33) | 30 s | Yes |
| Exception queue (PG-50) | 15 s | Yes |
| Messages (open thread) | 10 s | Yes |
| Notifications count | 60 s | Yes |
| Approval queue (PG-58), open amendment (PG-40) | 30 s | Yes |
| Import batch status (PG-56) | 5 s while processing | No (job continues server-side; status re-read on return) |
| Export job status (PG-59, PG-62, PG-63) | 10 s while running | Yes |
| Webhook delivery log (PG-61) | 60 s | Yes |
| Operations dashboard counts (PG-21) | 30 s | No on DV-WALL screens; yes elsewhere |
| Support ticket queue (PG-24) | 60 s | Yes |
| Attention queue (SH-07, dashboards) | 60 s and on focus | Yes |
| Recommended loads (SC-19.3) | 5 min | Yes |

Server-sent events via a Route Handler (native `ReadableStream`, no dependency) are the upgrade path for messages and exceptions once the backend exposes a stream. Hooks keep the same signature either way.

**Offline (driver, PP-06).**

- The driver trip (`useTrip`) is persisted to IndexedDB after each successful fetch and served from there when offline.
- Stop events, issue reports and POD uploads are appended to the offline queue (`lib/utils/offline-queue.ts`) with a `nanoid` ID and device time, then replayed in order on reconnect. The server de-duplicates by ID.
- Service worker caching of the driver routes is a Sprint 7 item (Phase 8), implemented with the platform Service Worker API; no library without approval.

---

## 14. Asset Organization

- `public/fonts/` (exists): fonts via `public/fonts/font.ts` (exists).
- `public/` holds only static files that must be served by path (favicon, manifest, OG fallback image).
- User-generated content (documents, avatars, POD images) never lives in the repo; it is served from backend storage through signed URLs and rendered with the Next.js `Image` component (configured `remotePatterns`).
- Icons come from the installed Carbon icon set (`@carbon/icons-react`), the single icon set.

---

## 15. Shared Libraries

Per the master prompt's Library Selection Policy: reuse first, otherwise recommend and wait for approval. **Nothing in the "Proposed" rows is installed.** Installation needs maintainer approval, then `pnpm add`.

| Need | Status | Library | Reason |
| --- | --- | --- | --- |
| Server state | Reuse | `@tanstack/react-query` (installed) | Host standard |
| Schemas and types | Reuse | `zod` (installed) + generated contract | Host standard |
| HTTP | Reuse | `axios` (installed) via `lib/api-client.ts` | Host standard |
| Animation | Reuse | `motion` (installed) | Host standard; `MotionConfig reducedMotion="user"` |
| Icons | Reuse | `@carbon/icons-react` (installed) | Single icon set |
| Dates | Reuse | `date-fns` (installed); time zones via `Intl` or `@date-fns/tz` (proposed if `Intl` proves insufficient) | Facility-local times (IC-08) |
| IDs | Reuse | `nanoid` (installed) | Host rule |
| Session | Reuse | `jose` (installed) | Existing verification |
| Unit tests | Reuse | `vitest` (installed), `fast-check` (installed) | Host standard |
| Forms | **Proposed** | `react-hook-form` + `@hookform/resolvers` | Most widely recommended React form library; uncontrolled inputs perform well for long forms (PG-27); Zod resolver keeps the contract schemas as the source |
| Maps | **Proposed** | `maplibre-gl` (+ `react-map-gl`) | Open-source vector maps with no per-load vendor lock-in; keyboard handlers built in; tile provider decided separately |
| Charts | **Proposed** | `recharts` | Most widely used React chart library; SVG output supports the IC-45 accessible equivalents |
| Component tests | **Proposed** | `@testing-library/react`, `@testing-library/user-event`, `jsdom` | Standard for behaviour-first component tests with Vitest |
| End-to-end | **Proposed** | `@playwright/test` | The recommended E2E runner for Next.js; multi-browser (Phase 9 cross-browser) |
| Accessibility tests | **Proposed** | `@axe-core/playwright` | Automated WCAG checks within E2E |
| Payments entry | **Proposed** | Processor's official React SDK | Required by A6; chosen with the backend processor decision |
| Observability | **Proposed** | `@vercel/otel` (or `@opentelemetry/sdk-node` if not on Vercel) via `instrumentation.ts`; `@sentry/nextjs` for error reporting | Framework-native OpenTelemetry hook; Sentry is the most widely used Next.js error reporter with source maps and release tracking (D-10) |
| Product analytics | **Proposed** | Vendor chosen with privacy review (for example PostHog, self-hostable) | Event catalogue in §27; NFR-PRIV-3 constrains properties |
| Feature flags | **Reuse first** | Environment-backed `lib/flags.ts`; a flag service only if targeting by organisation is required | D-11 |
| Passkeys | **Reuse** | Browser WebAuthn API (no dependency); server library chosen by the backend | SEC-1 |
| Accessible primitives | **Open question** | None proposed by default | The host builds primitives in `components/ui/`; if the team prefers a headless library for combobox, dialog and menu (IC-05, IC-41, IC-57), propose it explicitly |

---

## 16. Naming Conventions

| Thing | Convention | Example |
| --- | --- | --- |
| Component files | kebab-case matching PascalCase export | `load-timeline.tsx` → `LoadTimeline` |
| Hooks | `use-<resource>.ts`, exports `useX` | `use-loads.ts` → `useLoads`, `useLoad` |
| Server Actions | `<verb>-<noun>.ts`, exported camelCase verb phrase | `book-load.ts` → `bookLoad` |
| Route Handlers | `app/api/<resource>/route.ts` | `app/api/loads/[loadId]/positions/route.ts` |
| Types | `lib/types/<domain>.ts`, PascalCase | `Load`, `Bid`, `Invoice` (re-exported from contract via `z.infer`) |
| Schemas | camelCase + `Schema` | `postLoadSchema` |
| Constants | SCREAMING_SNAKE for scalars, camelCase for maps | `TRACKING_STALE_MINUTES`, `loadStatusLabels` |
| Enums | `lib/enums/<name>.ts`, singular | `load-status.ts` |
| Query keys | `<resource>Keys` factory | `loadKeys.detail(id)` |
| Test files | colocated `.test.ts(x)`; E2E in a top-level `e2e/` folder once Playwright is approved | `load-transitions.test.ts` |
| Design OS IDs | `PG-`, `SC-`, `SH-`, `IC-`, `XF-`, `XD-`, `XS-` cited in commit messages and PR titles | `feat(PG-27): lane step (SC-27.2)` |

---

## 17. Code Splitting and Lazy Loading

- Route-level splitting is automatic per `page.tsx`.
- **Heavy client libraries load only where used:** the map (IC-30) and charts (IC-45) are imported with `next/dynamic` and `ssr: false`, rendered after their text equivalents.
- **Role isolation:** internal tools, driver workflow and shipper/carrier workspaces share no client bundles beyond `components/ui/` and providers.
- Help search index loads on first focus of the search (SC-06.1).
- Processor payment SDK loads only on PG-49, PG-31 and onboarding billing steps.
- Dialog contents (IC-41) that are not needed at page load are dynamically imported.

---

## 18. Performance Strategy

| Target (p75, mid-range phone, 4G) | Budget |
| --- | --- |
| LCP | ≤ 2.5 s (PG-01: ≤ 2.0 s) |
| INP | ≤ 200 ms |
| CLS | ≤ 0.1 |
| JS per route (compressed, initial) | ≤ 170 KB public, ≤ 250 KB workspace, ≤ 150 KB driver |

Techniques: server components by default, with client components only for interaction; streaming with per-section Suspense (SSB-1); `HydrationBoundary` prefetch; static generation for public pages (Phase 3 §3.1); ISR for carrier profiles with tag revalidation; cursor pagination everywhere; polling paused when hidden; position subscriptions only for loads in view; Next.js `Image` for all images; fonts via `next/font` (exists); no client-side totals over large collections.

---

## 19. Security

- Session is an httpOnly cookie (`SESSION_COOKIE`) verified at the edge and on the server; the browser never holds the bearer token (existing design).
- Every Server Action and Route Handler re-checks role and record membership; hiding is never a control (Phase 3 §5).
- Return paths validated by `lib/utils/internal-path.ts`.
- Idempotency keys on booking, bid acceptance, payment and quick pay.
- No raw payment data (A6); no rates in public tracking (BR-21).
- Uploads: type and size checked client-side, scanned server-side; downloads via short-lived signed URLs.
- Content Security Policy set in `next.config.ts` headers, with map tiles, processor and storage origins allow-listed.
- No `console.*` in committed code (host rule 5); service-level logging only.
- **CSRF:** Server Actions rely on the framework's Origin check; `serverActions.allowedOrigins` in `next.config.ts` lists only Haulr origins. Route Handlers that mutate verify `Origin` and use SameSite=Lax cookies (SEC-7).
- **CSP with nonces:** generated per request in `proxy.ts` and passed through headers; `script-src 'self' 'nonce-…' 'strict-dynamic'`; `frame-ancestors 'none'`; `form-action` limited to Haulr and identity-provider origins.
- **Other headers:** HSTS (2 years, preload), `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` allowing camera and geolocation only on driver routes, `X-Content-Type-Options: nosniff`.
- **SSO:** SAML and OIDC exchanges terminate at the backend; the frontend relays through `app/api/auth/sso/[...step]` and never parses assertions. State and nonce parameters are validated server-side.
- **Session hygiene (SSB-10):** on sign-out, account switch, view-as start or end, and SCIM deprovision, the client calls `queryClient.clear()`, removes user-keyed drafts and clears the IndexedDB offline queue after replay or discard.
- **Idle timeout:** the organisation policy (BR-24) is enforced server-side; IC-54 warns 2 minutes before expiry.
- **Secrets in the browser:** only the reveal-once flow (IC-63) ever holds a secret, in component memory, never in query cache, storage or URL.
- **View-as:** the scoped session is read-only at the backend unless consent exists; the frontend additionally hides nothing, but disables blocked actions with the reason (G-5).

---

## 20. Enforcement

Existing ESLint rules in `tools/eslint/rules/` already enforce much of this phase:

| Rule | Enforces |
| --- | --- |
| `page-composes-only` | Pages compose; no inline data or sub-components (§3, §12) |
| `one-component-per-file` | One component per file (§12) |
| `domain-types-in-lib` | Shared types live in `lib/types/` (§16) |
| `api-access-boundary` | Components do not call transport directly (§8, §11) |
| `no-comments` | Host comment policy |
| `application-register-density` | Host styling-register rule (not specified here) |

Proposed additions, each with a colocated `.test.ts` per host convention: a rule forbidding string-literal internal paths in components (use `appRoutes`, IC-51); a rule forbidding `refetchInterval` literals outside feature constants; a rule requiring every exported Server Action and Route Handler to be wrapped by `withAction` or `withHandler` (D-13); and a rule forbidding analytics calls whose event name is not in the §27 catalogue. The existing codemod `extract-transport-to-hook` covers moving stray transport calls into hooks.

---

## 21. Observability

- **Tracing:** `instrumentation.ts` registers OpenTelemetry; spans cover route render, Server Action and Route Handler execution, and `backendFetch` calls. The `x-request-id` created in `proxy.ts` becomes the trace attribute and is forwarded to the backend (NFR-OBS-1).
- **Error reporting:** `lib/utils/report-error.ts` is the only reporting entry point. It is called from `error.tsx`, `global-error.tsx`, `withAction`/`withHandler` and the Query client's global `onError`. It attaches release, route, role key (never user identity), error class (Phase 4 §2.2) and correlation ID, and scrubs PII per NFR-PRIV-3.
- **Real-user monitoring:** Web Vitals via `useReportWebVitals` in the root providers, tagged with route and role family (NFR-OBS-3).
- **SLO dashboards and alerts:** built from the metrics above for NFR-AV-1, NFR-AV-2 and NFR-PERF-3, with burn-rate alerts (NFR-OBS-4).
- **Support reference:** E-SERVER and E-CONTRACT messages show the correlation ID so support can find the trace.

## 22. Feature Flags and Configuration

- `lib/validations/env.ts` (D-9): a schema for every environment variable (`NEXT_PUBLIC_API_URL`, `JWT_PUBLIC_KEY`, `CONTRACT_SOURCE`, map and processor keys, telemetry DSNs); parsed on server start.
- `lib/flags.ts` (D-11): typed flags with a default, owner and removal date. Initial flags: `bulkImport`, `recurringLoads`, `spendApprovals`, `amendments`, `sso`, `scim`, `apiKeys`, `webhooks`, `edi`, `reports`, `viewAs`, `passkeys`, `driverServiceWorker`.
- Flags gate availability, never authorisation. A flagged-off capability returns E-FORBIDDEN with "not yet available for your organisation", and the spec's status for it is still tracked in Phase 8.
- Flags past their removal date fail CI (an ESLint rule or a test in `lib/flags.test.ts`).

## 23. Caching and Revalidation

| Data | Server cache | Client cache (TanStack Query) |
| --- | --- | --- |
| Public pages (PG-01, PG-05 shell, PG-06, PG-07, PG-09) | Static or ISR; revalidate by tag on content change | — |
| Carrier profiles (PG-03) | ISR 1 h; tag `carrier:<id>` revalidated on compliance change | — |
| Authenticated reads | `no-store` (existing `backendFetch`) | `staleTime` 60 s default; freshness overrides from Phase 4 §2.6 |
| Polled reads | `no-store` | `refetchInterval` from §13; `placeholderData` keeps previous |
| Mutations | — | Invalidate by key factory; optimistic only where Phase 5 says so |
| Reference data (enums, facilities) | — | `staleTime` 10 min; invalidated by facility mutations |

Query keys always include the organisation ID as their first segment after the resource, so that a cache can never serve another tenant's data even before SSB-10 purges it.

## 24. Tenancy and Session Hygiene

- Organisation context is resolved from the session on the server; client components never pass an organisation ID to actions (SEC-5).
- Multi-role users switch role roots without re-authenticating; switching organisation is not supported (one membership per user, Phase 1 §7.4).
- View-as sessions (XS-16) use a separate cookie and query client instance; ending them restores the agent's session with a clean cache.
- Local persistence keys include the user ID and organisation ID; SSB-10 purges them.

## 25. Internationalisation Readiness

- All copy in constants grouped by feature (`lib/<feature>/constants.ts`), with ICU-style placeholders for variables and plurals, so a translation layer can wrap them without code changes (NFR-I18N-1).
- Dates, times, numbers, currency, distances and weights go through `lib/utils/date-formatter.ts`, `currency.ts` and `units.ts` with an explicit locale (default `en-US`) and time zone.
- No sentence is assembled from fragments; every sentence with variables is one template.
- `lang` is set on `<html>`; user-generated content (notes, messages) is rendered with `dir="auto"`.

## 26. Concurrency

- Mutable DTOs carry `version` (D-12). Hooks send it; `withAction` maps 412 to E-PRECONDITION.
- IC-67 resolves conflicts in the UI; hooks expose `{ conflict, latest }` for it.
- Idempotency keys (`nanoid`) on every money-committing and state-transition mutation; retries reuse the key.
- Queue claims (IC-47) use the same version mechanism.

## 27. Analytics Event Catalogue

Events follow `<domain>.<object>.<verb>` and carry only IDs, enums, counts and durations (NFR-PRIV-3). The catalogue lives in `lib/constants.ts` as a typed map, so an unknown event name fails type-checking. Each KPI's source events:

| KPI | Events |
| --- | --- |
| KPI-01 Quote-to-post | `load.quote.requested`, `load.posted` |
| KPI-02 Time to coverage | `load.posted`, `load.booked` |
| KPI-03 Self-serve booking | `load.booked` (property `actorType`) |
| KPI-04 On-time | `stop.arrived`, `stop.departed` (server) |
| KPI-05 Tracking compliance | `position.received` (server aggregate) |
| KPI-06 POD to verified | `pod.captured`, `pod.verified` |
| KPI-07 Days to pay | `settlement.paid` |
| KPI-08 Carrier repeat booking | `load.booked` (property `carrierId`) |
| KPI-10 Operations touches | `exception.resolved`, operations `actorType` on any mutation |
| KPI-11 Disputed invoices | `invoice.disputed`, `invoice.issued` |
| KPI-12 Task success | Research tooling, not product events |
| Enterprise adoption | `load.import.confirmed`, `approval.decided`, `security.sso.enforced`, `integration.key.created` |

Every page's events are named in its Phase 4 implementation notes; any event not in this catalogue must be added here first.

## 28. Error Taxonomy Implementation

- `lib/utils/action-result.ts` maps HTTP status and parse failures to the classes in Phase 4 §2.2 and returns `{ class, messageKey, retryAfter?, correlationId? }`.
- `errorCopy` in `lib/constants.ts` holds one message per class; sections add a context phrase from their feature constants.
- The Query client's `retry` function implements the automatic-retry column of Phase 4 §2.2: reads only, E-SERVER and E-UNAVAILABLE, with the stated delays; never for mutations without idempotency keys.
- `components/common/section-state.tsx` renders LS, E and EM classes consistently for every section.

---

Previous: [Phase 6 — Interaction Contracts](./phase-6-interaction-contracts.md) · Next: [Phase 8 — Implementation Roadmap](./phase-8-implementation-roadmap.md)
