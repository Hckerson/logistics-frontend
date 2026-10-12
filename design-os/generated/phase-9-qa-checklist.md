# Phase 9 — Quality Assurance Checklist

`Haulr Design OS` · `Version 1.3.6` · `2026-10-12` · Previous: [Phase 8 — Implementation Roadmap](./phase-8-implementation-roadmap.md) · Next: [START_HERE](./START_HERE.md)

A review of the whole system. Each item is a check that must pass before a feature moves from **Built** to **Verified** in [Phase 8 §9](./phase-8-implementation-roadmap.md#9-per-feature-build-status). QA here is functional. Visual quality is judged when each page is built, with the owner.

**Columns.** `Ref` cites the design OS source. `Method`: **Auto** (automated test; Vitest and fast-check are installed, Vitest Browser Mode for components and Playwright with axe end to end are approved but not yet installed, per [Phase 7 §15](./phase-7-frontend-architecture.md#15-shared-libraries)), **Manual** (tester), **AT** (assistive technology pass), **Review** (code review), **Tool** (Lighthouse; ESLint; `pnpm contract:check`; axe, proposed in Phase 7 §15). `Block` = blocks Verified status when failing.

## Table of Contents

1. [Accessibility](#1-accessibility) — QA-001 … QA-025, QA-268
2. [WCAG 2.2 AA Compliance](#2-wcag-22-aa-compliance) — QA-026 … QA-050, QA-267
3. [Behavioural Consistency](#3-behavioural-consistency) — QA-051 … QA-066
4. [Responsiveness](#4-responsiveness) — QA-067 … QA-078
5. [Scalability](#5-scalability) — QA-079 … QA-088
6. [Performance](#6-performance) — QA-089 … QA-103
7. [State Coverage](#7-state-coverage) — QA-104 … QA-123
8. [Error Handling](#8-error-handling) — QA-124 … QA-138
9. [Loading Behavior](#9-loading-behavior) — QA-139 … QA-148
10. [Frontend Readiness](#10-frontend-readiness) — QA-149 … QA-163
11. [Developer Experience](#11-developer-experience) — QA-164 … QA-173
12. [SEO Readiness](#12-seo-readiness) — QA-174 … QA-183
13. [Maintainability](#13-maintainability) — QA-184 … QA-193
14. [Cross-Browser Compatibility](#14-cross-browser-compatibility) — QA-194 … QA-201
15. [Business Rules and Security](#15-business-rules-and-security) — QA-202 … QA-216, QA-269, QA-270
16. [Enterprise, Compliance and Operations](#16-enterprise-compliance-and-operations) — QA-217 … QA-266
17. [Sign-off](#17-sign-off)

---

## 1. Accessibility

| ID | Check | Ref | Method | Block |
| --- | --- | --- | --- | --- |
| QA-001 | Every task in Phase 4 "Primary tasks" can be completed with keyboard only | PP-08 | Manual | Yes |
| QA-002 | Every task can be completed with NVDA + Firefox | PP-08 | AT | Yes |
| QA-003 | Every task can be completed with VoiceOver + Safari iOS | PP-08 | AT | Yes |
| QA-004 | Every task on PG-26, PG-33, PG-40, PG-02 can be completed without the map | IC-30, SH-02 | Manual | Yes |
| QA-005 | Focus moves to the main heading after route change | SSB-6 | Auto | Yes |
| QA-006 | Focus stays on or returns to the triggering element after mutations and dialogs | SSB-6, IC-41 | Auto | Yes |
| QA-007 | Every outcome of a mutation is announced through the live region | SSB-5, IC-14 | Auto | Yes |
| QA-008 | Only one live region announces at a time; no duplicate announcements | IC-14 | Manual | No |
| QA-009 | Loading states are announced only after 1 s | SSB-1 | Auto | No |
| QA-010 | Every form error summary receives focus and links to fields | IC-02 | Auto | Yes |
| QA-011 | Every combobox follows the WAI-ARIA combobox pattern | IC-05, IC-06, IC-50 | Auto | Yes |
| QA-012 | Every dialog traps focus, is labelled and restores focus on close | IC-41 | Auto | Yes |
| QA-013 | Every reorder is possible without dragging and announces position | IC-40 | Auto | Yes |
| QA-014 | Every chart has a data-table equivalent and text summary | IC-45 | Review | Yes |
| QA-015 | Countdown timers announce only at thresholds | IC-46 | Auto | No |
| QA-016 | Status is never conveyed by colour alone | G-3, IC-59 | Review | Yes |
| QA-017 | Disabled actions expose their reason | G-5 | Auto | No |
| QA-018 | Industry terms have an accessible explanation available | IC-56, PP-07 | Review | No |
| QA-019 | Driver workflow targets meet 44 × 44 CSS px | G-2 | Tool | Yes |
| QA-020 | Camera capture relies on native file input with capture | IC-25 | Review | Yes |
| QA-021 | Payment processor entry passes an axe scan (approved, Phase 7 §15) and a keyboard pass | IC-42 | Tool | Yes |
| QA-022 | Keyboard shortcuts can be turned off or are scoped to focus | IC-49 | Manual | Yes |
| QA-023 | Skip link present on every page and moves focus to the main landmark | IC-52 | Auto | Yes |
| QA-024 | Session timeout warns 2 minutes ahead and allows extension | IC-54 | Auto | Yes |
| QA-025 | Every page has exactly one level-one heading and a logical heading outline | SSB-6 | Tool | No |
| QA-268 | Every dispatch board action (open an entry, move a load, fill a window, mark a truck unavailable) works by keyboard alone and without dragging, and each move announces its start, target and result | IC-68, 2.5.7 | Auto | Yes |

## 2. WCAG 2.2 AA Compliance

| ID | Check | WCAG | Method | Block |
| --- | --- | --- | --- | --- |
| QA-026 | Non-text content has text alternatives | 1.1.1 | Tool | Yes |
| QA-027 | Info and relationships are programmatic (tables, lists, fieldsets) | 1.3.1 | Tool | Yes |
| QA-028 | Meaningful sequence preserved in the accessibility tree | 1.3.2 | AT | Yes |
| QA-029 | Input purpose tokens set for personal data | 1.3.5 | Review | Yes |
| QA-030 | Use of colour is not the only means of conveying information | 1.4.1 | Review | Yes |
| QA-031 | Text contrast meets 4.5:1 (3:1 large) | 1.4.3 | Tool | Yes |
| QA-032 | Text resizes to 200% without loss | 1.4.4 | Manual | Yes |
| QA-033 | Content reflows at 320 CSS px without two-dimensional scrolling (tables and maps excepted) | 1.4.10 | Manual | Yes |
| QA-034 | Non-text contrast meets 3:1 for controls and focus indicators | 1.4.11 | Tool | Yes |
| QA-035 | Text spacing overrides do not break content | 1.4.12 | Manual | No |
| QA-036 | Content on hover or focus is dismissible, hoverable, persistent | 1.4.13 | Manual | Yes |
| QA-037 | All functionality operable by keyboard | 2.1.1 | Manual | Yes |
| QA-038 | No keyboard trap | 2.1.2 | Manual | Yes |
| QA-039 | Character key shortcuts can be turned off or remapped | 2.1.4 | Manual | Yes |
| QA-040 | Timing adjustable (quote validity re-quote, session extension) | 2.2.1 | Manual | Yes |
| QA-041 | Auto-updating content (polling) can be paused where it moves or is announced | 2.2.2 | Manual | Yes |
| QA-042 | Bypass blocks (skip link, skip map) | 2.4.1 | Auto | Yes |
| QA-043 | Page titles descriptive (`<Page> · Haulr`) | 2.4.2 | Auto | Yes |
| QA-044 | Focus order preserves meaning | 2.4.3 | AT | Yes |
| QA-045 | Link purpose clear in context | 2.4.4 | Review | Yes |
| QA-046 | Focus visible and not obscured | 2.4.7, 2.4.11 | Manual | Yes |
| QA-047 | Dragging movements have single-pointer alternatives | 2.5.7 | Manual | Yes |
| QA-048 | Target size minimum 24 × 24 | 2.5.8 | Tool | Yes |
| QA-049 | Error identification, suggestion and prevention for money and legal steps | 3.3.1, 3.3.3, 3.3.4 | Manual | Yes |
| QA-050 | Redundant entry avoided; accessible authentication (paste and password managers allowed) | 3.3.7, 3.3.8 | Manual | Yes |
| QA-267 | Help routes repeated across pages (PG-06, PG-08 with context; Phase 3 §8) keep the same order relative to other page content | 3.2.6 | Manual | Yes |

## 3. Behavioural Consistency

| ID | Check | Ref | Method | Block |
| --- | --- | --- | --- | --- |
| QA-051 | Every irreversible action uses IC-12 with a consequence statement | PP-05 | Review | Yes |
| QA-052 | Every money commitment states amount, fees and method before confirmation | PP-01, IC-43 | Manual | Yes |
| QA-053 | Every live value states its source and age | PP-03 | Manual | Yes |
| QA-054 | Status labels are identical for the same state across pages | IC-59 | Auto | Yes |
| QA-055 | Action labels are verb-first and specific; no "Submit" or "OK" | Phase 3 §7 | Review | No |
| QA-056 | Filters use the same parameter names on every page | Phase 3 §10 | Auto | Yes |
| QA-057 | Filters, sort, view and cursor survive open-record-and-return | IC-20 | Auto | Yes |
| QA-058 | Reference numbers link to their record everywhere | IA-P1 | Review | No |
| QA-059 | Multi-party flows state whose turn it is and by when | Phase 2 §7 | Manual | Yes |
| QA-060 | Offered load actions match the (role, state) mapping everywhere | SC-40.2 | Auto | Yes |
| QA-061 | Empty states distinguish "none at all" from "none matching" | SH-05 | Manual | No |
| QA-062 | Draft persistence works the same in every multi-step flow | SH-13, PP-06 | Auto | Yes |
| QA-063 | Retry behaviour is identical across sections | IC-60 | Review | No |
| QA-064 | Pagination behaves identically across collections | IC-21 | Auto | No |
| QA-065 | Time zones for appointments are always the facility's | IC-08 | Auto | Yes |
| QA-066 | Every notification routes to its subject | XS-03 | Auto | Yes |

## 4. Responsiveness

Behavioural responsiveness only: every device need in Phase 4 is achievable. Visual layout is judged at build time.

| ID | Check | Ref | Method | Block |
| --- | --- | --- | --- | --- |
| QA-067 | Every Phase 4 "Device needs" statement is achievable on the named device | Phase 4 | Manual | Yes |
| QA-068 | PG-39 completes a full trip one-handed on a 360 px wide phone | PG-39 | Manual | Yes |
| QA-069 | PG-33 search, compare and book complete on a phone | PG-33, PG-34 | Manual | Yes |
| QA-070 | PG-11 carrier registration completes on a phone | PG-11 | Manual | Yes |
| QA-071 | PG-17 document capture completes on a phone | SC-17.4 | Manual | Yes |
| QA-072 | PG-28 single bid acceptance completes from a phone notification | PG-28 | Manual | No |
| QA-073 | Tabular collections provide an equivalent on narrow viewports | IC-22 | Manual | Yes |
| QA-074 | On-screen keyboard never hides the focused entry | SH-13 | Manual | Yes |
| QA-075 | Orientation is not locked | WCAG 1.3.4 | Manual | Yes |
| QA-076 | Touch and pointer both work on hybrid devices | IC-30, IC-40 | Manual | No |
| QA-077 | Desktop keyboard entry of a load completes without pointer | PG-27 | Manual | Yes |
| QA-078 | Web Share is used on phones where available, copy elsewhere | IC-44 | Manual | No |

## 5. Scalability

| ID | Check | Ref | Method | Block |
| --- | --- | --- | --- | --- |
| QA-079 | No collection fetches unbounded data; all use cursor pagination | IC-21 | Review | Yes |
| QA-080 | Collections of 10,000+ records remain responsive with filters | SH-05 | Manual | Yes |
| QA-081 | Map with 500 in-transit loads stays interactive | SC-26.2 | Manual | No |
| QA-082 | Positions subscribed only for loads in view | SH-02 | Review | Yes |
| QA-083 | Polling pauses when the tab is hidden | Phase 7 §13 | Auto | Yes |
| QA-084 | Totals come from the server, never summed client-side | Phase 7 §18 | Review | Yes |
| QA-085 | Search queries hit the index endpoints, not collection scans | Phase 3 §9 | Review | Yes |
| QA-086 | Query keys include every parameter (no cache collisions) | Phase 7 §8 | Auto | Yes |
| QA-087 | Thread with 1,000 messages loads latest page only | SH-04 | Manual | No |
| QA-088 | Timeline with 500 events paginates | SH-01 | Manual | No |

## 6. Performance

| ID | Check | Ref | Method | Block |
| --- | --- | --- | --- | --- |
| QA-089 | LCP ≤ 2.5 s p75 on every page (PG-01 ≤ 2.0 s) | Phase 7 §18 | Tool | Yes |
| QA-090 | INP ≤ 200 ms p75 | Phase 7 §18 | Tool | Yes |
| QA-091 | CLS ≤ 0.1 | Phase 7 §18 | Tool | Yes |
| QA-092 | Initial JS per route within budget (public 170 KB, workspace 250 KB, driver 150 KB) | Phase 7 §18 | Tool | Yes |
| QA-093 | Map library loads only on pages that use it | Phase 7 §17 | Tool | Yes |
| QA-094 | Chart library loads only on pages that use it | Phase 7 §17 | Tool | Yes |
| QA-095 | Processor SDK loads only on payment pages | Phase 7 §17 | Tool | Yes |
| QA-096 | Server components prefetch initial data; no client waterfall on load | Phase 7 §8 | Review | Yes |
| QA-097 | Sections stream independently | SSB-1 | Manual | Yes |
| QA-098 | Images use Next.js Image with correct sizing | Phase 7 §14 | Review | Yes |
| QA-099 | Fonts load through `next/font` without layout shift | Phase 7 §14 | Tool | No |
| QA-100 | Public pages are static or ISR as specified | Phase 3 §3.1 | Review | Yes |
| QA-101 | POD images are downscaled before upload | IC-25 | Auto | No |
| QA-102 | Debounced inputs never fire more than once per settle | IC-05, IC-19 | Auto | No |
| QA-103 | No polled read runs through a Server Action (D-2) | Phase 7 §1 | Review | Yes |

## 7. State Coverage

| ID | Check | Ref | Method | Block |
| --- | --- | --- | --- | --- |
| QA-104 | Every page implements its Phase 4 loading state | Phase 4 | Manual | Yes |
| QA-105 | Every page implements its Phase 4 empty state | Phase 4 | Manual | Yes |
| QA-106 | Every page implements its Phase 4 error state | Phase 4 | Manual | Yes |
| QA-107 | Every page implements its Phase 4 success state | Phase 4 | Manual | Yes |
| QA-108 | Every section implements its Phase 5 loading, empty and error states | Phase 5 | Manual | Yes |
| QA-109 | Every contract implements every state it lists | Phase 6 | Auto | Yes |
| QA-110 | Every load state in Phase 2 §5 renders correctly on PG-40 for every role | BR-01 | Auto | Yes |
| QA-111 | Every bid state in Phase 2 §6 renders correctly on PG-28 and PG-40 | BR-02 | Auto | Yes |
| QA-112 | Every illegal transition is absent from the offered actions | Phase 2 §5 | Auto | Yes |
| QA-113 | Offline state handled on PG-20 and PG-39 | SSB-4 | Manual | Yes |
| QA-114 | Stale tracking state handled with last known position and age | SH-02 | Manual | Yes |
| QA-115 | Expired tracking link state on PG-02 | BR-21 | Auto | Yes |
| QA-116 | Expired quote state on PG-27 with re-quote keeping entries | BR-06 | Auto | Yes |
| QA-117 | Ineligible carrier state on PG-33 and PG-34 | BR-03 | Auto | Yes |
| QA-118 | Onboarding-incomplete redirects per Phase 3 §14 | Phase 3 §14 | Auto | Yes |
| QA-119 | Compliance hold state on carrier pages | SH-06 | Manual | Yes |
| QA-120 | Partial batch payment state on PG-30 | SC-30.3 | Auto | Yes |
| QA-121 | Undo window for stop events | IC-29 | Auto | Yes |
| QA-122 | Claim window closed state | BR-17 | Auto | No |
| QA-123 | New-organisation guidance appears and disappears correctly | SH-12 | Manual | No |

## 8. Error Handling

| ID | Check | Ref | Method | Block |
| --- | --- | --- | --- | --- |
| QA-124 | A failing section never takes down its page | SSB-3 | Auto | Yes |
| QA-125 | 401 redirects to sign-in with a validated return path | Phase 3 §14 | Auto | Yes |
| QA-126 | 403/404 on a record renders PG-53 without confirming existence | Phase 3 §5.2 | Auto | Yes |
| QA-127 | 409 on booking renders "load taken" and similar loads | IC-27 | Auto | Yes |
| QA-128 | 409 on a state transition refreshes and explains the new state | SC-40.2 | Auto | Yes |
| QA-129 | 429 explains the wait | Phase 4 §2.2, Phase 7 §28 | Auto | No |
| QA-130 | 5xx offers retry; after 3 failures, a support route with context | IC-60 | Auto | Yes |
| QA-131 | Error messages come from constants; no raw server text is shown | SSB-3 | Review | Yes |
| QA-132 | Form entries are never lost on error | IC-02 | Auto | Yes |
| QA-133 | Failed messages remain with retry | SH-04 | Auto | Yes |
| QA-134 | Failed uploads are retryable per file | IC-24 | Auto | Yes |
| QA-135 | Offline queue replays in order and de-duplicates | Phase 7 §13 | Auto | Yes |
| QA-136 | Map failure falls back to the text equivalent | IC-30 | Auto | Yes |
| QA-137 | Processor errors map to plain messages | IC-42 | Manual | Yes |
| QA-138 | Segment `error.tsx` exists for every data-bearing route | Phase 7 §3 | Review | Yes |

## 9. Loading Behavior

| ID | Check | Ref | Method | Block |
| --- | --- | --- | --- | --- |
| QA-139 | Every data-bearing segment has `loading.tsx` | Phase 7 §3 | Review | Yes |
| QA-140 | Refetches keep previous data visible (placeholder data) | SSB-2 | Auto | Yes |
| QA-141 | Pending actions block duplicate activation | G-6 | Auto | Yes |
| QA-142 | Optimistic updates roll back on failure with announcement | IC-33, IC-36 | Auto | Yes |
| QA-143 | Polling intervals match Phase 7 §13 constants | Phase 7 §13 | Review | No |
| QA-144 | New bids and messages arrive without moving focus | SC-28.2, SH-04 | Manual | Yes |
| QA-145 | Map updates do not reset zoom or pan | IC-30 | Manual | No |
| QA-146 | Driver trip renders from cache before network | PG-39 | Auto | Yes |
| QA-147 | Upload progress is exposed per file | IC-24 | Auto | No |
| QA-148 | Route transitions never render a blank page | SSB-1 | Manual | Yes |

## 10. Frontend Readiness

| ID | Check | Ref | Method | Block |
| --- | --- | --- | --- | --- |
| QA-149 | Every page file exists at its Phase 7 §3 path | Phase 7 §3 | Auto | Yes |
| QA-150 | `page.tsx` files compose only (ESLint `page-composes-only`) | Phase 7 §20 | Tool | Yes |
| QA-151 | Components never call transport directly (ESLint `api-access-boundary`) | Phase 7 §20 | Tool | Yes |
| QA-152 | Every hook listed in Phase 7 §8 exists with its named exports | Phase 7 §8 | Auto | Yes |
| QA-153 | Every Server Action follows the `create-user.ts` pattern and returns `ActionResult` | Phase 7 §11 | Review | Yes |
| QA-154 | Every Route Handler re-verifies session and role | Phase 7 §19 | Review | Yes |
| QA-155 | Enums derive from the generated contract | Phase 7 §10 | Review | Yes |
| QA-156 | `PROTECTED_ROUTE_PREFIXES` covers every workspace and internal prefix | D-7 | Auto | Yes |
| QA-157 | Internal prefixes reject non-internal roles at the edge | D-7 | Auto | Yes |
| QA-158 | `appRoutes` used for every internal path (ESLint rule proposed in Phase 7 §20) | IC-51, Phase 7 §20 | Tool | Yes |
| QA-159 | Idempotency keys generated with `nanoid` for book, accept, pay, quick pay | Phase 7 §19 | Review | Yes |
| QA-160 | Mock handlers live only in `lib/mocks/`, registered under contract routes, with fixtures in `lib/data/mocks/` | Phase 7 §11 | Review | Yes |
| QA-161 | Every shared section in Phase 5 has one implementation in `components/common/` | Phase 7 §12 | Review | Yes |
| QA-162 | Every Phase 6 contract has one implementation in `components/ui/` or is native | Phase 7 §12 | Review | Yes |
| QA-163 | Library additions match approved Phase 7 §15 entries only | Phase 7 §15 | Review | Yes |

## 11. Developer Experience

| ID | Check | Ref | Method | Block |
| --- | --- | --- | --- | --- |
| QA-164 | `pnpm type-check` passes | Host | Tool | Yes |
| QA-165 | `pnpm lint` passes with no disabled rules added | Host | Tool | Yes |
| QA-166 | `pnpm test` passes | Host | Tool | Yes |
| QA-167 | `pnpm contract:check` passes | Host | Tool | Yes |
| QA-168 | New ESLint rules have colocated tests | Phase 7 §20 | Review | Yes |
| QA-169 | Query key factories exported and used for invalidation | Phase 7 §8 | Review | No |
| QA-170 | PR titles cite design OS IDs | Phase 7 §16 | Review | No |
| QA-171 | Phase 8 §9 status updated in the same PR | Phase 8 §7 | Review | Yes |
| QA-172 | Local development works with mocks on and no backend; setting `NEXT_PUBLIC_API_MOCKS=off` changes nothing else | Phase 7 §11 | Manual | No |
| QA-173 | SETUP-CHECKLIST steps reproduce a working environment | SETUP-CHECKLIST | Manual | No |

## 12. SEO Readiness

| ID | Check | Ref | Method | Block |
| --- | --- | --- | --- | --- |
| QA-174 | `sitemap.ts` lists exactly the indexable tiers | Phase 3 §11 | Auto | Yes |
| QA-175 | `robots.ts` blocks workspace, internal and tracking routes | Phase 3 §11 | Auto | Yes |
| QA-176 | PG-02 sends `noindex, nofollow` | Phase 3 §11 | Auto | Yes |
| QA-177 | Every indexable page has unique title and description from constants | SSB-7 | Auto | Yes |
| QA-178 | Canonical URLs set per Phase 3 §11 | Phase 3 §11 | Auto | Yes |
| QA-179 | Structured data validates (Organization, WebSite, FAQPage/Article, BreadcrumbList, WebApplication) | Phase 3 §11 | Tool | No |
| QA-180 | AggregateRating only when ≥ 5 ratings | PG-03 | Auto | Yes |
| QA-181 | Unapproved carriers return 404, not indexable pages | PG-03 | Auto | Yes |
| QA-182 | Public pages render meaningful HTML without JavaScript | Master prompt › Functional Standards (progressive enhancement) | Manual | Yes |
| QA-183 | Open Graph metadata present on public pages | Phase 3 §11 | Auto | No |

## 13. Maintainability

| ID | Check | Ref | Method | Block |
| --- | --- | --- | --- | --- |
| QA-184 | No file exceeds ~150 lines | Host | Tool | Yes |
| QA-185 | One component per file, kebab-case matching export | Host | Tool | Yes |
| QA-186 | Shared domain types live in `lib/types/` and are re-exported | Host | Tool | Yes |
| QA-187 | No inline copy repeated twice; copy in constants | Host rule 1 | Review | Yes |
| QA-188 | No `console.*` or debug statements | Host rule 5 | Tool | Yes |
| QA-189 | No deep-relative imports | Host | Tool | Yes |
| QA-190 | `lib/contract/` untouched by hand | Host | Tool | Yes |
| QA-191 | Validations compose over contract schemas instead of restating them | Host | Review | Yes |
| QA-192 | Deviations from Phases 1–7 recorded as decisions | Phase 8 §7 | Review | Yes |
| QA-193 | No specified feature removed without a maintainer instruction naming it | Scope Preservation | Review | Yes |

## 14. Cross-Browser Compatibility

| ID | Check | Ref | Method | Block |
| --- | --- | --- | --- | --- |
| QA-194 | Core flows pass on current and previous Chrome | Phase 1 §12 | Auto | Yes |
| QA-195 | Core flows pass on current and previous Edge | Phase 1 §12 | Auto | Yes |
| QA-196 | Core flows pass on current and previous Firefox | Phase 1 §12 | Auto | Yes |
| QA-197 | Core flows pass on current and previous Safari (macOS) | Phase 1 §12 | Auto | Yes |
| QA-198 | Driver and carrier flows pass on Safari iOS 16+ | Phase 1 §12 | Manual | Yes |
| QA-199 | Driver and carrier flows pass on Chrome Android 10+ | Phase 1 §12 | Manual | Yes |
| QA-200 | Camera capture, geolocation, Web Share and IndexedDB degrade gracefully where unsupported | IC-25, IC-44, Phase 7 §13 | Manual | Yes |
| QA-201 | Native `dialog` behaviour consistent across the matrix | IC-41 | Auto | Yes |

## 15. Business Rules and Security

| ID | Check | Ref | Method | Block |
| --- | --- | --- | --- | --- |
| QA-202 | Shippers never receive carrier pay in any response; carriers never receive shipper price | BR-05 | Auto | Yes |
| QA-203 | Public tracking payload contains no rates, contacts or documents | BR-21 | Auto | Yes |
| QA-204 | Quote honoured for 30 minutes only for its lane, equipment and dates | BR-06 | Auto | Yes |
| QA-205 | Ineligible carriers cannot book or bid, even by direct request | BR-03 | Auto | Yes |
| QA-206 | Rate confirmation acceptance records user, time, IP and version | BR-04 | Auto | Yes |
| QA-207 | Accepting a bid expires all other open bids | BR-02 | Auto | Yes |
| QA-208 | Tender waterfall respects exclusive windows | BR-08 | Auto | Yes |
| QA-209 | Detention accrual starts after free time from recorded arrival | BR-11 | Auto | Yes |
| QA-210 | Disputes hold only the disputed amount | BR-16 | Auto | Yes |
| QA-211 | Driver location collected only for active assigned trips with consent | Phase 1 §12 | Manual | Yes |
| QA-212 | Sensitive changes require re-authentication within 10 minutes | XS-11, IC-13 | Auto | Yes |
| QA-213 | No raw payment data in Haulr code, logs or network calls to Haulr | A6 | Review | Yes |
| QA-214 | Return paths cannot redirect off-site | Phase 3 §14, Phase 7 §19 | Auto | Yes |
| QA-215 | Rate limits enforced on anonymous endpoints | Phase 8 §10 | Auto | Yes |
| QA-216 | CSP blocks non-allow-listed origins | Phase 7 §19 | Tool | Yes |
| QA-269 | A custom quote request is answered or escalated by its BR-31 deadline; a price below the margin floor is refused; carrier pay never reaches the shipper | BR-31, BR-05 | Auto | Yes |
| QA-270 | The dispatch board shows ELD hours exactly as reported and only to the carrier's own users: no hours warning, override or stored hours decision exists, and no analytics, audit or error payload carries hours values | XF-17, SC-65.2, CMP-12, NFR-PRIV-3 | Auto | Yes |

## 16. Enterprise, Compliance and Operations

| ID | Check | Ref | Method | Block |
| --- | --- | --- | --- | --- |
| QA-217 | SAML and OIDC sign-in succeed with Okta, Entra ID, Google Workspace and OneLogin test tenants | SEC-2, R-13 | Manual | Yes |
| QA-218 | Enforced SSO disables password sign-in for members except the break-glass admin | BR-24 | Auto | Yes |
| QA-219 | SCIM create, update and deactivate reflect within 5 minutes; deactivation ends all sessions | BR-24 | Auto | Yes |
| QA-220 | SSO enforcement is refused without a passing test sign-in in the last 24 h | SC-60.4 | Auto | Yes |
| QA-221 | SSO discovery responses are indistinguishable for unknown and password-only domains | SC-10.3, SEC-10 | Auto | Yes |
| QA-222 | Idle timeout follows organisation policy and warns 2 minutes ahead | BR-24, IC-54 | Auto | Yes |
| QA-223 | IP allow-list refuses admin access from other addresses and cannot lock out the configuring admin | SC-60.4 | Auto | Yes |
| QA-224 | Actions above a member's spend limit enter `PendingApproval` via UI, bulk import, API and EDI | BR-23, Phase 2 §7 | Auto | Yes |
| QA-225 | Approvers cannot approve their own requests, including admins | BR-23, IC-62 | Auto | Yes |
| QA-226 | Approval of a still-valid request completes the original action within 5 s | PG-58 | Auto | Yes |
| QA-227 | Approval after quote or bid expiry is refused and the requester is prompted to re-quote | XF-16 | Auto | Yes |
| QA-228 | Amendments bind only after carrier acceptance with signature evidence; previous versions remain retrievable | BR-25, CMP-3, CMP-4 | Auto | Yes |
| QA-229 | Amendments cannot change completed stops; one open amendment per load | Phase 2 §5.1 | Auto | Yes |
| QA-230 | Lapsed amendments raise an operations exception | XF-15 | Auto | Yes |
| QA-231 | Bulk import of 500 rows validates and prices within 60 s; nothing posts before confirmation | BR-28, NFR-CAP-3 | Auto | Yes |
| QA-232 | Every imported row has exactly one outcome in the results file | IC-61 | Auto | Yes |
| QA-233 | Recurrence occurrences above the guardrail become drafts and notify the owner | SC-57.3 | Auto | No |
| QA-234 | API key secrets are shown once and never appear in storage, logs, analytics or query cache | IC-63, SEC-8 | Review | Yes |
| QA-235 | Revoked API keys fail within 60 s; rotation overlap ends at the chosen time | BR-29 | Auto | Yes |
| QA-236 | Webhooks are signed, retried for 24 h, and refused for non-HTTPS or private addresses | BR-29, SC-61.2 | Auto | Yes |
| QA-237 | Every mutation produces an audit event visible to the organisation within 60 s with actor type | BR-26, SSB-9 | Auto | Yes |
| QA-238 | No role, including `internal.admin`, can edit or delete audit events | BR-26 | Auto | Yes |
| QA-239 | Audit and data exports include manifests with row counts and checksums, and are themselves audited | IC-65 | Auto | Yes |
| QA-240 | Export download links require a session and expire after 24 h | IC-65 | Auto | Yes |
| QA-241 | Privacy requests are acknowledged within 7 days and fulfilled within 45; outcome reports state retained data and legal basis | BR-30, CMP-7 | Manual | Yes |
| QA-242 | View-as requires a linked ticket, is read-only without consent, never writes payout, security, key or export settings, and ends at 60 minutes | BR-27 | Auto | Yes |
| QA-243 | View-as actions appear in the organisation audit log attributed to the staff member | BR-27, XS-17 | Auto | Yes |
| QA-244 | View-as state is announced on every page and cannot be dismissed | IC-64 | AT | Yes |
| QA-245 | Every resource returns not found across tenants for read, list and mutate | SEC-5, R-14 | Auto | Yes |
| QA-246 | Query cache, drafts and offline queue are purged on sign-out, view-as start and end, and deprovisioning | SSB-10 | Auto | Yes |
| QA-247 | Stale edits return E-PRECONDITION and IC-67 preserves the user's input in every path | SSB-8, IC-67 | Auto | Yes |
| QA-248 | Every page and section implements the Phase 4 §2 state classes it cites; no bare "retry" or "loading" behaviour | Phase 4 §2 | Review | Yes |
| QA-249 | Every E-SERVER and E-CONTRACT shows a correlation ID that locates the trace | NFR-OBS-1, Phase 7 §21 | Manual | Yes |
| QA-250 | Analytics and error payloads contain no PII (automated scan) | NFR-PRIV-3 | Tool | Yes |
| QA-251 | Only catalogued analytics events are emitted; every KPI's source events arrive in staging | Phase 7 §27 | Auto | Yes |
| QA-252 | Load test meets NFR-CAP-1 … 3 and NFR-PERF-3 … 5 at 1.5× peak | NFR-CAP, NFR-PERF | Tool | Yes |
| QA-253 | Each dependency failure degrades only its capability, with E-UNAVAILABLE messaging | NFR-AV-4, OPS-4 | Manual | Yes |
| QA-254 | Restore drill meets RPO ≤ 5 min and RTO ≤ 1 h | NFR-AV-5 | Manual | Yes |
| QA-255 | Offline stop events queued up to 7 days replay without loss | NFR-AV-6 | Auto | Yes |
| QA-256 | No open critical or high findings from DAST or penetration test | SEC-7, SEC-9 | Tool | Yes |
| QA-257 | Security headers (CSP nonces, HSTS, frame-ancestors, Permissions-Policy) present on every route | Phase 7 §19 | Tool | Yes |
| QA-258 | Server Actions reject cross-origin requests | SEC-7 | Auto | Yes |
| QA-259 | Passwords checked against breached lists; MFA required for the roles listed in SEC-1 | SEC-1 | Auto | Yes |
| QA-260 | VPAT published and consistent with Phase 9 §1–2 results | NFR-A11Y-1 | Review | Yes |
| QA-261 | Broker MC number appears on rate confirmations, invoices and legal pages | CMP-1 | Manual | Yes |
| QA-262 | OFAC screening runs at onboarding and on payout-method change | CMP-11 | Auto | Yes |
| QA-263 | Environment validation fails the deploy on missing or malformed variables | D-9 | Auto | Yes |
| QA-264 | Expired feature flags fail CI | Phase 7 §22 | Auto | No |
| QA-265 | Copy survives 40% text expansion and pseudo-localisation without truncating meaning | NFR-I18N-1 | Manual | No |
| QA-266 | Runbooks exist and were rehearsed for every E-UNAVAILABLE dependency | OPS-4 | Review | Yes |

**Total: 270 QA items.**

## 17. Sign-off

A page moves to **Verified** when:

1. Every blocking item that applies to it passes.
2. Its Phase 5 sections and Phase 6 contracts pass their state checks (QA-104 … QA-112).
3. The owner has reviewed the rendered page (visual quality is judged there, not here).
4. [Phase 8 §9](./phase-8-implementation-roadmap.md#9-per-feature-build-status) is updated in the same PR.

Launch (M4) requires every page **Verified** and every item in §1, §2, §8, §15 and §16 passing. Enterprise readiness (M5) requires QA-217 … QA-247 passing for the enterprise track.

---

Previous: [Phase 8 — Implementation Roadmap](./phase-8-implementation-roadmap.md) · Next: [START_HERE](./START_HERE.md)
