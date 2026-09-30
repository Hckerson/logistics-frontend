# Phase 5 — Section Blueprints

`Haulr Design OS` · `Version 1.0.0` · `2026-09-30` · Previous: [Phase 4 — Page Blueprints](./phase-4-page-blueprints.md) · Next: [Phase 6 — Interaction Contracts](./phase-6-interaction-contracts.md)

Every page from [Phase 4](./phase-4-page-blueprints.md) is broken into sections, one per job. A section is a unit of behaviour: what it is responsible for, the data it needs, how the user interacts with it, and what happens when it is loading, empty or failing. Sections never say what they show, which components or controls they use, how they are arranged, their order on screen, their size, imagery or animation.

IDs: `SH-` shared sections (defined once, reused by reference), `SC-<page>.<n>` page sections. Hooks named in **Data requirements** are defined in [Phase 7 §8](./phase-7-frontend-architecture.md#8-hooks). Interaction contracts (`IC-`) are defined in [Phase 6](./phase-6-interaction-contracts.md).

## Table of Contents

1. [Section Rules](#1-section-rules)
2. [Shared Sections](#2-shared-sections) — SH-01 … SH-15
3. [Public Pages](#3-public-pages)
4. [Access Pages](#4-access-pages)
5. [Onboarding](#5-onboarding)
6. [Role Dashboards](#6-role-dashboards)
7. [Shipper Workspace](#7-shipper-workspace)
8. [Carrier Workspace](#8-carrier-workspace)
9. [Driver](#9-driver)
10. [Shared Records and Utilities](#10-shared-records-and-utilities)
11. [Internal Tools](#11-internal-tools)
12. [System Pages](#12-system-pages)
13. [Section Inventory](#13-section-inventory)

---

## 1. Section Rules

- **One job per section.** A section that would need two unrelated purposes is two sections.
- **Independent failure.** Each section that fetches data owns its loading and error boundary (SSB-1, SSB-3 in [Phase 4 §2](./phase-4-page-blueprints.md#2-shared-state-behaviour)), so one failure never takes down the page.
- **Instances inherit.** A page section marked "Instance of SH-nn" inherits every field of that shared section. It lists only its scope and overrides.
- **Role shaping happens on the server.** A section never decides what a role may see. It renders what the role-shaped response contains (BR-05, Phase 3 §5.2).
- **Every field is mandatory.** Where a field does not apply, it says "Not applicable" and why.

---

## 2. Shared Sections

### SH-01 — Load timeline

- **Purpose:** Tell the story of a load's lifecycle as recorded events.
- **Responsibilities:** Present every recorded state transition, tender step, bid event, stop event, exception and document event, with actor role, time (facility-local and relative), and source (driver, geofence, ELD, operations, system).
- **Data requirements:** `use-load-timeline(loadId)` → timeline events (contract type `LoadTimelineEventDto[]`); cursor pagination for long histories.
- **Interaction model:** Read-only; the user can narrow by event category and expand an event for its evidence (location, document link). New events arrive with the load's refresh cycle.
- **Device needs:** Phone: skim the latest events. Desktop: audit the full history.
- **Accessibility requirements:** Events exposed as an ordered list with time as text; new events announced politely only when the user has not scrolled into history; category filters are a labelled group (IC-20).
- **Loading states:** Pending message until the first page arrives; older pages load on request (IC-21).
- **Error states:** "Timeline could not be loaded" with retry; the rest of the page is unaffected.
- **Empty states:** Draft loads: "Events will be recorded once the load is posted."
- **Reuse potential:** PG-40, PG-02 (public-scoped variant), PG-50, PG-39 (trip-scoped variant).
- **Technical notes:** Events are immutable; key by event ID; times rendered with `lib/utils/date-formatter.ts` in the stop's time zone.

### SH-02 — Live position and ETA

- **Purpose:** Answer "where is it and when will it arrive" with honesty about freshness (PP-03).
- **Responsibilities:** Convey current or last known position, its source and age, the ETA for the next stop against its appointment window, on-time risk and a text equivalent of progress (city, miles remaining).
- **Data requirements:** `use-load-positions(loadId)` → latest position, recent track (last 24 h downsampled), ETA with confidence; refresh interval from constants (`TRACKING_REFRESH_MS`).
- **Interaction model:** The user can switch between the map and the text equivalent, recentre on the vehicle, and request a check call (carrier and operations roles, IC-10). Updates arrive without disturbing the user's current focus or zoom.
- **Device needs:** Phone: status and ETA at a glance. Desktop: map context and track history.
- **Accessibility requirements:** Map is supplementary; the text equivalent carries all information (PP-08); ETA changes announced politely; the map follows IC-30.
- **Loading states:** Last known values stay available during refresh (SSB-2).
- **Error states:** Location feed failure → last known position with age, "Live updates paused" and retry. Map failure → text equivalent only.
- **Empty states:** Not yet picked up → "Tracking starts at pickup" with the pickup appointment.
- **Reuse potential:** PG-40, PG-02, PG-26 (collection map), PG-35, PG-50.
- **Technical notes:** Polling via TanStack Query `refetchInterval` (paused when hidden); stale threshold from BR-10 in constants; map library pending approval (Phase 7 §15).

### SH-03 — Document set

- **Purpose:** Hold every document for a scope (a load, a claim, an organisation) and let permitted users add to it.
- **Responsibilities:** Enumerate documents with type, version, uploader and time; preview; download; upload new documents or new versions where the role permits; flag expiring company documents.
- **Data requirements:** `use-documents({ scope })`; upload through `use-document-upload`; downloads through signed URLs.
- **Interaction model:** The user filters by document type, previews a document, downloads it, or uploads by picking a file or using the camera (IC-24, IC-25). Uploads show progress and can be cancelled.
- **Device needs:** Phone: photograph and upload. Desktop: drag files in, bulk download.
- **Accessibility requirements:** Upload progress and completion announced; preview has a text title and a download alternative; file type and size limits stated before upload.
- **Loading states:** Pending until the document set arrives; per-file upload progress.
- **Error states:** Upload rejected (type, size, virus scan) → reason; download failed → retry.
- **Empty states:** "No documents yet" with what is expected for this scope (for example POD after delivery).
- **Reuse potential:** PG-40, PG-43, PG-45, PG-31, PG-17, PG-51.
- **Technical notes:** Upload is direct-to-storage via a presigned URL from the backend; client checks size and MIME before request; limits in constants.

### SH-04 — Conversation

- **Purpose:** Keep communication about a load or ticket on the record (BR-19).
- **Responsibilities:** Present messages with author, role and time; accept new messages with attachments; track delivery and read state; mark the thread read.
- **Data requirements:** `use-messages(threadId)`; `use-send-message`; attachments through `use-document-upload`.
- **Interaction model:** The user composes and sends (IC-35); failed messages stay with a retry; older messages load on request; new messages arrive live.
- **Device needs:** Phone and desktop equally; phone users attach photos.
- **Accessibility requirements:** Messages form a log region announced politely; the composer is labelled with the thread's subject; sending state announced.
- **Loading states:** Pending until the latest page arrives.
- **Error states:** Send failure → message kept with retry; thread unavailable → retry.
- **Empty states:** "No messages yet. Messages here are shared with everyone on this load."
- **Reuse potential:** PG-40, PG-41, PG-24.
- **Technical notes:** Optimistic append with a client `nanoid` message ID reconciled on server acknowledgement; transport per Phase 7 §13.

### SH-05 — Record collection

- **Purpose:** Let a user find and act on records in a collection that may be large.
- **Responsibilities:** Filter, search, sort and paginate a collection; select records; run permitted bulk actions; export; keep all of this in the URL (IA-P4).
- **Data requirements:** A collection hook for the scope (for example `use-loads(params)`), cursor-paginated; filter vocabularies from `lib/enums/`.
- **Interaction model:** Criteria changes apply after input settles (debounced, `use-debounced-search`); results update without losing selection where records remain; bulk actions confirm scope ("12 selected") before running (IC-12); pagination by cursor (IC-21).
- **Device needs:** Desktop: scan and compare many records, keyboard selection. Phone: find one record by reference quickly.
- **Accessibility requirements:** Result count announced after each change; sort state exposed (`aria-sort` where tabular); selection state announced; filters are labelled and reset-able (IC-20).
- **Loading states:** Previous results remain with a pending state during refetch (placeholder data).
- **Error states:** Collection failure → retry; partial bulk-action failure → per-record outcome.
- **Empty states:** Two distinct cases: no records at all (guidance from Phase 3 §13) and no records matching criteria (clear criteria).
- **Reuse potential:** PG-26, PG-30, PG-33, PG-35, PG-38, PG-43, PG-44, PG-50, PG-52, PG-32, PG-22.
- **Technical notes:** URL parsing and serialisation through `lib/utils/query-string.ts`; parameter names from Phase 3 §10; query keys include every parameter.

### SH-06 — Account standing notice

- **Purpose:** Tell the user when their organisation cannot do something and how to fix it.
- **Responsibilities:** Detect blockers (onboarding incomplete, compliance hold, insurance expiring or lapsed, payment method missing or failed, credit limit reached) and route to the exact fix.
- **Data requirements:** `use-account-standing()` → blockers with severity, affected capabilities and fix route.
- **Interaction model:** The user follows the fix route; non-blocking notices can be dismissed for the session; blocking notices cannot be dismissed.
- **Device needs:** All devices; on phones the blocker is announced on load so users do not have to hunt for it.
- **Accessibility requirements:** Blocking notices announced once on page load (assertive only for newly blocking states); fix route is a named link.
- **Loading states:** Nothing announced while loading; notice appears when data resolves.
- **Error states:** Standing unavailable → no notice; server remains authoritative on every action.
- **Empty states:** No blockers → the section is absent.
- **Reuse potential:** PG-18, PG-19, PG-33, PG-27, PG-34.
- **Technical notes:** Shared query key so resolving a blocker anywhere updates everywhere.

### SH-07 — Attention queue

- **Purpose:** Collect the items that need this user's action now (PP-04).
- **Responsibilities:** Present attention items of mixed type, each with its reason, deadline and direct route to act; allow acknowledging informational items.
- **Data requirements:** `use-attention-items({ role })` → items computed server-side.
- **Interaction model:** The user opens an item's subject or performs its single permitted quick action (for example accept bid, assign driver) through the relevant contract; handled items leave the queue immediately.
- **Device needs:** Phone: act on one item away from the desk. Desktop: clear the queue.
- **Accessibility requirements:** Item count announced; each item's deadline expressed as text; removal announced politely.
- **Loading states:** Pending; refresh every 60 seconds and on focus.
- **Error states:** Retry; stale age stated.
- **Empty states:** "Nothing needs you right now" with time of last check.
- **Reuse potential:** PG-18, PG-19, PG-22, PG-23, PG-24, PG-50.
- **Technical notes:** Item types are an enum; quick actions reuse the same mutation hooks as their full pages.

### SH-08 — Performance metrics

- **Purpose:** Tell users how they are doing over a period.
- **Responsibilities:** Present KPIs for the scope and period with comparison to the previous period and definitions of each measure.
- **Data requirements:** `use-metrics({ scope, period })`; values computed server-side.
- **Interaction model:** The user chooses the period (IC-17) and opens a metric's definition; drilling in navigates to the filtered collection that produced the number.
- **Device needs:** Desktop: review trends. Phone: glance at this week.
- **Accessibility requirements:** Every chart has a data-table equivalent (IC-45); changes expressed in words ("up 4 points"), not only colour or direction.
- **Loading states:** Pending per metric group.
- **Error states:** Metric unavailable → its value withheld with reason.
- **Empty states:** Not enough data → "Available after your first delivered load."
- **Reuse potential:** PG-18, PG-19, PG-21, PG-23.
- **Technical notes:** Chart library pending approval (Phase 7 §15); numbers formatted by shared formatters.

### SH-09 — Scorecard

- **Purpose:** Convey an organisation's reliability from measured data and ratings (BR-22).
- **Responsibilities:** Present on-time, tracking compliance, acceptance or dwell measures and rating summary, with sample size and period.
- **Data requirements:** `use-scorecard(orgId)`.
- **Interaction model:** Read-only; the user can open each measure's definition.
- **Device needs:** All devices.
- **Accessibility requirements:** Values as text with units; rating expressed as "4.6 out of 5 from 132 ratings".
- **Loading states:** Pending.
- **Error states:** Withheld with retry.
- **Empty states:** Too few loads → "Scorecard begins after 5 delivered loads."
- **Reuse potential:** PG-03, PG-04, PG-28, PG-29, PG-33.
- **Technical notes:** Minimum sample size from constants.

### SH-10 — Rating submission

- **Purpose:** Collect a rating of the counter-party after delivery (XS-05).
- **Responsibilities:** Accept a rating on the fixed scale, optional reason tags and a comment; enforce the 30-day window.
- **Data requirements:** `use-rate-counterparty(loadId)`; reason tag vocabulary from enums.
- **Interaction model:** The user selects a rating (IC-37), optional tags and comment, and submits; submitted ratings are final.
- **Device needs:** Phone: rate in seconds from a notification.
- **Accessibility requirements:** Rating input follows IC-37; submission result announced.
- **Loading states:** Submission pending announced.
- **Error states:** Window closed → explained; submission failed → retry.
- **Empty states:** Not applicable (section exists only when rating is allowed).
- **Reuse potential:** PG-40, notification deep links.
- **Technical notes:** Idempotent per (load, rater organisation).

### SH-11 — Audit history

- **Purpose:** Record who changed what, when and why.
- **Responsibilities:** Present audit entries for a scope with actor, action, reason, before and after values.
- **Data requirements:** `use-audit-log({ scope })`, cursor-paginated.
- **Interaction model:** Read-only; filter by actor and action; load older entries on request.
- **Device needs:** Desktop.
- **Accessibility requirements:** Entries as a list with textual before/after.
- **Loading states:** Pending.
- **Error states:** Retry.
- **Empty states:** "No changes recorded."
- **Reuse potential:** PG-25, PG-51, PG-52, PG-50.
- **Technical notes:** Read-only endpoint; never editable.

### SH-12 — Guided next steps

- **Purpose:** Move a new organisation to its first value.
- **Responsibilities:** Determine which setup tasks remain for the organisation and route to each; report completion.
- **Data requirements:** `use-onboarding()` → remaining tasks.
- **Interaction model:** The user follows a task; completed tasks drop out; the section disappears when all are complete or the user dismisses it.
- **Device needs:** All devices.
- **Accessibility requirements:** Progress expressed as text ("2 of 4 done").
- **Loading states:** Absent until resolved.
- **Error states:** Absent on failure.
- **Empty states:** All done → absent.
- **Reuse potential:** PG-18, PG-19.
- **Technical notes:** Dismissal stored per user via `lib/utils/local-storage.ts`.

### SH-13 — Step progression

- **Purpose:** Carry a user through a multi-step entry flow without losing work (PP-06).
- **Responsibilities:** Track the current step, completed steps and validity; allow moving back without loss; persist the draft; restore it on return.
- **Data requirements:** Local draft through `useSyncExternalStore` + `localStorage`; server draft through the flow's hook where Phase 4 says so; current step in `?step=`.
- **Interaction model:** Follows IC-15. Moving forward validates the current step; moving back never validates; jumping is allowed only to completed steps.
- **Device needs:** Phone: one step at a time; the on-screen keyboard never hides the focused entry (WCAG 2.4.11). Desktop: fast keyboard progression.
- **Accessibility requirements:** Current step and total announced on step change; focus moves to the step's heading; errors summarised with links to the fields (IC-02).
- **Loading states:** Restoring a draft is announced once.
- **Error states:** Draft restore failed → start fresh and say so.
- **Empty states:** Not applicable.
- **Reuse potential:** PG-16, PG-17, PG-27, PG-45, PG-08.
- **Technical notes:** Reducer with typed actions; draft keyed by flow and user ID; drafts cleared on successful submission.

### SH-14 — Money breakdown

- **Purpose:** Explain an amount completely before and after commitment (PP-01).
- **Responsibilities:** Break an amount into its parts (linehaul, fuel, accessorials, fees, deductions), state how each was derived and which are pending approval.
- **Data requirements:** The role-shaped money object on the parent record (quote, load, invoice or settlement).
- **Interaction model:** Read-only; the user can open the derivation of any part.
- **Device needs:** All devices.
- **Accessibility requirements:** Amounts read with currency; totals labelled as totals; pending parts described as pending in text.
- **Loading states:** Follows the parent record.
- **Error states:** Follows the parent record.
- **Empty states:** Not applicable.
- **Reuse potential:** PG-27, PG-28, PG-31, PG-33, PG-34, PG-38, PG-40.
- **Technical notes:** Currency formatting in one shared formatter; never computed client-side except display rounding.

### SH-15 — Driver and truck assignment

- **Purpose:** Assign the right driver and equipment to a booked load (XF-05).
- **Responsibilities:** Offer eligible drivers and vehicles, check equipment against requirements, choose the tracking source, invite a new driver inline, confirm the assignment.
- **Data requirements:** `use-fleet()`, `use-assign-load(loadId)`.
- **Interaction model:** The user selects driver and vehicle (IC-06), sees eligibility results, confirms; reassignment requires a reason.
- **Device needs:** Phone: assign in one sitting from a notification. Desktop: assign many loads in a row.
- **Accessibility requirements:** Ineligible options state why; confirmation announced.
- **Loading states:** Fleet pending.
- **Error states:** Assignment rejected (conflict with another load, equipment mismatch) → reason.
- **Empty states:** No drivers → invite inline (XS-02).
- **Reuse potential:** PG-40, PG-35, PG-19.
- **Technical notes:** Server validates equipment and availability; deadline from BR-09 in constants.

---

## 3. Public Pages

### PG-01 — Home

#### SC-01.1 — Intent routing
- **Purpose:** Let visitors declare whether they ship or haul and route them accordingly.
- **Responsibilities:** Explain the value for each side and hand the declared intent to PG-11 (`?side=`) or PG-05.
- **Data requirements:** Copy from constants.
- **Interaction model:** The visitor chooses a side; the choice is carried in the URL, not stored.
- **Device needs:** Phone: choose with one thumb. Desktop: compare both sides.
- **Accessibility requirements:** Each route is a named link describing its destination.
- **Loading states:** Not applicable (static).
- **Error states:** Not applicable.
- **Empty states:** Not applicable.
- **Reuse potential:** PG-02 conversion route.
- **Technical notes:** Static; no client JavaScript required.

#### SC-01.2 — Lane price entry
- **Purpose:** Start a price check from the home page.
- **Responsibilities:** Accept origin, destination and equipment and hand them to PG-05.
- **Data requirements:** Location suggestions via `use-location-suggestions`.
- **Interaction model:** Location entries follow IC-05; submitting navigates to PG-05 with parameters.
- **Device needs:** Phone and desktop.
- **Accessibility requirements:** Labelled inputs; suggestions per IC-05.
- **Loading states:** Suggestions pending per IC-05.
- **Error states:** Suggestion service down → free-text accepted; PG-05 resolves it.
- **Empty states:** Not applicable.
- **Reuse potential:** SC-05.1 uses the same schema.
- **Technical notes:** Schema shared with SC-05.1 in `lib/validations/`.

#### SC-01.3 — Network proof
- **Purpose:** Establish credibility with verifiable network facts.
- **Responsibilities:** Present aggregate network statistics (approved carriers, loads delivered, on-time rate).
- **Data requirements:** Public stats endpoint, cached (revalidate hourly).
- **Interaction model:** Read-only.
- **Device needs:** All.
- **Accessibility requirements:** Numbers as text with context.
- **Loading states:** Rendered at build or revalidation; no client loading.
- **Error states:** Withheld entirely (PG-01 error state).
- **Empty states:** Not applicable.
- **Reuse potential:** None.
- **Technical notes:** Fetched in a server component with `revalidate`.

#### SC-01.4 — Access routing
- **Purpose:** Get returning users into the product.
- **Responsibilities:** Route signed-out users to PG-10 and signed-in users to their role root.
- **Data requirements:** Session presence (server).
- **Interaction model:** Single navigation.
- **Device needs:** All.
- **Accessibility requirements:** Link names state the destination.
- **Loading states:** Not applicable.
- **Error states:** Not applicable.
- **Empty states:** Not applicable.
- **Reuse potential:** PG-06, PG-09.
- **Technical notes:** Session read server-side via `lib/utils/session.ts`.

### PG-02 — Public Tracking

#### SC-02.1 — Status and ETA
- **Purpose:** Tell an outside party the load's status and arrival estimate.
- Instance of **SH-02**, scoped to a tracking token. Overrides: position is approximate (rounded to city level between stops); no check-call request; refresh every 2 minutes; expired token handled by SC-02.3.

#### SC-02.2 — Stop progress
- **Purpose:** Tell the outside party which stops are done and which remain.
- Instance of **SH-01**, public variant. Overrides: only stop arrival, departure and delivery events; city-level locations; no actors, rates or documents (BR-21).

#### SC-02.3 — Link validity and help
- **Purpose:** Explain the tracking link's scope and lifetime.
- **Responsibilities:** State who shared the link (organisation name only), when it expires, and what to do when it has expired or is invalid; offer conversion routes (PG-01, PG-11).
- **Data requirements:** Token metadata from `use-tracking(token)`.
- **Interaction model:** Read-only; conversion navigation.
- **Device needs:** Phone is the common device; all devices supported.
- **Accessibility requirements:** Expiry as absolute date text.
- **Loading states:** Server-rendered.
- **Error states:** Invalid token → not-found message without detail.
- **Empty states:** Not applicable.
- **Reuse potential:** None.
- **Technical notes:** `noindex`; token verified server-side on every request.

### PG-03 — Carrier Public Profile

#### SC-03.1 — Identity and authority
- **Purpose:** Establish that the carrier is real and authorised.
- **Responsibilities:** Present legal name, USDOT and MC numbers, authority status and date verified, years operating, equipment types and operating regions.
- **Data requirements:** `use-carrier-profile(carrierId)` (ISR on the server).
- **Interaction model:** Read-only; registry reference is a link to the public registry.
- **Device needs:** All.
- **Accessibility requirements:** Verification status stated in text, not only by symbol.
- **Loading states:** Server-rendered.
- **Error states:** Unknown or unapproved → PG-53.
- **Empty states:** Not applicable.
- **Reuse potential:** SC-51.1 (internal, richer).
- **Technical notes:** Revalidated by tag on compliance change.

#### SC-03.2 — Carrier scorecard
- Instance of **SH-09** for the carrier: on-time pickup and delivery, tracking compliance, tender acceptance, rating.

#### SC-03.3 — Relationship with viewer
- **Purpose:** Let a signed-in shipper act on the carrier.
- **Responsibilities:** State loads shared with this carrier and the shipper's own ratings; add to or remove from preferred carriers.
- **Data requirements:** `use-carrier-relationship(carrierId)`; `use-preferred-carriers` mutations.
- **Interaction model:** Add or remove with confirmation for removal (IC-12).
- **Device needs:** All.
- **Accessibility requirements:** Preferred state announced on change.
- **Loading states:** Loads separately after the public part.
- **Error states:** Section withheld on failure; mutation errors explained.
- **Empty states:** No shared history → "You haven't worked with this carrier yet."
- **Reuse potential:** SC-29.1.
- **Technical notes:** Client-rendered after hydration so the page stays ISR-cacheable.

### PG-04 — Shipper Public Profile

#### SC-04.1 — Shipper identity
- **Purpose:** Establish who the shipper is.
- **Responsibilities:** Present name, time on Haulr, volume band, typical lanes (regions).
- **Data requirements:** `use-shipper-profile(shipperId)`.
- **Interaction model:** Read-only.
- **Device needs:** All.
- **Accessibility requirements:** Text values.
- **Loading states:** Pending.
- **Error states:** Unknown → PG-53.
- **Empty states:** Not applicable.
- **Reuse potential:** None.
- **Technical notes:** No pricing fields in the DTO (BR-05).

#### SC-04.2 — Shipper scorecard
- Instance of **SH-09** for the shipper: facility dwell time, detention frequency, accessorial approval rate, payment timeliness, carrier rating.

### PG-05 — Lane Rate Estimator

#### SC-05.1 — Lane query
- **Purpose:** Capture the lane to estimate.
- **Responsibilities:** Accept origin, destination, equipment and date; validate; write them to the URL.
- **Data requirements:** `use-location-suggestions`; equipment enum.
- **Interaction model:** IC-05 for locations, IC-07 for equipment, IC-08 for date; estimating runs on submit and when a shared URL is opened.
- **Device needs:** Phone and desktop; desktop users run many lanes in a row with the keyboard.
- **Accessibility requirements:** Labelled inputs; errors per IC-02.
- **Loading states:** Not applicable.
- **Error states:** Unresolvable location → suggestions.
- **Empty states:** Not applicable.
- **Reuse potential:** SC-01.2, SC-27.2 (same lane schema).
- **Technical notes:** Lane schema in `lib/validations/lane.ts` composed over the contract.

#### SC-05.2 — Estimate and basis
- **Purpose:** Give the estimate and explain it.
- **Responsibilities:** Present point estimate, range, confidence, per-mile rate, miles and the basis (recent comparable loads, market index).
- **Data requirements:** `use-rate-estimate(lane)`.
- **Interaction model:** Read-only; open the basis explanation.
- **Device needs:** All.
- **Accessibility requirements:** Result announced when it arrives; range read as "between X and Y".
- **Loading states:** Previous estimate retained while pending.
- **Error states:** Low data → low-confidence statement and custom quote route; rate limited → sign-up route.
- **Empty states:** No lane yet → what to enter.
- **Reuse potential:** SC-27.4 (instant quote uses the same money presentation via SH-14).
- **Technical notes:** Anonymous calls go through a route handler that applies rate limiting.

#### SC-05.3 — Lane trend
- **Purpose:** Show whether the lane is getting more or less expensive.
- **Responsibilities:** Present 30-day rate history and direction for the lane and equipment.
- **Data requirements:** `use-lane-trend(lane)`.
- **Interaction model:** Explore values by date (IC-45).
- **Device needs:** Desktop mainly; phone gets the direction in words.
- **Accessibility requirements:** Data-table equivalent; direction stated in words.
- **Loading states:** Pending.
- **Error states:** Withheld.
- **Empty states:** Not enough history → say so.
- **Reuse potential:** SH-08 metric rendering.
- **Technical notes:** Chart library pending approval.

#### SC-05.4 — Continue to quote
- **Purpose:** Convert the estimate into a real quote (XS-10 → XF-01).
- **Responsibilities:** Carry the lane to PG-27 through sign-in or registration; allow signed-in users to save the estimate.
- **Data requirements:** Session presence; `use-saved-estimates`.
- **Interaction model:** Navigation with the lane in `?lane=`; save confirms (SSB-5).
- **Device needs:** All.
- **Accessibility requirements:** Link names state the destination.
- **Loading states:** Save pending.
- **Error states:** Save failed → retry.
- **Empty states:** Not applicable.
- **Reuse potential:** None.
- **Technical notes:** Return path validated with `lib/utils/internal-path.ts`.

### PG-06 — Help Center

#### SC-06.1 — Help search
- **Purpose:** Find an answer by typing the question.
- **Responsibilities:** Full-text search across articles; results grouped by category; suggestions for no results.
- **Data requirements:** Build-time search index; `use-help-search(q)`.
- **Interaction model:** IC-19 (search input), debounced; query in `?q=`.
- **Device needs:** All.
- **Accessibility requirements:** Result count announced.
- **Loading states:** Index loads lazily on first focus.
- **Error states:** Index unavailable → category browsing remains.
- **Empty states:** No results → related categories and SC-06.3.
- **Reuse potential:** Global quick find pattern (Phase 3 §9).
- **Technical notes:** Index generated at build from the content source.

#### SC-06.2 — Category browsing
- **Purpose:** Let users explore help by topic.
- **Responsibilities:** Enumerate categories (Phase 3 §6) and their articles; signed-in users get articles relevant to their role.
- **Data requirements:** Static content; role from session.
- **Interaction model:** Navigation.
- **Device needs:** All.
- **Accessibility requirements:** Categories as a navigation landmark with a label.
- **Loading states:** Not applicable.
- **Error states:** Not applicable.
- **Empty states:** Not applicable.
- **Reuse potential:** SC-07.3.
- **Technical notes:** Static generation.

#### SC-06.3 — Escalation to support
- **Purpose:** Offer a human route when self-service fails.
- **Responsibilities:** Route to PG-08 carrying the search query as context.
- **Data requirements:** Current query.
- **Interaction model:** Navigation.
- **Device needs:** All.
- **Accessibility requirements:** Named link.
- **Loading states:** Not applicable.
- **Error states:** Not applicable.
- **Empty states:** Not applicable.
- **Reuse potential:** SC-07.2, SC-54.1.
- **Technical notes:** Context passed as URL parameters.

### PG-07 — Help Article

#### SC-07.1 — Article
- **Purpose:** Answer one question completely.
- **Responsibilities:** Present the article body with its last-updated date and category trail.
- **Data requirements:** Static article by slug.
- **Interaction model:** Reading; in-article anchors.
- **Device needs:** All.
- **Accessibility requirements:** Proper heading structure; step lists as ordered lists.
- **Loading states:** Not applicable.
- **Error states:** Unknown slug → PG-53.
- **Empty states:** Not applicable.
- **Reuse potential:** PG-09 document rendering.
- **Technical notes:** `generateStaticParams`; structured data.

#### SC-07.2 — Helpfulness feedback
- **Purpose:** Learn whether the article solved the problem.
- **Responsibilities:** Record yes or no with an optional reason; route "no" to SC-06.3.
- **Data requirements:** `use-article-feedback`.
- **Interaction model:** Single choice then optional comment; one submission per session.
- **Device needs:** All.
- **Accessibility requirements:** Result announced.
- **Loading states:** Pending.
- **Error states:** Silent failure with no user impact beyond a retry offer.
- **Empty states:** Not applicable.
- **Reuse potential:** None.
- **Technical notes:** Fire-and-forget mutation.

#### SC-07.3 — Related help
- **Purpose:** Offer the next likely question.
- **Responsibilities:** Enumerate related articles defined in content metadata.
- **Data requirements:** Static.
- **Interaction model:** Navigation.
- **Device needs:** All.
- **Accessibility requirements:** Labelled list.
- **Loading states:** Not applicable.
- **Error states:** Not applicable.
- **Empty states:** None defined → absent.
- **Reuse potential:** SC-06.2.
- **Technical notes:** From article front matter.

### PG-08 — Contact Support

#### SC-08.1 — Ticket creation
- **Purpose:** Open a ticket with the right context once.
- **Responsibilities:** Capture category, subject, description, urgency, optional load reference and attachments; prefill context from the URL; persist the draft.
- **Data requirements:** Ticket categories enum; `use-create-ticket`; draft via SH-13 persistence.
- **Interaction model:** Single-step entry (not a multi-step flow); submit through a Server Action; attachments via IC-24.
- **Device needs:** Phone: report with a photo from the road. Desktop: detailed reports.
- **Accessibility requirements:** Errors per IC-02; confirmation announced with the reference.
- **Loading states:** Submission pending.
- **Error states:** Failure → draft retained with retry.
- **Empty states:** Not applicable.
- **Reuse potential:** Support contexts from PG-54, PG-06.
- **Technical notes:** Anonymous submissions require an email and are rate-limited by the backend.

#### SC-08.2 — Ticket history
- Instance of **SH-05** over the user's tickets. Overrides: signed-in only; filters by status only; each ticket opens its conversation (SH-04).

### PG-09 — Legal

#### SC-09.1 — Legal document
- **Purpose:** Publish one legal document with its version.
- **Responsibilities:** Present the document text, version, effective date and change summary; offer a printable form.
- **Data requirements:** Static content by document key.
- **Interaction model:** Reading; in-document anchors.
- **Device needs:** All; printable.
- **Accessibility requirements:** Heading structure; print output keeps reading order.
- **Loading states:** Not applicable.
- **Error states:** Unknown document → PG-53.
- **Empty states:** Not applicable.
- **Reuse potential:** SC-07.1 rendering; consent references in SC-11.2 and SC-17.4.
- **Technical notes:** Version identifier exported as a constant and recorded with every consent.

---

## 4. Access Pages

### PG-10 — Sign In

#### SC-10.1 — Credential entry
- **Purpose:** Authenticate a returning user.
- **Responsibilities:** Accept email and password, submit, hand off to MFA when enrolled, redirect to the validated return path or role root.
- **Data requirements:** `use-login` (exists); `app/api/session` (exists).
- **Interaction model:** IC-01 inputs, IC-03 password, IC-11 submit; Enter submits; double submission prevented.
- **Device needs:** Password manager autofill on every device.
- **Accessibility requirements:** `autocomplete="username"` and `"current-password"`; error announced assertively and linked to the form.
- **Loading states:** Pending submission announced.
- **Error states:** `INVALID_CREDENTIALS` (generic); locked with cooldown; network retry.
- **Empty states:** Not applicable.
- **Reuse potential:** Existing `components/common/login-form.tsx`.
- **Technical notes:** Extend the existing form; do not fork it.

#### SC-10.2 — Recovery routes
- **Purpose:** Get users who cannot sign in to the right recovery.
- **Responsibilities:** Route to PG-12 (forgot password), PG-11 (no account), PG-08 (other trouble).
- **Data requirements:** None.
- **Interaction model:** Navigation.
- **Device needs:** All.
- **Accessibility requirements:** Named links.
- **Loading states:** Not applicable.
- **Error states:** Not applicable.
- **Empty states:** Not applicable.
- **Reuse potential:** PG-14 recovery.
- **Technical notes:** Routes from constants (`LOGIN_ROUTE` family).

### PG-11 — Register

#### SC-11.1 — Side selection
- **Purpose:** Establish whether the user ships or hauls.
- **Responsibilities:** Record the side; accept preselection from `?side=`.
- **Data requirements:** Side enum.
- **Interaction model:** IC-09 radio group; the choice changes which consent documents apply.
- **Device needs:** All.
- **Accessibility requirements:** Group labelled with the question.
- **Loading states:** Not applicable.
- **Error states:** Not chosen → error per IC-02.
- **Empty states:** Not applicable.
- **Reuse potential:** None.
- **Technical notes:** Side stored in the register request; drives onboarding route.

#### SC-11.2 — Account creation
- **Purpose:** Create the account with valid consent.
- **Responsibilities:** Capture name, work email, password, consent to the current terms version; submit; start email verification.
- **Data requirements:** `use-register` (exists), `app/api/register` (exists); schema composed over the contract register DTO.
- **Interaction model:** IC-01, IC-03 with policy feedback, IC-38 consent; submit via IC-11.
- **Device needs:** Phone: complete one-handed.
- **Accessibility requirements:** Password rules stated before entry; `autocomplete="new-password"`.
- **Loading states:** Pending announced.
- **Error states:** Email exists → sign-in and reset routes; `SESSION_UNAVAILABLE` → sign-in route.
- **Empty states:** Not applicable.
- **Reuse potential:** SC-15.1 (new-user acceptance).
- **Technical notes:** `PASSWORD_MIN_LENGTH` from constants.

### PG-12 — Forgot Password

#### SC-12.1 — Reset request
- **Purpose:** Send a reset link.
- **Responsibilities:** Accept an email; submit; confirm identically whether or not the account exists.
- **Data requirements:** `use-request-password-reset`.
- **Interaction model:** IC-01, IC-11.
- **Device needs:** All.
- **Accessibility requirements:** Confirmation announced.
- **Loading states:** Pending.
- **Error states:** Rate limit → wait time.
- **Empty states:** Not applicable.
- **Reuse potential:** None.
- **Technical notes:** No account enumeration.

### PG-13 — Reset Password

#### SC-13.1 — New password
- **Purpose:** Set a new password from a valid token.
- **Responsibilities:** Validate the token server-side; accept and confirm the new password; revoke other sessions.
- **Data requirements:** `use-reset-password(token)`.
- **Interaction model:** IC-03; IC-11.
- **Device needs:** All.
- **Accessibility requirements:** Policy stated; mismatch explained.
- **Loading states:** Token check before render.
- **Error states:** Invalid or expired → route to PG-12.
- **Empty states:** Not applicable.
- **Reuse potential:** SC-47.1 password change.
- **Technical notes:** Token read from URL on the server only.

### PG-14 — Verify

#### SC-14.1 — Email verification
- **Purpose:** Confirm the user owns the email.
- **Responsibilities:** Consume a verification link; allow resending; report status.
- **Data requirements:** `use-verify-email`, `use-resend-verification`.
- **Interaction model:** Automatic on link; resend with a cooldown.
- **Device needs:** All.
- **Accessibility requirements:** Status announced.
- **Loading states:** Verifying announced.
- **Error states:** Expired link → resend.
- **Empty states:** Not applicable.
- **Reuse potential:** Email change (SC-46.2).
- **Technical notes:** Cooldown from constants.

#### SC-14.2 — MFA challenge
- **Purpose:** Complete a second factor.
- **Responsibilities:** Accept a one-time code or backup code; report remaining attempts.
- **Data requirements:** `use-mfa-challenge`.
- **Interaction model:** IC-04 one-time code input; auto-submit when complete.
- **Device needs:** Phone autofill of codes.
- **Accessibility requirements:** `autocomplete="one-time-code"`; errors announced.
- **Loading states:** Pending.
- **Error states:** Wrong code; too many attempts → cooldown.
- **Empty states:** Not applicable.
- **Reuse potential:** Re-authentication (IC-13).
- **Technical notes:** Partial session cookie distinct from `SESSION_COOKIE`.

### PG-15 — Accept Invitation

#### SC-15.1 — Invitation acceptance
- **Purpose:** Join an organisation.
- **Responsibilities:** State organisation, inviter and role; accept for an existing account (sign in) or create credentials for a new one.
- **Data requirements:** `use-invitation(token)`, `use-accept-invitation`.
- **Interaction model:** Single decision; new users set a password (IC-03).
- **Device needs:** Phone from SMS; finish in under a minute.
- **Accessibility requirements:** Organisation and role in the page's main heading text.
- **Loading states:** Token validated server-side.
- **Error states:** Expired, revoked, other organisation → explained.
- **Empty states:** Not applicable.
- **Reuse potential:** SC-11.2 credential creation.
- **Technical notes:** Token single-use.

#### SC-15.2 — Driver location consent
- **Purpose:** Obtain informed location consent from drivers (Phase 1 §12).
- **Responsibilities:** Explain when location is collected (active assigned trips only) and why; request browser permission; record consent.
- **Data requirements:** `use-location-consent`.
- **Interaction model:** IC-38 consent then the browser permission prompt; declining is allowed and recorded.
- **Device needs:** Phone.
- **Accessibility requirements:** Explanation available before the browser prompt.
- **Loading states:** Not applicable.
- **Error states:** Permission blocked → how to enable in the browser.
- **Empty states:** Not applicable.
- **Reuse potential:** SC-20.3, SC-39.5.
- **Technical notes:** Consent version recorded.

---

## 5. Onboarding

### PG-16 — Shipper Onboarding

#### SC-16.1 — Onboarding progression
- Instance of **SH-13** with steps: company, billing and credit, team and facilities. Overrides: each completed step saves to the server; posting remains blocked until billing is complete.

#### SC-16.2 — Company and shipping profile
- **Purpose:** Capture who the shipper is and how they ship.
- **Responsibilities:** Record legal name, address, tax ID, typical lanes, monthly volume band, equipment needs.
- **Data requirements:** `use-onboarding` step mutation.
- **Interaction model:** IC-01, IC-05, IC-07; save on continue.
- **Device needs:** Desktop mainly; resumable anywhere.
- **Accessibility requirements:** IC-02 error summary.
- **Loading states:** Restoring announced.
- **Error states:** Validation per field.
- **Empty states:** Not applicable.
- **Reuse potential:** SC-48.1.
- **Technical notes:** Schema composed over the organisation DTO.

#### SC-16.3 — Billing and credit
- **Purpose:** Decide how the shipper pays.
- **Responsibilities:** Capture billing contacts; submit a credit application or set up prepay; report the decision.
- **Data requirements:** `use-credit-application`, `use-payment-methods`.
- **Interaction model:** Choice between terms and prepay (IC-09); processor entry via IC-42.
- **Device needs:** Desktop.
- **Accessibility requirements:** Decision announced.
- **Loading states:** Credit decision pending (may take minutes; user may continue).
- **Error states:** Declined → prepay route without loss.
- **Empty states:** Not applicable.
- **Reuse potential:** SC-49.2, SC-49.3.
- **Technical notes:** Credit decision arrives by notification if not immediate.

#### SC-16.4 — Team and facilities
- **Purpose:** Bring colleagues and facilities in.
- **Responsibilities:** Invite members with roles; add facilities; allow skipping.
- **Data requirements:** `use-invitations`, `use-facilities`.
- **Interaction model:** IC-39 invite; facility entry reuses SC-32.2 behaviour.
- **Device needs:** Desktop.
- **Accessibility requirements:** Each added item announced.
- **Loading states:** Per mutation.
- **Error states:** Per invite.
- **Empty states:** Skippable.
- **Reuse potential:** SC-48.3, SC-32.2.
- **Technical notes:** Same mutations as their home pages.

### PG-17 — Carrier Onboarding

#### SC-17.1 — Onboarding progression
- Instance of **SH-13** with steps: authority, company and capability, documents and agreement, payout, review. Overrides: resumable across devices from the server draft.

#### SC-17.2 — Authority lookup
- **Purpose:** Establish the carrier's operating authority.
- **Responsibilities:** Accept USDOT and MC numbers; fetch the registry record; confirm the match with the user; allow manual entry for review if the lookup is unavailable.
- **Data requirements:** `use-authority-lookup`.
- **Interaction model:** IC-01 numeric entry; lookup on submit; user confirms "this is my company".
- **Device needs:** Phone and desktop.
- **Accessibility requirements:** Lookup result announced.
- **Loading states:** Lookup pending announced.
- **Error states:** Not found; inactive authority → explanation; source down → manual path.
- **Empty states:** Not applicable.
- **Reuse potential:** SC-51.1.
- **Technical notes:** Registry calls made by the backend only.

#### SC-17.3 — Company and capability
- **Purpose:** Record what the carrier can haul and where.
- **Responsibilities:** Capture contacts, fleet size, equipment types, preferred lanes and regions.
- **Data requirements:** `use-onboarding`.
- **Interaction model:** IC-07 multi-select for equipment; IC-05 for lanes.
- **Device needs:** Phone and desktop.
- **Accessibility requirements:** IC-02.
- **Loading states:** Per save.
- **Error states:** Validation.
- **Empty states:** Not applicable.
- **Reuse potential:** SC-48.1.
- **Technical notes:** Lanes feed recommendations (SC-19.3).

#### SC-17.4 — Compliance documents and agreement
- **Purpose:** Collect insurance, W-9 and the signed carrier agreement.
- **Responsibilities:** Accept uploads or insurer-linked verification; report each document's check result; capture the agreement signature.
- **Data requirements:** `use-document-upload`, `use-sign-agreement`.
- **Interaction model:** Instance of SH-03 behaviour for uploads; IC-26 e-signature.
- **Device needs:** Phone: photograph certificates.
- **Accessibility requirements:** Check results in text.
- **Loading states:** Per upload.
- **Error states:** Rejected with reason and re-upload.
- **Empty states:** Required documents listed as outstanding.
- **Reuse potential:** SC-43.2.
- **Technical notes:** Agreement version from constants.

#### SC-17.5 — Payout setup
- Instance of **SC-49.2** behaviour for payout methods, embedded in onboarding.

#### SC-17.6 — Review status
- **Purpose:** Tell the carrier where they stand.
- **Responsibilities:** Report compliance status, outstanding items, reasons for any request or rejection, expected decision time.
- **Data requirements:** `use-compliance-status`.
- **Interaction model:** Follow a fix route; resubmit after fixing.
- **Device needs:** All.
- **Accessibility requirements:** Status change announced.
- **Loading states:** Pending.
- **Error states:** Retry.
- **Empty states:** Not applicable.
- **Reuse potential:** SH-06 standing data.
- **Technical notes:** Updates also arrive by notification.

---

## 6. Role Dashboards

### PG-18 — Shipper Dashboard

#### SC-18.1 — Shipper attention
- Instance of **SH-07** for shipper roles. Item types: bid awaiting decision, uncovered near pickup, late ETA, open exception, accessorial approval, invoice due (finance), claim response due.

#### SC-18.2 — Active load overview
- **Purpose:** Give a count of active loads by state and route into each.
- **Responsibilities:** Report counts per load state group (posted, booked, in transit, delivered awaiting POD) with late counts; route to PG-26 filtered.
- **Data requirements:** `use-load-counts()`.
- **Interaction model:** Each count navigates to the filtered collection.
- **Device needs:** All.
- **Accessibility requirements:** Counts with labels as text.
- **Loading states:** Pending.
- **Error states:** Retry.
- **Empty states:** No active loads → SH-12 or quote route.
- **Reuse potential:** SC-19.2.
- **Technical notes:** Filter parameters from Phase 3 §10.

#### SC-18.3 — Service and spend
- Instance of **SH-08**: on-time pickup and delivery, tracking compliance, spend, average cost per mile, time to coverage. Finance role receives spend only.

#### SC-18.4 — New organisation guidance
- Instance of **SH-12**.

#### SC-18.5 — Shipper account standing
- Instance of **SH-06**.

### PG-19 — Carrier Dashboard

#### SC-19.1 — Carrier attention
- Instance of **SH-07** for carrier roles. Item types: needs assignment (with BR-09 deadline), tender awaiting response, counter-offer received, exception on load, POD missing, document expiring.

#### SC-19.2 — Active loads
- **Purpose:** Report the carrier's in-flight loads and their health.
- **Responsibilities:** Report active loads with next stop, tracking freshness and exceptions; route to PG-40.
- **Data requirements:** `use-loads({ scope: 'carrier', status: active })`.
- **Interaction model:** Navigate to a load; assign via SH-15 where needed.
- **Device needs:** Phone for owner-operators; desktop for dispatchers.
- **Accessibility requirements:** Freshness as text.
- **Loading states:** Pending.
- **Error states:** Retry.
- **Empty states:** No active loads → load board route.
- **Reuse potential:** SC-18.2, SH-05.
- **Technical notes:** Shares the loads query key.

#### SC-19.3 — Recommended loads
- **Purpose:** Suggest loads for trucks becoming empty.
- **Responsibilities:** Offer posted loads matched to each truck's expected empty location and time and the carrier's lanes; explain why each was recommended.
- **Data requirements:** `use-recommended-loads()`.
- **Interaction model:** Open a load, book it (PG-34) or watch it (IC-33); dismiss a recommendation.
- **Device needs:** Phone and desktop.
- **Accessibility requirements:** Recommendation reason as text.
- **Loading states:** Pending.
- **Error states:** Withheld with retry.
- **Empty states:** No matches → save a search route.
- **Reuse potential:** SC-33.2 result behaviour.
- **Technical notes:** Refresh every 5 minutes.

#### SC-19.4 — Pay outlook
- **Purpose:** Tell the carrier what money is coming and when.
- **Responsibilities:** Report pending settlement totals by expected date, quick-pay-eligible amount, failed payouts.
- **Data requirements:** `use-settlement-summary()`.
- **Interaction model:** Navigate to PG-38 filtered.
- **Device needs:** All.
- **Accessibility requirements:** Amounts with currency; dates as text.
- **Loading states:** Pending.
- **Error states:** Retry.
- **Empty states:** Nothing pending.
- **Reuse potential:** SC-38.1.
- **Technical notes:** Amounts for `carrier.admin` only (server-shaped).

#### SC-19.5 — Carrier account standing
- Instance of **SH-06**.

### PG-20 — Driver Home

#### SC-20.1 — Current trip entry
- **Purpose:** Get the driver into the current trip immediately.
- **Responsibilities:** Identify the current trip and its next stop and route to PG-39.
- **Data requirements:** `use-driver-trips()` (cached for offline).
- **Interaction model:** One navigation.
- **Device needs:** Phone; gloves; glare.
- **Accessibility requirements:** The route to the current trip is a named link describing the trip and its next stop.
- **Loading states:** Cached value immediately.
- **Error states:** Offline → cached trip.
- **Empty states:** No trip → how to reach dispatch.
- **Reuse potential:** None.
- **Technical notes:** Cache persisted per SC-39.5.

#### SC-20.2 — Upcoming trips
- **Purpose:** Let the driver plan ahead.
- **Responsibilities:** Enumerate assigned future trips with pickup city and appointment.
- **Data requirements:** `use-driver-trips()`.
- **Interaction model:** Open a trip (read-only until active).
- **Device needs:** Phone.
- **Accessibility requirements:** Dates as text.
- **Loading states:** Cached.
- **Error states:** Cached.
- **Empty states:** None assigned.
- **Reuse potential:** None.
- **Technical notes:** Same query as SC-20.1.

#### SC-20.3 — Sync and permission state
- **Purpose:** Tell the driver whether their updates are reaching dispatch.
- **Responsibilities:** Report queued offline events, last sync time, location permission state; route to fix permission.
- **Data requirements:** Offline queue state (`use-stop-events` queue), permission API.
- **Interaction model:** Retry sync; open permission help.
- **Device needs:** Phone.
- **Accessibility requirements:** Queue count changes announced politely.
- **Loading states:** Not applicable.
- **Error states:** Sync failing → reason.
- **Empty states:** Everything synced → stated once.
- **Reuse potential:** SC-39.5.
- **Technical notes:** Shared with PG-39.

### PG-21 — Operations Dashboard

#### SC-21.1 — Exception volume
- **Purpose:** Tell operations how many exceptions exist by type and severity.
- **Responsibilities:** Report counts and age; route to PG-50 filtered; claim the next exception.
- **Data requirements:** `use-exception-summary()`.
- **Interaction model:** Navigate or claim next (IC-47).
- **Device needs:** Desktop, often left open.
- **Accessibility requirements:** Counts as text; last refresh time stated.
- **Loading states:** Pending; refresh every 30 seconds.
- **Error states:** Age stated.
- **Empty states:** Zero with refresh time.
- **Reuse potential:** SC-22.1 pattern.
- **Technical notes:** Paused when hidden.

#### SC-21.2 — Coverage risk
- **Purpose:** Surface loads at risk of not being covered.
- **Responsibilities:** Report posted loads picking up within 24 hours with their risk score and tender state; allow bulk re-tender.
- **Data requirements:** `use-coverage-risk()`.
- **Interaction model:** Open, re-tender (IC-12 confirmation), or claim as an exception.
- **Device needs:** Desktop.
- **Accessibility requirements:** Risk expressed as text band.
- **Loading states:** Pending.
- **Error states:** Retry.
- **Empty states:** No risk.
- **Reuse potential:** SH-05.
- **Technical notes:** Risk computed server-side.

#### SC-21.3 — Tracking health
- **Purpose:** Report network tracking compliance now (KPI-05).
- **Responsibilities:** Report percentage of in-transit loads with fresh positions and the loads that are stale.
- **Data requirements:** `use-tracking-health()`.
- **Interaction model:** Navigate to stale loads.
- **Device needs:** Desktop.
- **Accessibility requirements:** Text values.
- **Loading states:** Pending.
- **Error states:** Age stated.
- **Empty states:** Not applicable.
- **Reuse potential:** SH-08.
- **Technical notes:** Threshold from BR-10 constants.

#### SC-21.4 — Personal throughput
- Instance of **SH-08** scoped to the agent: claimed, resolved, median time to resolve, this shift.

### PG-22 — Compliance Dashboard

#### SC-22.1 — Vetting queue
- Instance of **SH-07** and **SH-05** over carriers awaiting review. Overrides: SLA age per item; opens PG-51.

#### SC-22.2 — Monitoring changes
- **Purpose:** Surface authority and insurance changes since the last review.
- **Responsibilities:** Report each change with carrier, change type, effective date and automatic action taken (BR-18); allow acknowledging.
- **Data requirements:** `use-monitoring-events()`.
- **Interaction model:** Open the carrier; acknowledge with a note.
- **Device needs:** Desktop.
- **Accessibility requirements:** Change type as text.
- **Loading states:** Pending.
- **Error states:** Last successful fetch time.
- **Empty states:** No changes.
- **Reuse potential:** None.
- **Technical notes:** Cursor-paginated.

#### SC-22.3 — Affected loads
- **Purpose:** Identify booked loads affected by a compliance change.
- **Responsibilities:** Report loads whose carrier became ineligible; route to operations exceptions.
- **Data requirements:** `use-loads({ affectedByCompliance: true })`.
- **Interaction model:** Open load; the linked exception is handled in PG-50.
- **Device needs:** Desktop.
- **Accessibility requirements:** Text.
- **Loading states:** Pending.
- **Error states:** Retry.
- **Empty states:** None affected.
- **Reuse potential:** SH-05.
- **Technical notes:** Read-only here.

### PG-23 — Finance Operations Dashboard

#### SC-23.1 — POD verification queue
- **Purpose:** Verify PODs that failed automatic checks.
- **Responsibilities:** Present the document and load context; verify or reject with reason; request recapture.
- **Data requirements:** `use-pod-queue()`, `use-verify-pod`.
- **Interaction model:** Keyboard-driven review: verify, reject with reason (IC-12 for reject), next.
- **Device needs:** Desktop.
- **Accessibility requirements:** Document has text metadata; decisions announced.
- **Loading states:** Next item prefetched.
- **Error states:** Decision failed → item stays.
- **Empty states:** Queue clear.
- **Reuse potential:** SH-03 preview.
- **Technical notes:** Optimistic removal with rollback.

#### SC-23.2 — Disputes
- Instance of **SH-05** over open disputes and claims needing finance. Opens PG-45.

#### SC-23.3 — Receivables ageing
- Instance of **SH-08** for receivables by age bucket, with drill-down to invoices.

#### SC-23.4 — Payout failures
- **Purpose:** Resolve failed carrier payouts.
- **Responsibilities:** Report failures with reason; retry after correction; contact the carrier.
- **Data requirements:** `use-payout-failures()`, `use-retry-payout`.
- **Interaction model:** Retry (IC-12 confirmation), message the carrier admin.
- **Device needs:** Desktop.
- **Accessibility requirements:** Reason text.
- **Loading states:** Pending.
- **Error states:** Retry result explained.
- **Empty states:** None failed.
- **Reuse potential:** SH-05.
- **Technical notes:** Idempotent retry.

#### SC-23.5 — Quick pay activity
- Instance of **SH-08** for quick pay volume, fee revenue and average time to pay.

### PG-24 — Support Console

#### SC-24.1 — Ticket queue
- Instance of **SH-07** and **SH-05** over tickets with SLA. Selected ticket in `?ticket=`.

#### SC-24.2 — Ticket conversation
- Instance of **SH-04** for the selected ticket. Overrides: internal notes visible only to internal roles; hand-off to ops, compliance or finance (IC-48).

#### SC-24.3 — Requester context
- **Purpose:** Give the agent the requester's situation.
- **Responsibilities:** Report organisation, role, account standing, recent loads, open exceptions and prior tickets; route to each.
- **Data requirements:** `use-requester-context(userId)`.
- **Interaction model:** Navigate; look up by email or load reference when unmatched.
- **Device needs:** Desktop.
- **Accessibility requirements:** Text.
- **Loading states:** Pending.
- **Error states:** Unmatched → lookup.
- **Empty states:** New user with no activity.
- **Reuse potential:** SC-52.2.
- **Technical notes:** Read-only.

### PG-25 — Admin Dashboard

#### SC-25.1 — Pending approvals
- Instance of **SH-07** over organisation approvals and access requests.

#### SC-25.2 — Platform configuration
- **Purpose:** Change platform parameters safely.
- **Responsibilities:** Present configurable values (quote validity, tender window, detention free time, tracking thresholds) with current value and history; preview impact; apply with reason.
- **Data requirements:** `use-platform-config()`, `use-update-config`.
- **Interaction model:** Edit, preview impact, confirm with reason (IC-12, IC-13 re-authentication).
- **Device needs:** Desktop.
- **Accessibility requirements:** Impact preview as text.
- **Loading states:** Pending.
- **Error states:** Conflict → impact explained.
- **Empty states:** Not applicable.
- **Reuse potential:** None.
- **Technical notes:** Server-side values override frontend constants of the same name.

#### SC-25.3 — Platform audit
- Instance of **SH-11** scoped to the platform.

---

## 7. Shipper Workspace

### PG-26 — Shipments

#### SC-26.1 — Load collection
- Instance of **SH-05** over the organisation's loads. Filters: status, dates, origin, destination, equipment, carrier, late only, exceptions only. Bulk actions: export, share tracking (SC-26.3).

#### SC-26.2 — Shipments map
- Instance of **SH-02**, collection variant. Overrides: positions for in-transit loads matching SC-26.1 criteria; the map view and the list view share one query and one URL (`view=map`); selecting a load navigates to PG-40.

#### SC-26.3 — Tracking share and export
- **Purpose:** Share tracking and export data for selected loads.
- **Responsibilities:** Generate tracking links (IC-44) for selected loads; export selected or filtered loads as CSV.
- **Data requirements:** `use-tracking-links`, `use-export-loads`.
- **Interaction model:** Operates on the selection from SC-26.1; export runs server-side and notifies when ready if large.
- **Device needs:** Desktop.
- **Accessibility requirements:** Completion announced.
- **Loading states:** Export progress.
- **Error states:** Per-load failures reported.
- **Empty states:** Nothing selected → action unavailable with reason.
- **Reuse potential:** SC-40.15.
- **Technical notes:** Exports generated by the backend.

### PG-27 — Post a Load

#### SC-27.1 — Posting progression
- Instance of **SH-13** with steps: lane and schedule, freight and equipment, quote, tender strategy, review. Overrides: server draft after the lane step; prefill from `?from=` or `?lane=`.

#### SC-27.2 — Lane and schedule
- **Purpose:** Define where and when.
- **Responsibilities:** Capture ordered stops (pickup, delivery, additional stops), facility, appointment windows, time zone, references.
- **Data requirements:** `use-facilities`, `use-location-suggestions`.
- **Interaction model:** IC-05 locations with facility match; IC-08 date-time windows; add or remove stops (IC-40 for reordering).
- **Device needs:** Desktop keyboard speed; phone for single-stop loads.
- **Accessibility requirements:** Stop count announced on change; IC-02.
- **Loading states:** Suggestions pending.
- **Error states:** Window in the past; delivery before pickup; unknown address.
- **Empty states:** Not applicable.
- **Reuse potential:** SC-05.1 lane schema.
- **Technical notes:** Stop schema composed over the contract stop DTO.

#### SC-27.3 — Freight and equipment
- **Purpose:** Define what is moving and what it needs.
- **Responsibilities:** Capture equipment, commodity, weight, pallets, temperature range (reefer), hazmat flag, special requirements.
- **Data requirements:** Enums.
- **Interaction model:** IC-07, IC-01 numeric with units; conditional requirements appear per equipment.
- **Device needs:** All.
- **Accessibility requirements:** Units in labels.
- **Loading states:** Not applicable.
- **Error states:** Over legal weight; temperature missing for reefer.
- **Empty states:** Not applicable.
- **Reuse potential:** None.
- **Technical notes:** Conditional validation via Zod discriminated unions.

#### SC-27.4 — Instant quote
- **Purpose:** Price the load and hold the price (BR-06).
- **Responsibilities:** Request a quote; present it with SH-14 breakdown, confidence and validity countdown (IC-46); re-quote; request a custom quote.
- **Data requirements:** `use-quote(draft)`.
- **Interaction model:** Quote requested when prior steps are valid; changes to earlier steps invalidate the quote.
- **Device needs:** All.
- **Accessibility requirements:** Countdown announced at 5 minutes and 1 minute remaining only.
- **Loading states:** Pending announced.
- **Error states:** Unserviceable → custom quote; expired → re-quote.
- **Empty states:** Not applicable.
- **Reuse potential:** SC-05.2.
- **Technical notes:** Quote ID carried to posting.

#### SC-27.5 — Tender strategy
- **Purpose:** Decide who gets offered the load.
- **Responsibilities:** Choose open market, preferred waterfall, or both; review the lane's preferred order; choose bid mode or book-now.
- **Data requirements:** `use-preferred-carriers({ lane })`.
- **Interaction model:** IC-09 strategy choice; route to PG-29 to edit rules.
- **Device needs:** All.
- **Accessibility requirements:** Consequence of each strategy stated.
- **Loading states:** Preferred list pending.
- **Error states:** Ineligible preferred carriers flagged.
- **Empty states:** No preferred carriers → open market only.
- **Reuse potential:** SC-29.2.
- **Technical notes:** Strategy enum.

#### SC-27.6 — Review and post
- **Purpose:** Confirm everything and post.
- **Responsibilities:** Summarise the load in text, money via SH-14, strategy; post with confirmation (IC-12); hand off to PG-40.
- **Data requirements:** `use-post-load`.
- **Interaction model:** Edit routes back to any step; post once.
- **Device needs:** All.
- **Accessibility requirements:** Summary as a description list; post result announced.
- **Loading states:** Posting pending.
- **Error states:** Quote expired → re-quote; organisation blocked → SH-06 route.
- **Empty states:** Not applicable.
- **Reuse potential:** None.
- **Technical notes:** Server Action with idempotency key.

### PG-28 — Compare Bids

#### SC-28.1 — Load context
- **Purpose:** Remind the shipper what the bids are for.
- **Responsibilities:** Summarise lane, schedule, equipment, target price and time posted.
- **Data requirements:** `use-load(loadId)`.
- **Interaction model:** Read-only; route to PG-40.
- **Device needs:** All.
- **Accessibility requirements:** Text.
- **Loading states:** Pending.
- **Error states:** Load gone → PG-53.
- **Empty states:** Not applicable.
- **Reuse potential:** SC-40.3.
- **Technical notes:** Shares the load query key.

#### SC-28.2 — Bid comparison
- **Purpose:** Let the shipper compare bids on value and reliability.
- **Responsibilities:** Present each bid's amount, difference from target, expiry, round, carrier scorecard (SH-09) and equipment; let the user sort and compare selected bids.
- **Data requirements:** `use-bids(loadId)`, refetch every 20 seconds.
- **Interaction model:** Sort; select bids to compare; new bids arrive without moving focus.
- **Device needs:** Desktop compare; phone single decision.
- **Accessibility requirements:** New bid arrival announced politely; comparisons available as a table.
- **Loading states:** Pending.
- **Error states:** Retry.
- **Empty states:** No bids → tender progress (SC-28.4).
- **Reuse potential:** SH-05.
- **Technical notes:** Bid amounts are shipper-side prices (BR-05).

#### SC-28.3 — Negotiation
- **Purpose:** Accept, decline or counter a bid (BR-02).
- **Responsibilities:** Offer only the transitions legal for the bid's state and round; capture a counter amount; confirm acceptance.
- **Data requirements:** `use-bid-actions(loadId)`.
- **Interaction model:** IC-28 bid response; acceptance confirmed via IC-12 stating that other bids will close.
- **Device needs:** All.
- **Accessibility requirements:** Whose turn it is stated in text.
- **Loading states:** Pending per action.
- **Error states:** Bid expired or load booked meanwhile → explained.
- **Empty states:** Not applicable.
- **Reuse potential:** SC-40.4.
- **Technical notes:** Idempotent Server Actions.

#### SC-28.4 — Tender progress
- **Purpose:** Report where the preferred waterfall stands.
- **Responsibilities:** Report the current tender holder and remaining window, past responses and when the load reaches the open market.
- **Data requirements:** `use-tenders(loadId)`.
- **Interaction model:** Read-only; skip to the open market (IC-12).
- **Device needs:** All.
- **Accessibility requirements:** Countdown per IC-46.
- **Loading states:** Pending.
- **Error states:** Retry.
- **Empty states:** Open-market only → absent.
- **Reuse potential:** SC-40.4.
- **Technical notes:** Refresh with bids.

### PG-29 — Preferred Carriers

#### SC-29.1 — Preferred roster
- Instance of **SH-05** over preferred carriers with SH-09 scorecard. Overrides: add from carrier search; remove with confirmation; eligibility flag per carrier.

#### SC-29.2 — Lane tender rules
- **Purpose:** Define who gets offered each lane and in which sequence (BR-08).
- **Responsibilities:** Create lane rules; set sequence of carriers and acceptance window; choose fallback to the open market.
- **Data requirements:** `use-tender-rules()`.
- **Interaction model:** IC-40 reorderable sequence (keyboard-operable); IC-01 window minutes.
- **Device needs:** Desktop.
- **Accessibility requirements:** Sequence position announced on move.
- **Loading states:** Pending.
- **Error states:** Duplicate lane rule.
- **Empty states:** No rules → how rules work.
- **Reuse potential:** SC-27.5.
- **Technical notes:** Edit requires `shipper.admin`.

### PG-30 — Invoices

#### SC-30.1 — Payables position
- **Purpose:** Report what the organisation owes.
- **Responsibilities:** Report outstanding, due within 7 days, overdue, disputed totals and credit used against limit.
- **Data requirements:** `use-invoice-summary()`.
- **Interaction model:** Each total filters SC-30.2.
- **Device needs:** Desktop.
- **Accessibility requirements:** Amounts with labels.
- **Loading states:** Pending.
- **Error states:** Retry.
- **Empty states:** Nothing owed.
- **Reuse potential:** SC-38.1.
- **Technical notes:** Server totals only.

#### SC-30.2 — Invoice collection
- Instance of **SH-05** over invoices. Filters: status, due date, issued date, load, carrier. Bulk: pay selected (SC-30.3), download.

#### SC-30.3 — Batch payment
- **Purpose:** Pay several invoices at once.
- **Responsibilities:** Total the selection, choose method, confirm, report per-invoice outcome.
- **Data requirements:** `use-pay-invoices`.
- **Interaction model:** IC-43 payment confirmation stating total, count, method and date.
- **Device needs:** Desktop.
- **Accessibility requirements:** Outcome summary announced.
- **Loading states:** Processing announced.
- **Error states:** Partial failure per invoice.
- **Empty states:** No selection → unavailable with reason.
- **Reuse potential:** SC-31.3.
- **Technical notes:** One idempotency key per batch.

### PG-31 — Invoice Detail and Pay

#### SC-31.1 — Charge verification
- **Purpose:** Let AP check charges against the agreement.
- **Responsibilities:** Break down charges via SH-14 with the agreed rate, approved accessorials and their evidence references, terms and due date.
- **Data requirements:** `use-invoice(invoiceId)`.
- **Interaction model:** Open the evidence for any line.
- **Device needs:** Desktop.
- **Accessibility requirements:** Line items as a table.
- **Loading states:** Pending.
- **Error states:** PG-53 if inaccessible.
- **Empty states:** Not applicable.
- **Reuse potential:** SH-14.
- **Technical notes:** None.

#### SC-31.2 — Invoice evidence
- Instance of **SH-03** scoped to the invoice's load documents (POD, rate agreement, accessorial evidence). Read-only.

#### SC-31.3 — Payment
- **Purpose:** Pay the invoice.
- **Responsibilities:** Choose method, pay full or undisputed amount, confirm, provide remittance.
- **Data requirements:** `use-pay-invoices`, `use-payment-methods`.
- **Interaction model:** IC-43.
- **Device needs:** Desktop and phone.
- **Accessibility requirements:** Amount and method read before confirmation.
- **Loading states:** Processing announced.
- **Error states:** Declined → alternatives; verification needed → PG-49.
- **Empty states:** No method → PG-49.
- **Reuse potential:** SC-30.3.
- **Technical notes:** Processor tokenised flow.

#### SC-31.4 — Dispute initiation
- **Purpose:** Dispute a specific charge (BR-16).
- **Responsibilities:** Select disputed lines, state reason and amount, route to claim creation with the invoice linked.
- **Data requirements:** `use-create-claim`.
- **Interaction model:** Navigate to PG-45 prefilled, or file inline for simple disputes.
- **Device needs:** Desktop.
- **Accessibility requirements:** Selected lines announced.
- **Loading states:** Pending.
- **Error states:** Window closed.
- **Empty states:** Not applicable.
- **Reuse potential:** SC-38.4.
- **Technical notes:** Disputed amount held out of collection.

### PG-32 — Locations

#### SC-32.1 — Facility collection
- Instance of **SH-05** over facilities. Filters: type (pickup, delivery), city.

#### SC-32.2 — Facility editor
- **Purpose:** Create or update a facility.
- **Responsibilities:** Capture name, address with verified geocode, hours, appointment rules, dock instructions, contacts.
- **Data requirements:** `use-facilities` mutations, geocoding.
- **Interaction model:** IC-05 address; pin adjustment on the map with a text coordinate alternative (IC-30); save.
- **Device needs:** Desktop.
- **Accessibility requirements:** Coordinate alternative for pin placement.
- **Loading states:** Geocode pending.
- **Error states:** Unverifiable address → confirm adjusted pin.
- **Empty states:** Not applicable.
- **Reuse potential:** SC-16.4, SC-27.2.
- **Technical notes:** Geocode verified server-side.

---

## 8. Carrier Workspace

### PG-33 — Load Board

#### SC-33.1 — Search criteria
- **Purpose:** Capture what the carrier is looking for.
- **Responsibilities:** Accept origin with radius, destination (city, state or region, or anywhere) with radius, pickup date range, equipment, minimum rate and rate per mile, maximum weight; write all to the URL; apply a saved search.
- **Data requirements:** `use-location-suggestions`, enums, `use-saved-searches`.
- **Interaction model:** IC-05, IC-07, IC-08, IC-18 radius; criteria apply after settling (debounced) or on explicit search on phone.
- **Device needs:** Phone: set criteria quickly with defaults from the carrier's lanes. Desktop: rapid adjustments.
- **Accessibility requirements:** IC-20 filter group; result count announced after change.
- **Loading states:** Not applicable (criteria are local).
- **Error states:** Invalid combinations explained.
- **Empty states:** Defaults applied from carrier lanes.
- **Reuse potential:** SC-36.2 (saved search editing).
- **Technical notes:** Parameters from Phase 3 §10.

#### SC-33.2 — Load results
- Instance of **SH-05** over posted loads. Overrides: carrier pay via SH-14; deadhead computed from the search origin; shipper score (SH-09 summary); instant-book or bid mode; loads booked by others while viewing are marked as gone; refresh every 30 seconds while visible; watch a load (IC-33).

#### SC-33.3 — Results map
- Instance of **SH-02**, collection variant over the result set: origin points and lanes rather than live positions. Shares SC-33.2's query and URL (`view=map`).

#### SC-33.4 — Save search and alert
- **Purpose:** Turn the current search into an alert (XS-09).
- **Responsibilities:** Name the search; choose channel and frequency; confirm.
- **Data requirements:** `use-saved-searches` mutations.
- **Interaction model:** IC-34.
- **Device needs:** All.
- **Accessibility requirements:** Saved state announced.
- **Loading states:** Pending.
- **Error states:** Limit reached → manage in PG-36.
- **Empty states:** Not applicable.
- **Reuse potential:** SC-36.2.
- **Technical notes:** Stores the URL parameter set.

#### SC-33.5 — Booking eligibility
- Instance of **SH-06**. Overrides: states which booking capabilities are blocked (BR-03) while leaving search fully usable.

### PG-34 — Book Load

#### SC-34.1 — Terms review
- **Purpose:** Let the carrier understand exactly what they are committing to.
- **Responsibilities:** Present stops, schedules, requirements, accessorial terms (detention, TONU, layover), carrier pay via SH-14 and cancellation consequences (BR-12).
- **Data requirements:** `use-load(loadId)` carrier-shaped.
- **Interaction model:** Read-only; expand any term's explanation (PP-07).
- **Device needs:** Phone and desktop.
- **Accessibility requirements:** Terms as structured text.
- **Loading states:** Server-rendered.
- **Error states:** Load gone → similar loads.
- **Empty states:** Not applicable.
- **Reuse potential:** SC-40.3.
- **Technical notes:** None.

#### SC-34.2 — Eligibility and availability
- **Purpose:** Confirm the carrier may book this load now.
- **Responsibilities:** Report eligibility checks (authority, insurance minimums, equipment) and availability; block booking with an exact reason when failing.
- **Data requirements:** Server-side check on render and again on booking.
- **Interaction model:** Follow fix routes.
- **Device needs:** All.
- **Accessibility requirements:** Each check result as text.
- **Loading states:** Server-rendered.
- **Error states:** Check service unavailable → booking blocked with retry.
- **Empty states:** Not applicable.
- **Reuse potential:** SH-06.
- **Technical notes:** Server is authoritative.

#### SC-34.3 — Rate confirmation signing
- **Purpose:** Make the booking binding (BR-04).
- **Responsibilities:** Present the rate confirmation document; capture acceptance with IC-26; submit booking; handle the race for the load.
- **Data requirements:** `use-book-load`.
- **Interaction model:** IC-27 book action with IC-12 confirmation; 409 → "load taken".
- **Device needs:** All.
- **Accessibility requirements:** Document readable as text; outcome announced.
- **Loading states:** Booking pending announced.
- **Error states:** Taken; ineligible; signature failure with grace period.
- **Empty states:** Not applicable.
- **Reuse potential:** SC-28.3 acceptance handoff.
- **Technical notes:** `nanoid` idempotency key generated once per attempt.

#### SC-34.4 — Assignment handoff
- **Purpose:** Move straight into dispatch after booking (XF-05).
- **Responsibilities:** Offer assignment now via SH-15 or later with the BR-09 deadline stated.
- **Data requirements:** As SH-15.
- **Interaction model:** Continue or defer.
- **Device needs:** All.
- **Accessibility requirements:** Deadline as text.
- **Loading states:** Per SH-15.
- **Error states:** Per SH-15.
- **Empty states:** Per SH-15.
- **Reuse potential:** SH-15.
- **Technical notes:** None.

### PG-35 — My Loads (carrier)

#### SC-35.1 — Carrier load collection
- Instance of **SH-05** over the carrier's loads. Filters: status, dates, shipper, driver, needs assignment, exceptions only. Overrides: tracking freshness per load.

#### SC-35.2 — Assignment
- Instance of **SH-15**, invoked for a selected load from the collection.

### PG-36 — Saved Loads and Searches

#### SC-36.1 — Watched loads
- Instance of **SH-05** over watched loads. Overrides: current availability per load; unwatch (IC-33).

#### SC-36.2 — Saved searches and alerts
- **Purpose:** Manage saved searches and their alerts.
- **Responsibilities:** Rename, edit criteria (opens PG-33 with parameters), change channel and frequency, pause, delete; report new matches since last viewed.
- **Data requirements:** `use-saved-searches`.
- **Interaction model:** IC-34; delete with IC-12.
- **Device needs:** All.
- **Accessibility requirements:** Alert state announced on change.
- **Loading states:** Pending.
- **Error states:** Per mutation.
- **Empty states:** Nothing saved → how to save.
- **Reuse potential:** SC-33.4.
- **Technical notes:** None.

### PG-37 — Fleet

#### SC-37.1 — Vehicles
- Instance of **SH-05** over trucks and trailers, with create and edit. Overrides: ELD connection state per vehicle (read-only).

#### SC-37.2 — Drivers and invitations
- **Purpose:** Manage drivers and bring new ones in.
- **Responsibilities:** Enumerate drivers with status and current assignment; invite by phone or email (IC-39); resend or revoke invitations; deactivate a driver.
- **Data requirements:** `use-fleet`, `use-invitations`.
- **Interaction model:** IC-39; deactivate with IC-12 (blocked while assigned to an active load).
- **Device needs:** All.
- **Accessibility requirements:** Invitation state as text.
- **Loading states:** Pending.
- **Error states:** Invite failures.
- **Empty states:** No drivers → why they are needed.
- **Reuse potential:** SC-48.3.
- **Technical notes:** Drivers are members with role `carrier.driver`.

### PG-38 — Settlements

#### SC-38.1 — Pay outlook totals
- **Purpose:** Report money owed to the carrier.
- **Responsibilities:** Report pending, scheduled, paid this month, quick-pay-eligible and failed totals.
- **Data requirements:** `use-settlement-summary()`.
- **Interaction model:** Each total filters SC-38.2.
- **Device needs:** All.
- **Accessibility requirements:** Amounts with labels.
- **Loading states:** Pending.
- **Error states:** Retry.
- **Empty states:** Nothing yet.
- **Reuse potential:** SC-19.4.
- **Technical notes:** Amounts for admin only.

#### SC-38.2 — Settlement collection
- Instance of **SH-05** over settlements. Filters: status, expected date, load, shipper. Bulk: download remittances.

#### SC-38.3 — Quick pay
- **Purpose:** Pay the carrier sooner for a stated fee (BR-15).
- **Responsibilities:** State fee, net and arrival time for the selected settlements; confirm; report outcome.
- **Data requirements:** `use-quick-pay`.
- **Interaction model:** IC-43 variant stating fee and net.
- **Device needs:** Phone and desktop.
- **Accessibility requirements:** Fee and net read before confirmation.
- **Loading states:** Processing.
- **Error states:** Payout method unverified → PG-49.
- **Empty states:** Nothing eligible → why.
- **Reuse potential:** SC-30.3 pattern.
- **Technical notes:** Idempotent.

#### SC-38.4 — Deductions and disputes
- **Purpose:** Explain deductions and let the carrier dispute them.
- **Responsibilities:** Break down each settlement via SH-14 with reason for each deduction; route to PG-45 with the settlement linked.
- **Data requirements:** `use-settlement(settlementId)`.
- **Interaction model:** Open breakdown; dispute route.
- **Device needs:** All.
- **Accessibility requirements:** Text.
- **Loading states:** Pending.
- **Error states:** Retry.
- **Empty states:** No deductions.
- **Reuse potential:** SC-31.4.
- **Technical notes:** None.

---

## 9. Driver

### PG-39 — Driver Trip

#### SC-39.1 — Current stop
- **Purpose:** Tell the driver where to go next and what to do there.
- **Responsibilities:** Present the current stop's facility, address, appointment, reference numbers, instructions and contacts; hand off to the device's navigation app.
- **Data requirements:** `use-trip(loadId)` (cached).
- **Interaction model:** Open navigation (IC-31); call facility (tel link).
- **Device needs:** Phone; glanceable.
- **Accessibility requirements:** Address and appointment as text; phone numbers as `tel:` links.
- **Loading states:** Cached immediately.
- **Error states:** Offline → cached.
- **Empty states:** Not applicable.
- **Reuse potential:** SC-40.3 (stop data).
- **Technical notes:** Navigation handoff via platform map URLs.

#### SC-39.2 — Stop event reporting
- **Purpose:** Record arrival, loading or unloading, and departure (XF-06).
- **Responsibilities:** Offer only the next legal event for the current stop (Phase 2 §5); record it with device time and position; allow undo within 5 minutes; record seal and piece count at departure.
- **Data requirements:** `use-stop-events(loadId)` with offline queue.
- **Interaction model:** IC-29 stop event action; each event acknowledged immediately and synced later if offline.
- **Device needs:** Phone; gloves; one action per step.
- **Accessibility requirements:** Event recorded announced; undo available as a named action for its window.
- **Loading states:** Not applicable (optimistic).
- **Error states:** Sync failure retried automatically; conflict with a server-recorded event (geofence) → server wins, driver told.
- **Empty states:** Not applicable.
- **Reuse potential:** Operations record events for drivers in SC-40.2.
- **Technical notes:** Events carry `nanoid` IDs; replay in order.

#### SC-39.3 — POD capture
- **Purpose:** Capture the signed delivery receipt (XF-09).
- **Responsibilities:** Capture one or more pages by camera or file, receiver name, OS&D notes; run quality checks; queue offline; confirm verification outcome.
- **Data requirements:** `use-pod-upload(loadId)`.
- **Interaction model:** IC-25 camera capture; retake per page; submit.
- **Device needs:** Phone camera in poor light.
- **Accessibility requirements:** Each captured page announced; rejection reasons as text.
- **Loading states:** Upload progress per page.
- **Error states:** Blurry → specific reason and retake; offline → queued.
- **Empty states:** Not applicable.
- **Reuse potential:** SH-03 upload behaviour.
- **Technical notes:** Client-side image downscale before upload; checks repeated server-side.

#### SC-39.4 — Issue and delay reporting
- **Purpose:** Let the driver report problems quickly.
- **Responsibilities:** Record delay (reason, new ETA), breakdown, refused freight, lumper paid (with receipt photo), other issues; notify dispatch and operations.
- **Data requirements:** `use-report-issue(loadId)`.
- **Interaction model:** Choose issue type (IC-09), add optional note and photo, send; queued offline.
- **Device needs:** Phone.
- **Accessibility requirements:** Issue types as a labelled group.
- **Loading states:** Optimistic.
- **Error states:** Queued.
- **Empty states:** Not applicable.
- **Reuse potential:** Creates exceptions for SC-50.x.
- **Technical notes:** Accessorial evidence (BR-11).

#### SC-39.5 — Sync state
- Instance of **SC-20.3** scoped to this trip.

#### SC-39.6 — Trip overview
- **Purpose:** Let the driver see the whole trip.
- **Responsibilities:** Enumerate all stops with status and appointments; trip documents the driver may see (rate confirmation excluded).
- **Data requirements:** `use-trip(loadId)`.
- **Interaction model:** Read-only; open a stop's details.
- **Device needs:** Phone.
- **Accessibility requirements:** Stops as an ordered list.
- **Loading states:** Cached.
- **Error states:** Cached.
- **Empty states:** Not applicable.
- **Reuse potential:** SH-01 trip variant.
- **Technical notes:** None.

#### SC-39.7 — Contact dispatch
- **Purpose:** Reach the dispatcher or Haulr operations.
- **Responsibilities:** Offer call and message routes to dispatch and operations; message via SH-04.
- **Data requirements:** Contacts from `use-trip`.
- **Interaction model:** `tel:` link or conversation.
- **Device needs:** Phone.
- **Accessibility requirements:** Named links.
- **Loading states:** Cached.
- **Error states:** Offline → call route remains.
- **Empty states:** Not applicable.
- **Reuse potential:** SH-04.
- **Technical notes:** None.

---

## 10. Shared Records and Utilities

### PG-40 — Load Details

#### SC-40.1 — Load identity and state
- **Purpose:** Establish which load this is and where it is in its life.
- **Responsibilities:** Present reference numbers, status label, lane summary, parties (as permitted) and whose action is awaited.
- **Data requirements:** `use-load(loadId)` role-shaped.
- **Interaction model:** Copy reference (IC-44 copy behaviour).
- **Device needs:** All.
- **Accessibility requirements:** Status as text, not colour alone.
- **Loading states:** Server-rendered.
- **Error states:** PG-53 if inaccessible.
- **Empty states:** Not applicable.
- **Reuse potential:** SC-28.1.
- **Technical notes:** Status labels from constants.

#### SC-40.2 — Next actions
- **Purpose:** Offer exactly the actions this role may take in this state.
- **Responsibilities:** Derive legal actions from (role, state) via the single mapping function; perform them with confirmation where irreversible; record operations actions on behalf of parties.
- **Data requirements:** `use-load-actions(loadId)`; mapping in `lib/loads/transitions.ts`.
- **Interaction model:** IC-11 actions; IC-12 for cancel and other irreversible actions; state conflicts (409) → refresh and explain.
- **Device needs:** All.
- **Accessibility requirements:** Each action named by its effect; disabled actions state why.
- **Loading states:** Per action.
- **Error states:** Illegal transition → new state explained.
- **Empty states:** No actions available → state who acts next.
- **Reuse potential:** PG-26, PG-35 row actions.
- **Technical notes:** Mapping unit-tested against Phase 2 §5 table.

#### SC-40.3 — Lane, stops and schedule
- **Purpose:** State where and when the load moves.
- **Responsibilities:** Present each stop with facility, appointment window, time zone, references, instructions; actual arrival and departure once recorded.
- **Data requirements:** `use-load(loadId)`.
- **Interaction model:** Read-only; shippers can edit instructions before dispatch (IC-01).
- **Device needs:** All.
- **Accessibility requirements:** Stops as an ordered list.
- **Loading states:** Server-rendered.
- **Error states:** Not applicable.
- **Empty states:** Not applicable.
- **Reuse potential:** SC-34.1, SC-39.6.
- **Technical notes:** Times in facility zone.

#### SC-40.4 — Coverage state
- **Purpose:** Report how the load is being covered (posted, tendered, bids).
- **Responsibilities:** Report tender progress (SC-28.4 behaviour) and bid summary; route shippers to PG-28 and carriers to bid (IC-28) or book (PG-34).
- **Data requirements:** `use-tenders`, `use-bids`.
- **Interaction model:** Per role.
- **Device needs:** All.
- **Accessibility requirements:** Whose turn stated.
- **Loading states:** Pending.
- **Error states:** Retry.
- **Empty states:** Absent after booking.
- **Reuse potential:** SC-28.2, SC-28.4.
- **Technical notes:** Present only while `Posted`.

#### SC-40.5 — Assignment
- Instance of **SH-15**. Carrier roles and operations only; shippers receive the assigned driver's first name and truck number after dispatch.

#### SC-40.6 — Tracking
- Instance of **SH-02** for this load.

#### SC-40.7 — Timeline
- Instance of **SH-01** for this load.

#### SC-40.8 — Money
- Instance of **SH-14** role-shaped: shipper price for shipper roles, carrier pay for carrier roles, both for internal roles (BR-05).

#### SC-40.9 — Accessorials
- **Purpose:** Manage extra charges with evidence (BR-11).
- **Responsibilities:** Report accruing and requested accessorials with evidence; carriers request; shippers approve or dispute above threshold; operations adjudicates.
- **Data requirements:** `use-accessorials(loadId)`.
- **Interaction model:** Request (IC-01 amount, IC-24 evidence), approve or dispute (IC-12).
- **Device needs:** Phone approval from notification; desktop review.
- **Accessibility requirements:** Timer-based accruals expressed as text durations.
- **Loading states:** Pending.
- **Error states:** Per action.
- **Empty states:** None → absent unless accruing.
- **Reuse potential:** SC-31.1.
- **Technical notes:** Detention accrual computed server-side.

#### SC-40.10 — Documents
- Instance of **SH-03** scoped to the load.

#### SC-40.11 — Conversation
- Instance of **SH-04** for the load's thread.

#### SC-40.12 — Exceptions
- **Purpose:** Inform parties of open exceptions on this load and their handling.
- **Responsibilities:** Report open and resolved exceptions with owner and what happens next; operations can claim from here.
- **Data requirements:** `use-exceptions({ loadId })`.
- **Interaction model:** Read for parties; claim for operations (IC-47).
- **Device needs:** All.
- **Accessibility requirements:** Severity as text.
- **Loading states:** Pending.
- **Error states:** Retry.
- **Empty states:** None → absent.
- **Reuse potential:** SC-50.2.
- **Technical notes:** None.

#### SC-40.13 — Claims
- **Purpose:** Connect the load to its claims.
- **Responsibilities:** Report claims on the load; route to PG-45; start a new claim within the window.
- **Data requirements:** `use-claims({ loadId })`.
- **Interaction model:** Navigate.
- **Device needs:** All.
- **Accessibility requirements:** Text.
- **Loading states:** Pending.
- **Error states:** Retry.
- **Empty states:** None → file-a-claim route after delivery only.
- **Reuse potential:** SH-05.
- **Technical notes:** None.

#### SC-40.14 — Rating
- Instance of **SH-10**, present after delivery within the rating window.

#### SC-40.15 — Tracking link sharing
- **Purpose:** Share public tracking with an outside party (XF-07).
- **Responsibilities:** Generate, copy, send by email or SMS, and revoke a tracking link; state its expiry (BR-21).
- **Data requirements:** `use-tracking-links(loadId)`.
- **Interaction model:** IC-44.
- **Device needs:** Phone: share through the device share sheet. Desktop: copy.
- **Accessibility requirements:** Copy success announced.
- **Loading states:** Pending.
- **Error states:** Generation failed → retry.
- **Empty states:** Not applicable.
- **Reuse potential:** SC-26.3.
- **Technical notes:** Web Share API where available.

### PG-41 — Messages

#### SC-41.1 — Thread collection
- Instance of **SH-05** over the user's threads. Filters: unread, load, ticket. Overrides: unread counts; selection sets `?thread=`.

#### SC-41.2 — Selected conversation
- Instance of **SH-04** for the selected thread.

### PG-42 — Notifications

#### SC-42.1 — Notification feed
- Instance of **SH-05** over notifications. Filters: unread, event type. Overrides: each notification routes to its subject and is marked read on open.

#### SC-42.2 — Read management
- **Purpose:** Let the user clear notifications in bulk.
- **Responsibilities:** Mark all read, mark selected read; route to preferences (PG-47).
- **Data requirements:** `use-notifications` mutations.
- **Interaction model:** Bulk action with count stated.
- **Device needs:** All.
- **Accessibility requirements:** Result announced.
- **Loading states:** Pending.
- **Error states:** Retry.
- **Empty states:** Nothing unread → unavailable with reason.
- **Reuse potential:** None.
- **Technical notes:** Invalidates the unread-count key.

### PG-43 — Documents

#### SC-43.1 — Document collection
- Instance of **SH-05** combined with **SH-03** over the organisation's documents. Filters: type, load, date, party.

#### SC-43.2 — Company compliance documents
- **Purpose:** Keep company documents current (insurance, W-9, agreements).
- **Responsibilities:** Report each required company document with status and expiry; replace with a new version; remind before expiry (XS-12).
- **Data requirements:** `use-documents({ scope: 'organisation' })`.
- **Interaction model:** SH-03 upload behaviour.
- **Device needs:** All.
- **Accessibility requirements:** Expiry as text date and days remaining.
- **Loading states:** Pending.
- **Error states:** Upload rejected with reason.
- **Empty states:** Required documents outstanding.
- **Reuse potential:** SC-17.4.
- **Technical notes:** Carrier replacements trigger compliance re-check.

### PG-44 — Claims

#### SC-44.1 — Claim collection
- Instance of **SH-05** over claims. Filters: status, type, whose turn, load.

#### SC-44.2 — Awaiting my response
- Instance of **SH-07** filtered to claims where it is the user's turn, with deadlines.

### PG-45 — Claim Detail

#### SC-45.1 — Claim filing
- **Purpose:** File a complete claim once.
- **Responsibilities:** Capture type (overage, shortage, damage, billing), load, amount, description; enforce the filing window (BR-17); state required evidence per type.
- **Data requirements:** `use-create-claim`; draft via SH-13 persistence.
- **Interaction model:** Single-page entry with IC-02 validation; submit via IC-11.
- **Device needs:** Desktop mostly; phone for photos.
- **Accessibility requirements:** Required evidence stated before submission.
- **Loading states:** Submission pending.
- **Error states:** Window closed; missing evidence.
- **Empty states:** Not applicable.
- **Reuse potential:** SC-31.4.
- **Technical notes:** `?load=` prefill.

#### SC-45.2 — Claim evidence
- Instance of **SH-03** scoped to the claim.

#### SC-45.3 — Response exchange
- **Purpose:** Let parties respond to each other and to finance.
- **Responsibilities:** Record responses with evidence; state whose turn and deadline.
- **Data requirements:** `use-claim(claimId)`.
- **Interaction model:** Respond with note and documents.
- **Device needs:** All.
- **Accessibility requirements:** Turn and deadline as text.
- **Loading states:** Pending.
- **Error states:** Retry.
- **Empty states:** No responses yet.
- **Reuse potential:** SH-04 behaviour.
- **Technical notes:** Distinct from free messaging; responses are formal records.

#### SC-45.4 — Resolution
- **Purpose:** Conclude the claim.
- **Responsibilities:** Present the proposed resolution; accept or contest; finance records the decision and money adjustment.
- **Data requirements:** `use-claim-actions`.
- **Interaction model:** IC-12 confirmation stating money effect.
- **Device needs:** All.
- **Accessibility requirements:** Money effect as text.
- **Loading states:** Pending.
- **Error states:** Per action.
- **Empty states:** No proposal yet.
- **Reuse potential:** None.
- **Technical notes:** Adjusts invoice or settlement server-side.

### PG-46 — Profile

#### SC-46.1 — Personal details
- **Purpose:** Keep the user's personal details correct.
- **Responsibilities:** Edit name, phone, avatar; present role and organisation read-only.
- **Data requirements:** `use-profile` (backend `GET /users/me`).
- **Interaction model:** IC-01; IC-24 avatar; save.
- **Device needs:** All.
- **Accessibility requirements:** IC-02.
- **Loading states:** Pending.
- **Error states:** Validation.
- **Empty states:** Not applicable.
- **Reuse potential:** None.
- **Technical notes:** Avatar via Next.js Image.

#### SC-46.2 — Email change
- **Purpose:** Change email with verification.
- **Responsibilities:** Accept a new email; require re-authentication; send verification; keep the old email until verified.
- **Data requirements:** `use-change-email`.
- **Interaction model:** IC-13 re-authentication then IC-01.
- **Device needs:** All.
- **Accessibility requirements:** Pending verification state as text.
- **Loading states:** Pending.
- **Error states:** Email in use.
- **Empty states:** Not applicable.
- **Reuse potential:** SC-14.1.
- **Technical notes:** Security notification to the old email.

### PG-47 — Settings

#### SC-47.1 — Password and MFA
- **Purpose:** Secure the account.
- **Responsibilities:** Change password; enrol, regenerate backup codes for, or remove MFA (removal blocked for roles that require it).
- **Data requirements:** `use-change-password`, `use-mfa`.
- **Interaction model:** IC-13 re-authentication; IC-03; IC-04.
- **Device needs:** All.
- **Accessibility requirements:** Setup secret available as text as well as a scannable code.
- **Loading states:** Pending.
- **Error states:** Wrong current password; invalid code.
- **Empty states:** Not applicable.
- **Reuse potential:** SC-13.1.
- **Technical notes:** None.

#### SC-47.2 — Sessions
- **Purpose:** Let the user control where they are signed in.
- **Responsibilities:** Enumerate active sessions (device, location, last active); revoke one or all others.
- **Data requirements:** `use-sessions`.
- **Interaction model:** Revoke with IC-12.
- **Device needs:** All.
- **Accessibility requirements:** Current session identified in text.
- **Loading states:** Pending.
- **Error states:** Retry.
- **Empty states:** Only this session.
- **Reuse potential:** None.
- **Technical notes:** None.

#### SC-47.3 — Notification preferences
- **Purpose:** Control what the user is told and how (XS-03).
- **Responsibilities:** Set channels per event type; quiet hours; state which events cannot be disabled.
- **Data requirements:** `use-notification-preferences`.
- **Interaction model:** IC-36 toggles grouped by event category; saves per change.
- **Device needs:** All.
- **Accessibility requirements:** Each toggle labelled with event and channel.
- **Loading states:** Pending.
- **Error states:** Per change with revert.
- **Empty states:** Not applicable.
- **Reuse potential:** None.
- **Technical notes:** Event catalogue from enums.

### PG-48 — Organization and Team

#### SC-48.1 — Organisation details
- **Purpose:** Keep organisation details correct.
- **Responsibilities:** Edit legal name, address, contacts; present identifiers read-only (tax ID, USDOT/MC).
- **Data requirements:** `use-organization`.
- **Interaction model:** IC-01; save.
- **Device needs:** Desktop mostly.
- **Accessibility requirements:** IC-02.
- **Loading states:** Pending.
- **Error states:** Validation.
- **Empty states:** Not applicable.
- **Reuse potential:** SC-16.2, SC-17.3.
- **Technical notes:** Changes to carrier identity trigger re-vetting.

#### SC-48.2 — Members and roles
- Instance of **SH-05** over members. Overrides: change role (IC-07 with IC-12 for privilege reduction), remove (IC-12; last admin blocked).

#### SC-48.3 — Invitations
- **Purpose:** Manage pending invitations.
- **Responsibilities:** Invite (IC-39), resend, revoke; state expiry.
- **Data requirements:** `use-invitations`.
- **Interaction model:** IC-39; revoke via IC-12.
- **Device needs:** All.
- **Accessibility requirements:** Expiry as text.
- **Loading states:** Pending.
- **Error states:** Per invite.
- **Empty states:** None pending.
- **Reuse potential:** SC-16.4, SC-37.2.
- **Technical notes:** None.

### PG-49 — Payment and Payout Methods

#### SC-49.1 — Method collection
- Instance of **SH-05** over methods. Overrides: set default; remove (IC-12; blocked for the only verified method while money is scheduled).

#### SC-49.2 — Method entry and verification
- **Purpose:** Add and verify a method securely (XS-08).
- **Responsibilities:** Host the processor's tokenised entry; run instant verification or micro-deposit flow; resume pending verification.
- **Data requirements:** `use-payment-methods`.
- **Interaction model:** IC-42; IC-13 re-authentication before changes.
- **Device needs:** Desktop mostly.
- **Accessibility requirements:** Processor entry must meet WCAG 2.2 AA (vendor requirement in Phase 7 §15).
- **Loading states:** Processor entry loading announced.
- **Error states:** Verification failed.
- **Empty states:** Not applicable.
- **Reuse potential:** SC-16.3, SC-17.5.
- **Technical notes:** No raw account data in Haulr code.

#### SC-49.3 — Terms and credit
- **Purpose:** Tell shippers their payment terms and credit position.
- **Responsibilities:** Present terms, credit limit, credit used; request a limit increase.
- **Data requirements:** `use-credit()`.
- **Interaction model:** Request increase (IC-11).
- **Device needs:** Desktop.
- **Accessibility requirements:** Amounts as text.
- **Loading states:** Pending.
- **Error states:** Retry.
- **Empty states:** Prepay organisations → how to apply for terms.
- **Reuse potential:** SC-30.1.
- **Technical notes:** Shipper roles only.

---

## 11. Internal Tools

### PG-50 — Exception Queue

#### SC-50.1 — Exception queue
- Instance of **SH-07** and **SH-05** over exceptions. Filters: type, severity, owner, age. Overrides: claim next (IC-47); refresh every 15 seconds; selection in `?exception=`.

#### SC-50.2 — Exception context
- **Purpose:** Give the agent everything needed to decide.
- **Responsibilities:** Present the rule that fired, evidence, load summary, tracking (SH-02), timeline (SH-01), parties and contacts, prior actions.
- **Data requirements:** `use-exception(exceptionId)`.
- **Interaction model:** Read; navigate to the load.
- **Device needs:** Desktop.
- **Accessibility requirements:** Evidence as text.
- **Loading states:** Pending.
- **Error states:** Retry.
- **Empty states:** No selection.
- **Reuse potential:** SC-40.12.
- **Technical notes:** Prefetch next exception.

#### SC-50.3 — Resolution actions
- **Purpose:** Act on the exception.
- **Responsibilities:** Offer actions by exception type (contact party, re-tender, reassign, approve accessorial, cancel with TONU decision, put on hold); resolve with a reason code.
- **Data requirements:** `use-exception-actions`.
- **Interaction model:** IC-12 for irreversible actions; reason codes via IC-07.
- **Device needs:** Desktop; keyboard shortcuts (IC-49).
- **Accessibility requirements:** Shortcuts are discoverable; single-character shortcuts can be turned off or remapped, or work only while focus is within the queue (WCAG 2.1.4).
- **Loading states:** Per action.
- **Error states:** Action failed → exception stays claimed.
- **Empty states:** Not applicable.
- **Reuse potential:** SC-40.2.
- **Technical notes:** Actions recorded in audit.

#### SC-50.4 — Ownership and handoff
- **Purpose:** Prevent collisions and allow handoff.
- **Responsibilities:** State owner; claim, release, hand off to a named agent with a note.
- **Data requirements:** `use-exception-actions`.
- **Interaction model:** IC-47.
- **Device needs:** Desktop.
- **Accessibility requirements:** Ownership changes announced.
- **Loading states:** Pending.
- **Error states:** Claimed by another → owner named.
- **Empty states:** Not applicable.
- **Reuse potential:** SC-24.2 handoff.
- **Technical notes:** Optimistic lock with version.

### PG-51 — Carrier Vetting Review

#### SC-51.1 — Authority and safety
- **Purpose:** Evidence of legal authority and safety record.
- **Responsibilities:** Present registry record, authority history, safety rating, inspection and out-of-service data, match against submitted details.
- **Data requirements:** `use-carrier-vetting(carrierId)`.
- **Interaction model:** Read; refresh from source.
- **Device needs:** Desktop.
- **Accessibility requirements:** Mismatches stated in text.
- **Loading states:** Pending.
- **Error states:** Source down → last fetch time.
- **Empty states:** Not applicable.
- **Reuse potential:** SC-03.1.
- **Technical notes:** None.

#### SC-51.2 — Insurance and documents
- Instance of **SH-03** scoped to the carrier's compliance documents, plus insurance verification results.

#### SC-51.3 — Identity and fraud signals
- **Purpose:** Detect impersonation and fraud.
- **Responsibilities:** Report identity checks, contact verification, device and network signals, duplicate-account matches with explanations.
- **Data requirements:** `use-carrier-vetting(carrierId)`.
- **Interaction model:** Read; mark a signal as reviewed.
- **Device needs:** Desktop.
- **Accessibility requirements:** Signal severity as text.
- **Loading states:** Pending.
- **Error states:** Retry.
- **Empty states:** No signals.
- **Reuse potential:** None.
- **Technical notes:** Signals computed by the backend.

#### SC-51.4 — Decision
- **Purpose:** Approve, request information, reject or suspend.
- **Responsibilities:** Capture decision, reason code and note; state consequences for booked loads (BR-18).
- **Data requirements:** `use-vetting-decision`.
- **Interaction model:** IC-12 with reason; IC-13 not required.
- **Device needs:** Desktop.
- **Accessibility requirements:** Consequences as text.
- **Loading states:** Pending.
- **Error states:** Conflict with another reviewer.
- **Empty states:** Not applicable.
- **Reuse potential:** None.
- **Technical notes:** Audited.

#### SC-51.5 — Decision history
- Instance of **SH-11** scoped to the carrier.

### PG-52 — Accounts

#### SC-52.1 — Account search
- Instance of **SH-05** over organisations and users. Filters: type, status, role.

#### SC-52.2 — Access changes
- **Purpose:** Change an account's access safely.
- **Responsibilities:** Suspend or reactivate organisations and users, change roles, reset MFA; preview impact on active loads; require reason.
- **Data requirements:** `use-accounts` mutations.
- **Interaction model:** IC-12 with reason; IC-13 re-authentication.
- **Device needs:** Desktop.
- **Accessibility requirements:** Impact as text.
- **Loading states:** Pending.
- **Error states:** Conflict explained.
- **Empty states:** Not applicable.
- **Reuse potential:** SC-48.2.
- **Technical notes:** Backend `users` module extended.

#### SC-52.3 — Account audit
- Instance of **SH-11** scoped to the selected account.

---

## 12. System Pages

### PG-53 — Not Found

#### SC-53.1 — Recovery routes
- **Purpose:** Get the user somewhere useful.
- **Responsibilities:** State that the page was not found without revealing whether a record exists; route to the role root or home; offer quick find (signed in) or help search (signed out).
- **Data requirements:** Session presence.
- **Interaction model:** Navigation; IC-19 search.
- **Device needs:** All.
- **Accessibility requirements:** Heading states the problem.
- **Loading states:** Not applicable.
- **Error states:** Not applicable.
- **Empty states:** Not applicable.
- **Reuse potential:** Per-group `not-found.tsx`.
- **Technical notes:** HTTP 404.

### PG-54 — Server Error

#### SC-54.1 — Retry and report
- **Purpose:** Recover from a failure.
- **Responsibilities:** State that something went wrong; retry via `reset()`; route to PG-08 with the error digest.
- **Data requirements:** Error digest.
- **Interaction model:** Retry; report.
- **Device needs:** All.
- **Accessibility requirements:** Focus moves to the heading.
- **Loading states:** Retry pending.
- **Error states:** Retry fails → report route.
- **Empty states:** Not applicable.
- **Reuse potential:** Every segment `error.tsx`.
- **Technical notes:** No stack traces; no console logging in components.

### PG-55 — Access Denied

#### SC-55.1 — Access explanation
- **Purpose:** Explain why the route is unavailable.
- **Responsibilities:** State that the user's role does not include this area; name organisation admins who can change access; route to role root.
- **Data requirements:** Role, admins.
- **Interaction model:** Navigation.
- **Device needs:** All.
- **Accessibility requirements:** Heading states the problem.
- **Loading states:** Not applicable.
- **Error states:** Not applicable.
- **Empty states:** Not applicable.
- **Reuse potential:** None.
- **Technical notes:** HTTP 403.

---

## 13. Section Inventory

| Page | Sections | Count |
| --- | --- | --- |
| Shared | SH-01 … SH-15 | 15 |
| PG-01 | SC-01.1 … SC-01.4 | 4 |
| PG-02 | SC-02.1 … SC-02.3 | 3 |
| PG-03 | SC-03.1 … SC-03.3 | 3 |
| PG-04 | SC-04.1, SC-04.2 | 2 |
| PG-05 | SC-05.1 … SC-05.4 | 4 |
| PG-06 | SC-06.1 … SC-06.3 | 3 |
| PG-07 | SC-07.1 … SC-07.3 | 3 |
| PG-08 | SC-08.1, SC-08.2 | 2 |
| PG-09 | SC-09.1 | 1 |
| PG-10 | SC-10.1, SC-10.2 | 2 |
| PG-11 | SC-11.1, SC-11.2 | 2 |
| PG-12 | SC-12.1 | 1 |
| PG-13 | SC-13.1 | 1 |
| PG-14 | SC-14.1, SC-14.2 | 2 |
| PG-15 | SC-15.1, SC-15.2 | 2 |
| PG-16 | SC-16.1 … SC-16.4 | 4 |
| PG-17 | SC-17.1 … SC-17.6 | 6 |
| PG-18 | SC-18.1 … SC-18.5 | 5 |
| PG-19 | SC-19.1 … SC-19.5 | 5 |
| PG-20 | SC-20.1 … SC-20.3 | 3 |
| PG-21 | SC-21.1 … SC-21.4 | 4 |
| PG-22 | SC-22.1 … SC-22.3 | 3 |
| PG-23 | SC-23.1 … SC-23.5 | 5 |
| PG-24 | SC-24.1 … SC-24.3 | 3 |
| PG-25 | SC-25.1 … SC-25.3 | 3 |
| PG-26 | SC-26.1 … SC-26.3 | 3 |
| PG-27 | SC-27.1 … SC-27.6 | 6 |
| PG-28 | SC-28.1 … SC-28.4 | 4 |
| PG-29 | SC-29.1, SC-29.2 | 2 |
| PG-30 | SC-30.1 … SC-30.3 | 3 |
| PG-31 | SC-31.1 … SC-31.4 | 4 |
| PG-32 | SC-32.1, SC-32.2 | 2 |
| PG-33 | SC-33.1 … SC-33.5 | 5 |
| PG-34 | SC-34.1 … SC-34.4 | 4 |
| PG-35 | SC-35.1, SC-35.2 | 2 |
| PG-36 | SC-36.1, SC-36.2 | 2 |
| PG-37 | SC-37.1, SC-37.2 | 2 |
| PG-38 | SC-38.1 … SC-38.4 | 4 |
| PG-39 | SC-39.1 … SC-39.7 | 7 |
| PG-40 | SC-40.1 … SC-40.15 | 15 |
| PG-41 | SC-41.1, SC-41.2 | 2 |
| PG-42 | SC-42.1, SC-42.2 | 2 |
| PG-43 | SC-43.1, SC-43.2 | 2 |
| PG-44 | SC-44.1, SC-44.2 | 2 |
| PG-45 | SC-45.1 … SC-45.4 | 4 |
| PG-46 | SC-46.1, SC-46.2 | 2 |
| PG-47 | SC-47.1 … SC-47.3 | 3 |
| PG-48 | SC-48.1 … SC-48.3 | 3 |
| PG-49 | SC-49.1 … SC-49.3 | 3 |
| PG-50 | SC-50.1 … SC-50.4 | 4 |
| PG-51 | SC-51.1 … SC-51.5 | 5 |
| PG-52 | SC-52.1 … SC-52.3 | 3 |
| PG-53 | SC-53.1 | 1 |
| PG-54 | SC-54.1 | 1 |
| PG-55 | SC-55.1 | 1 |
| **Total** | **15 shared + 179 page sections** | **194** |

---

Previous: [Phase 4 — Page Blueprints](./phase-4-page-blueprints.md) · Next: [Phase 6 — Interaction Contracts](./phase-6-interaction-contracts.md)
