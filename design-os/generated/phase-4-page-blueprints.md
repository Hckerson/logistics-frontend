# Phase 4 — Page Blueprints

`Haulr Design OS` · `Version 1.3.0` · `2026-10-09` · Previous: [Phase 3 — Information Architecture](./phase-3-information-architecture.md) · Next: [Phase 5 — Section Blueprints](./phase-5-section-blueprints.md)

A functional blueprint for each of the 66 pages in the [Phase 3 sitemap](./phase-3-information-architecture.md#3-sitemap). Each blueprint says what the page is for, what users come to get done, what data and permissions it needs, and what happens in every state. It never says what the page contains or how it looks; that is decided when the page is built, with the owner.

States describe what happens and what the user is told, never where it appears.

## Table of Contents

1. [Blueprint Format](#1-blueprint-format)
2. [Shared State Behaviour](#2-shared-state-behaviour)
3. [Public Pages](#3-public-pages) — PG-01 … PG-03, PG-05 … PG-09
4. [Access Pages](#4-access-pages) — PG-10 … PG-15
5. [Onboarding](#5-onboarding) — PG-16, PG-17
6. [Role Dashboards](#6-role-dashboards) — PG-18 … PG-25
7. [Shipper Workspace](#7-shipper-workspace) — PG-26 … PG-32
8. [Carrier Workspace](#8-carrier-workspace) — PG-33 … PG-38, PG-65
9. [Driver](#9-driver) — PG-39
10. [Shared Records and Utilities](#10-shared-records-and-utilities) — PG-40 … PG-49, PG-04
11. [Internal Tools](#11-internal-tools) — PG-50 … PG-52, PG-66
12. [System Pages](#12-system-pages) — PG-53 … PG-55
    - [Enterprise Pages](#12a-enterprise-pages) — PG-56 … PG-64
13. [Page-to-Experience Traceability](#13-page-to-experience-traceability)

---

## 1. Blueprint Format

Each page defines: **Purpose**, **Business objective**, **User objective**, **Primary tasks** (what the user comes to get done, in their own words), **Required data**, **Permissions**, **Device needs**, **Loading states**, **Empty states**, **Error states**, **Success states**, **Dependencies** and **Implementation notes**. Each blueprint also names its route, the experiences it serves (Phase 2) and its sections (Phase 5).

## 2. Shared State Behaviour

These rules apply to every page unless a blueprint overrides them. They are referenced as `SSB-n`.

- **SSB-1 Loading.** Server-rendered pages stream. Each independently fetched part has its own loading boundary so one slow source never blocks the rest. A loading indicator is announced to assistive technology only if loading exceeds 1 second.
- **SSB-2 Background refresh.** Refreshing cached data never clears what is already known. The page states its age when a refresh fails.
- **SSB-3 Errors.** A failed part says what failed in plain words, keeps everything else usable and offers a retry. Messages come from constants, never raw server text. A 401 redirects to PG-10 with the return path; a 403 on a record is treated as not found (Phase 3 §5.2).
- **SSB-4 Offline.** When the device goes offline the user is told once. Read-only cached data stays available. Mutations follow PP-06 where the blueprint allows it; otherwise the user is told the action needs a connection.
- **SSB-5 Success.** Every completed mutation is confirmed through a polite live announcement, and the changed data is visibly current.
- **SSB-6 Focus.** After navigation, focus moves to the page's main heading. After a mutation, focus stays on the element that triggered it unless that element no longer exists; then it moves to the result.
- **SSB-7 Metadata.** Every page sets its title from constants (`<Page> · Haulr`) through `generateMetadata`.
- **SSB-8 Concurrency.** Every edit to a mutable record carries the version the user started from. If the record changed meanwhile, the edit is refused (E-PRECONDITION), the user is told what changed and by whom, and their unsaved input is kept so it can be re-applied.
- **SSB-9 Audit.** Every mutation produces a server-side audit event (§2.7). Actions that require a reason (Phase 1 §11) cannot be submitted without one.
- **SSB-10 Tenancy.** Cached data belongs to one session and one organisation. Signing out, switching account or ending a view-as session (XS-16) purges the query cache and drafts belonging to other users. **Exception for the driver offline queue (NFR-AV-6):** queued stop events, issue reports and POD uploads are never purged silently. Sign-out with a non-empty queue first attempts replay; if still offline, the driver is told how many events are pending and may either stay signed in or sign out. Signing out keeps the queue encrypted on the device and bound to that driver, and it replays at their next sign-in for up to 7 days. Only an explicit discard, confirmed with IC-12, removes queued events.

The subsections below give every state a named class. Page and section blueprints cite these classes and add only what is specific to them, so no state is ever left as "loading", "retry" or "not applicable" without meaning.

### 2.1 Loading classes

| Class | When | Behaviour | What the user is told |
| --- | --- | --- | --- |
| **LS-1 Initial** | No data yet for this part | Server streams the part inside its own boundary; nothing else waits for it | Nothing within 1 s; after 1 s, "Loading <part name>" announced politely once |
| **LS-2 Refresh** | Data exists and is being refetched (interval, focus, filter change) | Previous data stays usable; freshness age updates on arrival | Nothing, unless the result count or state changes (then announced politely) |
| **LS-3 Slow** | LS-1 or LS-2 exceeds 5 s | Partial results stay usable; user can leave or cancel the request | "Still loading <part name>. You can keep working." once |
| **LS-4 Timeout** | Reads exceed 15 s, mutations 30 s | Request abandoned client-side; becomes E-TIMEOUT | As E-TIMEOUT |
| **LS-5 Pending action** | A mutation is in flight | Triggering element busy; duplicates blocked (G-6); optimistic update only where the section says so | Pending label from constants ("Booking…") |
| **LS-6 Cached** | Served from local cache (offline, driver) | Read-only unless the section allows queued mutations (PP-06) | Age of the cached data ("Saved 14 min ago") |
| **LS-7 Background job** | Long-running server job (export, bulk import, batch pay) | Request accepted immediately; progress polled; user may leave | "Started. We'll notify you when it's ready." plus progress when viewed |

### 2.2 Error classes

Every failure maps to exactly one class. Copy keys live in constants (`errorCopy.<class>`); pages and sections add a context phrase ("Couldn't load documents") and the recovery below.

| Class | Source | Recovery | Automatic retry | Telemetry |
| --- | --- | --- | --- | --- |
| **E-VALIDATION** | 400, 422, schema failure | Field-level messages and summary (IC-02); entries kept | Never | Count only |
| **E-AUTH** | 401 | Drafts saved, redirect to PG-10 with return path | Never | Count only |
| **E-FORBIDDEN** | 403 on a route or capability | PG-55 for routes; for an action, the reason and who can grant access | Never | Event with capability |
| **E-NOT-FOUND** | 404, or 403 on a record (Phase 3 §5.2) | PG-53 for records; "no longer available" inside a section | Never | Count only |
| **E-CONFLICT** | 409: state moved on, resource taken | Refetch, explain the new state, offer the next legal action | Never | Event with from/to state |
| **E-PRECONDITION** | 412: version mismatch (SSB-8) | Explain what changed; keep input; reload-and-reapply | Never | Event |
| **E-RATE-LIMIT** | 429 | State the wait from `Retry-After`; re-enable after it | After `Retry-After` for reads only | Event |
| **E-UNAVAILABLE** | 503, dependency or maintenance | State which capability is affected and that data shown may be stale | Reads: 2 retries at 2 s and 6 s | Event with dependency |
| **E-SERVER** | 500, other 5xx | Plain message, retry (IC-60), support reference = correlation ID | Reads: 2 retries at 1 s and 3 s | Error report with correlation ID |
| **E-TIMEOUT** | LS-4 | Retry; after 3 manual failures, support route with context | As E-SERVER | Event with duration |
| **E-OFFLINE** | No connectivity | SSB-4; queued where allowed, else "needs a connection" | On reconnect | Count only |
| **E-CONTRACT** | Response fails its contract schema | Treated as E-SERVER for the user; never partially rendered | Never | Error report with schema path |

Mutations never retry automatically unless they carry an idempotency key, and then only for E-TIMEOUT, E-UNAVAILABLE and E-OFFLINE.

### 2.3 Empty classes

| Class | Meaning | What the user is told |
| --- | --- | --- |
| **EM-1 None yet** | Nothing has ever existed here for this organisation or user | Why the area matters and the single next step that fills it |
| **EM-2 No match** | Records exist but none match the current criteria | Active criteria count and a way to clear or widen them |
| **EM-3 Cleared** | Work queue or inbox emptied by the user's work | That it is clear and when it was last checked |
| **EM-4 Not yet available** | Depends on a later lifecycle event (for example POD before delivery) | Which event makes it available and, when known, when |
| **EM-5 Not applicable** | The part cannot be empty by construction (it only renders with data) | Nothing; the blueprint states the reason it cannot be empty |

### 2.4 Success classes

| Class | Meaning | Behaviour |
| --- | --- | --- |
| **SU-1 In place** | The change is complete and the user stays | Polite announcement (IC-14); changed data current; focus per SSB-6 |
| **SU-2 Navigate to result** | The outcome lives elsewhere (posted load, filed claim) | Navigate to the result; its main heading announces the outcome |
| **SU-3 Accepted for processing** | Asynchronous job (LS-7) | Reference returned; notification on completion (XS-03) |

### 2.5 Device contexts

Device needs are written against these contexts, which describe how people use the product rather than screen sizes.

| Context | Description |
| --- | --- |
| **DV-DESK** | Desk work: keyboard and pointer, many tabs, high data volumes, long sessions |
| **DV-PHONE** | Phone on the move: one hand, short sessions, notifications as entry points, variable network |
| **DV-CAB** | Driver or dock: gloves, glare, noise, intermittent signal, seconds of attention, device mounted or handheld |
| **DV-WALL** | Shared operations screen: unattended, long-running, auto-refreshing, read at a distance by several people |
| **DV-AT** | Assistive technology in any of the other contexts (screen reader, switch, voice control, magnification) |

Every task a page supports on DV-DESK must also be possible on DV-AT. DV-PHONE and DV-CAB support the subset each blueprint names.

### 2.6 Freshness and staleness

| Data | Fresh while | Stale label after | Source |
| --- | --- | --- | --- |
| Vehicle position | ≤ 60 min | 60 min (exception at 90 min, BR-10) | Tracking source |
| ETA | Recomputed on each position | With its position | ETA service |
| Bids, tenders | ≤ 30 s | 60 s | Poll |
| Exception queue | ≤ 15 s | 60 s | Poll |
| Dashboards, counts | ≤ 60 s | 5 min | Poll and focus |
| Fleet plan (PG-65) | ≤ 60 s | 5 min | Poll and focus |
| Quote requests (PG-66, SC-27.7) | ≤ 30 s | 2 min | Poll |
| Recommended loads | ≤ 5 min | 15 min | Poll |
| Documents, invoices, settlements | On open | Not labelled; refetched on focus | Request |

### 2.7 Audit and analytics events

- **Audit (server-side, immutable, BR-26).** Actor user, organisation, role, view-as origin (XS-16), action, target type and ID, before and after values for changed fields, reason where required, correlation ID, IP and user agent, time. The frontend supplies the reason and correlation ID; it never writes audit records itself.
- **Analytics (client and server).** Names follow `<domain>.<object>.<verb>` (for example `load.quote.requested`, `load.posted`, `bid.accepted`). Properties are IDs, enums, counts and durations; never names, emails, phone numbers, free text or precise locations (NFR-PRIV-3). The naming convention and the catalogue of every event are in Phase 7 §27; every KPI in Phase 1 §10 names its source events there.
- **Correlation.** Every request carries an `x-request-id` created at the edge; it is returned to the user as the support reference for E-SERVER and E-CONTRACT.

### 2.8 Irreversible, sensitive and bulk actions

- **Irreversible** (book, cancel, pay, reject, delete, revoke): IC-12, consequence stated, confirm label repeats the action.
- **Sensitive** (security policy, payout method, roles, API keys, data export): re-authentication within 10 minutes (IC-13), notification to organisation admins, audit with reason.
- **Bulk** (any action on more than one record): scope and totals stated before running (IC-23); per-record outcome; background job (LS-7) above 100 records.

---

## 3. Public Pages

### PG-01 — Home

`/` · Serves XS-10, XS-01 · Sections: [SC-01.x](./phase-5-section-blueprints.md#pg-01--home)

- **Purpose:** Explain what Haulr does for shippers and carriers and move each visitor into the journey that fits them.
- **Business objective:** Acquisition; qualified registrations on both sides of the marketplace (BG-01, BG-05).
- **User objective:** Understand quickly whether Haulr fits their situation and how to start.
- **Primary tasks:** "Get a price for my lane." "Find out whether I can haul for Haulr." "Sign in to my account."
- **Required data:** Marketing copy (constants, Public); network statistics (cached public aggregate, Public); help category index (Public). The page collects no personal data.
- **Permissions:** Read for everyone, including anonymous visitors; the page performs no mutations. A signed-in user is offered their role root (Phase 3 §4) in place of the sign-in entry and is never redirected automatically.
- **Device needs:** DV-PHONE: understand the offer and start either journey (PG-05, or PG-11 with `?side=`) one-handed. DV-DESK: the same, comparing shipper and carrier value in one visit. DV-AT: full parity with DV-DESK. DV-CAB and DV-WALL: not targeted.
- **Loading states:** Static, so LS-1 never applies to the copy and nothing is announced. Network statistics are resolved at build or revalidation time; if they are unavailable they are omitted, never replaced by a loading indicator. No client fetch and no LS-2 refresh on load.
- **Empty states:** EM-5: the page is static copy and always renders; missing statistics are an error case, not an empty one.
- **Error states:** E-UNAVAILABLE, E-SERVER or E-CONTRACT from the stats endpoint during revalidation → the last successfully built statistics remain; if none exist, the statement that uses them is withheld and nothing is announced.
- **Success states:** SU-2: the visitor reaches PG-05, PG-11 with a declared intent (`?side=shipper` or `?side=carrier`), or PG-10; the destination's main heading receives focus (SSB-6).
- **Dependencies:** PG-05, PG-11, PG-10, public stats endpoint (backend `stats` module extension).
- **Implementation notes:** Statically rendered with revalidation; no client data fetching on load; structured data per Phase 3 §11; performance budget is strictest here (LCP ≤ 2.0 s). Acceptance: given the stats endpoint fails at revalidation, when the page renders, then no statistic and no error text appears and LCP stays ≤ 2.0 s; given a visitor chooses the carrier journey, then PG-11 opens with `?side=carrier` preselected. Analytics: `marketing.home.viewed`, `marketing.journey.selected` (property `side`). No audit events (no mutations). Statistics revalidate by the `stats` cache tag; initial JS ≤ 170 KB (Phase 7 §18).

### PG-02 — Public Tracking

`/track/[token]` · Serves XF-07 · Sections: [SC-02.x](./phase-5-section-blueprints.md#pg-02--public-tracking)

- **Purpose:** Let a consignee or other outside party follow one load without an account.
- **Business objective:** Remove "where is my truck" calls (BG-02) and expose Haulr to receivers who are also shippers.
- **User objective:** Know the load's status, ETA and approximate progress, and whether it is running late.
- **Primary tasks:** "When will it arrive?" "Is it on time?" "Has it been delivered?"
- **Required data:** Tracking view for the token: status, stops (city level), appointment windows, ETA with confidence, approximate current position with source and age, delivery confirmation time (BR-21). Every field is Public within the token's scope; the position is reduced to city-level precision on the server because precise driver location is Restricted (NFR-PRIV-1); rates and contact details (Confidential) are never in the payload.
- **Permissions:** Signed tracking token; no session. Token scope is one load, read-only; the page offers no mutations. A signed-in party still sees only the token view here; the full record lives on PG-40.
- **Device needs:** DV-PHONE: check status and ETA within seconds from a text-message link on a variable network. DV-DESK and DV-WALL: left open on a dock computer, refreshing itself every 120 s without interaction. DV-AT: full parity, including a text equivalent of the map (PP-08). DV-CAB: not targeted.
- **Loading states:** LS-1: status, stops and ETA are server-rendered, so the page is useful before any client code runs. LS-2: position and ETA refetch every 120 s (Phase 7 §13), paused while the tab is hidden; previous values stay usable and their age updates; a status change is announced politely. LS-3 after 5 s keeps the last values with their age.
- **Empty states:** EM-4: no position yet (not yet picked up) → tracking starts at pickup, with the scheduled pickup window in the facility's time zone.
- **Error states:** E-NOT-FOUND: invalid, tampered or revoked token → a not-found message that never reveals whether a load exists. Expired token (7 days after delivery, BR-21) → state that tracking ended and when the load was delivered. Position stale beyond 60 min (§2.6) → the last known position and its age (PP-03), not an error. E-RATE-LIMIT (SEC-10) → the wait from `Retry-After`; polling resumes after it. E-UNAVAILABLE from the ETA service → status and stops remain; the ETA is withheld with a statement that it is temporarily unavailable. E-SERVER on refresh → values kept with their age; reads retried per §2.2.
- **Success states:** SU-1 (passive): on `Delivered`, the delivery time is confirmed and announced politely once if it arrives during the visit; polling stops.
- **Dependencies:** Tracking token service, ETA service, map base layer (pending approval; deck.gl installed, Phase 7 §15).
- **Implementation notes:** `noindex, nofollow`; no rates, contacts or documents in the payload (BR-21); polling through TanStack Query `refetchInterval`, paused when the tab is hidden; a text equivalent of the map is always present (PP-08). Acceptance: given a token 8 days past delivery, when it is opened, then the expired state is shown and the response carries no position; given the tab is hidden for 10 minutes, then no tracking request is made; given a position older than 60 min, then its age is stated in words. Analytics: `tracking.page.viewed`, `tracking.token.expired`, `tracking.token.rejected` (token ID only). No audit events here (read-only); link issuance and revocation are audited on PG-40. Query key `trackingKeys.public(token)` through `useTracking`; responses `Cache-Control: private, no-store`; built for 100,000 views per hour (NFR-CAP-1) at 99.95% availability (NFR-AV-2).

### PG-03 — Carrier Public Profile

`/carriers/[carrierId]` · Serves XF-04, XS-05 · Sections: [SC-03.x](./phase-5-section-blueprints.md#pg-03--carrier-public-profile)

- **Purpose:** Show a carrier's verified standing and track record.
- **Business objective:** Build trust in the network; SEO for carrier names; feed the preferred-carrier list (XF-04).
- **User objective:** Shipper: "Is this carrier safe and reliable?" Carrier: "What do shippers see about me?"
- **Primary tasks:** "Check this carrier is legitimate." "See how reliable they have been." "Add them to my preferred carriers."
- **Required data:** Carrier identity, authority status, years operating, equipment types, operating regions, scorecard (on-time, tracking, acceptance, rating), approval date — all Public. Signed-in shippers additionally get loads shared with this carrier and their own ratings (Internal to the shipper's organisation). No carrier pay or contact details (Confidential) appear.
- **Permissions:** Public view for approved carriers only; extended view for `shipper.*` and internal roles, scoped to the viewer's organisation. Adding to preferred carriers is an act for `shipper.admin`; `shipper.member` reads the preferred state only (Phase 3 §5.1). View-as (BR-27): extended view as the viewed member; adding requires write consent on the linked ticket.
- **Device needs:** DV-PHONE and DV-DESK: check authority, insurance and scorecard facts within seconds. DV-DESK: compare with another carrier in another tab (stable, shareable URL). DV-AT: full parity, with a text equivalent for every scorecard figure. DV-CAB, DV-WALL: not targeted.
- **Loading states:** The public view is ISR (1 hour), so LS-1 does not apply to it. The extended signed-in part streams in its own boundary (LS-1), announced politely only after 1 s. Adding to preferred is LS-5 ("Adding…").
- **Empty states:** EM-4: new carrier with no completed loads → the scorecard begins after 5 delivered loads (SH-09, `SCORECARD_MIN_SAMPLE`); authority and approval facts still show. EM-1 in the extended view: no loads shared yet → posting a load with a preferred tender (PG-27) is the next step.
- **Error states:** E-NOT-FOUND: carrier not approved, suspended or unknown → PG-53 without confirming the carrier exists. E-UNAVAILABLE or E-SERVER on the extended part → the public facts remain; the part says what could not load and offers retry (IC-60). E-FORBIDDEN on add by a `shipper.member` → the reason and that an organisation admin can add. E-CONFLICT: already added by a colleague → state it and show the current preferred state.
- **Success states:** SU-1: carrier added to the organisation's preferred list; announced politely (IC-14) and the preferred state is current.
- **Dependencies:** PG-29, XS-05, compliance status.
- **Implementation notes:** `generateStaticParams` not used (unbounded set); revalidate hourly and on compliance status change by tag; AggregateRating structured data only when rating count ≥ 5. Acceptance: given a carrier's authority is revoked, when the compliance tag is revalidated, then the profile returns PG-53 within one revalidation; given a signed-out visitor, then the response contains no extended fields. Analytics: `carrier.profile.viewed` (signed-in flag), `carrier.preferred.added`. Audit: `preferred_carrier.added`. Cache tag `carrier:<carrierId>`; the extended part uses `useCarrierProfile` with a session-scoped query key and is never served from the ISR cache (SSB-10).

### PG-05 — Lane Rate Estimator

`/tools/rate-estimator` · Serves XS-10, XF-01 · Sections: [SC-05.x](./phase-5-section-blueprints.md#pg-05--lane-rate-estimator)

- **Purpose:** Give a market rate estimate for a lane.
- **Business objective:** Lead generation and quote conversion (KPI-01).
- **User objective:** Know what a lane should cost now, and why.
- **Primary tasks:** "What does Chicago to Dallas dry van cost next Tuesday?" "Is this quote I got fair?" "Turn this into a real booking."
- **Required data:** Lane (origin, destination), equipment, date; estimate (point, range, confidence, per-mile), 30-day lane trend, basis of estimate. Market estimates and trends are Public aggregates; saved estimates are Internal to the user. No personal data accompanies an anonymous estimate request.
- **Permissions:** Everyone; anonymous usage is rate-limited per IP (SEC-10); signed-in users can save estimates, own only.
- **Device needs:** DV-PHONE: a single lane check in a meeting with location suggestions and a readable result. DV-DESK: several lanes in a row by keyboard, each result shareable by URL for comparison in tabs. DV-AT: full parity, including a text equivalent of the 30-day trend (IC-45). DV-CAB, DV-WALL: not targeted.
- **Loading states:** LS-5 while the estimate is requested ("Estimating…", announced politely); the previous result stays usable until the new one arrives (LS-2). LS-3 after 5 s; LS-4 at 15 s becomes E-TIMEOUT. Location suggestions are debounced and never announce loading.
- **Empty states:** EM-1: no estimate yet → which inputs are needed (origin, destination, equipment, date). EM-2 for suggestions: no matching location → check the spelling or enter a ZIP code.
- **Error states:** E-VALIDATION: unknown or ambiguous location → suggest matches (IC-05); pickup date in the past → explain. Insufficient market data → not an error: low confidence stated and a custom quote request offered. E-RATE-LIMIT → the wait from `Retry-After` and an offer to sign up. E-UNAVAILABLE from the pricing service → estimates are temporarily unavailable; entries kept. E-TIMEOUT or E-SERVER → retry (IC-60) with entries kept.
- **Success states:** SU-1: estimate delivered with point, range, confidence and basis, announced politely; estimate saved when signed in. SU-2: "continue to post" carries the lane to PG-27 (`?lane=`), through PG-10 with the return path when signed out.
- **Dependencies:** Pricing service, geocoding, PG-27.
- **Implementation notes:** Lane parameters in the URL so estimates are shareable; the estimate is fetched client-side through a hook; debounced location suggestions (`use-debounced-search`). Acceptance: given lane parameters in the URL, when a colleague opens it, then the same lane is estimated without re-entry; given a 429, when `Retry-After` elapses, then the estimate action re-enables; estimates return within 3 s at p95 (NFR-PERF-4). Analytics: `pricing.estimate.requested`, `pricing.estimate.delivered` (confidence enum), `pricing.estimate.converted`, `pricing.estimate.rate_limited`. Audit: `estimate.saved` (signed-in saves only). `useRateEstimate` keyed by `quoteKeys.estimate(lane)` with a 5-minute stale time; `useLaneTrend` cached for 1 hour.

### PG-06 — Help Center

`/help` · Serves XS-07 · Sections: [SC-06.x](./phase-5-section-blueprints.md#pg-06--help-center)

- **Purpose:** Self-service answers.
- **Business objective:** Deflect support tickets; SEO.
- **User objective:** Find an answer without contacting anyone.
- **Primary tasks:** "How do I…?" "Why was I charged…?" "I need to talk to someone."
- **Required data:** Help categories and articles (static content source, Public), popular articles by role (signed-in only, aggregate, Internal).
- **Permissions:** Read for everyone; no mutations. Signed-in users additionally receive popular articles for their role.
- **Device needs:** DV-PHONE: search and read an answer one-handed. DV-DESK: search, browse categories and open articles in tabs. DV-CAB: drivers reach help from PG-20 and search with seconds of attention. DV-AT: full parity; the result count is announced politely.
- **Loading states:** Static, so LS-1 does not apply to categories. Search runs over a build-time local index without network requests; the result count is announced politely once typing pauses (LS-2 semantics). The role-specific popular articles stream in their own boundary (LS-1).
- **Empty states:** EM-2: search with no results → the query, related categories and PG-08 with the query carried as context.
- **Error states:** E-UNAVAILABLE: the search index fails to load → category browsing remains fully usable and search states it is unavailable. E-SERVER on the role-specific part → that part is omitted; the rest is unaffected.
- **Success states:** SU-2: the user reaches an article (PG-07) or PG-08 with context.
- **Dependencies:** Help content source, PG-07, PG-08.
- **Implementation notes:** Content source is decided in Phase 7 (typed modules in `lib/data/help/` until a CMS exists, D-3); search runs over a build-time index. Acceptance: given the index fails to load, when the page renders, then every category remains reachable by keyboard; given a no-result search, then PG-08 opens with the query as context. Analytics: `help.search.performed` (result count only; never the query text, NFR-PRIV-3), `help.search.no_results_returned`, `help.article.opened`. No audit events (no mutations). `useHelpSearch` loads the index lazily on focus of the search; static pages revalidate on content publish.

### PG-07 — Help Article

`/help/[slug]` · Serves XS-07 · Sections: [SC-07.x](./phase-5-section-blueprints.md#pg-07--help-article)

- **Purpose:** Answer one question completely.
- **Business objective:** Ticket deflection; SEO.
- **User objective:** Solve the problem and get back to work.
- **Primary tasks:** "Tell me how to do this." "Did that answer my question?"
- **Required data:** Article body, category, related articles, last updated date — all Public; helpfulness feedback is an anonymous yes or no with an optional reason code; no free text (NFR-PRIV-2).
- **Permissions:** Read for everyone. Anyone may submit helpfulness feedback, rate-limited per IP (SEC-10).
- **Device needs:** DV-PHONE and DV-DESK: read comfortably and follow numbered steps while doing the task in another tab or app. DV-CAB: follow one step at a time. DV-AT: full parity; headings describe their topic for navigation (WCAG 2.4.6).
- **Loading states:** Static generation, so LS-1 does not apply. Feedback submission is LS-5 ("Sending…").
- **Empty states:** EM-5: an article only exists with a body; unknown slugs are E-NOT-FOUND. Related articles absent → that part is omitted.
- **Error states:** E-NOT-FOUND: unknown slug → PG-53 with help search. E-RATE-LIMIT or E-SERVER on feedback → the user is told it was not recorded; reading is unaffected.
- **Success states:** SU-1: helpfulness feedback recorded and acknowledged politely; a "not helpful" answer offers PG-08 with the article as context.
- **Dependencies:** PG-06, PG-08.
- **Implementation notes:** `generateStaticParams`; Article and BreadcrumbList structured data. Acceptance: given an unknown slug, then HTTP 404 and PG-53 with help search; given feedback is sent twice from the same session, then it is recorded once. Analytics: `help.article.viewed` (slug), `help.feedback.submitted` (helpful boolean). Audit: `help_feedback.recorded` (anonymous, no actor). Revalidated on content publish by the `help` tag.

### PG-08 — Contact Support

`/support` · Serves XS-07 · Sections: [SC-08.x](./phase-5-section-blueprints.md#pg-08--contact-support)

- **Purpose:** Open a ticket and follow existing ones.
- **Business objective:** Resolve blockers; capture context to cut handling time.
- **User objective:** Reach a person with the full context once.
- **Primary tasks:** "Report a problem with this load." "Check on my request."
- **Required data:** Ticket categories, context from the originating page (load reference, page, error digest), the user's tickets and their status. Ticket text and attachments are Confidential (may contain personal data); the anonymous requester's email is Confidential; originating context is Internal.
- **Permissions:** Everyone can open a ticket (anonymous submissions rate-limited, SEC-10); history requires sign-in and shows the user's own tickets only. View-as (BR-27): history readable as the member; opening a ticket as the member requires write consent.
- **Device needs:** DV-PHONE and DV-CAB: report a problem from the road with a photo (IC-25) and the load reference prefilled. DV-DESK: detailed tickets with several attachments (IC-24). DV-AT: full parity.
- **Loading states:** LS-1: ticket history streams in its own boundary; a ticket can be opened immediately. LS-5 on submission ("Sending…"), duplicates blocked. Attachments show per-file progress, with completion announced politely.
- **Empty states:** EM-1: signed in with no tickets → nothing to follow yet; opening a ticket is the next step. Signed out → EM-5 for history: it is not offered until sign-in.
- **Error states:** E-VALIDATION: missing category or description → IC-02 summary, entries kept. E-OFFLINE, E-SERVER or E-TIMEOUT on submission → draft preserved locally, retry offered (IC-60); the idempotency key prevents a duplicate ticket. E-RATE-LIMIT (anonymous) → the wait stated. Attachment rejected (type, limit or failed scan, SEC-7) → that file named with the reason; other files kept. E-AUTH on history → history withheld; opening a ticket remains possible.
- **Success states:** SU-1: ticket reference (`TKT-`) returned and the expected response time stated from the OPS-2 tier; the draft is cleared.
- **Dependencies:** Support system, XS-07.
- **Implementation notes:** Ticket creation through a Server Action; draft persistence via `useSyncExternalStore` + `localStorage`; anonymous submissions protected by rate limiting on the backend. Acceptance: given a network failure on submit, when the page is reloaded, then the draft is restored intact; given an urgent category, then the stated response time is ≤ 15 min (OPS-2). Analytics: `support.ticket.created` (category, has-context flag), `support.ticket.failed` (error class). Audit: `ticket.created`. `useCreateTicket` uses a `nanoid` idempotency key; history via `useTickets` keyed `ticketKeys.mine()`, refetched on focus; drafts expire after 30 days (NFR-PRIV-4).

### PG-09 — Legal

`/legal/[document]` · Serves XS-01 · Sections: [SC-09.x](./phase-5-section-blueprints.md#pg-09--legal)

- **Purpose:** Publish terms of service, privacy policy, carrier agreement and shipper terms.
- **Business objective:** Legal compliance; referenced by consent in XS-01 and XF-12.
- **User objective:** Read the terms they are agreeing to.
- **Primary tasks:** "What am I agreeing to?" "What changed?"
- **Required data:** Document text, version, effective date, change summary; Haulr's broker MC number (CMP-1) and the public sub-processor list (NFR-PRIV-7). All Public.
- **Permissions:** Read for everyone; no mutations. Consent is recorded on the page that asks for it (PG-11, PG-17, PG-34), never here.
- **Device needs:** DV-PHONE and DV-DESK: readable in full; printable to a complete copy carrying version and effective date (CMP-4). DV-AT: full parity; headings navigable. DV-CAB, DV-WALL: not targeted.
- **Loading states:** Static generation, so LS-1 does not apply and nothing is announced.
- **Empty states:** EM-5: each document route renders only with content; an unknown document is E-NOT-FOUND.
- **Error states:** E-NOT-FOUND: unknown document or version → PG-53.
- **Success states:** No success state: the page performs no action. Consent to a version is confirmed where it is recorded (PG-11, PG-17, PG-34).
- **Dependencies:** Legal content source.
- **Implementation notes:** Version recorded with every consent (BR-04). Acceptance: given a user consents on PG-11, then the recorded version equals the version served here at that moment; every superseded version remains retrievable by version (CMP-4). Analytics: `legal.document.viewed` (document, version). No audit events here. Static generation revalidated on publish by the `legal` tag.

---

## 4. Access Pages

### PG-10 — Sign In

`/auth/login` · Serves XS-01, XS-13 · Sections: [SC-10.x](./phase-5-section-blueprints.md#pg-10--sign-in)

- **Purpose:** Authenticate returning users.
- **Business objective:** Secure, low-friction access.
- **User objective:** Get back to work where they left off.
- **Primary tasks:** "Sign in." "I forgot my password."
- **Required data:** Credentials (Restricted; never logged or sent to analytics); validated return path; the identity policy for the email's verified domain (SSO optional or required, break-glass admin, IP allow-list, BR-24).
- **Permissions:** Signed-out users; signed-in users are redirected to their role root. When an organisation requires SSO, its members are routed to their identity provider and cannot use password sign-in, except the one designated break-glass admin (BR-24). An organisation IP allow-list for internal-facing roles is enforced at sign-in. View-as never starts here (XS-16).
- **Device needs:** DV-PHONE: sign in with password manager autofill or a passkey. DV-DESK: the same by keyboard alone. DV-CAB: drivers usually stay signed in; autofill must still work. DV-AT: full parity; errors announced assertively and tied to their field (IC-02, WCAG 3.3.1).
- **Loading states:** LS-5: pending submission is announced ("Signing in…"); the submitting action is disabled against double submission. Identity-policy discovery after the email is entered is LS-5 ("Checking your organisation…") and clears no entry.
- **Empty states:** EM-5: signing in involves no collection that could be empty.
- **Error states:** E-VALIDATION: missing fields → IC-02. Wrong credentials → generic message (`INVALID_CREDENTIALS`) that never reveals whether the account exists. Locked account → cooldown explained. E-RATE-LIMIT → the wait from `Retry-After` (SEC-10). E-FORBIDDEN: password sign-in disabled by SSO policy → route to the identity provider; address outside the IP allow-list → the reason and to contact the organisation's security admin. Identity-provider failure on return → the failing step and a support reference. E-OFFLINE, E-SERVER, E-TIMEOUT → retry, email kept, password cleared.
- **Success states:** SU-2: redirect to the validated return path or role root; MFA challenge to PG-14 when enrolled and not enforced by the identity provider; SSO members return already verified.
- **Dependencies:** `app/api/session`, `lib/hooks/use-sign-in-flow.ts` (wraps `lib/hooks/use-login.ts`), `proxy.ts`.
- **Implementation notes:** Identity-first: the email is taken first and the organisation's identity policy resolved through `useSsoDiscovery` (SC-10.3, XS-13) before any password is asked for; `useSignInFlow` sequences the email and password steps over `useLogin`, then MFA hand-off (PG-14) and role resolution follow. Build status lives in [Phase 8](./phase-8-implementation-roadmap.md#9-per-feature-build-status). Acceptance: given a member of an SSO-required organisation, when they enter their email, then no password entry is offered and they reach their identity provider; given the break-glass admin, then password sign-in and Haulr MFA remain available; given an unknown email and a wrong password, then both produce the identical message and timing. Analytics: `auth.sign_in.succeeded` (method), `auth.sign_in.failed` (reason enum), `auth.sso.redirected`. Audit: `session.created` (method password, passkey or SSO; identity provider), `session.signin_failed`. Session rotated on sign-in (SEC-3); the page is dynamic and never cached.

### PG-11 — Register

`/auth/register` · Serves XS-01, XF-12, XF-13 · Sections: [SC-11.x](./phase-5-section-blueprints.md#pg-11--register)

- **Purpose:** Create an account on the shipper or carrier side.
- **Business objective:** Acquisition on both sides.
- **User objective:** Start quickly on the correct side.
- **Primary tasks:** "I ship freight." "I haul freight." "Create my account."
- **Required data:** Side (shipper or carrier), name and work email (Confidential, personal data), password (Restricted), consent to terms (document and version).
- **Permissions:** Signed-out only; signed-in users are redirected to their role root. An email on a verified domain whose organisation requires SSO is refused here and routed to the identity provider (BR-24, XS-13). Bot protection applies (SEC-10).
- **Device needs:** DV-PHONE: carriers often register on phones; the whole flow works one-handed with autofill. DV-DESK: shippers mostly. DV-AT: full parity; password rules announced with the field (IC-03).
- **Loading states:** LS-5: pending submission announced ("Creating your account…"); duplicates blocked.
- **Empty states:** EM-5: registering involves no collection that could be empty.
- **Error states:** E-CONFLICT: email already used → offer sign-in and reset. E-VALIDATION: password shorter than `PASSWORD_MIN_LENGTH` or found in the breached-password check (SEC-1) → explain the rule; consent not given → required. E-FORBIDDEN: domain requires SSO → route to the identity provider. E-RATE-LIMIT or failed bot check → the wait or a retry. Session creation fails after account creation → `SESSION_UNAVAILABLE` and route to sign-in.
- **Success states:** SU-2: account created, consent recorded with document version, verification email sent; user continues to PG-14.
- **Dependencies:** `app/api/register`, `lib/hooks/use-register.ts`, PG-14, PG-09.
- **Implementation notes:** Side preselected by `?side=` from PG-01 or PG-02; schema composes over the generated register DTO. Acceptance: given `?side=carrier`, then the carrier side is preselected; given a breached password, then the account is not created and entries except the password are kept; given success, then the recorded consent version equals the PG-09 version served. Analytics: `auth.account.registered` (side), `auth.registration.failed` (reason enum). Audit: `user.registered`, `consent.recorded` (document, version, IP). Never cached.

### PG-12 — Forgot Password

`/auth/forgot-password` · Serves XS-01 · Sections: [SC-12.x](./phase-5-section-blueprints.md#pg-12--forgot-password)

- **Purpose:** Start a password reset.
- **Business objective:** Recover accounts without support.
- **User objective:** Get back into the account.
- **Primary tasks:** "Send me a reset link."
- **Required data:** Email (Confidential; never sent to analytics).
- **Permissions:** Signed-out. Members of an SSO-required organisation receive the same on-page confirmation, but the email directs them to their identity provider instead of a reset (BR-24).
- **Device needs:** DV-PHONE and DV-DESK: request a link in one step. DV-AT: full parity; the confirmation is announced politely.
- **Loading states:** LS-5: pending announced ("Sending…").
- **Empty states:** EM-5: requesting a link involves no collection that could be empty.
- **Error states:** E-VALIDATION: malformed email → IC-02. E-RATE-LIMIT → explain the wait from `Retry-After`. E-SERVER or E-TIMEOUT → retry with the entry kept.
- **Success states:** SU-1: the same confirmation whether or not the email exists (no enumeration), stating that a link valid for 30 minutes was sent if an account exists.
- **Dependencies:** Backend auth reset endpoint.
- **Implementation notes:** Reset link expires in 30 minutes. Acceptance: given a registered and an unregistered email, then the response body and timing are indistinguishable; given the rate limit is hit, then the action re-enables after `Retry-After`. Analytics: `auth.reset.requested`. Audit: `password_reset.requested` (written only when an account exists). `useRequestPasswordReset`; never cached.

### PG-13 — Reset Password

`/auth/reset-password` · Serves XS-01 · Sections: [SC-13.x](./phase-5-section-blueprints.md#pg-13--reset-password)

- **Purpose:** Set a new password from a reset link.
- **Business objective:** Account recovery.
- **User objective:** Set a new password and sign in.
- **Primary tasks:** "Choose a new password."
- **Required data:** Reset token (URL, Restricted), new password (Restricted).
- **Permissions:** Valid, unexpired, unused reset token; no session required.
- **Device needs:** DV-PHONE: often opened from email; password manager generation supported. DV-DESK: the same. DV-AT: full parity; rules announced with the field (IC-03).
- **Loading states:** Token validated on the server before rendering, so no LS-1 state is shown; LS-5 on submit ("Saving…").
- **Empty states:** EM-5: setting a password involves no collection that could be empty.
- **Error states:** E-NOT-FOUND: token invalid, used or expired → say so and route to PG-12. E-VALIDATION: shorter than `PASSWORD_MIN_LENGTH` or breached (SEC-1) → explain. E-RATE-LIMIT → the wait. E-SERVER → retry while the token remains valid.
- **Success states:** SU-2: password changed; all other sessions revoked (SEC-3); user signed in or sent to PG-10; a security notification is emailed.
- **Dependencies:** Backend auth.
- **Implementation notes:** Token never stored client-side beyond the request. Acceptance: given a used token, when it is opened again, then the invalid state is shown; given success, then sessions on other devices end within 5 minutes (SEC-3). Analytics: `auth.password.reset`. Audit: `password.reset`, `sessions.revoked` (scope all-others). `useResetPassword`; never cached.

### PG-14 — Verify

`/auth/verify` · Serves XS-01 · Sections: [SC-14.x](./phase-5-section-blueprints.md#pg-14--verify)

- **Purpose:** Complete email verification and multi-factor challenges.
- **Business objective:** Account security; required MFA for sensitive roles.
- **User objective:** Prove it's them and continue.
- **Primary tasks:** "Confirm my email." "Enter my code." "I can't access my code."
- **Required data:** Verification state, MFA method (TOTP, passkey, backup code), pending return path. Codes are Restricted and never logged.
- **Permissions:** Partially authenticated session; a full session is issued only on success. MFA is required for `*.admin`, `*.finance`, `shipper.approver`, `org.security` and every internal role (SEC-1). Members who sign in through SSO skip the Haulr challenge because the identity provider enforces MFA (BR-24); the break-glass admin always completes it.
- **Device needs:** DV-PHONE: paste or autofill one-time codes; passkey on the device. DV-DESK: the same by keyboard. DV-AT: full parity; attempts remaining announced assertively.
- **Loading states:** LS-5: pending verification announced ("Verifying…"); resend is LS-5 ("Sending…").
- **Empty states:** EM-5: a challenge involves no collection that could be empty.
- **Error states:** E-VALIDATION: wrong code → attempts remaining stated. Expired email link → resend. E-RATE-LIMIT: too many attempts → cooldown stated. E-AUTH: partial session expired → PG-10 with the return path. Lost device → backup code, else PG-08 with the account recovery category.
- **Success states:** SU-2: full session issued and rotated (SEC-3); continue to onboarding (PG-16, PG-17), the return path or the role root. Email verification is confirmed and announced politely.
- **Dependencies:** Backend auth, PG-16, PG-17.
- **Implementation notes:** Supports `autocomplete="one-time-code"`; backup codes accepted. Acceptance: given a role that requires MFA without enrolment, when verification completes, then enrolment is required before the session is issued; given an SSO member, then this challenge is never shown. Analytics: `auth.mfa.verified` (method), `auth.mfa.failed`, `auth.email.verified`. Audit: `mfa.challenge_passed`, `mfa.challenge_failed`, `backup_code.used`, `email.verified`. `useMfaChallenge`, `useVerifyEmail`; never cached.

### PG-15 — Accept Invitation

`/auth/invite/[token]` · Serves XS-02 · Sections: [SC-15.x](./phase-5-section-blueprints.md#pg-15--accept-invitation)

- **Purpose:** Join an organisation from an invitation.
- **Business objective:** Team growth; driver activation (XF-05).
- **User objective:** Join the team with the least effort.
- **Primary tasks:** "Join my company on Haulr." "Set my password."
- **Required data:** Invitation (organisation name, inviter name — Confidential, role), whether an account exists for the email, the organisation's identity policy (BR-24). A password set while accepting is Restricted.
- **Permissions:** Valid invitation token. In an organisation that requires SSO, acceptance completes through the identity provider and no Haulr password is set; members provisioned by SCIM need no invitation (XS-13).
- **Device needs:** DV-PHONE and DV-CAB: drivers accept from SMS; the flow finishes within one minute. DV-DESK: office staff. DV-AT: full parity.
- **Loading states:** Token validated server-side before rendering; LS-5 on acceptance ("Joining…").
- **Empty states:** EM-5: the page renders only for a resolved invitation.
- **Error states:** E-NOT-FOUND: expired or revoked → say so and name who to ask (the inviter). E-CONFLICT: email already in another organisation → explain the one-organisation rule; invitation already accepted → route to sign-in. E-VALIDATION: password rules (SEC-1). E-FORBIDDEN: SSO required → route to the identity provider.
- **Success states:** SU-2: membership active; drivers continue to location consent and PG-20; other roles reach their role root.
- **Dependencies:** XS-02, PG-20.
- **Implementation notes:** Existing users sign in to accept; new users set a password as part of accepting. Acceptance: given a driver on a phone, when they open the SMS link, then they can reach PG-20 in ≤ 60 s; given an SSO-required organisation, then no password entry is offered. Analytics: `team.invitation.accepted` (role), `team.invitation.failed` (reason enum). Audit: `invitation.accepted`, `membership.created`. `useInvitation`, `useAcceptInvitation`; never cached.

---

## 5. Onboarding

### PG-16 — Shipper Onboarding

`/onboarding/shipper` · Serves XF-13 · Sections: [SC-16.x](./phase-5-section-blueprints.md#pg-16--shipper-onboarding)

- **Purpose:** Activate a shipper organisation for posting.
- **Business objective:** Time to first posted load; credit risk control.
- **User objective:** Get the company ready to ship without a sales call.
- **Primary tasks:** "Tell Haulr about our company." "Set up how we'll pay." "Bring my team."
- **Required data:** Organisation profile, shipping profile, billing contacts (Confidential), credit application (financials Confidential; tax ID Restricted) or prepay method (processor token only, A6), invitations, facilities.
- **Permissions:** `shipper.admin` of the organisation being onboarded; other members resolve to it only after activation (Phase 3 §4). View-as (BR-27): read-only; the payment step is never writable in view-as.
- **Device needs:** DV-DESK mostly; resumable on DV-PHONE at the saved step. DV-AT: full parity; step progression announced (IC-15).
- **Loading states:** LS-1: progress restored from the server; the current step (`?step=`) streams in its own boundary. LS-5 while each step saves ("Saving…"). Credit decision: LS-5, or LS-7 when the provider answers asynchronously, with notification on decision (XS-03).
- **Empty states:** EM-5: the flow always renders its current step; incomplete steps are its normal state.
- **Error states:** E-VALIDATION per step (IC-02), entries kept. Credit declined → not an error: offer prepay without losing progress. E-UNAVAILABLE from the credit provider → the other steps continue and the decision is deferred. E-PRECONDITION: another admin saved the same step → what changed and by whom, input kept (SSB-8). Sanctions screening hold (CMP-11) → review pending, with the expected time.
- **Success states:** SU-2: organisation active; user reaches PG-18 with a suggested next task. Each saved step is SU-1.
- **Dependencies:** XS-02, XS-08, PG-32, credit provider.
- **Implementation notes:** Step state in the URL (`?step=`); each step saved on completion through a Server Action; the user can quote (XF-01) before finishing but not post. Acceptance: given a closed tab at step 3, when the admin returns on another device, then step 3 opens with saved entries; given a credit decline, then prepay is offered and no earlier step is lost. Analytics: `onboarding.shipper.step_completed` (step), `onboarding.shipper.completed`, `onboarding.shipper.credit_declined`. Audit: `organization.profile_updated`, `credit.application_submitted`, `payment_method.added`, `invitation.sent`, `facility.created`. `useOnboarding` keyed `organizationKeys.onboarding(orgId)`; local drafts expire after 30 days (NFR-PRIV-4).

### PG-17 — Carrier Onboarding

`/onboarding/carrier` · Serves XF-12 · Sections: [SC-17.x](./phase-5-section-blueprints.md#pg-17--carrier-onboarding)

- **Purpose:** Collect everything compliance needs to approve a carrier.
- **Business objective:** Safe network growth (BG-04); fast activation.
- **User objective:** Get approved once and start booking.
- **Primary tasks:** "Look up my authority." "Upload my insurance." "Sign the agreement." "Tell me where I stand."
- **Required data:** USDOT and MC numbers, registry record (Public), company profile, equipment, lanes, insurance certificate, W-9 and tax ID (Restricted), agreement acceptance, payout method (processor token only, Confidential), compliance status with reasons.
- **Permissions:** `carrier.admin`. View-as (BR-27): read-only; the payout step is never writable in view-as.
- **Device needs:** DV-PHONE: photograph documents (IC-25) and complete every step. DV-DESK: upload scans (IC-24). DV-AT: full parity, with document capture through file selection.
- **Loading states:** LS-5: registry lookup announced ("Looking up your authority…"); documents show per-file upload progress, with completion announced politely. Review decision: LS-7 — compliance review runs asynchronously and status updates arrive by notification (XS-03).
- **Empty states:** EM-5: the flow always renders its current step.
- **Error states:** Authority inactive → explain why booking is not possible (BR-03); no workaround offered. Document rejected (type, unreadable, failed scan) → reason and re-upload. E-UNAVAILABLE from the registry → allow manual entry for review. E-VALIDATION: USDOT or MC format, missing agreement consent. E-OFFLINE during upload → uploads persisted and resumed. E-PRECONDITION: another admin edited the step (SSB-8).
- **Success states:** SU-3: submitted for review with an expected decision time. SU-2: approved automatically and routed to PG-19.
- **Dependencies:** XF-12, XS-08, registry and insurance providers, e-signature.
- **Implementation notes:** Resumable; uploads persist before submission; status updates arrive by notification (XS-03). Acceptance: given the registry is unavailable, when the admin enters details manually, then submission proceeds with a manual-review flag; given a rejected certificate, then the reason names the failing requirement. Analytics: `onboarding.carrier.step_completed` (step), `onboarding.carrier.submitted`, `compliance.authority.looked_up` (result enum). Audit: `carrier.onboarding_submitted`, `agreement.signed` (version, IP, BR-04 evidence), `document.uploaded`, `payout_method.added`. `useAuthorityLookup`, `useComplianceStatus` (shared with PG-19); uploads through presigned URLs (SEC-7).

---

## 6. Role Dashboards

All dashboards follow XD rules in [Phase 2 §3](./phase-2-experience-maps.md#3-role-dashboards). Each part of a dashboard loads, fails and retries independently (SSB-1, SSB-3): LS-1 per part, LS-2 on interval and focus, freshness per §2.6 (fresh ≤ 60 s, stale label after 5 min), and a failed part never blocks the others.

### PG-18 — Shipper Dashboard

`/shipper` · Serves XD-01 · Sections: [SC-18.x](./phase-5-section-blueprints.md#pg-18--shipper-dashboard)

- **Purpose:** Triage and overview for a shipper organisation.
- **Business objective:** Self-serve management (KPI-03); repeat posting.
- **User objective:** Know what needs attention today and act on it.
- **Primary tasks:** "What needs me right now?" "Is anything late?" "Start a new load." "How are we doing this week?" (finance role: "What's due?") (approver: "What is waiting for my approval?")
- **Required data:** Attention items (bids awaiting decision, approvals awaiting the viewer as `shipper.approver` with their deadline, the viewer's own requests in `PendingApproval`, uncovered near pickup, late ETAs, open exceptions, PODs pending, invoices due), active load counts by state, weekly service and spend metrics, onboarding completion. Invoice and spend amounts are Confidential and shaped by role.
- **Permissions:** `shipper.*`, organisation records only; finance sees invoice-related items only; admin sees all; `shipper.approver` additionally sees approvals awaiting decision, never their own requests (BR-23). Acting on an item follows that item's capability (Phase 3 §5.1). View-as (BR-27): read-only as the viewed member; acting requires write consent on the linked ticket.
- **Device needs:** DV-DESK: triage many loads. DV-PHONE: check exceptions, accept a bid or decide an approval from a notification. DV-AT: full parity; changes in the attention count announced politely. DV-WALL: not targeted.
- **Loading states:** LS-1 per part (attention, counts, metrics, onboarding). LS-2 every 60 s and on window focus, paused when hidden; a changed attention count is announced politely; stale label after 5 min (§2.6).
- **Empty states:** EM-1: new organisation → guided next steps (quote, invite, add facility; SH-12). EM-3: attention set cleared → clear, with the last-checked time. Metrics EM-4: no delivered loads this week → metrics begin after a delivery.
- **Error states:** Per part: E-SERVER, E-UNAVAILABLE or E-TIMEOUT → that part says what failed and offers retry (IC-60); after a failed refresh the last data stays with its age (SSB-2). E-CONFLICT on acting: bid expired or withdrawn, or approval already decided by another approver → refresh the item and name who decided. E-CONFLICT: approval deadline passed (quote or bid expired, BR-06) → the item states it expired and the requester is offered a re-quote.
- **Success states:** SU-1: acting on an item updates the attention set without a reload, announced politely; an approval decision states the resulting load state (posted, bid accepted, or returned to `Draft`).
- **Dependencies:** XF-01, XF-03, XF-07, XF-08, XF-10, XF-16.
- **Implementation notes:** Attention items computed by one backend endpoint; refresh on window focus and every 60 seconds. Acceptance: given a pending approval, when half its remaining validity has elapsed, then it appears as escalated for every organisation admin (XF-16); given an approver who is also the requester, then their own request is never decidable here; given one part fails, then the other parts remain fully usable. Analytics: `dashboard.shipper.viewed` (role), `dashboard.attention.acted` (item type). Audit events come from the underlying action (`bid.accepted`, `approval.approved`, `approval.rejected`). `useAttentionItems` keyed `attentionKeys.list(orgId)`, invalidated by load, bid and approval mutations; `useMetrics` stale time 60 s.

### PG-19 — Carrier Dashboard

`/carrier` · Serves XD-02 · Sections: [SC-19.x](./phase-5-section-blueprints.md#pg-19--carrier-dashboard)

- **Purpose:** Daily operations view for a carrier.
- **Business objective:** Utilisation, repeat booking (KPI-08), assignment compliance (BR-09).
- **User objective:** Keep every truck loaded and every load assigned, and know when money arrives.
- **Primary tasks:** "Which loads still need a driver?" "Find the next load for this truck." "When am I getting paid?" "Is my account in good standing?"
- **Required data:** Loads needing assignment with their BR-09 deadline, active loads with status, exceptions and any amendment awaiting response (BR-25), recommended loads by truck availability, pending settlements with expected dates, compliance standing and expiring documents. Settlement amounts are Confidential.
- **Permissions:** `carrier.admin`, `carrier.dispatcher`, own carrier only; settlement amounts visible to admin, dates visible to dispatcher (response shaping, Phase 3 §5.2). Acting happens on PG-33, PG-35 and PG-40. View-as (BR-27): read-only; settlements and payout data are never writable in view-as.
- **Device needs:** DV-PHONE: owner-operators run their business from here. DV-DESK: dispatchers with many trucks. DV-AT: full parity.
- **Loading states:** LS-1 per part; LS-2 every 60 s and on focus, paused when hidden, except recommendations every 5 min and settlements on focus only (§2.6, Phase 7 §13); stale label after 5 min, or 15 min for recommendations.
- **Empty states:** EM-1: no active loads → go to the load board. EM-4: not yet approved → onboarding status and what is missing (SH-06). EM-3: every load assigned → clear, with the last-checked time. Recommendations EM-2: nothing matches current truck availability → search PG-33 with wider criteria.
- **Error states:** Per part: E-SERVER, E-UNAVAILABLE → that part names what failed and offers retry; others unaffected. E-CONFLICT: a recommended load was booked by someone else → marked as gone. E-FORBIDDEN on booking from a recommendation while ineligible → the BR-03 reason and the fix.
- **Success states:** SU-1: assignments and bookings reflect immediately, announced politely.
- **Dependencies:** XF-02, XF-05, XF-11, XF-12, XF-15.
- **Implementation notes:** Recommendations endpoint keyed by carrier; compliance standing from one endpoint shared with PG-17. Acceptance: given a booked load 3 hours before pickup with no driver, then it appears in loads needing assignment with its deadline; given a dispatcher, then no settlement amount is present in the response. Analytics: `dashboard.carrier.viewed` (role), `load.recommendation.opened`. Audit events come from the underlying actions (`load.assigned`, `load.booked`). `useRecommendedLoads`, `useAccountStanding`, `useSettlementSummary`; dashboard queries stale after 60 s.

### PG-20 — Driver Home

`/driver` · Serves XD-03 · Sections: [SC-20.x](./phase-5-section-blueprints.md#pg-20--driver-home)

- **Purpose:** Take the driver to the current trip immediately.
- **Business objective:** Tracking compliance (KPI-05), stop-event completeness.
- **User objective:** "What do I do now?"
- **Primary tasks:** "Open my current trip." "What's next after this?" "Did my updates go through?"
- **Required data:** Current trip, upcoming trips, location consent state, offline queue state. Stop contacts are Confidential; the driver's precise location is Restricted and leaves the device only as tracking events.
- **Permissions:** `carrier.driver`; own assigned trips only. View-as (BR-27): read-only as the driver; stop events are never recorded through view-as.
- **Device needs:** DV-CAB is the target: reach the current trip in one action, with gloves, in glare and with seconds of attention. DV-PHONE: the same. DV-AT: full parity. DV-DESK: not targeted.
- **Loading states:** LS-6: cached trip shown instantly with its age ("Saved 14 min ago") while LS-2 refreshes silently (SSB-2). LS-1 only on a device with no cached trip.
- **Empty states:** EM-1: no trip → how to reach dispatch (the carrier's dispatch contact). EM-4: next trip assigned but not yet dispatched → when it starts.
- **Error states:** Location permission off → how to turn it on and why (a consent state, not an E-class). E-OFFLINE → SSB-4, queued events count, cached trip remains. E-AUTH → the queue is retained for the same driver and replayed after sign-in; it leaves the device only by replay or an explicit discard confirmed with IC-12, and another account never sees it (SSB-10 driver exception, NFR-AV-6). E-SERVER on refresh → cached trip remains with its age.
- **Success states:** SU-1: queue drained confirmation, announced politely with the number of events synced.
- **Dependencies:** XF-06, PG-39.
- **Implementation notes:** Active trip cached for offline; if exactly one active trip exists, the page offers to go straight to it. Acceptance: given the device is offline, when the page opens, then the cached trip renders within 1 s with its age; given 3 queued events, when connectivity returns, then all 3 sync in order and the drained confirmation states 3. Analytics: `driver.home.viewed` (offline flag), `driver.queue.drained` (count). No mutations on this page, so no audit events (stop events are audited on PG-39). `useDriverTrips` persisted to IndexedDB; initial JS ≤ 150 KB (Phase 7 §18).

### PG-21 — Operations Dashboard

`/ops` · Serves XD-04 · Sections: [SC-21.x](./phase-5-section-blueprints.md#pg-21--operations-dashboard)

- **Purpose:** Network health and exception flow for operations.
- **Business objective:** Protect service (KPI-04), reduce touches (KPI-10).
- **User objective:** See where the network is at risk and take the next exception.
- **Primary tasks:** "How many exceptions and how severe?" "Which loads might not get covered?" "Give me the next one."
- **Required data:** Exception counts by type and severity, coverage risk for loads picking up within 24 hours, tracking compliance now, agent's claimed and resolved counts. All Internal; no personal data or coordinates.
- **Permissions:** `internal.ops` (read and claim), `internal.admin` (read only). Not reachable through view-as.
- **Device needs:** DV-WALL: often left open all shift on a shared operations screen; refreshes unattended and always states the last refresh time. DV-DESK: claim the next exception by keyboard. DV-AT: full parity. DV-PHONE: not targeted.
- **Loading states:** LS-1 per part; LS-2 every 30 s, paused when hidden; last refresh time always stated; stale label after 5 min (§2.6). Count changes are not announced on DV-WALL; on DV-DESK a new high-severity count is announced politely.
- **Empty states:** EM-3: no exceptions → state it with the last refresh time. Coverage risk EM-3: no load at risk in the next 24 hours.
- **Error states:** E-UNAVAILABLE or delayed feed → the last values stay with their age (PP-03). E-SERVER per part → that part offers retry; others continue. E-CONFLICT on claim: already claimed → the owner named.
- **Success states:** SU-2: claiming an exception goes to PG-50 focused on it.
- **Dependencies:** XF-08, PG-50.
- **Implementation notes:** Refresh every 30 seconds; pauses when hidden. Acceptance: given the feed fails for 5 minutes, then the stale label is shown and the last refresh time remains stated; given two agents claim the same exception, then exactly one succeeds and the other is told who owns it. Analytics: `ops.dashboard.viewed`, `exception.claim.requested`. Audit: `exception.claimed`. `useExceptionSummary`, `useCoverageRisk` with `refetchInterval` 30 s and `refetchIntervalInBackground: false`.

### PG-22 — Compliance Dashboard

`/compliance` · Serves XD-05 · Sections: [SC-22.x](./phase-5-section-blueprints.md#pg-22--compliance-dashboard)

- **Purpose:** Vetting queue and monitoring changes.
- **Business objective:** Network safety (BG-04).
- **User objective:** Decide pending carriers within SLA and act on changes.
- **Primary tasks:** "Who is waiting for a decision?" "Whose insurance or authority changed?" "Which loads does that affect?"
- **Required data:** Vetting queue with age and SLA, monitoring events, affected booked loads. Registry and insurance facts are Public; fraud signals and carrier contacts are Confidential; tax IDs (Restricted) are not part of this page.
- **Permissions:** `internal.compliance`, read and act. Not reachable through view-as.
- **Device needs:** DV-DESK: work the queue by keyboard for a full shift. DV-AT: full parity. DV-PHONE, DV-WALL: not targeted.
- **Loading states:** LS-1 per part; LS-2 every 60 s and on focus; the queue pages by cursor (default 50, maximum 200) and keeps the current page during refresh.
- **Empty states:** EM-3: queue clear, with the last-checked time. Monitoring events EM-3: no changes since the last check.
- **Error states:** E-UNAVAILABLE from the registry source → last successful fetch time stated; monitoring may be stale. E-SERVER per part → retry; others usable.
- **Success states:** SU-1: a decision recorded on PG-51 is reflected here and the queue updates.
- **Dependencies:** XF-12, PG-51, BR-18.
- **Implementation notes:** Queue paginated by cursor; SLA computed server-side. Acceptance: given a carrier whose SLA passes, then it is marked overdue by the server value, never by client time; given an authority change on a carrier with booked loads, then the affected loads are listed with the resulting exception. Analytics: `compliance.queue.viewed`, `compliance.event.opened`. Audit events come from PG-51 (`carrier.vetting_decided`). `useCarrierVetting`, `useMonitoringEvents`, stale after 60 s.

### PG-23 — Finance Operations Dashboard

`/finance` · Serves XD-06 · Sections: [SC-23.x](./phase-5-section-blueprints.md#pg-23--finance-operations-dashboard)

- **Purpose:** Cash-flow health and stuck items.
- **Business objective:** Days to pay (KPI-07), dispute rate (KPI-11).
- **User objective:** Clear every item past its SLA.
- **Primary tasks:** "Which PODs need verifying?" "What's disputed?" "What's overdue?" "Which payouts failed?"
- **Required data:** POD verification queue, disputes, receivables ageing, payout failures, quick pay volume and fees. Amounts are Confidential; bank details appear masked only.
- **Permissions:** `internal.finance`, read and act (verify POD, retry payout). Not reachable through view-as.
- **Device needs:** DV-DESK: work queues by keyboard. DV-AT: full parity. DV-PHONE, DV-WALL: not targeted.
- **Loading states:** LS-1 per queue; LS-2 every 60 s and on focus; LS-5 on verify or retry ("Verifying…", "Retrying…").
- **Empty states:** EM-3: each queue states when it is clear, with the last-checked time.
- **Error states:** E-UNAVAILABLE from the processor → "awaiting processor" with age. E-CONFLICT: POD already verified or payout already retried by a colleague → refresh and name who acted. E-SERVER per part → retry.
- **Success states:** SU-1: verification or resolution updates the queues, announced politely.
- **Dependencies:** XF-09, XF-10, XF-11, XS-06.
- **Implementation notes:** Totals come from the ledger endpoint, never summed client-side. Acceptance: given a payout retry, then it carries an idempotency key and a second click creates no second payout; given the processor is unavailable, then queue items state their age. Analytics: `finance.queue.viewed`, `pod.verification.completed`, `payout.retry.requested`. Audit: `pod.verified`, `pod.rejected`, `payout.retried`. `usePodQueue`, `usePayoutFailures`, `useVerifyPod`, `useRetryPayout`.

### PG-24 — Support Console

`/support-console` · Serves XD-07, XS-07, XS-16 · Sections: [SC-24.x](./phase-5-section-blueprints.md#pg-24--support-console)

- **Purpose:** Work support tickets with full account context.
- **Business objective:** Resolution time; satisfaction.
- **User objective:** Understand the requester's situation without switching tools.
- **Primary tasks:** "Take the next ticket." "What's going on with this person's account and loads?" "Reply or hand this off." "See what the customer sees."
- **Required data:** Ticket queue with SLA (OPS-2 tiers), ticket thread (Confidential), requester's organisation, role, contact (Confidential), recent loads and exceptions, whether write consent exists on the ticket (BR-27).
- **Permissions:** `internal.support`; read access to PG-40 and PG-44. Starting view-as requires a linked ticket, lasts at most 60 minutes and is read-only unless the organisation granted write consent on that ticket; payout and payment methods, API keys and data export are never available in view-as, and security settings are read-only (BR-27, Phase 3 §5.2).
- **Device needs:** DV-DESK: keyboard-driven ticket handling in long sessions. DV-AT: full parity. DV-PHONE, DV-WALL: not targeted.
- **Loading states:** LS-1 per part; LS-2 on the queue every 60 s and the open thread every 10 s (Phase 7 §13), paused when hidden; SLA timers update without refetching.
- **Empty states:** EM-3: queue clear, with the last-checked time. Requester context EM-4: anonymous ticket not yet matched → lookup by email or load reference.
- **Error states:** Requester not matched → lookup by email or load reference. E-CONFLICT: ticket taken by another agent → the owner named. E-FORBIDDEN: view-as without a linked ticket, or a write attempted without consent → the reason stated. E-SERVER per part → retry.
- **Success states:** SU-1: reply sent; ticket status updated. SU-2: view-as started → the workspace opens with the session identified throughout (IC-64) and the remaining time stated.
- **Dependencies:** XS-07, XS-04, XS-16, PG-40.
- **Implementation notes:** Selected ticket in the URL (`?ticket=`). Acceptance: given no linked ticket, then view-as cannot start; given 60 minutes elapse, then the view-as session ends and the client cache is purged (SSB-10); given an urgent ticket, then its SLA timer targets 15 minutes. Analytics: `support.ticket.opened`, `support.ticket.replied`, `support.view_as.started`, `support.view_as.ended` (duration). Audit: `ticket.replied`, `ticket.status_changed`, `ticket.assigned`, `view_as.started` (ticket, member, mode), `view_as.ended`. `useTickets`, `useRequesterContext`; `useViewAs` (SC-24.4) starts and ends sessions.

### PG-25 — Admin Dashboard

`/admin` · Serves XD-08 · Sections: [SC-25.x](./phase-5-section-blueprints.md#pg-25--admin-dashboard)

- **Purpose:** Platform administration.
- **Business objective:** Safe, audited control (Phase 1 §11).
- **User objective:** Handle access requests and configuration safely.
- **Primary tasks:** "Who is waiting for access?" "Change a platform setting safely." "What changed recently?"
- **Required data:** Pending approvals, configuration values with history, platform audit log (append-only, BR-26; before and after values may include Confidential fields and are shown to `internal.admin` only).
- **Permissions:** `internal.admin` reads and changes configuration. The audit log is read-only for every role, `internal.admin` included: no edit or delete exists (BR-26). Not reachable through view-as.
- **Device needs:** DV-DESK: review impact and apply changes by keyboard. DV-AT: full parity. DV-PHONE, DV-WALL: not targeted.
- **Loading states:** LS-1 per part; the audit log pages by cursor (default 50, maximum 200) and keeps the current page during LS-2; LS-5 on apply ("Applying…"); impact preview is LS-5.
- **Empty states:** EM-3: nothing pending, with the last-checked time. Audit log EM-2: filters match nothing → clear them.
- **Error states:** Change conflicts with active loads → the impact preview explains which loads and how. E-VALIDATION: reason missing (SSB-9) or value out of range. E-FORBIDDEN: re-authentication older than 10 minutes → IC-13. E-PRECONDITION: another admin changed the value → both values shown, input kept (SSB-8). E-SERVER → retry; nothing applied.
- **Success states:** SU-1: change applied and audited; the event appears in recent changes.
- **Dependencies:** PG-52, XS-02.
- **Implementation notes:** Every mutation requires a reason; re-authentication within 10 minutes. Acceptance: given any role including `internal.admin`, then no edit or delete of an audit event is possible through the UI or the API; given a stale configuration version, then the change is refused with E-PRECONDITION; given a change, then its audit event carries before and after values and the reason. Analytics: `admin.config.previewed`, `admin.config.changed` (key). Audit: `config.changed`, `access_request.approved`, `access_request.rejected`. `usePlatformConfig`, `useUpdateConfig`, `useAuditLog` keyed `adminKeys.audit(filters)`; audit reads never cached beyond the session.

---

## 7. Shipper Workspace

### PG-26 — Shipments

`/shipper/loads` · Serves XF-01, XF-07, XF-14, XS-18, XD-01 · Sections: [SC-26.x](./phase-5-section-blueprints.md#pg-26--shipments)

- **Purpose:** Find, follow and act on the organisation's loads, as a list or on a map.
- **Business objective:** Visibility (BG-02); fewer support contacts.
- **User objective:** Locate any load and know its state and freshness.
- **Primary tasks:** "Find load HL-… or PO …" "Show me everything in transit." "Which ones are late?" "Where are all my trucks right now?" "Export or share tracking for these loads."
- **Required data:** Paginated loads with status (including `PendingApproval`), lane, schedule, carrier, ETA versus appointment, last position age, exception flag, import batch ID where created by bulk import (BR-28); positions for in-transit loads in view (city-level for lists; precise location is Restricted and only shown on the map to roles with live-location read). Shipper price is Confidential.
- **Permissions:** `shipper.member`, `shipper.admin`; organisation loads only. Bulk export and bulk tracking-share are acts for the same roles, per record (Phase 3 §5.1). View-as (BR-27): read-only as the viewed member; bulk actions and export are unavailable in view-as.
- **Device needs:** DV-DESK: scan and filter hundreds of loads, switch between list and map, select and run bulk actions by keyboard. DV-PHONE: search one load and check it. DV-AT: full parity, with the list as the complete equivalent of the map (PP-08).
- **Loading states:** LS-1 for the collection and the map separately; LS-2 on filter change keeps the previous results until new ones arrive and announces the new result count politely. Positions refresh every 60 s, paused when hidden. Bulk actions: LS-5 up to 100 records; LS-7 over 100 records with progress when viewed.
- **Empty states:** EM-1: no loads → start a quote (PG-27) or import a file (PG-56). EM-2: filters match nothing → active filter count and a way to clear them.
- **Error states:** Per part E-SERVER, E-TIMEOUT → retry (IC-60); the other part stays usable. Map failure (E-UNAVAILABLE) → list remains fully usable (PP-08). E-VALIDATION: malformed URL parameters → defaults applied and stated. Bulk partial failure → per-record outcome reported; failed rows never block the successful ones (BR-28).
- **Success states:** SU-1: bulk share tracking confirmed with the count of links created and any failures per load. SU-3: export accepted, reference returned, notification when ready (LS-7).
- **Dependencies:** PG-40, PG-27, PG-56, XF-07, XF-14, map base layer (pending approval; deck.gl installed, Phase 7 §15).
- **Implementation notes:** Filters, view and cursor in the URL (Phase 3 §10); positions subscribed only for loads in view; export generated server-side. Acceptance: given 150 selected loads, when the user exports, then scope and total are stated before running (IC-23) and the export runs as a background job; given 3 of 20 share-tracking requests fail, then each failure is named with its reason and the 17 links are kept; the page of 50 loads returns within 800 ms at p95 (NFR-PERF-3). Analytics: `load.list.viewed` (view, filter count), `load.list.filtered`, `load.export.requested` (count), `tracking.link.bulk_created` (count). Audit: `export.requested` (scope, count), `tracking_link.created` per load. `useLoads` keyed `loadKeys.list(params)` with page size 50 (maximum 200); `useLoadPositions` 60 s; `useExportLoads`.

### PG-27 — Post a Load

`/shipper/loads/new` · Serves XF-01, XF-04, XF-16, XS-18 · Sections: [SC-27.x](./phase-5-section-blueprints.md#pg-27--post-a-load)

- **Purpose:** Quote and post a load (the core entity submission).
- **Business objective:** Quote-to-post conversion (KPI-01); time to coverage (KPI-02).
- **User objective:** Get a firm price and a live load in minutes.
- **Primary tasks:** "Price this shipment." "Post it to the network." "Offer it to my usual carriers." "Reuse last week's load."
- **Required data:** Facilities (PG-32), equipment and commodity enumerations, instant quote with validity (shipper price, Confidential), preferred carrier lists for the lane, organisation posting eligibility, the requester's spend limit outcome (within limit or approval required, with the approvers who can decide; BR-23), draft.
- **Permissions:** `shipper.member`, `shipper.admin`; posting requires an active organisation (XF-13). A member with a spend limit can always submit; the server decides whether the load posts or enters `PendingApproval`, and the client never hides the action because of a limit (Phase 3 §5.2). View-as (BR-27): read-only; posting requires write consent on the linked ticket.
- **Device needs:** DV-DESK: fast keyboard entry, many loads in a row. DV-PHONE: post a simple single-stop load. DV-AT: full parity, including the quote countdown (IC-46) announced at thresholds only.
- **Loading states:** LS-5 while the quote is requested ("Getting your price…", announced politely); quote validity counts down (BR-06, IC-46). LS-3 after 5 s; LS-4 at 30 s. LS-5 on posting ("Posting…").
- **Empty states:** EM-5: the flow always renders its current step; prefilled from `?from=<loadId>` (duplicate) or `?lane=` (estimator).
- **Error states:** E-VALIDATION per field (IC-02), entries kept. Quote expired → re-quote keeping all entries. Unserviceable lane, or no instant quote → custom quote request (XS-18, SC-27.7). E-FORBIDDEN: posting blocked → route to onboarding. E-UNAVAILABLE from pricing → entries kept, draft saved, retry offered. E-TIMEOUT on posting → retried automatically with the same idempotency key, never duplicated. Approval required is not an error: the user is told approval is needed, who can approve and by when (quote expiry).
- **Success states:** SU-2: load posted; user lands on PG-40 with tender progress. SU-2: approval required → load in `PendingApproval` on PG-40, stating approvers and the deadline; approvers notified (XF-16).
- **Dependencies:** XF-01, XF-04, XF-13, XF-16, PG-32, PG-29.
- **Implementation notes:** Multi-step state in `useReducer` with draft persisted locally (PP-06) and to the server after the lane step; schema composed over the generated load DTO; posting through a Server Action with an idempotency key. Acceptance: given a member whose limit is exceeded by the quote, when they post, then the load enters `PendingApproval` and they cannot approve it themselves; given the approval arrives after the quote expired, then the load returns to `Draft` and the requester is offered a re-quote carrying the approval note; given a double submit, then exactly one load is created. Analytics: `load.quote.requested`, `load.quote.expired`, `load.posted`, `load.approval.requested`. Audit: `load.drafted`, `load.posted`, `load.approval_requested` (amount, limit). `useQuote`, `usePostLoad`; quote queries never cached beyond their validity; local drafts expire after 30 days (NFR-PRIV-4).

### PG-28 — Compare Bids

`/shipper/loads/[loadId]/bids` · Serves XF-03, XF-16 · Sections: [SC-28.x](./phase-5-section-blueprints.md#pg-28--compare-bids)

- **Purpose:** Decide between carrier bids on one load.
- **Business objective:** Coverage at healthy margin (BG-05).
- **User objective:** Pick the best carrier at a fair price, quickly.
- **Primary tasks:** "Which bid is best value?" "Is this carrier reliable?" "Accept, decline or counter."
- **Required data:** Load lane and schedule, bids with amount (shipper-side price, Confidential), expiry, round, carrier scorecard and equipment, negotiation history, the viewer's spend limit outcome for each bid (BR-23), any bid acceptance already in `PendingApproval`.
- **Permissions:** `shipper.member`, `shipper.admin` of the load's organisation. Accepting a bid over the member's spend limit routes to `shipper.approver`; the approver cannot be the requester (BR-23). View-as (BR-27): read-only; accept, decline and counter require write consent.
- **Device needs:** DV-DESK: compare several bids at once. DV-PHONE: accept one bid from a notification. DV-AT: full parity; every comparison available as a sortable table (IC-22).
- **Loading states:** LS-1 then LS-2 every 20 s (Phase 7 §13), paused when hidden; new bids arrive without losing the user's place and are announced politely; LS-5 on accept ("Accepting…").
- **Empty states:** EM-4: no bids yet → how long the load has been posted and the tender progress.
- **Error states:** E-CONFLICT: bid expired or withdrawn between view and action → explained, other bids remain; load already booked → go to PG-40; accepted by another member → name who accepted. E-VALIDATION: counter amount out of the permitted range or round limit reached (3). E-TIMEOUT → retried with the same idempotency key. Approval required is not an error: the user is told who can approve and that approval must happen before the bid expires.
- **Success states:** SU-1: accepted → load moves to rate confirmation; all other bids closed (BR-02). SU-1: approval required → the bid acceptance is in `PendingApproval` with the deadline (bid expiry) and approvers notified.
- **Dependencies:** XF-03, XF-16, PG-03, PG-40.
- **Implementation notes:** Refetch bids every 20 seconds while open; accept uses an idempotent Server Action. Acceptance: given two members accept different bids simultaneously, then one succeeds and the other receives E-CONFLICT naming who accepted; given an acceptance in `PendingApproval` whose bid expires, then the requester is told it expired; bid data is never more than 30 s old while visible (§2.6). Analytics: `bid.accepted`, `bid.declined`, `bid.countered`, `bid.approval.requested`. Audit: `bid.accepted`, `bid.declined`, `bid.countered`, `bid.approval_requested`. `useBids` keyed `bidKeys.list(loadId)`, `useBidActions`; acceptance invalidates `loadKeys.detail(loadId)`.

### PG-29 — Preferred Carriers

`/shipper/carriers` · Serves XF-04 · Sections: [SC-29.x](./phase-5-section-blueprints.md#pg-29--preferred-carriers)

- **Purpose:** Maintain the organisation's preferred carriers and per-lane tender order (the Favorites page for shippers).
- **Business objective:** Loyalty and repeat volume; controlled tendering.
- **User objective:** Make sure trusted carriers get the earliest offer on their lanes.
- **Primary tasks:** "Add a carrier I trust." "Set who gets offered this lane, in what order." "Remove a carrier."
- **Required data:** Preferred carriers with scorecard and eligibility (Public), lane rules with ordered carriers and acceptance window (Internal).
- **Permissions:** Read `shipper.member`; edit `shipper.admin`; organisation records only. View-as (BR-27): read-only; edits require write consent.
- **Device needs:** DV-DESK: maintain lane rules. DV-AT: full parity, including keyboard reordering (IC-40). DV-PHONE: read only in practice.
- **Loading states:** LS-1; LS-5 on save ("Saving…"); reordering is local until saved.
- **Empty states:** EM-1: none added → how to add from PG-03 or from a delivered load. Lane rules EM-1: no rules → loads go to the open market without a waterfall.
- **Error states:** Carrier becomes ineligible → flagged and skipped in tendering (BR-18). E-VALIDATION: acceptance window out of range, duplicate carrier in a rule. E-PRECONDITION: another admin changed the rule → what changed and by whom, order kept for re-apply (SSB-8). E-FORBIDDEN on edit by a member → an admin can change it.
- **Success states:** SU-1: rule saved and announced politely (IC-14).
- **Dependencies:** PG-03, XF-04.
- **Implementation notes:** Reordering must be operable by keyboard (IC-40). Acceptance: given a carrier is suspended, then it is marked ineligible and the next carrier in the rule receives the tender; given two admins edit one rule, then the second save is refused with E-PRECONDITION. Analytics: `carrier.preferred.added`, `carrier.preferred.removed`, `tender.rule.saved`. Audit: `preferred_carrier.added`, `preferred_carrier.removed`, `tender_rule.updated` (before and after order). `usePreferredCarriers`, `useTenderRules`, version-checked on save.

### PG-30 — Invoices

`/shipper/invoices` · Serves XF-10 · Sections: [SC-30.x](./phase-5-section-blueprints.md#pg-30--invoices)

- **Purpose:** Manage the organisation's payables to Haulr.
- **Business objective:** Collection speed; low dispute rate (KPI-11).
- **User objective:** Pay what's due, on time, with evidence.
- **Primary tasks:** "What's due this week?" "Pay these invoices together." "Find the invoice for load HL-…" "Download statements."
- **Required data:** Invoices with status, amount, due date, load reference; outstanding and overdue totals; payment methods (masked). Amounts are Confidential; bank details appear masked only.
- **Permissions:** `shipper.finance`, `shipper.admin`; organisation invoices only. View-as (BR-27): read-only; paying is never available in view-as.
- **Device needs:** DV-DESK: filter, select and batch-pay invoices. DV-PHONE: check what is due. DV-AT: full parity.
- **Loading states:** LS-1; LS-2 on focus (§2.6: refetched on focus, not labelled); LS-2 on filter change keeps previous results and announces the count. Batch pay: LS-5 up to 100 invoices, LS-7 over 100.
- **Empty states:** EM-4: none yet → invoices are issued automatically on POD verification (BR-14). EM-2: filters match nothing → clear them.
- **Error states:** Payment failures per invoice explained; partial success in a batch payment is reported per invoice. E-UNAVAILABLE from the processor → payment unavailable, invoices still readable. E-CONFLICT: invoice already paid or disputed since selection → excluded with the reason. E-TIMEOUT → retried with the same idempotency key.
- **Success states:** SU-1: paid invoices update and remittance is available; batch outcome states paid, failed and excluded counts. SU-3 for batches over 100 invoices.
- **Dependencies:** PG-31, XF-10, XS-08.
- **Implementation notes:** Batch pay through one idempotent Server Action returning per-invoice outcomes; totals from the server. Acceptance: given 10 selected invoices where 2 fail, then 8 are paid and each failure is named with its reason; given selection changes, then the total stated before confirmation (IC-43) matches the server total. Analytics: `invoice.list.viewed`, `invoice.batch_pay.confirmed` (count), `invoice.statement.downloaded`. Audit: `invoice.paid` per invoice, `payment_batch.submitted` (count, total). `useInvoices` (page size 50, maximum 200), `useInvoiceSummary`, `usePayInvoices`.

### PG-31 — Invoice Detail and Pay

`/shipper/invoices/[invoiceId]` · Serves XF-10, XS-06 · Sections: [SC-31.x](./phase-5-section-blueprints.md#pg-31--invoice-detail-and-pay)

- **Purpose:** Review one invoice with its evidence and pay or dispute it (the Payment page).
- **Business objective:** Accurate collection.
- **User objective:** Confirm the charges match the agreement and settle them.
- **Primary tasks:** "Do these charges match what we agreed?" "Show me the POD." "Pay it." "Dispute this line."
- **Required data:** Invoice lines (linehaul, accessorials with evidence), agreed rate and governing rate confirmation version (Confidential), POD, terms, payments applied, dispute state, payment methods (masked; raw data never reaches Haulr, A6).
- **Permissions:** `shipper.finance`, `shipper.admin` of the invoiced organisation; other records return PG-53. View-as (BR-27): read-only; paying is never available in view-as.
- **Device needs:** DV-DESK mostly: compare lines with evidence. DV-PHONE: approve a single payment. DV-AT: full parity, including document previews with text alternatives (IC-58).
- **Loading states:** LS-1 per part (lines, evidence, payment methods); LS-5 on pay ("Paying…") and dispute ("Filing…"); processor entry loads in its own boundary.
- **Empty states:** EM-5: an invoice always has lines. Payments applied EM-1: none yet. Dispute EM-1: none filed.
- **Error states:** Payment declined → reason and alternatives; method needs verification → resume XS-08. E-CONFLICT: invoice already paid or disputed since opening → refresh and state the current status. E-VALIDATION: dispute without a line or reason. E-UNAVAILABLE from the processor → payment unavailable; dispute still possible. E-TIMEOUT → retried with the same idempotency key.
- **Success states:** SU-1: payment confirmed with reference and remittance. SU-2: dispute filed with a claim reference, only the disputed amount held (BR-16).
- **Dependencies:** XS-08, XS-06, PG-43.
- **Implementation notes:** Payment through the processor's tokenised flow (A6); confirmation step states the amount, method and date (PP-01, PP-05). Acceptance: given an accessorial line, then its evidence is reachable from the line; given a dispute on one line, then the remaining balance stays payable (BR-16); given a double submit, then exactly one payment is created. Analytics: `invoice.viewed`, `invoice.paid`, `invoice.disputed` (line count). Audit: `invoice.paid` (amount, method type), `invoice.disputed` (lines, amount, reason). `useInvoice` keyed `invoiceKeys.detail(id)`, refetched on focus; `usePayInvoices` with a `nanoid` idempotency key.

### PG-32 — Locations

`/shipper/locations` · Serves XF-01, XS-11 · Sections: [SC-32.x](./phase-5-section-blueprints.md#pg-32--locations)

- **Purpose:** Maintain the organisation's pickup and delivery facilities.
- **Business objective:** Faster, more accurate posting; better driver instructions.
- **User objective:** Enter a facility once and reuse it.
- **Primary tasks:** "Add our warehouse." "Update receiving hours." "Fix the dock instructions drivers keep missing."
- **Required data:** Facilities with address, geocode, hours, appointment rules, instructions (Internal), contacts (Confidential).
- **Permissions:** `shipper.member`, `shipper.admin`; organisation facilities only. View-as (BR-27): read-only; edits require write consent.
- **Device needs:** DV-DESK: add and edit facilities. DV-PHONE: look up a facility's instructions. DV-AT: full parity, including pin adjustment by typed coordinates or address search as an alternative to the map (PP-08).
- **Loading states:** LS-1; LS-5 on save ("Saving…") and on address verification ("Checking address…").
- **Empty states:** EM-1: none → why to add facilities (faster posting, better driver instructions).
- **Error states:** Address not verifiable → allow a pin adjustment with confirmation. E-VALIDATION: hours overlap or invalid time zone. E-PRECONDITION: facility edited by a colleague → changes and author stated, input kept (SSB-8). E-CONFLICT: facility used by active loads → the change applies to future loads only, and this is stated.
- **Success states:** SU-1: saved and announced politely.
- **Dependencies:** Geocoding; PG-27.
- **Implementation notes:** Geocode verified server-side. Acceptance: given an unverifiable address, when the user confirms a pin, then the facility saves with a manual-geocode flag; given concurrent edits, then the second save is refused with E-PRECONDITION. Analytics: `facility.created`, `facility.updated`, `facility.geocode.adjusted`. Audit: `facility.created`, `facility.updated` (changed fields), `facility.archived`. `useFacilities` keyed `facilityKeys.list(orgId)`, shared with PG-27.

---

## 8. Carrier Workspace

### PG-33 — Load Board

`/carrier/load-board` · Serves XF-02, XF-03, XS-09, XF-17 · Sections: [SC-33.x](./phase-5-section-blueprints.md#pg-33--load-board)

- **Purpose:** Search bookable loads (the Search page and the carrier's List/Map view).
- **Business objective:** Coverage speed (KPI-02); self-serve booking (KPI-03).
- **User objective:** Find the best-paying suitable load for a specific truck fast.
- **Primary tasks:** "Loads within 50 miles of Joliet going to Texas tomorrow." "Which pays best per mile after deadhead?" "Book it." "Tell me when more like this appear."
- **Required data:** Posted loads matching the search with lane, schedule, equipment, weight, carrier pay (Confidential, never shipper price, BR-05), rate per mile, deadhead, shipper score, instant-book or bid mode; eligibility state. Loads in `PendingApproval` never appear (XF-16).
- **Permissions:** `carrier.dispatcher`, `carrier.admin`; ineligible carriers can search but not book (BR-03). Private-tendered loads are visible only to the carrier holding the tender (Phase 3 §5.2). View-as (BR-27): search readable; saving and booking require write consent.
- **Device needs:** DV-PHONE: owner-operators search from the cab while parked. DV-DESK: dispatchers search for many trucks. DV-AT: full parity, with the list as the complete equivalent of the map (PP-08). DV-CAB: not targeted while driving.
- **Loading states:** LS-2: keep previous results while a new search runs; announce the result count politely. Results refresh every 30 s while visible (Phase 7 §13). LS-3 after 5 s; LS-4 at 15 s.
- **Empty states:** EM-2: no matches → active criteria count, widen radius or dates, or save as an alert.
- **Error states:** E-UNAVAILABLE or E-SERVER: search unavailable → retry (IC-60); previous results kept with their age. E-NOT-FOUND: a load in the results was booked by someone else → marked as gone when opened. E-VALIDATION: unknown origin → suggestions (IC-05). E-FORBIDDEN on book or bid while ineligible → the exact BR-03 reason and the fix.
- **Success states:** SU-1: search saved as an alert. SU-2: load booked (via PG-34).
- **Dependencies:** Search index, PG-34, PG-36, PG-40.
- **Implementation notes:** Search parameters in the URL; results refresh every 30 seconds while visible; list and map views share one query. Acceptance: given a search, then results return within 1.2 s at p95 (NFR-PERF-3); given a load goes `Booked` during viewing, then the next refresh removes it and an opened stale entry states it is gone; given the tab is hidden, then no refresh request is made. Analytics: `load_board.search.performed` (filter count, result count), `load_board.load.opened`, `load_board.search.saved`. Audit: `saved_search.created`. `useLoadBoard` keyed `loadBoardKeys.search(params)`, page size 50 (maximum 200), `refetchInterval` 30 s.

### PG-34 — Book Load

`/carrier/load-board/[loadId]/book` · Serves XF-02 · Sections: [SC-34.x](./phase-5-section-blueprints.md#pg-34--book-load)

- **Purpose:** Commit to a load and accept its rate confirmation (the Domain Transaction page).
- **Business objective:** Binding bookings (BR-04).
- **User objective:** Lock in the load and know exactly what was agreed.
- **Primary tasks:** "Book this load at this rate." "Check the terms before I commit." "Sign the rate confirmation."
- **Required data:** Load terms (stops, schedule, requirements, accessorial terms), carrier pay (Confidential), rate confirmation document and version, eligibility check result, signer evidence captured on acceptance (user, time, IP, version; BR-04).
- **Permissions:** `carrier.dispatcher`, `carrier.admin` of an eligible carrier. View-as (BR-27): terms readable; booking and signing are never performed through view-as without write consent, and signature evidence always records the acting staff identity alongside the member.
- **Device needs:** DV-PHONE and DV-DESK: complete booking and signing in one sitting. DV-AT: full parity; the rate confirmation is available as accessible text (IC-26, IC-58).
- **Loading states:** Eligibility and availability checked server-side before rendering. LS-5 on booking ("Booking…") and signing ("Signing…"); duplicates blocked.
- **Empty states:** EM-5: the page renders only for a bookable load.
- **Error states:** E-CONFLICT: load no longer available (409, taken) → offer similar loads. E-FORBIDDEN: ineligible → exact reason and route to the fix (BR-03). Signature fails (E-SERVER) → retry (IC-60) within the grace period (XF-02). E-TIMEOUT → retried with the same idempotency key. E-UNAVAILABLE from e-signature → booking held for the grace period and the user told.
- **Success states:** SU-2: booked; rate confirmation stored; user continues to driver assignment (XF-05).
- **Dependencies:** XF-02, XF-05, e-signature.
- **Implementation notes:** Booking through a Server Action with a `nanoid` idempotency key; conflict response (409) handled as "load taken". Acceptance: given two carriers book simultaneously, then exactly one succeeds and the other sees "load taken" with similar loads; given acceptance, then the stored evidence contains user, time, IP and document version (BR-04, CMP-4). Analytics: `load.booking.started`, `load.booked`, `load.booking.conflicted`. Audit: `load.booked`, `rate_confirmation.accepted` (version, IP). `useBookLoad`, `useSignAgreement`; success invalidates `loadKeys.detail(loadId)` and `loadBoardKeys`.

### PG-35 — My Loads (carrier)

`/carrier/loads` · Serves XF-05, XF-06, XF-07, XF-15, XF-17 · Sections: [SC-35.x](./phase-5-section-blueprints.md#pg-35--my-loads-carrier)

- **Purpose:** Manage the carrier's booked, active and past loads.
- **Business objective:** Assignment compliance (BR-09); tracking compliance.
- **User objective:** Keep every load assigned, tracked and moving.
- **Primary tasks:** "Which loads still need a driver?" "Where is each of my trucks?" "Find last month's load for this shipper." "Which loads have an amendment waiting for me?"
- **Required data:** Loads with status, assignment, next stop, tracking source and freshness, exceptions, pay (Confidential, carrier pay only), open amendment state and response deadline (BR-25).
- **Permissions:** `carrier.dispatcher`, `carrier.admin`; own carrier's loads only. Responding to an amendment happens on PG-64. View-as (BR-27): read-only; assignment requires write consent.
- **Device needs:** DV-DESK: many loads. DV-PHONE: the owner-operator's few loads, including answering an amendment from a notification. DV-AT: full parity.
- **Loading states:** LS-1; LS-2 on filter change keeps previous results and announces the count; positions refresh every 60 s, paused when hidden; LS-5 on assignment ("Assigning…").
- **Empty states:** EM-1: no loads → load board (PG-33). EM-2: filters match nothing → clear them.
- **Error states:** E-SERVER, E-TIMEOUT → retry; previous results kept (SSB-2). E-CONFLICT on assignment: driver already assigned elsewhere in that window, or load state moved → explain and refresh. Amendment lapsed (response deadline passed) → state it and that operations has an exception (XF-08).
- **Success states:** SU-1: assignment confirmed and announced politely.
- **Dependencies:** PG-40, XF-05, XF-15, PG-37, PG-64.
- **Implementation notes:** Same collection pattern and URL parameters as PG-26. Acceptance: given a load with an open amendment, then its response deadline is stated and it reaches PG-64 in one step; given the BR-09 deadline is within 2 hours and no driver is assigned, then the load is flagged. Analytics: `load.list.viewed` (carrier side), `load.assigned`, `amendment.review.opened`. Audit: `load.assigned` (driver, truck). `useLoads` with carrier scope, page size 50 (maximum 200); `useAssignLoad`.

### PG-36 — Saved Loads and Searches

`/carrier/saved` · Serves XS-09 · Sections: [SC-36.x](./phase-5-section-blueprints.md#pg-36--saved-loads-and-searches)

- **Purpose:** Manage watched loads and saved searches with alerts (the Saved Loads page).
- **Business objective:** Engagement and repeat booking (KPI-08).
- **User objective:** Stop searching the same lanes by hand.
- **Primary tasks:** "Show me loads I was watching." "Change how often I'm alerted." "Pause alerts while I'm on vacation."
- **Required data:** Watched loads with current status and carrier pay (Confidential), saved searches with alert settings and new-match counts (Internal, personal to the user).
- **Permissions:** `carrier.dispatcher`, `carrier.admin`; searches and watches are personal to the user. View-as (BR-27): readable as the member; changes require write consent.
- **Device needs:** DV-PHONE and DV-DESK: review watches and change alert settings. DV-AT: full parity.
- **Loading states:** LS-1 per part (watches, searches); LS-5 on saving settings; watch toggles are optimistic (IC-33) and revert on failure.
- **Empty states:** EM-1: nothing saved → how to save from PG-33.
- **Error states:** E-NOT-FOUND: watched load no longer available → marked as gone. E-VALIDATION: alert frequency or quiet period invalid. E-SERVER on an optimistic toggle → reverted and the user told.
- **Success states:** SU-1: alert settings saved and announced politely.
- **Dependencies:** PG-33, XS-03.
- **Implementation notes:** Opening a saved search navigates to PG-33 with its parameters. Acceptance: given alerts are paused until a date, then no alert is sent before it; given a watched load is booked by another carrier, then it is marked as gone. Analytics: `saved_search.alert.updated`, `saved_search.opened`, `load.watch.toggled`. Audit: `saved_search.updated`, `saved_search.deleted`. `useSavedSearches`, `useWatchedLoads`.

### PG-37 — Fleet

`/carrier/fleet` · Serves XF-05, XS-02, XF-17 · Sections: [SC-37.x](./phase-5-section-blueprints.md#pg-37--fleet)

- **Purpose:** Manage trucks, trailers and drivers.
- **Business objective:** Correct assignment and eligibility.
- **User objective:** Keep the fleet record accurate so assignment is fast.
- **Primary tasks:** "Add a truck." "Invite a new driver." "Who is available tomorrow?"
- **Required data:** Vehicles (type, equipment, identifiers, ELD link state), drivers (status, contact — Confidential, invitation state, current assignment).
- **Permissions:** Read `carrier.dispatcher`; edit `carrier.admin`, and dispatchers for drivers (Phase 3 §5). Own carrier only. View-as (BR-27): read-only; edits require write consent.
- **Device needs:** DV-DESK mostly. DV-PHONE: owner-operators add a truck or invite a driver. DV-AT: full parity.
- **Loading states:** LS-1 per part (vehicles, drivers); LS-5 on save and invite ("Saving…", "Sending…").
- **Empty states:** EM-1: no vehicles or drivers → why they are needed for dispatch and the step that adds one.
- **Error states:** Invitation failed → resend. E-VALIDATION: duplicate VIN or plate, invalid phone. E-CONFLICT: driver removed while assigned to an active load → blocked with the load named. E-PRECONDITION: vehicle edited by a colleague (SSB-8). E-UNAVAILABLE from the ELD integration → link state shown with its age.
- **Success states:** SU-1: saved; invitation sent and its state shown.
- **Dependencies:** XS-02, XF-05.
- **Implementation notes:** ELD connection handled by a backend integration; the page reports its state only. Acceptance: given a driver on an active load, then removal is refused with the load reference; given an invitation, then its state (sent, accepted, expired) is current on return. Analytics: `fleet.vehicle.added`, `fleet.driver.invited`. Audit: `vehicle.created`, `vehicle.updated`, `vehicle.archived`, `invitation.sent`, `membership.removed`. `useFleet` keyed `fleetKeys.list(carrierId)`; `useInvitations`.

### PG-38 — Settlements

`/carrier/settlements` · Serves XF-11 · Sections: [SC-38.x](./phase-5-section-blueprints.md#pg-38--settlements)

- **Purpose:** Track carrier pay and request quick pay (the carrier Payment page).
- **Business objective:** Carrier trust (BG-03); quick pay revenue.
- **User objective:** Know what's coming, when, and get it sooner if needed.
- **Primary tasks:** "What am I owed and when?" "Get paid today on this load." "Why was this deducted?" "Download remittances."
- **Required data:** Settlements with gross, accessorials, deductions, net, expected date, status, quick pay eligibility and fee. Amounts are Confidential; payout destination is masked.
- **Permissions:** Amounts `carrier.admin`; dates `carrier.dispatcher` (amounts absent from the dispatcher's response). Quick pay is an act for `carrier.admin` only. View-as (BR-27): read-only; quick pay is never available in view-as.
- **Device needs:** DV-PHONE and DV-DESK: check what is owed and request quick pay. DV-AT: full parity.
- **Loading states:** LS-1; LS-2 on focus (§2.6); LS-5 on quick pay ("Requesting…").
- **Empty states:** EM-4: none yet → settlements appear on POD verification, paid 3 business days later (BR-15). EM-2: filters match nothing → clear them.
- **Error states:** Payout failed → reason and route to PG-49. E-CONFLICT: settlement no longer eligible for quick pay (already paid or disputed) → refresh and state why. E-UNAVAILABLE from the processor → quick pay unavailable; data still readable. E-TIMEOUT → retried with the same idempotency key.
- **Success states:** SU-1: quick pay requested with net amount and arrival time stated.
- **Dependencies:** XF-11, XS-08, XS-06.
- **Implementation notes:** Quick pay confirmation must state fee and net before commitment (PP-01). Acceptance: given a dispatcher, then no amount is present in the response; given a double quick pay request, then exactly one is created; given a disputed deduction, then only the disputed amount is held (BR-16). Analytics: `settlement.list.viewed`, `settlement.quick_pay.requested`, `settlement.remittance.downloaded`. Audit: `quick_pay.requested` (settlement, fee, net). `useSettlements` (page size 50, maximum 200), `useSettlementSummary`, `useQuickPay` with a `nanoid` idempotency key.

---

### PG-65 — Dispatch Board

`/carrier/plan` · Serves XF-17, XF-05 · Sections: [SC-65.x](./phase-5-section-blueprints.md#pg-65--dispatch-board)

- **Purpose:** Plan every truck's week: which loads it runs, where it ends up and where it sits empty.
- **Business objective:** More paid miles per truck on Haulr freight, so carriers book with Haulr again (KPI-08), and every booked load assigned before its deadline (BR-09).
- **User objective:** See conflicts and empty windows before they cost money, and fix them from one place.
- **Primary tasks:** "What is every truck doing this week?" "Which loads still need a driver?" "Truck 12 is empty in Dallas on Thursday afternoon; find it a load." "Move this load to another driver." "Truck 7 is in the shop until Monday."
- **Required data:** Trucks and drivers (PG-37) with unavailable periods; booked and in-flight loads with pickup and delivery windows, stops and carrier pay (Confidential); each truck's last known position with its source and age (PP-03); driver available hours from a connected ELD (Confidential; returned only to the carrier's own users), absent otherwise; conflicts and open windows computed server-side; recommended loads for an open window.
- **Permissions:** Act: `carrier.dispatcher`, `carrier.admin` (own carrier). Read: `internal.ops`, without driver hours (CMP-12). Drivers see their own trips in PG-20, never the board. View-as (BR-27): read-only; moving a load or marking a truck unavailable requires write consent.
- **Device needs:** DV-DESK is the target: a week for up to 60 trucks, entirely by keyboard (IC-68). DV-PHONE: owner-operators with one to three trucks check the next three days, fill a window and mark a truck unavailable. DV-AT: full parity through IC-68, including a text account of each truck's week. DV-CAB, DV-WALL: not targeted.
- **Loading states:** LS-1 per part (plan, window suggestions); LS-2 every 60 s and on focus, paused when hidden; stale label after 5 min (§2.6, fleet plan); LS-5 when moving a load or marking a truck unavailable ("Moving…", "Saving…").
- **Empty states:** EM-1: no trucks → why the plan needs them and the step that adds one (PG-37). EM-1: trucks but no booked loads this week → find loads (PG-33) for the fleet's equipment. EM-2: `truck` or `driver` filter matches nothing → clear it.
- **Error states:** E-CONFLICT: the load chosen for a window was booked by another carrier → similar loads offered (XF-02); a move would overlap another load on that truck → refused with the overlap named. E-PRECONDITION: assignment changed by a colleague (SSB-8, IC-67). E-UNAVAILABLE from the ELD integration → hours shown as unavailable, with the last reading's age. E-VALIDATION: an unavailable period that ends before it starts or covers a booked load. E-FORBIDDEN: carrier not yet approved → SH-06. E-OFFLINE, E-SERVER, E-TIMEOUT → last plan kept with its age; retry (IC-60).
- **Success states:** SU-1: a moved load, a new assignment or an unavailable period is current on the plan and announced politely. Booking from a window (PG-34) returns here with the load in place (SU-1).
- **Dependencies:** XF-17, XF-05, XF-02, PG-37, PG-33, PG-35, SH-15, IC-68, ELD integration (A5).
- **Implementation notes:** The plan is a server-computed view over bookings, assignments, stop events and unavailable periods; nothing is scheduled client-side. Week in `?week=`, focused truck in `?truck=`. Scheduling conflicts are advisory and never block a move. ELD hours are displayed as reported, never evaluated against hours-of-service rules, and Haulr stores no carrier decision about hours (Phase 2 XF-17). Acceptance: given a booked load with no driver inside its BR-09 deadline, then it is flagged here and in PG-35; given an open window, when the dispatcher asks for loads, then PG-33 opens filtered to the truck's position, radius, window and equipment; given no ELD connection, then no hours figure or estimate appears; every action works without dragging (WCAG 2.5.7). Analytics: `fleet.plan.viewed`, `fleet.plan.window_filled` (empty-miles band), `fleet.plan.load_moved`, `fleet.truck.unavailable_set`. Audit: `assignment.changed` (reason, as SH-15 requires on reassignment), `vehicle.unavailable_set`. `useFleetPlan` keyed `fleetPlanKeys.week(carrierId, week)`.

## 9. Driver

### PG-39 — Driver Trip

`/driver/trips/[loadId]` · Serves XF-06, XF-09, XF-15 · Sections: [SC-39.x](./phase-5-section-blueprints.md#pg-39--driver-trip)

- **Purpose:** Run the stop workflow for one trip.
- **Business objective:** Accurate timestamps (detention, KPI-04), POD speed (KPI-06), tracking (KPI-05).
- **User objective:** Know the next stop and report each step with minimal effort.
- **Primary tasks:** "Where am I going and when?" "I've arrived." "I'm loaded, leaving." "Here's the signed POD." "I'm delayed." "Call dispatch."
- **Required data:** Stops with address, appointment, references, instructions, contacts (Confidential) from the governing rate confirmation only (a proposed amendment never changes the trip until accepted, BR-25); current step; allowed next events; offline queue; location consent. The driver's precise location is Restricted.
- **Permissions:** `carrier.driver` assigned to the load; any other load returns PG-53. View-as (BR-27): read-only; stop events and POD are never recorded through view-as.
- **Device needs:** DV-CAB: single-handed, gloves, glare, intermittent signal, seconds of attention; every stop event reachable in one action. DV-PHONE: the same. DV-AT: full parity, every event operable by voice control and screen reader. DV-DESK: not targeted.
- **Loading states:** LS-6: cached trip available immediately with its age; LS-2 refresh is silent (SSB-2). LS-5 on each event is optimistic (IC-29): acknowledged at once and confirmed once synced. POD uploads show progress and resume after connectivity returns.
- **Empty states:** EM-5: the page renders only for an assigned trip; a trip with no remaining stops shows the delivered state.
- **Error states:** E-OFFLINE → events queued with count (SSB-4). Upload interrupted (E-OFFLINE, E-TIMEOUT or E-UNAVAILABLE) → retried automatically from the queue under its event ID (§2.2). Permission revoked → re-grant guidance. Wrong event → undo within 5 minutes. E-CONFLICT: event no longer legal (operations moved the state) → the new state explained and the queued event discarded with notice. E-NOT-FOUND: driver unassigned → the trip is withdrawn and the driver told to contact dispatch. Amendment accepted during the trip → the updated stops are announced assertively once.
- **Success states:** SU-1: each event acknowledged immediately (optimistic) and confirmed once synced; the driver is told when an accepted amendment changed the trip.
- **Dependencies:** XF-06, XF-09, XF-15, geolocation, camera.
- **Implementation notes:** Offline event queue persisted in IndexedDB through browser-native APIs (no new dependency unless approved); events carry device time and a `nanoid` event ID for de-duplication; location collected through the browser only while the page is open (A8). Acceptance: given the device is offline, when the driver records arrival, then the event is queued with device time and replayed exactly once on reconnect; given an amendment is accepted, then the trip reflects the new stops on the next refresh and the driver is notified; queued events survive a browser restart for 7 days (NFR-AV-6). Analytics: `driver.stop_event.recorded` (event type, offline flag), `driver.pod.captured`, `driver.issue.reported`, `driver.event.undone`. Audit: `stop_event.recorded` (event, device time, source), `pod.uploaded`, `stop_event.undone`, `issue.reported`. `useTrip`, `useStopEvents`, `usePodUpload`; initial JS ≤ 150 KB; 99.95% availability (NFR-AV-2).

---

## 10. Shared Records and Utilities

### PG-40 — Load Details

`/loads/[loadId]` · Serves XF-01 … XF-11, XF-15, XF-16, XS-04, XS-05, XS-06 · Sections: [SC-40.x](./phase-5-section-blueprints.md#pg-40--load-details)

- **Purpose:** The single record of a load for every party (the Core Entity Details page; IA-P1).
- **Business objective:** One source of truth; fewer calls.
- **User objective:** Understand the load's state and do the next thing their role allows.
- **Primary tasks:** Shipper: "Is it covered, where is it, is it late? Share tracking. Cancel. Change the terms." Carrier: "Assign a driver, update status, upload documents, check pay, review a proposed change." Approver: "Approve or reject this request." Operations: "Fix what's wrong." Everyone: "Talk about this load."
- **Required data:** Load (lane, stops, schedule, equipment, commodity, references), status and timeline, role-shaped money (BR-05; shipper price and carrier pay Confidential), tender or bid state, approval state (requester, approvers, deadline, decision and reason; BR-23), amendment state and every rate confirmation version (BR-25), assignment, positions and ETA (precise location Restricted, shown only to roles with live-location read), exceptions, documents, accessorials, thread, invoice or settlement link, claims, ratings.
- **Permissions:** Parties and internal roles (Phase 3 §5.2); every action gated by role and state (Phase 2 §5). Proposing an amendment is an act for `shipper.member`, `shipper.admin` and operations; accepting or declining is for the booked carrier on PG-64. Approving a request in `PendingApproval` is for `shipper.approver` or `shipper.admin`, never the requester (BR-23). View-as (BR-27): read-only as the viewed member; any action requires write consent on the linked ticket and is attributed to both identities.
- **Device needs:** DV-DESK: full management. DV-PHONE: check status, share tracking, approve an accessorial or a spend request, message. DV-AT: full parity, including a text equivalent of the map and timeline (PP-08).
- **Loading states:** LS-1 per part; live parts refresh on their own interval (positions 60 s, bids 20 s, open thread 10 s; Phase 7 §13), paused when hidden. LS-5 on each transition with its pending label from constants.
- **Empty states:** Each part states its own emptiness: EM-4 no documents yet (POD after delivery), EM-4 no position yet (tracking starts at pickup), EM-1 no messages (the thread starts here), EM-1 no claims, EM-4 no amendment history until a change is proposed.
- **Error states:** Not a party → PG-53 (E-NOT-FOUND). E-CONFLICT: action no longer legal (state moved) → explain the new state and refresh; approval already decided by another approver → name who and when; amendment already open → only one open amendment per load (XF-15). E-PRECONDITION: edited concurrently → what changed and by whom, input kept (SSB-8). E-VALIDATION: reason missing where required (cancel, hold), stops already completed cannot be amended. Approval deadline passed → the request returns to `Draft` and the requester is offered a re-quote. E-SERVER per part → retry; other parts usable.
- **Success states:** SU-1: each state transition confirmed and reflected in the timeline. SU-1: amendment proposed → carrier notified and the response deadline stated. SU-1: approval decided → the original action completes (load posts, bid accepted, accessorial approved) or returns to `Draft` with the reason.
- **Dependencies:** Nearly every flow; see Phase 2 §8.
- **Implementation notes:** Server component fetches the role-shaped load; offered actions derive from one function mapping (role, state) to legal transitions, shared with PG-35 and PG-26; the `load` query key is invalidated by all load mutations. Acceptance: given a carrier viewer, then shipper price is absent from the response (BR-05); given an amendment is proposed while another is open, then it is refused with E-CONFLICT; given a requester opens their own pending request, then no approve action is offered and the server refuses self-approval; given an accessorial over the requester's limit, then it enters `PendingApproval`. Analytics: `load.viewed` (role), `load.cancelled`, `load.amendment.proposed`, `load.approval.decided`, `tracking.link.created`, `accessorial.approved`. Audit: `load.cancelled` (reason), `load.held`, `amendment.proposed`, `amendment.withdrawn`, `approval.approved`, `approval.rejected` (reason), `accessorial.approved`, `tracking_link.created`, `tracking_link.revoked`. `useLoad` keyed `loadKeys.detail(id)`, record read ≤ 500 ms at p95 (NFR-PERF-3); `useAmendments` (SC-40.16) and `useApprovalRequests` (SC-40.17) for amendment and approval state.

### PG-41 — Messages

`/messages` · Serves XS-04 · Sections: [SC-41.x](./phase-5-section-blueprints.md#pg-41--messages)

- **Purpose:** All load and ticket conversations in one place.
- **Business objective:** Keep communication on the record (BR-19).
- **User objective:** Reply fast and know what's unread.
- **Primary tasks:** "What's new?" "Reply to the carrier on HL-…" "Find what the shipper said about the dock."
- **Required data:** Threads with load or ticket reference, participants, unread counts, messages (Confidential free text), attachments (Confidential), read receipts.
- **Permissions:** Participants only; internal roles may join load threads. No free-form messaging outside a load or ticket (BR-19). View-as (BR-27): threads readable; sending requires write consent and is attributed to both identities.
- **Device needs:** DV-PHONE and DV-DESK equally: read and reply. DV-CAB: drivers reach threads from PG-39 for short replies. DV-AT: full parity; new messages in the open thread announced politely (IC-35).
- **Loading states:** LS-1 for threads and the open thread separately; LS-2: the open thread refreshes every 10 s and the thread index every 60 s (Phase 7 §13), paused when hidden. Sending is optimistic (SH-04) with a pending state.
- **Empty states:** EM-1: no conversations → they start on loads (PG-40) or tickets (PG-08). EM-2: search matches nothing → clear it.
- **Error states:** Failed send (E-SERVER, E-TIMEOUT) kept with retry (IC-60, XS-04). E-OFFLINE → message kept as unsent and sent on reconnect only after the user confirms. E-NOT-FOUND: thread no longer accessible (removed from the load) → state it. Attachment rejected (type, limit or scan) → reason named.
- **Success states:** SU-1: sent and delivered states shown; the thread reflects the new message.
- **Dependencies:** XS-04, PG-40.
- **Implementation notes:** Selected thread in `?thread=`; polling or server-sent events chosen in Phase 7 §13. Acceptance: given a send fails, then the text is kept and can be resent without re-typing; given a new message while the thread is open, then it is visible within 10 s and announced politely once. Analytics: `message.sent` (thread type, has attachment), `message.send.failed`, `thread.opened`. Audit: `message.sent` (thread, never the text in analytics). `useThreads`, `useMessages` (`refetchInterval` 10 s), `useSendMessage` with a `nanoid` client ID for de-duplication.

### PG-42 — Notifications

`/notifications` · Serves XS-03 · Sections: [SC-42.x](./phase-5-section-blueprints.md#pg-42--notifications)

- **Purpose:** The complete history of what the user was told.
- **Business objective:** Timely action on events.
- **User objective:** Catch up and jump to what matters.
- **Primary tasks:** "What happened while I was away?" "Mark all read." "Change what I get notified about."
- **Required data:** Notifications with type, subject reference, time, read state (Internal; no rates in notification text).
- **Permissions:** Own notifications only. View-as (BR-27): readable as the member; marking read requires write consent.
- **Device needs:** DV-PHONE and DV-DESK: catch up and open the subject. DV-AT: full parity; unread count changes announced politely (IC-53).
- **Loading states:** LS-1; LS-2 on the unread count every 60 s (Phase 7 §13), paused when hidden; mark-read is optimistic.
- **Empty states:** EM-1: none → what will arrive here and a route to PG-47 preferences. EM-3: all read → caught up, with the last-checked time.
- **Error states:** E-SERVER or E-TIMEOUT → retry; previously loaded notifications stay (SSB-2). E-NOT-FOUND when opening a subject the user can no longer reach → "no longer available". Optimistic mark-read fails → reverted and the user told.
- **Success states:** SU-1: read state updated and the unread count current.
- **Dependencies:** XS-03, PG-47.
- **Implementation notes:** Unread count shared through one query key used everywhere. Acceptance: given "mark all read", then the unread count everywhere becomes 0 without a reload; given 500 notifications, then the collection pages by cursor (default 50, maximum 200). Analytics: `notification.opened` (type), `notification.all_read`. Audit: `notification.marked_read` (bulk count). `useNotifications` keyed `notificationKeys.unread()`, `refetchInterval` 60 s.

### PG-43 — Documents

`/documents` · Serves XS-12, XF-09 · Sections: [SC-43.x](./phase-5-section-blueprints.md#pg-43--documents)

- **Purpose:** The organisation's document vault.
- **Business objective:** Audit readiness; dispute evidence.
- **User objective:** Find, preview and share any document.
- **Primary tasks:** "Find the POD for HL-…" "Download last month's rate confirmations." "Replace our insurance certificate."
- **Required data:** Documents with type, load, party, version, upload time, expiry. Rate confirmations and invoices are Confidential; W-9 and tax documents are Restricted; insurance certificates are Public once verified.
- **Permissions:** Organisation members except drivers; per-document access checked server-side; bulk download is an act for the same members per document. View-as (BR-27): readable except Restricted documents; upload and replace require write consent.
- **Device needs:** DV-DESK mostly: filter, preview and download in bulk. DV-PHONE: find and preview a single document. DV-AT: full parity; previews have text alternatives (IC-58).
- **Loading states:** LS-1; LS-2 on filter change keeps results and announces the count; LS-5 on upload with per-file progress; bulk download: LS-5 up to 100 documents, LS-7 over 100.
- **Empty states:** EM-1: none → when documents arrive (booking, delivery, onboarding). EM-2: filters (`docType`, `load`) match nothing → clear them.
- **Error states:** Download failure (E-SERVER, E-TIMEOUT) → retry (IC-60); signed URL expired (5 minutes, SEC-7) → a fresh one is requested automatically once. Upload rejected (type, limit, failed scan) → reason named. E-NOT-FOUND: document no longer accessible → "no longer available". E-PRECONDITION: replaced by a colleague meanwhile → the newer version named.
- **Success states:** SU-1: upload or replacement confirmed with version. SU-3: bulk download accepted with reference and notification when ready.
- **Dependencies:** XS-12, PG-40.
- **Implementation notes:** Downloads through short-lived signed URLs from the backend. Acceptance: given a replaced certificate, then earlier versions remain retrievable for 7 years (BR-20); given 250 selected documents, then scope is stated before running (IC-23) and the download runs as a background job. Analytics: `document.previewed` (type), `document.downloaded` (type, count), `document.uploaded` (type). Audit: `document.uploaded`, `document.replaced` (version), `document.downloaded` (Confidential and Restricted types). `useDocuments` (page size 50, maximum 200), `useDocumentUpload`; documents refetched on focus (§2.6).

### PG-44 — Claims

`/claims` · Serves XS-06 · Sections: [SC-44.x](./phase-5-section-blueprints.md#pg-44--claims)

- **Purpose:** Track claims and disputes.
- **Business objective:** Fair, fast resolution; financial accuracy.
- **User objective:** Know the status of every claim and what's needed.
- **Primary tasks:** "What's the status of my damage claim?" "Which claims need my response?" "File a new claim."
- **Required data:** Claims with type, load, amount (Confidential), status, whose turn, deadline.
- **Permissions:** Per Phase 3 §3.3: `shipper.*`, `carrier.admin`, `carrier.dispatcher`, `internal.finance` (act) and `internal.support` (read); organisation claims only for external roles. View-as (BR-27): read-only.
- **Device needs:** DV-DESK mostly: filter and follow claims. DV-PHONE: check whose turn it is. DV-AT: full parity.
- **Loading states:** LS-1; LS-2 on filter change keeps results and announces the count; claims refetched on focus.
- **Empty states:** EM-1: none → how to file from a load (PG-40, PG-45 with `?load=`). EM-2: filters match nothing → clear them. EM-3: nothing awaiting the user's response.
- **Error states:** E-SERVER, E-TIMEOUT → retry; previous results kept (SSB-2). E-VALIDATION: malformed URL parameters → defaults applied and stated.
- **Success states:** SU-1: a claim filed on PG-45 appears here with its reference.
- **Dependencies:** PG-45, XS-06.
- **Implementation notes:** Same collection pattern as PG-26. Acceptance: given a claim whose turn is the user's, then it states the deadline; given `internal.support`, then no act is offered. Analytics: `claim.list.viewed`, `claim.list.filtered`. No mutations on this page, so no audit events. `useClaims` keyed `claimKeys.list(params)`, page size 50 (maximum 200).

### PG-45 — Claim Detail

`/claims/new`, `/claims/[claimId]` · Serves XS-06 · Sections: [SC-45.x](./phase-5-section-blueprints.md#pg-45--claim-detail)

- **Purpose:** File a claim and carry it to resolution.
- **Business objective:** Evidence-based resolution (PP-09).
- **User objective:** Make the case once, completely, and see progress.
- **Primary tasks:** "File a shortage claim on HL-…" "Respond with our evidence." "Accept the settlement."
- **Required data:** Claim type, load, amount (Confidential), description (Confidential free text), evidence documents, responses, status history, proposed resolution.
- **Permissions:** Parties to the load and internal finance (act); `internal.support` (read). Non-parties receive PG-53. View-as (BR-27): read-only; filing, responding and accepting require write consent.
- **Device needs:** DV-DESK mostly: assemble evidence. DV-PHONE: add photos (IC-25). DV-AT: full parity.
- **Loading states:** LS-1 per part (claim, evidence, history); LS-5 on filing, responding and accepting; per-file upload progress.
- **Empty states:** EM-5: a claim record always has a type, load and amount; responses EM-4 until the counter-party replies, with whose turn and by when.
- **Error states:** Outside the filing window → explained (BR-17, 9 months from delivery). Missing evidence → exact statement of what is required. E-VALIDATION: amount exceeds the load's value or missing type. E-CONFLICT: claim already resolved or withdrawn → state it. E-PRECONDITION: the other party responded meanwhile → their response shown, input kept (SSB-8). Upload rejected → reason.
- **Success states:** SU-2: filed with reference (`CLM-`). SU-1: resolution accepted and applied to the invoice or settlement.
- **Dependencies:** XS-06, PG-40, PG-31, PG-38.
- **Implementation notes:** `/claims/new?load=` prefills the load; draft persisted (PP-06). Acceptance: given a delivery 10 months ago, then filing is refused with the BR-17 reason; given acceptance of a resolution, then the linked invoice or settlement reflects the adjustment. Analytics: `claim.filed` (type), `claim.responded`, `claim.resolution.accepted`. Audit: `claim.filed` (type, amount), `claim.responded`, `claim.resolution_accepted`, `claim.withdrawn`. `useClaim`, `useCreateClaim` with a `nanoid` idempotency key, `useClaimActions`; drafts expire after 30 days (NFR-PRIV-4).

### PG-46 — Profile

`/profile` · Serves XS-11 · Sections: [SC-46.x](./phase-5-section-blueprints.md#pg-46--profile)

- **Purpose:** The user's personal details.
- **Business objective:** Accurate contact data.
- **User objective:** Keep personal details correct.
- **Primary tasks:** "Update my phone number." "Change my photo."
- **Required data:** Name, email, phone and avatar (Confidential, personal data), role, organisation (read-only). For members provisioned by SSO, name and email come from the identity provider.
- **Permissions:** Own profile only. SSO-provisioned members cannot change name or email here; the identity provider is the source (BR-24). View-as (BR-27): readable; never editable.
- **Device needs:** DV-PHONE and DV-DESK: edit a field in one step. DV-AT: full parity.
- **Loading states:** LS-1; LS-5 on save ("Saving…"); avatar upload shows progress.
- **Empty states:** EM-5: a profile always exists for a signed-in user; optional fields not yet filled state what they are used for.
- **Error states:** E-VALIDATION per field (IC-02). E-CONFLICT: new email already in use. E-PRECONDITION: profile changed in another session (SSB-8). Avatar rejected (type, limit) → reason.
- **Success states:** SU-1: saved and announced politely; email change pending until verified.
- **Dependencies:** Backend `users` module (`GET /users/me`).
- **Implementation notes:** Email change requires verification. Acceptance: given an email change, then the old email stays active until the new one is verified and the old address is notified; given an SSO member, then name and email are read-only. Analytics: `profile.updated` (field names only), `profile.email.change_requested`. Audit: `user.profile_updated` (changed fields), `user.email_change_requested`, `user.email_changed`. `useProfile`, `useChangeEmail`.

### PG-47 — Settings

`/settings` · Serves XS-03, XS-11, XS-13 · Sections: [SC-47.x](./phase-5-section-blueprints.md#pg-47--settings)

- **Purpose:** Security and notification preferences.
- **Business objective:** Account security; relevant notifications.
- **User objective:** Control access and noise.
- **Primary tasks:** "Change my password." "Turn on two-factor." "Sign out my other devices." "Stop texting me about bids."
- **Required data:** MFA state, sessions (device, approximate location at city level, last activity; Confidential), notification preferences by event and channel, quiet hours, the organisation's identity policy (SSO required, idle timeout; BR-24).
- **Permissions:** Own settings only. When the organisation requires SSO, password change and Haulr MFA are not offered (the identity provider governs them) except to the break-glass admin; the idle timeout follows organisation policy (SEC-3, BR-24). View-as (BR-27): security settings and notification preferences are read-only.
- **Device needs:** DV-PHONE and DV-DESK: change a preference or sign out other sessions. DV-AT: full parity; re-authentication (IC-13) fully keyboard and screen-reader operable.
- **Loading states:** LS-1 per part (security, sessions, preferences); LS-5 on each change; preference switches are optimistic (IC-36) and revert on failure.
- **Empty states:** EM-5: preferences always have defaults. Sessions EM-5: the current session is always listed.
- **Error states:** Re-authentication required for sensitive changes (XS-11, IC-13). E-VALIDATION: new password rules (SEC-1), invalid quiet hours. E-FORBIDDEN: action governed by SSO policy → the reason and the identity provider named. Attempt to disable a critical event → refused with the reason (XS-03).
- **Success states:** SU-1: saved; a security notification is sent for sensitive changes; other sessions revoked within 5 minutes (SEC-3).
- **Dependencies:** XS-03, XS-11, XS-13.
- **Implementation notes:** Critical notification events cannot be fully disabled (XS-03). Acceptance: given "sign out other devices", then those sessions end within 5 minutes; given an SSO-required organisation, then password and MFA changes are not offered to ordinary members. Analytics: `settings.notification.updated` (event, channel), `settings.mfa.enrolled` (method), `settings.sessions.revoked` (count). Audit: `password.changed`, `mfa.enrolled`, `mfa.removed`, `session.revoked`, `notification_preferences.updated`. `useMfa`, `useSessions`, `useNotificationPreferences`, `useChangePassword`.

### PG-48 — Organization and Team

`/settings/organization` · Serves XS-02, XS-13, XF-16 · Sections: [SC-48.x](./phase-5-section-blueprints.md#pg-48--organization-and-team)

- **Purpose:** Organisation profile and membership.
- **Business objective:** Correct access (Phase 3 §5).
- **User objective:** Give each person the access their job needs.
- **Primary tasks:** "Invite a colleague." "Change their role." "Remove someone who left." "Update company details." "Set a member's spend limit."
- **Required data:** Organisation details, members with roles, status, provisioning source (invitation or SCIM) and spend limit (shipper side, Confidential), pending invitations; member emails are Confidential.
- **Permissions:** Edit by admins (`shipper.admin`, `carrier.admin`; `carrier.dispatcher` for drivers); read by members; `org.security` reads. Spend limits are set by `shipper.admin` only (BR-23). For SCIM-provisioned members, roles follow identity-provider group mapping and deprovisioning happens there (BR-24). View-as (BR-27): read-only; role changes are never made through view-as without write consent.
- **Device needs:** DV-DESK mostly. DV-PHONE: invite a driver. DV-AT: full parity.
- **Loading states:** LS-1 per part (details, members, invitations); LS-5 on invite, role change and removal.
- **Empty states:** EM-1: only the admin → invite guidance. Invitations EM-3: none pending.
- **Error states:** Last admin removal blocked (XS-02). E-FORBIDDEN: role change on a SCIM-managed member → change the identity-provider group instead; re-authentication older than 10 minutes → IC-13 (roles are sensitive, §2.8). E-VALIDATION: invalid email, spend limit not a positive amount. E-CONFLICT: invitee already a member here or in another organisation. E-PRECONDITION: member changed by another admin (SSB-8).
- **Success states:** SU-1: invitation sent; role changed; spend limit saved; all organisation admins notified of role changes (§2.8).
- **Dependencies:** XS-02, XS-13, PG-15.
- **Implementation notes:** Role changes through Server Actions; audited. Acceptance: given the last admin, then removal and demotion are refused; given a new spend limit, then the next post over it enters `PendingApproval`; given a removed member, then their sessions end within 5 minutes (SEC-3). Analytics: `team.invitation.sent` (role), `team.role.changed`, `team.member.removed`, `team.spend_limit.set`. Audit: `invitation.sent`, `invitation.revoked`, `member.role_changed` (before, after, reason), `member.removed`, `spend_limit.changed` (before, after). `useMembers`, `useInvitations`, `useOrganization`.

### PG-49 — Payment and Payout Methods

`/settings/billing` · Serves XS-08 · Sections: [SC-49.x](./phase-5-section-blueprints.md#pg-49--payment-and-payout-methods)

- **Purpose:** Manage how the organisation pays or is paid.
- **Business objective:** Successful money movement.
- **User objective:** Set up a verified default method securely.
- **Primary tasks:** "Add our bank account." "Finish verifying the micro-deposits." "Make this the default." "Remove the old card."
- **Required data:** Methods with type, masked identifier, verification state, default flag; terms and credit limit (shipper). Bank and card details are Confidential and held by the processor only (A6, CMP-5); ACH authorisations retained (CMP-6).
- **Permissions:** `shipper.admin`, `shipper.finance`, `carrier.admin`; re-authentication for changes (IC-13). View-as (BR-27): not available; payout and payment methods are never shown (Phase 3 §5.2).
- **Device needs:** DV-DESK mostly. DV-PHONE: verify micro-deposits. DV-AT: full parity, including the processor's hosted entry (IC-42).
- **Loading states:** LS-1; processor entry loads separately in its own boundary; LS-5 on add, verify, set default and remove.
- **Empty states:** EM-1: none → why a method is required (paying invoices or receiving settlements).
- **Error states:** Verification failed → retry or other method. E-FORBIDDEN: re-authentication older than 10 minutes → IC-13. E-CONFLICT: removing the only verified default while invoices or settlements are pending → blocked with the reason. E-UNAVAILABLE from the processor → method entry unavailable; existing methods readable. Sanctions screening hold on a new payee (CMP-11) → review pending.
- **Success states:** SU-1: method verified and default set; all admins notified (XS-08).
- **Dependencies:** Payments processor, XS-08.
- **Implementation notes:** Raw account data never touches Haulr servers (A6). Acceptance: given a new payout method, then every organisation admin is notified and sanctions screening runs; given re-authentication older than 10 minutes, then the change requires IC-13 before submission. Analytics: `billing.method.added` (type), `billing.method.verified`, `billing.method.defaulted`, `billing.method.removed`. Audit: `payment_method.added`, `payment_method.verified`, `payment_method.default_changed`, `payment_method.removed` (all with reason). `usePaymentMethods` keyed `paymentMethodKeys.list(orgId)`, never persisted beyond the session.

### PG-04 — Shipper Public Profile

`/shippers/[shipperId]` · Serves XS-05, XF-02 · Sections: [SC-04.x](./phase-5-section-blueprints.md#pg-04--shipper-public-profile)

- **Purpose:** Show carriers a shipper's reputation.
- **Business objective:** Trust on the carrier side.
- **User objective:** "Is this shipper good to work with?"
- **Primary tasks:** "How long do they keep trucks at the dock?" "Do they pay accessorials fairly?"
- **Required data:** Shipper name, years on Haulr, facility dwell times, carrier ratings, volume band. All aggregates (Internal to authenticated carriers); no shipper pricing (Confidential, BR-05).
- **Permissions:** Read for `carrier.dispatcher`, `carrier.admin`, internal roles; no mutations. View-as (BR-27): readable as the viewed member.
- **Device needs:** DV-PHONE and DV-DESK: check reputation before booking. DV-AT: full parity, with a text equivalent for each aggregate.
- **Loading states:** LS-1 per part (identity, dwell times, ratings); aggregates cached for 1 hour.
- **Empty states:** EM-4: not enough data (fewer than 5 rated loads) → say so and that figures appear as loads are delivered.
- **Error states:** E-NOT-FOUND: unknown or suspended shipper → PG-53. E-SERVER per part → retry; others usable.
- **Success states:** No success state: the page performs no action.
- **Dependencies:** XS-05.
- **Implementation notes:** Aggregates only; no shipper pricing (BR-05). Acceptance: given fewer than 5 rated loads, then no rating figure is shown; given any response, then it contains no shipper price or margin. Analytics: `shipper.profile.viewed`. No audit events (read-only). `useShipperProfile` stale time 1 hour.

---

## 11. Internal Tools

### PG-50 — Exception Queue

`/ops/exceptions` · Serves XF-08 · Sections: [SC-50.x](./phase-5-section-blueprints.md#pg-50--exception-queue)

- **Purpose:** Work exceptions to resolution.
- **Business objective:** Service protection; KPI-10.
- **User objective:** Resolve the riskiest exceptions quickly without colliding with colleagues.
- **Primary tasks:** "Give me the next riskiest exception." "What happened on this load?" "Re-tender it." "Resolve and note why."
- **Required data:** Exceptions with type (including lapsed amendments, BR-25), severity, risk score, load, owner, age; selected exception's evidence and load context (both parties' money visible to operations, Confidential); resolution reason codes.
- **Permissions:** `internal.ops` (all types); compliance and finance for their own types. Not reachable through view-as.
- **Device needs:** DV-DESK; keyboard-driven for speed (IC-49). DV-AT: full parity. DV-WALL: not targeted (PG-21 serves it).
- **Loading states:** LS-1 then LS-2: queue refresh every 15 seconds, paused when hidden; the selected exception stays in focus during refresh; LS-5 on claim, re-tender and resolve.
- **Empty states:** EM-3: queue clear with last refresh time. EM-2: filters (`type`, `severity`, `owner`) match nothing → clear them.
- **Error states:** E-CONFLICT: already claimed by someone else → owner named. Action failed → exception stays claimed. E-PRECONDITION: exception updated by another agent since opening → changes shown (SSB-8). E-VALIDATION: resolution without reason code. E-UNAVAILABLE on refresh → last queue kept with its age (stale after 60 s, §2.6).
- **Success states:** SU-1: resolved with reason; next exception offered.
- **Dependencies:** XF-08, PG-40.
- **Implementation notes:** Claim uses optimistic locking with a version field; selected exception in `?exception=`. Acceptance: given two agents claim one exception, then exactly one succeeds; given a resolution without a reason code, then it is refused; queue data is never older than 15 s while visible. Analytics: `exception.claimed`, `exception.resolved` (type, reason code, duration), `exception.retendered`. Audit: `exception.claimed`, `exception.released`, `exception.resolved` (reason), `load.retendered`. `useExceptions` `refetchInterval` 15 s, page size 50 (maximum 200); `useExceptionActions`.

### PG-51 — Carrier Vetting Review

`/compliance/carriers/[carrierId]` · Serves XF-12 · Sections: [SC-51.x](./phase-5-section-blueprints.md#pg-51--carrier-vetting-review)

- **Purpose:** Decide on a carrier with all evidence in one place.
- **Business objective:** Safety and fraud prevention (BG-04).
- **User objective:** Make a defensible decision quickly.
- **Primary tasks:** "Is this authority genuine and active?" "Is the insurance valid?" "Any fraud signals?" "Approve, ask for more, or reject."
- **Required data:** Registry record (Public), insurance verification, documents (W-9 and tax ID Restricted), identity checks and fraud signals (Confidential), history of decisions, booked loads.
- **Permissions:** `internal.compliance`, read and decide. Not reachable through view-as.
- **Device needs:** DV-DESK: review evidence and decide. DV-AT: full parity; document previews with text alternatives (IC-58).
- **Loading states:** LS-1 per evidence source, so a slow registry never blocks documents; LS-5 on decision ("Recording decision…").
- **Empty states:** EM-5: the page renders only for a carrier with an application. Decision history EM-1: no earlier decisions.
- **Error states:** E-UNAVAILABLE from a source → decision can be deferred with reason. E-CONFLICT: another reviewer decided meanwhile → name who and the decision. E-VALIDATION: decision without reason code and note.
- **Success states:** SU-1: decision recorded with reasons; carrier notified; the queue on PG-22 updates.
- **Dependencies:** XF-12, BR-18.
- **Implementation notes:** Decisions require a reason code and note; audited. Acceptance: given a rejection, then the carrier is notified with the reason code and booking eligibility stays off; given vetting evidence, then it is retained 7 years (CMP-2). Analytics: `compliance.vetting.decided` (decision, reason code, duration). Audit: `carrier.vetting_decided` (decision, reason code, note), `carrier.vetting_deferred`, `carrier.more_info_requested`. `useCarrierVetting`, `useVettingDecision`.

### PG-52 — Accounts

`/admin/accounts` · Serves XD-08, XS-02, XS-16 · Sections: [SC-52.x](./phase-5-section-blueprints.md#pg-52--accounts)

- **Purpose:** Administer organisations and users.
- **Business objective:** Controlled access.
- **User objective:** Find any account and change its access safely.
- **Primary tasks:** "Find this user." "Suspend this organisation." "Reset MFA for a locked-out admin." "Review what changed on this account."
- **Required data:** Organisations and users with status, roles, last activity, identity policy (SSO, SCIM); user emails (Confidential); the organisation's audit history (append-only, BR-26).
- **Permissions:** `internal.admin`. The audit history is read-only for every role, `internal.admin` included (BR-26). SSO configuration changes are a support override, audited (Phase 3 §5.1a). Starting view-as requires a linked ticket (BR-27).
- **Device needs:** DV-DESK: search accounts and apply changes. DV-AT: full parity. DV-PHONE: not targeted.
- **Loading states:** LS-1; LS-2 on search keeps previous results and announces the count; LS-5 on each change; audit history pages by cursor (default 50, maximum 200).
- **Empty states:** EM-2: no search results → check the email or organisation name. Audit history EM-1: no events yet for a new organisation.
- **Error states:** Change conflicts with active loads → impact explained. E-VALIDATION: reason missing (SSB-9). E-FORBIDDEN: re-authentication older than 10 minutes → IC-13; view-as without ticket → refused. E-PRECONDITION: account changed by another admin (SSB-8).
- **Success states:** SU-1: change applied and audited; the organisation's admins notified of security-relevant changes (MFA reset, suspension).
- **Dependencies:** Backend `users` module (user CRUD), extended with organisations.
- **Implementation notes:** Reason required; re-authentication. Acceptance: given a suspension, then all member sessions end within 5 minutes (SEC-3); given any attempt to edit or delete an audit event, then no such action exists and the API refuses it; given an MFA reset, then the user must re-enrol on next sign-in. Analytics: `admin.account.searched` (result count), `admin.account.changed` (action). Audit: `organization.suspended`, `organization.reinstated`, `user.suspended`, `mfa.reset`, `sso.override_changed` (all with reason). `useAccounts`, `useAuditLog` keyed per organisation.

---

### PG-66 — Quote Desk

`/ops/quotes` · Serves XS-18 · Sections: [SC-66.x](./phase-5-section-blueprints.md#pg-66--quote-desk)

- **Purpose:** Answer custom quote requests before their deadline.
- **Business objective:** Keep shippers posting when instant pricing cannot (KPI-01), at prices that respect the margin floor (BR-31, BG-05).
- **User objective:** Price each request quickly, with the lane's evidence at hand, without colliding with colleagues.
- **Primary tasks:** "Which request is due next?" "What has this lane paid recently?" "Price it." "Decline it and say why."
- **Required data:** Quote requests with lane, equipment, dates, freight, the shipper's note, requesting organisation, status, owner and response deadline (BR-31); lane market data and recent comparable Haulr loads with shipper price and carrier pay (Confidential); the margin floor and the validity default and cap from platform configuration (BR-31); decline reason codes.
- **Permissions:** Act: `internal.ops`. Read: `internal.support` with a ticket. Not reachable through view-as.
- **Device needs:** DV-DESK; keyboard-driven for speed (IC-49). DV-AT: full parity. DV-PHONE, DV-WALL: not targeted.
- **Loading states:** LS-1 then LS-2: queue refresh every 30 s, paused when hidden, stale label after 2 min (§2.6); the selected request keeps focus during refresh. LS-1 for the selected request's lane evidence. LS-5 on claim, price and decline ("Claiming…", "Sending quote…").
- **Empty states:** EM-3: no open requests, with the last refresh time. EM-2: `status`, `equipment` or `due` filters match nothing → clear them. EM-4 for lane evidence: no comparable Haulr loads on the lane yet → market data only, stated as such.
- **Error states:** E-CONFLICT: claimed by someone else → owner named (IC-47); already priced, withdrawn or lapsed → current state stated and the request leaves the queue. E-VALIDATION: price below the margin floor → refused with the floor stated; validity beyond the cap → refused with the cap stated; decline without a reason code. E-PRECONDITION: the shipper changed the draft after the request was opened → changes shown (SSB-8). E-UNAVAILABLE from market data → pricing continues on comparable loads alone, stated. E-SERVER, E-TIMEOUT → retry (IC-60) with entries kept.
- **Success states:** SU-1: priced or declined; the shipper is notified (XS-03); the next request due is offered.
- **Dependencies:** XS-18, XF-08 (overdue escalation), SH-14, IC-46, IC-47, PG-40, platform configuration (SC-25.2).
- **Implementation notes:** Claim uses optimistic locking with a version field, as in PG-50; selected request in `?request=`. Deadlines come from platform configuration (BR-31) and count down with IC-46. Acceptance: given two agents claim one request, then exactly one succeeds; given a price below the margin floor or a validity beyond the cap, then it is refused before submission and by the server; given a request past its deadline, then an exception exists in PG-50 and the shipper has been told. Analytics: `quote.custom.claimed`, `quote.custom.priced` (time to price), `quote.custom.declined` (reason code). Audit: `quote_request.claimed`, `quote_request.priced` (shipper price, carrier pay), `quote_request.declined` (reason). `useQuoteRequests` keyed `quoteRequestKeys.queue(params)`.

## 12. System Pages

### PG-53 — Not Found

Mechanism in [Phase 3 §3.5](./phase-3-information-architecture.md#35-system-pages) · Serves Phase 3 §14 fallbacks · Sections: [SC-53.x](./phase-5-section-blueprints.md#pg-53--not-found)

- **Purpose:** Recover from a missing or inaccessible page or record.
- **Business objective:** Keep users in the product.
- **User objective:** Get to where they meant to go.
- **Primary tasks:** "Take me somewhere useful." "Search for the load."
- **Required data:** Whether the user is signed in; their role root. Nothing about the requested record.
- **Permissions:** Everyone. The same page serves unknown records and records the user cannot access (Phase 3 §5.2).
- **Device needs:** DV-PHONE, DV-DESK, DV-CAB: recover in one step to the role root or search. DV-AT: full parity; focus on the main heading (SSB-6).
- **Loading states:** No loading state: the page renders from the session alone and fetches nothing.
- **Empty states:** EM-5: the page is itself the empty outcome and always renders its recovery routes.
- **Error states:** No error state of its own: it fetches nothing that could fail; a failure while rendering falls through to PG-54.
- **Success states:** SU-2: the user navigates to their role root, help or quick find.
- **Dependencies:** Phase 3 §14.
- **Implementation notes:** Returns HTTP 404; never reveals whether a record exists. Acceptance: given a record in another organisation and an unknown ID, then both responses are identical in status, body and timing; given a signed-out visitor, then the recovery route is PG-01. Analytics: `system.not_found.viewed` (route pattern only, never the ID). No audit events. Static per group; never cached with user data.

### PG-54 — Server Error

Mechanism in Phase 3 §3.5 · Serves Phase 3 §14 fallbacks · Sections: [SC-54.x](./phase-5-section-blueprints.md#pg-54--server-error)

- **Purpose:** Recover from an unexpected failure.
- **Business objective:** Trust; diagnosability.
- **User objective:** Try again or get help.
- **Primary tasks:** "Try again." "Tell support what happened."
- **Required data:** Error digest and correlation ID (`x-request-id`, reference for support; Internal).
- **Permissions:** Everyone, signed in or not; the page offers no action beyond retry and a route to support, and it reveals no data about the failed request beyond its reference.
- **Device needs:** DV-PHONE, DV-DESK, DV-CAB: retry in one action or reach support with the reference. DV-AT: full parity; the failure announced assertively once.
- **Loading states:** LS-5 while `reset()` retries ("Trying again…"); no other loading.
- **Empty states:** EM-5: the page always renders its message, retry and support reference.
- **Error states:** Covers E-SERVER and E-CONTRACT for a whole segment. Retry fails again → stays here with the same reference; after 3 failures the message directs the user to support with the reference (E-TIMEOUT rule, §2.2). A failure in the root segment → `global-error.tsx`.
- **Success states:** SU-1: retry succeeds and the segment renders in place.
- **Dependencies:** PG-08.
- **Implementation notes:** Segment `error.tsx` offers `reset()`; `global-error.tsx` for root failures; the digest is passed to PG-08 as context; no stack traces; logging belongs in services, not components (host rule 5). Acceptance: given an E-CONTRACT failure, then nothing partial is rendered and the correlation ID is stated; given the user opens support, then PG-08 receives the digest as context. Analytics: `system.error.viewed` (route pattern, error class), `system.error.retried`. No audit events. Error reports carry release, route and correlation ID without PII (NFR-OBS-2).

### PG-55 — Access Denied

Mechanism in Phase 3 §3.5 · Serves Phase 3 §14 fallbacks · Sections: [SC-55.x](./phase-5-section-blueprints.md#pg-55--access-denied)

- **Purpose:** Explain that the route is outside the user's role.
- **Business objective:** Clear permissions; fewer tickets.
- **User objective:** Understand why and where to go.
- **Primary tasks:** "Why can't I see this?" "Who can give me access?"
- **Required data:** User's role and role root; organisation admins' names (Confidential, shown only to members of the same organisation).
- **Permissions:** Authenticated. Used only for whole routes outside the role; records use PG-53 (Phase 3 §5.2). During view-as, routes excluded from view-as (payout and payment methods, API keys, data export) resolve here with that reason (BR-27).
- **Device needs:** DV-PHONE, DV-DESK: understand the reason and return in one step. DV-AT: full parity.
- **Loading states:** No loading state: rendered from the session alone.
- **Empty states:** EM-5: the page always states the reason and a route back. An organisation without other admins → the organisation's own admin role is named instead.
- **Error states:** No error state of its own: it fetches nothing that could fail; a render failure falls through to PG-54.
- **Success states:** SU-2: user returns to their role root.
- **Dependencies:** Phase 3 §5.
- **Implementation notes:** HTTP 403 via `forbidden()`, which is experimental in Next.js 16 and requires `experimental.authInterrupts` in `next.config.ts`. Acceptance: given a `shipper.member` opening `/shipper/invoices`, then HTTP 403 with the admins named; given an internal route requested by a customer, then the response does not confirm which internal role would grant it. Analytics: `system.forbidden.viewed` (route pattern, role), mirroring E-FORBIDDEN telemetry (§2.2). No audit events.

## 12a. Enterprise Pages

Added in version 1.1.0 to meet Phase 1 §18–22. Same format and shared state behaviour as every other page.

### PG-56 — Bulk Load Import

`/shipper/loads/import` · Serves XF-14, XF-16, XS-18 · Sections: [SC-56.x](./phase-5-section-blueprints.md#pg-56--bulk-load-import)

- **Purpose:** Create many loads at once from a file, with every row validated and priced before anything posts (BR-28).
- **Business objective:** Win high-volume shippers who will not re-key loads (A9, JTBD-13); raise loads per shipper per week.
- **User objective:** Turn a weekly shipping plan into posted loads in minutes, with proof that every row was handled.
- **Primary tasks:** "Upload this week's plan." "Show me which rows are wrong and why." "Fix them here." "Post the good ones now." "Give me a file of what happened."
- **Required data:** Import template and column dictionary; saved column mappings; facilities (for matching); equipment and accessorial enums; existing load references (duplicate detection); batch job status and per-row outcomes; quotes per row; spend limit of the uploader (BR-23). Classification: rows contain Confidential shipper prices (NFR-PRIV-1).
- **Permissions:** Act: `shipper.member`, `shipper.admin` for their own organisation. Read: `internal.support` with a ticket. View-as: read-only (BR-27).
- **Device needs:** DV-DESK: the full journey, including correcting hundreds of rows by keyboard without leaving the import. DV-AT: full parity, with row outcomes navigable as a table with row and column headers. DV-PHONE: check batch status and download results only; uploading and correcting is not supported and the page says so.
- **Loading states:** LS-7 for parsing, validation and pricing, with progress as rows processed out of total; the user may leave, and the batch continues and notifies on completion (SU-3). LS-2 while polling batch status every 5 s. LS-5 while confirming the post.
- **Empty states:** EM-1: no batches yet; explains the template and links the column dictionary article (PG-07). EM-4: no priced rows yet while validation runs.
- **Error states:** E-VALIDATION: unreadable file, unsupported encoding, more than 500 rows, or missing mandatory columns, each named, and nothing is created. Row-level errors are outcomes, not page errors. E-UNAVAILABLE: pricing down; valid rows are held as drafts with a custom-quote request. E-CONFLICT: duplicate reference against an existing load, linked. E-TIMEOUT: the batch continues server-side, and the page recovers by re-reading batch status.
- **Success states:** SU-3 when the batch is accepted; SU-1 on confirmation, with counts posted, pending approval, saved as draft and rejected; downloadable results file.
- **Dependencies:** XF-14, XF-16, PG-32, PG-26, IC-61, quoting service, background job service.
- **Implementation notes:** The CSV is parsed server-side only; the client checks size (≤ 5 MB) and type before upload. Batch ID via `nanoid`; the job is idempotent per file hash and user, so re-uploading the same file offers the existing batch. Acceptance criteria:
  - A 500-row file is validated and priced within 60 s (NFR-CAP-3).
  - No load is created before confirmation.
  - Every row appears in the results file with exactly one outcome.

  Analytics: `load.import.started`, `load.import.validated`, `load.import.confirmed`. Audit: `load.import.confirmed` plus `load.posted` per load, carrying the batch ID.

### PG-57 — Templates and Recurring Loads

`/shipper/templates` · Serves XF-14 · Sections: [SC-57.x](./phase-5-section-blueprints.md#pg-57--templates-and-recurring-loads)

- **Purpose:** Save repeatable loads and generate them on a schedule.
- **Business objective:** Retention and share of wallet on contract lanes; fewer quote-to-post drop-offs (KPI-01).
- **User objective:** Never re-key a lane that ships every week.
- **Primary tasks:** "Save this load as a template." "Post from a template." "Ship this lane every Tuesday and Thursday." "Pause the recurrence while the plant is shut."
- **Required data:** Templates (lane, stops, freight, equipment, references pattern, tender strategy, owner, shared flag); recurrences (days, horizon up to 12 weeks, generation lead time 72 h, auto-post flag, price guardrail); upcoming occurrences with status. Classification: Internal, with guardrail amounts Confidential.
- **Permissions:** Act on own templates: `shipper.member`. Act on shared templates: `shipper.admin`. Auto-post recurrences: only when the template owner's spend limit covers the guardrail (BR-23). Read: `internal.support` with a ticket (Phase 3 §5.1a). View-as: read-only.
- **Device needs:** DV-DESK: create and manage templates and recurrences. DV-PHONE: post from a template and pause a recurrence. DV-AT: full parity.
- **Loading states:** LS-1 for the template collection; LS-2 on focus; LS-5 for save, post-from-template and pause.
- **Empty states:** EM-1: explains saving from a posted load in PG-40 or PG-27. EM-2 for template search.
- **Error states:**
  - E-VALIDATION: recurrence dates outside horizon; facility deleted since the template was saved (the template is flagged, not silently broken).
  - E-PRECONDITION: the template was edited by a colleague (IC-67).
  - E-UNAVAILABLE: pricing down; occurrences are created as drafts.
- **Success states:** SU-1 for saved templates and recurrence changes, with the next occurrence date stated. SU-2 when posting from a template opens PG-27 prefilled.
- **Dependencies:** XF-14, PG-27, PG-32, BR-06, BR-23.
- **Implementation notes:** Occurrence generation is server-side; the page never creates loads on a timer. Acceptance criteria:
  - Pausing stops every future occurrence not yet generated.
  - A generated occurrence whose quote exceeds the guardrail is a draft, and the owner is notified.

  Analytics: `load.template.saved`, `load.template.used`, `load.recurrence.changed`. Audit: `load_template.created`, `load_template.updated`, `load_template.deleted`, `recurrence.paused`, `recurrence.resumed`.

### PG-58 — Approvals

`/shipper/approvals` · Serves XF-16 · Sections: [SC-58.x](./phase-5-section-blueprints.md#pg-58--approvals)

- **Purpose:** Decide spend requests above members' limits (BR-23) before their quotes or bids expire.
- **Business objective:** Give enterprise shippers spend control without slowing coverage (KPI-02).
- **User objective:** Approvers: clear requests quickly with the facts in hand. Requesters: know where their request stands.
- **Primary tasks:** "What's waiting for me, and what expires soonest?" "Is this price reasonable for this lane?" "Approve." "Reject and say why." "Who covers approvals while I'm away?"
- **Required data:** Approval requests (type: post, bid acceptance, amendment, accessorial), with requester, amount, limit, quote or bid expiry, lane history (last 90 days, median and range), requester note, status and decision history, and delegation settings. Classification: Confidential (prices).
- **Permissions:** Act: `shipper.approver` and `shipper.admin`, never on their own requests. Read own requests: requesters. View-as: read-only; approvals are never granted through view-as.
- **Device needs:** DV-PHONE: approve or reject a single request from a notification in under 30 s. DV-DESK: work the whole queue. DV-AT: full parity, with expiry announced as text.
- **Loading states:** LS-1; LS-2 polling every 30 s and on focus; LS-5 for each decision.
- **Empty states:** EM-3: "Nothing awaiting approval", with the last checked time. For requesters, EM-1 explains when approval is needed.
- **Error states:**
  - E-CONFLICT: another approver decided first; the page says who and when.
  - E-CONFLICT: the quote or bid expired; the request is marked expired and the requester has been prompted to re-quote.
  - E-FORBIDDEN: the approver attempted their own request.
- **Success states:** SU-1: decision confirmed and the requester notified; for approvals, the resulting action (posted, accepted) is stated.
- **Dependencies:** XF-16, BR-06, BR-23, IC-62, XS-03.
- **Implementation notes:** Decisions use an idempotent Server Action with the request version (SSB-8). Acceptance criteria:
  - An approval completes the original action within 5 s when it is still valid.
  - An approver is never offered a decision on their own requests, and the server rejects the attempt anyway.

  Analytics: `approval.requested`, `approval.decided`, including time-to-decision. Audit: `approval.approved` and `approval.rejected` with reason, `approval.delegated`.

### PG-59 — Reports

`/shipper/reports` · Serves XD-01, JTBD-08 · Sections: [SC-59.x](./phase-5-section-blueprints.md#pg-59--reports)

- **Purpose:** Give shipper managers and finance the spend, service and carrier-performance reports they take to quarterly reviews.
- **Business objective:** Retain enterprise accounts by making Haulr their system of record for freight performance (KPI-09).
- **User objective:** Answer "what did we spend, where, with whom, and how well did it go?" without exporting raw data.
- **Primary tasks:**
  - "Spend by lane and month."
  - "On-time by carrier and facility."
  - "Accessorial cost trend."
  - "Detention at our facilities."
  - "Schedule this report to my inbox every Monday."
  - "Export for my finance team."
- **Required data:** Server-computed aggregates for a fixed report catalogue: spend, lane cost per mile, service (on-time pickup and delivery, tracking compliance), carrier scorecards, accessorials, facility dwell and detention, invoice ageing. Each has filters (period, lanes, facilities, carriers, equipment) and a definition. Classification: Confidential.
- **Permissions:** `shipper.admin` and `shipper.approver`: all reports. `shipper.finance`: spend, accessorial and invoice reports only. Report scheduling is available to the same roles. View-as: read-only.
- **Device needs:** DV-DESK: explore, filter, export and schedule. DV-PHONE: read the headline figures of a saved report. DV-AT: full parity; every trend and distribution has a data equivalent (IC-45).
- **Loading states:** LS-1 per report; LS-3 for periods over 12 months; LS-7 for exports and scheduled deliveries.
- **Empty states:** EM-4: not enough history, stating how many delivered loads each report needs. EM-2: filters exclude all data.
- **Error states:**
  - E-UNAVAILABLE: the reporting store is lagging; the page states data currency ("Data as of 06:00 CT").
  - E-VALIDATION: the period exceeds 36 months.
  - E-RATE-LIMIT: too many concurrent exports.
- **Success states:** SU-1 for a saved or scheduled report; SU-3 for an export, delivered to PG-62 downloads and by email link.
- **Dependencies:** SH-08, IC-17, IC-45, IC-65, chart library (pending approval).
- **Implementation notes:** Figures come from the reporting service, never summed client-side (Phase 7 §18). Filters are in the URL (Phase 3 §10). Every report states its data currency and definitions. Acceptance criteria:
  - Totals match the invoice ledger for the same period to the cent.
  - A 12-month report renders within 3 s at p95.

  Analytics: `report.viewed`, `report.exported`, `report.scheduled`. Audit: `report.exported`, `report_schedule.changed`.

### PG-60 — Security and SSO

`/settings/security` · Serves XS-13 · Sections: [SC-60.x](./phase-5-section-blueprints.md#pg-60--security-and-sso)

- **Purpose:** Let an organisation control how its members authenticate and how long sessions last (BR-24, SEC-2, SEC-3).
- **Business objective:** Pass enterprise security reviews (A9, OPS-5); reduce account-takeover risk.
- **User objective:** Connect the identity provider, enforce it safely, and never lock the company out.
- **Primary tasks:** "Verify our domain." "Connect Okta (or Entra ID)." "Test it with my account." "Map our groups to Haulr roles." "Turn on SCIM." "Require SSO." "Set a 30-minute idle timeout." "Restrict admin access to our office IPs."
- **Required data:** Verified domains with DNS TXT challenge; SSO connection (protocol, metadata, certificate expiry, last successful sign-in); group-to-role mappings; SCIM status, last sync and token metadata (never the token after creation); enforcement state and break-glass admin; session policy (idle timeout, IP allow-list); policy change history. Classification: Restricted (certificates and tokens), Confidential (policy).
- **Permissions:** Act: `org.security`, `shipper.admin` and `carrier.admin` (Phase 3 §5.1a). Every change is a sensitive action (Phase 4 §2.8): re-authentication (IC-13), admin notification and audit with reason. View-as: never permitted to write; read is permitted.
- **Device needs:** DV-DESK: the full configuration journey. DV-PHONE: read status and receive certificate-expiry warnings; configuration is not supported on phones and the page says so. DV-AT: full parity.
- **Loading states:** LS-1 for each part; LS-5 during a connection test, which may take up to 30 s while the identity-provider round trip completes.
- **Empty states:** EM-1: no SSO connection; explains prerequisites (verified domain, identity-provider admin access) and links the setup article.
- **Error states:**
  - E-VALIDATION: malformed metadata; the certificate is expired or expires within 14 days.
  - Test sign-in failure: the specific assertion problem is named (audience, recipient, clock skew over 5 min, missing email attribute).
  - E-PRECONDITION: enforcement is attempted without a successful test by the configuring admin, or without a break-glass admin.
  - E-CONFLICT: the domain is already verified by another organisation, and support is routed.
- **Success states:** SU-1: every change is confirmed and every organisation admin is notified by email.
- **Dependencies:** XS-13, BR-24, SEC-1 … SEC-3, IC-13, IC-63, backend identity service.
- **Implementation notes:** SSO sign-in is routed from PG-10 by email domain. The SCIM token is shown once (IC-63). Acceptance criteria:
  - Enforcement is impossible without a passing test sign-in in the last 24 h.
  - A SCIM deprovision ends all sessions within 5 min.
  - Certificate expiry warnings are sent 30, 14 and 3 days ahead.

  Analytics: `security.sso.configured`, `security.sso.enforced`. Audit: `sso_connection.created`, `sso_connection.updated`, `sso_connection.deleted`, `sso.enforcement_changed`, `scim_token.rotated`, `session_policy.changed`, `ip_allowlist.changed`, `domain.verified`.

### PG-61 — Integrations

`/settings/integrations` · Serves XS-14 · Sections: [SC-61.x](./phase-5-section-blueprints.md#pg-61--integrations)

- **Purpose:** Manage API keys, webhooks and EDI connections (BR-29).
- **Business objective:** Make Haulr embeddable in enterprise TMS and ERP stacks; increase switching costs (KPI-09).
- **User objective:** Connect systems safely and see at a glance whether the connection is healthy.
- **Primary tasks:** "Create a read-only key for our BI tool." "Rotate our production key without downtime." "Subscribe our endpoint to load status events." "Why are deliveries failing?" "Replay yesterday's failed events." "Is our EDI 214 feed flowing?"
- **Required data:**
  - API keys: name, scopes, created by, last used (time and IP), expiry, status.
  - Webhook endpoints: URL, events, signing secret metadata, delivery log (30 days: event, response code, latency, attempts).
  - EDI connections: partner, transaction sets, status, last transaction.
  - Rate-limit usage.
  - Classification: Restricted (secrets, shown once).
- **Permissions:** Act: `org.security` and `shipper.admin` (Phase 3 §5.1a). Read: `internal.support` with a ticket; keys are never shown (Phase 3 §5.1a). Key and secret creation, rotation and revocation are sensitive actions (IC-13). View-as: webhooks and EDI connections read-only; API keys are never shown.
- **Device needs:** DV-DESK: the full journey, including copying secrets. DV-PHONE: read health and revoke a compromised key. DV-AT: full parity; secrets are announced only on explicit request.
- **Loading states:** LS-1; LS-2 for the delivery log every 60 s while viewed; LS-5 for a test delivery (up to 10 s).
- **Empty states:** EM-1: no keys or endpoints; links developer documentation. EM-3: no failed deliveries in 30 days.
- **Error states:**
  - E-VALIDATION: webhook URL not HTTPS, or resolves to a private network range; too many scopes for the role.
  - Test delivery failure: the response code and latency are reported.
  - E-RATE-LIMIT: replaying more than 1,000 events at once.
- **Success states:** SU-1: key created (IC-63), rotated (old and new overlap until the chosen time) or revoked (effective immediately); replay queued (SU-3).
- **Dependencies:** XS-14, BR-29, SEC-8, IC-63, IC-65.
- **Implementation notes:** Key secrets never enter client state beyond the reveal (IC-63); they are never logged or sent to analytics. Acceptance criteria:
  - A revoked key fails authentication within 60 s.
  - Rotation keeps both keys valid only until the chosen overlap time.
  - The delivery log shows every attempt with its response code.

  Analytics: `integration.key.created`, `integration.webhook.tested`. Audit: `api_key.created`, `api_key.rotated`, `api_key.revoked`, `webhook.created`, `webhook.updated`, `webhook.deleted`, `webhook.replayed`, `edi_connection.requested`.

### PG-62 — Data and Privacy

`/settings/privacy` · Serves XS-15 · Sections: [SC-62.x](./phase-5-section-blueprints.md#pg-62--data-and-privacy)

- **Purpose:** Organisation data export and individual privacy requests (NFR-PRIV-5, NFR-PRIV-6, BR-30).
- **Business objective:** Meet CMP-7 and enterprise contract terms (OPS-5); avoid support effort on data requests.
- **User objective:** Get our data out, or exercise my privacy rights, without a ticket.
- **Primary tasks:** "Export all our loads and documents for 2026." "Download the export." "Show me the personal data you hold on me." "Delete my account." "What's the status of my request?"
- **Required data:** Export datasets and formats; export jobs with status, size and expiry; privacy requests (type, status, due date, outcome report); the retention schedule that explains what cannot be deleted and why. Classification: exports inherit the highest classification of their contents.
- **Permissions:** Organisation exports: `org.security`, `shipper.admin`, `carrier.admin`. Personal requests: every authenticated user, for themselves. Both require re-authentication (IC-13). View-as: blocked entirely.
- **Device needs:** DV-DESK: request and download exports. DV-PHONE: submit and track personal requests. DV-AT: full parity.
- **Loading states:** LS-7 for exports (minutes to hours), with progress; LS-1 for request history.
- **Empty states:** EM-1: no exports or requests yet; explains datasets and response times (BR-30).
- **Error states:**
  - E-VALIDATION: the range exceeds 24 months per export; the page suggests splitting.
  - E-CONFLICT: deletion is blocked by open obligations (open claim, unpaid invoice, active load), each named.
  - E-NOT-FOUND: expired download; a re-issue is offered.
- **Success states:** SU-3: export queued and a notification sent when ready (download link valid 24 h, authenticated). SU-1: privacy request acknowledged with its due date.
- **Dependencies:** XS-15, BR-26, BR-30, NFR-PRIV-5 … 7, IC-13, IC-65.
- **Implementation notes:** Download links are signed, single-organisation and require a session. Acceptance criteria:
  - An export contains every record in range for the selected datasets, with row counts stated in a manifest file.
  - A deletion outcome report lists deleted, de-identified and retained categories with the legal basis.

  Audit: `export.requested`, `export.downloaded`, `privacy_request.submitted`, `privacy_request.fulfilled`. Analytics carries counts only.

### PG-63 — Audit Log

`/settings/audit` · Serves XS-17 · Sections: [SC-63.x](./phase-5-section-blueprints.md#pg-63--audit-log)

- **Purpose:** Let organisations review and export every change made in their account (BR-26).
- **Business objective:** Enterprise trust and SOC 2 evidence for customers (CMP-8, OPS-5).
- **User objective:** Find out who did what, when, from where, and prove it.
- **Primary tasks:** "Who changed our payout account last week?" "What did Haulr support do in our account?" "Show all actions by this API key." "Export March for our auditors."
- **Required data:** Audit events per Phase 4 §2.7, filtered by actor (member, Haulr staff via view-as, API key), action, target type and ID, and date range; event detail with before and after values (Restricted values masked); retention boundary. Classification: Confidential.
- **Permissions:** Read and export: `org.security`, `shipper.admin`, `carrier.admin`. Read: `internal.support` with a ticket, `internal.admin`. No role can edit or delete (BR-26). View-as: read-only.
- **Device needs:** DV-DESK: investigate and export. DV-PHONE: look up a single recent event. DV-AT: full parity; events are an ordered list with complete text detail.
- **Loading states:** LS-1 with cursor pagination (page size 100); LS-3 for ranges over 90 days; LS-7 for exports.
- **Empty states:** EM-2: no events match; retention boundary stated.
- **Error states:** E-VALIDATION: the range is outside retention. E-RATE-LIMIT: concurrent exports.
- **Success states:** SU-3: export queued (CSV or JSON), itself audited.
- **Dependencies:** XS-17, SH-11, BR-26, IC-65.
- **Implementation notes:** Uses SH-11 with the organisation scope. View-as and API-key actors are always labelled as such. Acceptance criteria:
  - Every mutation in Phase 5 produces an event visible here within 60 s.
  - Exported files include a checksum.

  Analytics: `audit.searched`, `audit.exported`.

### PG-64 — Review Amendment

`/loads/[loadId]/amendments/[amendmentId]` · Serves XF-15 · Sections: [SC-64.x](./phase-5-section-blueprints.md#pg-64--review-amendment)

- **Purpose:** Let a carrier see exactly what changed on a booked load and accept or decline it bindingly (BR-25).
- **Business objective:** Keep one binding agreement after changes; cut phone renegotiation and disputes (KPI-10, KPI-11).
- **User objective:** Carrier: understand the change and its money effect before committing. Shipper: know whether the carrier accepted.
- **Primary tasks:** "What changed?" "Does the pay change?" "Can my driver still make it?" "Accept." "Decline and cancel without penalty."
- **Required data:** Previous and proposed terms field by field (stops, appointments, equipment, weight, accessorial terms), carrier pay before and after (carrier view) or shipper price before and after (shipper view) (BR-05), materiality classification, response deadline, amendment document version, and assigned driver and current trip progress. Classification: Confidential.
- **Permissions:** Act (accept or decline): `carrier.dispatcher`, `carrier.admin` of the booked carrier. Act (withdraw): the proposing shipper roles, operations. Read: shipper roles and internal roles. View-as: read-only.
- **Device needs:** DV-PHONE: owner-operators review and accept from a notification with the full comparison. DV-DESK: dispatchers handle several amendments. DV-AT: full parity; every compared term is announced with its previous and proposed value (IC-66).
- **Loading states:** LS-1 server-rendered; LS-5 while signing.
- **Empty states:** EM-5: the page exists only for an existing amendment.
- **Error states:**
  - E-CONFLICT: withdrawn, lapsed or already decided; the page states the outcome and the governing version.
  - E-PRECONDITION: the amendment was revised after opening; a new comparison is required.
  - E-NOT-FOUND: not a party.
- **Success states:** SU-2: accepted; returns to PG-40 with the new governing rate confirmation and the driver notified. SU-1: declined, with the cancellation choice recorded.
- **Dependencies:** XF-15, BR-04, BR-25, IC-26, IC-66, SH-14.
- **Implementation notes:** Signature evidence is identical to PG-34 (CMP-4). Acceptance criteria:
  - Acceptance is impossible after the deadline or once the affected stop is completed.
  - The previous version remains downloadable for the full retention period (7 years, BR-20; CMP-3).

  Analytics: `amendment.viewed`, `amendment.decided`, including time-to-decision. Audit: `amendment.accepted`, `amendment.declined`, `amendment.withdrawn`.

---

## 13. Page-to-Experience Traceability

| Page | Experiences | Page | Experiences |
| --- | --- | --- | --- |
| PG-01 | XS-10, XS-01 | PG-29 | XF-04 |
| PG-02 | XF-07 | PG-30 | XF-10 |
| PG-03 | XF-04, XS-05 | PG-31 | XF-10, XS-06 |
| PG-04 | XS-05, XF-02 | PG-32 | XF-01, XS-11 |
| PG-05 | XS-10, XF-01 | PG-33 | XF-02, XF-03, XS-09, XF-17 |
| PG-06, PG-07, PG-08 | XS-07 | PG-34 | XF-02 |
| PG-09 | XS-01 | PG-35 | XF-05, XF-06, XF-07, XF-15, XF-17 |
| PG-10 … PG-14 | XS-01; XS-13 (PG-10); XF-12, XF-13 (PG-11) | PG-36 | XS-09 |
| PG-15 | XS-02 | PG-37 | XF-05, XS-02, XF-17 |
| PG-16 | XF-13 | PG-38 | XF-11 |
| PG-17 | XF-12 | PG-39 | XF-06, XF-09, XF-15 |
| PG-18 | XD-01 | PG-40 | XF-01 … XF-11, XF-15, XF-16, XS-04 … XS-06 |
| PG-19 | XD-02 | PG-41 | XS-04 |
| PG-20 | XD-03 | PG-42 | XS-03 |
| PG-21 | XD-04 | PG-43 | XS-12, XF-09 |
| PG-22 | XD-05 | PG-44, PG-45 | XS-06 |
| PG-23 | XD-06 | PG-46 | XS-11 |
| PG-24 | XD-07, XS-07, XS-16 | PG-47 | XS-03, XS-11, XS-13 |
| PG-25 | XD-08 | PG-48 | XS-02, XS-13, XF-16 |
| PG-26 | XF-01, XF-07, XF-14, XS-18, XD-01 | PG-49 | XS-08 |
| PG-27 | XF-01, XF-04, XF-16, XS-18 | PG-50 | XF-08 |
| PG-28 | XF-03, XF-16 | PG-51 | XF-12 |
| PG-52 | XD-08, XS-02, XS-16 | PG-53 … PG-55 | Phase 3 §14 |
| PG-56 | XF-14, XF-16, XS-18 | PG-57 | XF-14 |
| PG-58 | XF-16 | PG-59 | XD-01 |
| PG-60 | XS-13 | PG-61 | XS-14 |
| PG-62 | XS-15 | PG-63 | XS-17 |
| PG-64 | XF-15 | PG-65 | XF-17, XF-05 |
| PG-66 | XS-18 | | |

**Template page mapping** (master prompt examples → Haulr pages): Home → PG-01 · Search → PG-33 · Core Entity Details → PG-40 · List/Map View → PG-26, PG-33 · Saved → PG-36 · Favorites → PG-29 · Compare → PG-28 · Role Profile → PG-03, PG-04 · Role Dashboards → PG-18 … PG-25 · Messages → PG-41 · Notifications → PG-42 · Settings → PG-47 … PG-49, PG-60 … PG-63 · Profile → PG-46 · Domain Tool → PG-05 · Core Entity Submission → PG-27, PG-56 · Authentication → PG-10 … PG-15 · Domain Transaction → PG-34 · Payment → PG-31, PG-38 · Help Center → PG-06 … PG-08 · 404 → PG-53 · 500 → PG-54.

---

Previous: [Phase 3 — Information Architecture](./phase-3-information-architecture.md) · Next: [Phase 5 — Section Blueprints](./phase-5-section-blueprints.md)
