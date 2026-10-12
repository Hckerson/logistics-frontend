# Phase 5 — Section Blueprints

`Haulr Design OS` · `Version 1.3.6` · `2026-10-12` · Previous: [Phase 4 — Page Blueprints](./phase-4-page-blueprints.md) · Next: [Phase 6 — Interaction Contracts](./phase-6-interaction-contracts.md)

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
    - [Enterprise Pages](#12a-enterprise-pages)
13. [Section Inventory](#13-section-inventory)

---

## 1. Section Rules

- **One job per section.** A section that would need two unrelated purposes is two sections.
- **Independent failure.** Each section that fetches data owns its loading and error boundary (SSB-1, SSB-3 in [Phase 4 §2](./phase-4-page-blueprints.md#2-shared-state-behaviour)), so one failure never takes down the page.
- **Instances inherit.** A page section marked "Instance of SH-nn" (or of another page section, SC-nn.n) inherits every field of that section. It lists only its scope and overrides.
- **Role shaping happens on the server.** A section never decides what a role may see. It renders what the role-shaped response contains (BR-05, Phase 3 §5.2).
- **Every field is mandatory.** Where a field does not apply, it says "Not applicable" and why.

---

## 2. Shared Sections

### SH-01 — Load timeline

- **Purpose:** Tell the story of a load's lifecycle as an immutable, ordered record of events, so every party can see what happened, when, by whom and on what evidence (PP-03, PP-09).
- **Responsibilities:** Present every recorded state transition (BR-01), tender step (BR-08), bid event (BR-02), amendment event (BR-25), stop event, exception and document event, with actor role, time (facility-local with zone abbreviation, plus relative) and source (driver, geofence, ELD, operations, system, API or EDI principal); attribute view-as actions to both the agent and the member (BR-27); never include an event or value the viewer's role cannot read (BR-05, Phase 3 §5.2).
- **Data requirements:** `use-load-timeline(loadId, { category, cursor })` → timeline events (contract type `LoadTimelineEventDto[]`) with a next cursor; cursor pagination for long histories, ordered newest to oldest, page size 50 (maximum 200); event category vocabulary from `lib/enums/`; stop time zones from the parent `use-load(loadId)` record. Responses are role-shaped by the server; the client never filters out forbidden fields.
- **Interaction model:** Read-only; the user can narrow by event category (IC-20) and expand an event for its evidence (IC-32: location, document link opening IC-58). Older pages load on request (IC-21). New events arrive with the load's refresh cycle, are merged by event ID and never move the user's focus or collapse an expanded event.
- **Device needs:** DV-PHONE: skim the latest events and open the evidence of one. DV-DESK: audit the full history with category narrowing and keyboard-only operation. DV-CAB: need not audit history; the trip-scoped variant (PG-39) carries only the driver's own stop events. DV-WALL: not a supported context. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** A labelled region ("Load timeline") containing an ordered list; each event exposes its name, actor role, source and absolute time as text, with relative time supplementary; new events are announced politely through IC-14 as one batched message per refresh ("2 new events") and only when the user has not moved into older history; category filters are a labelled group (IC-20); expanding leaves focus on the element that expanded the event (IC-32); state names use IC-59 text, never a visual-only cue (G-3; WCAG 1.3.1, 4.1.3).
- **Loading states:** LS-1 for the initial page inside its own boundary; the rest of the host page stays usable. LS-2 on the load's refresh cycle (`TRACKING_REFRESH_MS`, 60 s, Phase 7 §13): known events stay and nothing is announced unless new events arrive. LS-5 while an older page is requested (IC-21), the request control busy. LS-3 after 5 s states "Still loading the timeline. You can keep working."
- **Error states:** E-SERVER, E-TIMEOUT, E-UNAVAILABLE → "Couldn't load the timeline" with retry (IC-60); the rest of the page is unaffected; on a failed refresh the loaded events stay with their age (SSB-2). E-CONTRACT → treated as E-SERVER, never partially rendered, correlation ID given as the support reference. E-OFFLINE → cached events stay with "Saved <age> ago" (SSB-4). E-NOT-FOUND (access lost mid-session) → "This load is no longer available" and the host page applies PG-53.
- **Empty states:** EM-4 for `Draft` and `PendingApproval` loads: "Events will be recorded once the load is posted." EM-2 when a category filter excludes every event: the active category count and a way to clear it.
- **Reuse potential:** PG-40, PG-02 (public-scoped variant), PG-50, PG-39 (trip-scoped variant); implemented once and reused by reference (location per Phase 7 §12).
- **Technical notes:** Events are immutable; key by event ID; query key `timelineKeys.list(loadId, category)`, stale time 60 s, invalidated by every successful `useLoadActions` mutation on the same load; times rendered with `lib/utils/date-formatter.ts` in the stop's time zone. Read-only: no audit event. Analytics `load.timeline.filtered` and `load.timeline_event.expanded` carry the load ID and category enum only (NFR-PRIV-3). Event locations finer than city are Restricted (NFR-PRIV-1) and returned only to roles that may view live location (Phase 3 §5.1); history retention follows BR-20.

### SH-02 — Live position and ETA

- **Purpose:** Answer "where is it and when will it arrive" with honesty about freshness (PP-03).
- **Responsibilities:** Convey current or last known position, its source (ELD, driver device, check call) and age, the ETA for the next stop against its appointment window, on-time risk and a text equivalent of progress (city, miles remaining); label any position older than 60 minutes as stale and state when a tracking exception has been raised at 90 minutes (BR-10, Phase 4 §2.6).
- **Data requirements:** `use-load-positions(loadId)` → latest position, recent track (last 24 h downsampled), ETA with confidence and next-stop appointment window; refresh interval from constants (`TRACKING_REFRESH_MS`, 60 s); stale threshold `TRACKING_STALE_MINUTES` (BR-10). Location is collected only while the load is active and assigned (Phase 1 §12); the server returns nothing before pickup.
- **Interaction model:** The user can switch between the map view (IC-30) and the text equivalent, recentre on the vehicle, and request a check call (carrier and operations roles, IC-10). Updates arrive without disturbing the user's current focus, zoom or chosen view. The chosen view persists for the session only.
- **Device needs:** DV-PHONE: status, ETA and freshness at a glance through the text equivalent, without loading the map. DV-DESK: map context and 24 h track history. DV-WALL: left open all shift on PG-26 and PG-50; refreshes unattended and states its age at a distance in text. DV-CAB: not used here (drivers see their own trip in PG-39). DV-AT: full parity with DV-DESK through the text equivalent.
- **Accessibility requirements:** The map is supplementary; the text equivalent carries all information (PP-08) and is complete while the map is still loading. ETA changes and a switch to stale are announced politely through IC-14, at most once per refresh; the age is text ("Updated 12 min ago"), never a visual-only cue (G-3); the map follows IC-30 keyboard operation; the check-call request follows IC-10 and announces its outcome.
- **Loading states:** LS-1 streams the text equivalent without waiting for the map library, which loads separately (`next/dynamic`, Phase 7 §17). LS-2 every 60 s: last known values stay available during refresh (SSB-2) and only the age changes; polling pauses while the tab is hidden. LS-5 while a check call is being requested. LS-3 after 5 s keeps the last known values usable.
- **Error states:** E-UNAVAILABLE or E-SERVER on the location feed → last known position with age, "Live updates paused" and retry (IC-60); automatic read retries per Phase 4 §2.2. Map library or tile failure (E-UNAVAILABLE for maps, NFR-AV-4) → text equivalent only, stated once. E-OFFLINE → last cached values with age. E-CONFLICT on a check-call request → a request is already open; state who requested it and when. E-RATE-LIMIT on check calls → state when another request is allowed. E-CONTRACT → as E-SERVER with correlation ID.
- **Empty states:** EM-4 before pickup: "Tracking starts at pickup" with the pickup appointment window in facility-local time. EM-4 after delivery: final position replaced by the delivery time; no live tracking is expected.
- **Reuse potential:** PG-40, PG-02, PG-26 (collection map), PG-35, PG-50; implemented once and reused by reference (location per Phase 7 §12).
- **Technical notes:** Polling via TanStack Query `refetchInterval` with `refetchIntervalInBackground: false`; query key `positionKeys.latest(loadId)`; subscriptions only for loads in view (Phase 7 §18); stale threshold from BR-10 in constants; map base layer (MapLibre with Protomaps tiles; Phase 7 §15). Precise positions are Restricted (NFR-PRIV-1) and never leave the client in analytics; `tracking.position.viewed` and `tracking.check_call.requested` carry the load ID and source enum only. A check call emits the audit event `load.check_call_requested`. Position-to-visible latency target ≤ 90 s (NFR-PERF-5).

### SH-03 — Document set

- **Purpose:** Hold every document for a scope (a load, a claim, an organisation) and let permitted users add to it.
- **Responsibilities:** Enumerate documents with type, version, uploader role, time and verification state; preview; download; upload new documents or new versions where the role permits; flag expiring company documents with their expiry date; state which documents are expected for the scope and which are outstanding (for example POD after delivery, BR-13).
- **Data requirements:** `use-documents({ scope, scopeId, docType, cursor })`; upload through `use-document-upload({ scope, scopeId })`; downloads through short-lived signed URLs (≤ 5 min, SEC-7); document type vocabulary from `lib/enums/document-type.ts`; upload limits (`UPLOAD_MAX_BYTES`, `UPLOAD_ALLOWED_TYPES`) from constants.
- **Interaction model:** The user filters by document type (IC-20, `docType`), previews a document (IC-58), downloads it, or uploads by picking a file or using the camera (IC-24, IC-25). Type and byte limits are checked on selection, before any request; uploads show progress and can be cancelled. A new version supersedes the previous one, which stays retrievable. Deleting is not offered: documents are retained (BR-20).
- **Device needs:** DV-PHONE: photograph a document and upload it on a variable network, with progress surviving a brief signal loss. DV-CAB: capture only, through PG-39 (IC-25), queued offline (PP-06). DV-DESK: add several files at once and download many. DV-AT: full parity with DV-DESK, including upload by file selection.
- **Accessibility requirements:** A labelled region per scope; the document collection is a list with type, version and time as text; upload progress is announced politely at start, at completion and on failure (IC-14), not at every percentage; preview (IC-58) has a text title and a download alternative; accepted file types and the byte limit are stated before upload (IC-24); verification state and expiry are text (G-3).
- **Loading states:** LS-1 until the document set arrives, the rest of the page usable; LS-2 on window focus (documents are refetched on focus, Phase 4 §2.6); LS-5 per file with upload progress and a cancel action; LS-6 for driver captures queued offline ("Waiting to upload, saved 4 min ago").
- **Error states:** E-VALIDATION (type, byte limit, failed virus scan) → reason per file and the accepted alternatives; other files unaffected. E-FORBIDDEN on upload → the role cannot add to this scope and who can. E-OFFLINE → capture queued where the section allows (PG-39), otherwise "Uploading needs a connection". E-SERVER or E-TIMEOUT on download → retry (IC-60); an expired signed URL is refreshed silently once. E-PRECONDITION on a new version (SSB-8) → another version was added meanwhile; state by whom and offer to add this one as the next version.
- **Empty states:** EM-1 for organisation scope: "No documents yet" with what compliance or billing expects. EM-4 for load scope before the event that produces the document ("POD will be expected after delivery"). EM-2 when a type filter matches nothing: active filter and a way to clear it.
- **Reuse potential:** PG-40, PG-43, PG-45, PG-31, PG-17, PG-51; implemented once and reused by reference (location per Phase 7 §12).
- **Technical notes:** Upload is direct-to-storage via a presigned URL from the backend; client checks bytes and MIME before request; limits in constants; server scans every file (SEC-7). Query key `documentKeys.list(scope, scopeId, docType)`, invalidated on upload success. Audit events `document.uploaded`, `document.version_added`, `document.downloaded`; analytics `document.uploaded`, `document.downloaded` with type enum and byte count only. Tax IDs on W-9 and bank documents are Restricted (NFR-PRIV-1) and preview is limited to roles in Phase 3 §5.1. Retention 7 years for POD and rate confirmations (BR-20).

### SH-04 — Conversation

- **Purpose:** Keep communication about a load or ticket on the record (BR-19).
- **Responsibilities:** Present messages with author name, role, organisation and time; accept new messages with attachments; track delivery and read state; mark the thread read; state who is on the thread (both parties of the load and Haulr operations, or the requester and support). No thread exists outside a load or ticket.
- **Data requirements:** `use-messages(threadId, { cursor })` polled every 10 s while open (Phase 7 §13); `use-send-message(threadId)`; attachments through `use-document-upload({ scope: 'thread', scopeId: threadId })`; page size 50 (maximum 200), the newest page loaded initially.
- **Interaction model:** The user composes and sends (IC-35); the message appears at once as sending, then as delivered on acknowledgement; failed messages stay in the log with a retry; older messages load on request (IC-21) without moving focus; new messages arrive live and do not disturb the composer. The thread is marked read when the latest message has been in view.
- **Device needs:** DV-PHONE and DV-DESK equally; DV-PHONE users attach photos from the camera (IC-25) and reply from a notification deep link. DV-CAB: drivers reach load messages from PG-39 with short replies. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** Messages form a `role="log"` region announced politely (new messages from others only, never the user's own); the composer is labelled with the thread's subject; sending, sent and failed states are announced (IC-14) and exposed in text on the message; attachments carry file names as text; loading older messages keeps focus on the request control (SSB-6).
- **Loading states:** LS-1 until the latest page arrives; LS-2 every 10 s while the thread is open, paused when hidden; LS-5 per outgoing message with optimistic append; LS-3 after 5 s keeps the composer usable.
- **Error states:** E-SERVER, E-TIMEOUT or E-OFFLINE on send → message kept with retry and the entered text never lost; the idempotent message ID prevents duplicates on retry. E-VALIDATION (empty, over length, attachment rejected) → field message per IC-02. E-FORBIDDEN → the thread is closed to this role (for example after the load closes) with the reason. E-NOT-FOUND → thread unavailable; retry not offered. E-SERVER on read → retry (IC-60) with known messages retained (SSB-2).
- **Empty states:** EM-1: "No messages yet. Messages here are shared with everyone on this load." (ticket threads: "…shared with Haulr support").
- **Reuse potential:** PG-40, PG-41, PG-24; implemented once and reused by reference (location per Phase 7 §12).
- **Technical notes:** Optimistic append with a client `nanoid` message ID reconciled on server acknowledgement (Phase 7 §8 permits optimism here); the ID doubles as the idempotency key; transport per Phase 7 §13 (polling at launch, server-sent events later with the same hook signature). Query key `messageKeys.list(threadId)`. Message body limit `MESSAGE_MAX_LENGTH` from constants. Audit `message.sent`; analytics `message.sent` with thread ID, attachment count and length band only; message bodies are Confidential and never reach analytics or error reports (NFR-PRIV-3).

### SH-05 — Record collection

- **Purpose:** Let a user find and act on records in a collection that may hold a million entries (NFR-CAP-2).
- **Responsibilities:** Filter, search, sort and paginate a collection; select records; run permitted bulk actions; export; keep all of this in the URL (IA-P4) so any view can be shared and restored; state the result count and its freshness.
- **Data requirements:** A collection hook for the scope (for example `use-loads(params)`), cursor-paginated, page size 50 by default (maximum 200); filter vocabularies from `lib/enums/`; parameter names from Phase 3 §10 (`status`, `from`, `to`, `dateField`, `sort`, `cursor` and the scope's own); access filter applied by the server and never user-editable (Phase 3 §10 precedence); exports through `use-export-loads` or the scope's export hook (IC-65).
- **Interaction model:** Criteria changes apply after input settles (debounced, `use-debounced-search`); results update without losing selection where records remain; bulk actions state scope and totals ("12 selected") before running (IC-23) and irreversible bulk actions confirm through IC-12; pagination by cursor (IC-21); sort through IC-22; exports beyond the current page run as a background job (IC-65). A reference number typed into search resolves exactly to the record (Phase 3 §9).
- **Device needs:** DV-DESK: scan and compare many records, keyboard selection and range selection, bulk actions, export. DV-PHONE: find one record by reference quickly; bulk actions and export need not be offered. DV-WALL: unattended views of PG-26 and PG-50 refresh and state their age. DV-AT: full parity with DV-DESK, including selection and bulk actions.
- **Accessibility requirements:** Result count announced politely after each criteria change (IC-14); sort state exposed (`aria-sort` where tabular, IC-22); selection state and selected count announced; filters are a labelled group with an explicit reset (IC-20); pagination controls are named with the destination (IC-21); focus stays on the changed control after refetch (SSB-6); bulk results listed per record in text.
- **Loading states:** LS-1 inside the collection's own boundary; LS-2 on criteria change or interval: previous results remain with a pending state during refetch (placeholder data) and the count is announced only when it changes; LS-3 after 5 s allows the user to keep working with previous results; LS-5 during a bulk action on up to 100 records; LS-7 for more than 100 records and for exports ("Started. We'll notify you when it's ready.", Phase 4 §2.8).
- **Error states:** E-SERVER, E-TIMEOUT or E-UNAVAILABLE on the collection → previous results retained with age and retry (IC-60). E-VALIDATION on malformed URL parameters → invalid values dropped, the user told which filter was reset. Partial bulk-action failure → per-record outcome with the E-class reason for each (E-CONFLICT: state moved on; E-FORBIDDEN: not permitted for this record). E-RATE-LIMIT on export → wait from `Retry-After`. E-CONTRACT → as E-SERVER, never partially rendered.
- **Empty states:** EM-1 when no records exist at all (guidance per route from Phase 3 §13, with the single next step); EM-2 when no records match criteria (active criteria count and a way to clear or widen them); EM-3 for work queues emptied by the user's work (clear, with time of last check).
- **Reuse potential:** PG-26, PG-30, PG-33, PG-35, PG-38, PG-43, PG-44, PG-50, PG-52, PG-32, PG-22; implemented once and reused by reference (location per Phase 7 §12).
- **Technical notes:** URL parsing and serialisation through `lib/utils/query-string.ts`; parameter names from Phase 3 §10; query keys include every parameter (`<resource>Keys.list(params)`); `placeholderData: keepPreviousData`; no client-side totals over the collection (Phase 7 §18); initial page within NFR-PERF-3 (≤ 800 ms p95). Bulk actions carry one idempotency key per record and emit the per-record audit events of the underlying action plus `bulk.<action>.requested`; exports emit `export.requested` (Sensitive, Phase 4 §2.8). Analytics `<resource>.collection.filtered`, `<resource>.collection.exported` with filter names and counts, never search text (NFR-PRIV-3).

### SH-06 — Account standing notice

- **Purpose:** Tell the user when their organisation cannot do something and how to fix it.
- **Responsibilities:** Detect blockers (onboarding incomplete, compliance hold, insurance expiring or lapsed, payment method missing or failed, credit limit reached, authority inactive per BR-18) and route to the exact fix; state which capabilities are affected (book, bid, post, pay) and, for expiring items, the date the block will start.
- **Data requirements:** `use-account-standing()` → blockers with severity (blocking or warning), affected capabilities, effective date and fix route; scoped to the session's organisation; shared query key across every page.
- **Interaction model:** The user follows the fix route (PG-17 or PG-49 per Phase 3 §8; PG-16 for incomplete shipper onboarding, SC-18.5); non-blocking notices can be dismissed for the session; blocking notices cannot be dismissed. Actions elsewhere are never hidden because of a blocker; the server refuses them and the notice explains why (G-5).
- **Device needs:** DV-PHONE: the blocker is announced on load so users do not have to hunt for it, and the fix route is reachable in one step. DV-DESK: the same, persisting across pages until resolved. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** Blocking notices are announced once on page load (assertive only for a state that became blocking since the last visit; polite otherwise); the notice is a labelled region naming the organisation; the fix route is a named link stating the destination ("Update insurance certificate"); dismissal returns focus to the next focusable element in reading order (SSB-6).
- **Loading states:** LS-1 silently: nothing is announced while loading and the notice appears only when data resolves, so no empty region is ever exposed; LS-2 on window focus and after any mutation that may resolve a blocker.
- **Error states:** E-SERVER, E-UNAVAILABLE or E-TIMEOUT → no notice, no error message (the server remains authoritative on every action and refusals carry their own reason via E-FORBIDDEN). E-CONTRACT → reported with correlation ID, no notice rendered.
- **Empty states:** EM-5: no blockers → the section is absent; it renders only when at least one blocker exists.
- **Reuse potential:** PG-18, PG-19, PG-33, PG-27, PG-34; implemented once and reused by reference (location per Phase 7 §12).
- **Technical notes:** Shared query key `organizationKeys.standing()` so resolving a blocker anywhere updates everywhere; stale time 60 s; invalidated by payment method, document and onboarding mutations. Dismissal held in session storage via `lib/utils/local-storage.ts`, keyed by user and blocker ID, cleared on sign-out (SSB-10). Read-only: no audit event. Analytics `account.standing_notice.viewed` and `account.standing_notice.fix_followed` with blocker type enum only. Standing mirrors BR-03 and BR-18; the client never decides eligibility.

### SH-07 — Attention queue

- **Purpose:** Collect the items that need this user's action now (PP-04).
- **Responsibilities:** Present attention items of mixed type, each with its reason, deadline (with a countdown within the last hour, IC-46), the load or record reference and direct route to act; state whose turn it is and by when (Phase 2 §7); allow acknowledging informational items; order by deadline as computed by the server.
- **Data requirements:** `use-attention-items({ role })` → items computed server-side for the session's organisation and role, with type enum, subject reference, deadline and permitted quick action; one backend endpoint per dashboard (PG-18 note); page size 50 (maximum 200).
- **Interaction model:** The user opens an item's subject or performs its single permitted quick action (for example accept bid, assign driver) through the relevant contract (IC-28, IC-06, IC-12 for irreversible ones); handled items leave the queue immediately; informational items are acknowledged and leave; the queue refreshes every 60 seconds and on focus. Spend-limited members still see money actions; the server decides whether they route to approval (BR-23).
- **Device needs:** DV-PHONE: act on one item from a notification, away from the desk. DV-DESK: clear the queue in sequence with the keyboard. DV-WALL: internal queues (PG-22, PG-24) may be left open; age stays stated as text. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** A labelled region stating the item count ("5 items need you"); count changes announced politely (IC-14); each item's deadline expressed as text with facility time zone, countdowns following IC-46 (no per-second announcements); removal announced politely ("Bid accepted. 4 items remaining") and focus moves to the next item (SSB-6).
- **Loading states:** LS-1 inside its own boundary; LS-2 every 60 s (`ATTENTION_REFRESH_MS`) and on window focus, known items retained, paused when hidden; LS-5 on the triggering quick action, which is busy until settled; LS-3 after 5 s.
- **Error states:** E-SERVER, E-UNAVAILABLE or E-TIMEOUT on read → retry (IC-60) with the stale age stated ("Last checked 6 min ago"). E-CONFLICT on a quick action → the item was handled elsewhere; refetch and state who handled it. E-FORBIDDEN → the action is outside the role; state who can act. E-PRECONDITION → the subject changed; open it instead. E-OFFLINE → quick actions unavailable, "needs a connection".
- **Empty states:** EM-3: "Nothing needs you right now" with time of last check; EM-1 for a new organisation defers to SH-12.
- **Reuse potential:** PG-18, PG-19, PG-22, PG-23, PG-24, PG-50; implemented once and reused by reference (location per Phase 7 §12).
- **Technical notes:** Item types are an enum; quick actions reuse the same mutation hooks as their full pages and invalidate `attentionKeys.list(role)` on success; stale time 60 s and stale label after 5 min (Phase 4 §2.6). Audit events are those of the underlying action (for example `bid.accepted`) plus `attention_item.acknowledged`. Analytics `dashboard.attention.opened`, `dashboard.attention.acted` with type enum and time-to-action. Money values in items follow BR-05 shaping.

### SH-08 — Performance metrics

- **Purpose:** Tell users how they are doing over a period.
- **Responsibilities:** Present KPIs for the scope and period with comparison to the previous period, sample size and definitions of each measure (IC-56); withhold any metric the role may not read (for example spend for non-finance carrier roles, BR-05).
- **Data requirements:** `use-metrics({ scope, period })`; values computed server-side from the ledger and event stores; period vocabulary from constants (this week, last 30 days, quarter, custom); definitions from the glossary constants.
- **Interaction model:** The user chooses the period (IC-17) and opens a metric's definition (IC-56); drilling in navigates to the filtered collection that produced the number (SH-05 with matching Phase 3 §10 parameters); graphical renderings expose their values by date (IC-45).
- **Device needs:** DV-DESK: review trends and drill in. DV-PHONE: glance at this week's values in text; graphical trends need not load. DV-WALL: internal throughput (PG-21) refreshes unattended. DV-AT: full parity with DV-DESK through the tabular equivalents.
- **Accessibility requirements:** Every graphical rendering has a tabular data equivalent (IC-45); changes expressed in words ("up 4 points on last week"), never by visual cue alone (G-3); each metric is a labelled group with value, unit and period as text; period changes announce the new period politely (IC-14).
- **Loading states:** LS-1 per metric group, each in its own boundary; LS-2 on period change with previous values kept; values refresh on focus and at most every 60 s (Phase 4 §2.6), stale label after 5 min.
- **Error states:** E-SERVER or E-UNAVAILABLE for one metric → its value withheld with reason and retry (IC-60); others unaffected. E-FORBIDDEN → the metric is absent, never shown as zero. E-VALIDATION on a custom period → IC-17 message (range outside retention or end before start).
- **Empty states:** EM-4: not enough data → "Available after your first delivered load."; EM-2 for a period with no activity: "No activity in this period" with a way to widen it.
- **Reuse potential:** PG-18, PG-19, PG-21, PG-23; implemented once and reused by reference (location per Phase 7 §12).
- **Technical notes:** Chart library pending approval (Phase 7 §15), loaded with `next/dynamic` after the text values; numbers formatted by shared formatters (`lib/utils/currency.ts`, `lib/utils/units.ts`); query key `metricKeys.set(scope, period)`, stale time 60 s. Read-only: no audit event. Analytics `dashboard.metric_period.changed` and `dashboard.metric.drilled` with metric ID and period enum. Spend values are Confidential (NFR-PRIV-1).

### SH-09 — Scorecard

- **Purpose:** Convey an organisation's reliability from measured data and ratings (BR-22).
- **Responsibilities:** Present on-time, tracking compliance, acceptance or dwell measures and rating summary, with sample size and period; include carrier cancellation penalties where they apply (BR-12); state the minimum sample short of which values are withheld.
- **Data requirements:** `use-scorecard(orgId)` → measures with value, unit, sample size and period, plus rating average and count; public fields only on public pages (no rates, BR-05, BR-21); minimum sample `SCORECARD_MIN_SAMPLE` (5 delivered loads) from constants.
- **Interaction model:** Read-only; the user can open each measure's definition (IC-56). No sorting, filtering or drilling on public pages.
- **Device needs:** DV-PHONE: check a carrier's reliability in seconds. DV-DESK: compare two organisations in separate tabs. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** A labelled region naming the organisation; values as text with units and period; rating expressed as "4.6 out of 5 from 132 ratings", never as a visual-only rating (G-3); definitions follow IC-56 and return focus to their trigger.
- **Loading states:** LS-1 on workspace pages inside its own boundary; server-rendered with ISR on PG-03 (no client loading there); PG-04 is signed-in only and follows LS-1 per part.
- **Error states:** E-SERVER or E-UNAVAILABLE → values withheld with retry (IC-60), never replaced by zero. E-NOT-FOUND → handled by the host page (PG-53). E-CONTRACT → as E-SERVER.
- **Empty states:** EM-4: too few loads → "Scorecard begins after 5 delivered loads." with the current count.
- **Reuse potential:** PG-03, PG-04, PG-28, PG-29, PG-33; implemented once and reused by reference (location per Phase 7 §12).
- **Technical notes:** Minimum sample size from constants; query key `scorecardKeys.detail(orgId)`, stale time 5 min; public pages revalidate by tag on rating or compliance change. AggregateRating structured data only when the rating count is at least 5 (PG-03). Read-only: no audit event; analytics `scorecard.definition.opened` with measure enum. Individual ratings are never shown with the rater's identity (XS-05).

### SH-10 — Rating submission

- **Purpose:** Collect a rating of the counter-party after delivery (XS-05).
- **Responsibilities:** Accept a rating on the fixed scale, optional reason tags and a comment; enforce the 30-day window from delivery (`RATING_WINDOW_DAYS`); state that the rating is not attributed to the rater by name.
- **Data requirements:** `use-rate-counterparty(loadId)`; reason tag vocabulary from enums; window end date from the load record.
- **Interaction model:** The user selects a rating (IC-37), optional tags and comment, and submits (IC-11); the comment is validated for length on submit; submitted ratings are final and the section then states the rating given.
- **Device needs:** DV-PHONE: rate in seconds from a notification deep link. DV-DESK: the same from PG-40. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** A labelled region naming the counter-party; the rating input follows IC-37 (radio semantics, value as text); tags are a labelled group; the window end is stated as text; the submission result is announced politely (IC-14) and focus moves to the confirmation.
- **Loading states:** LS-5: submission pending announced ("Submitting rating…"), the submit action busy (G-6).
- **Error states:** E-CONFLICT: window closed or already rated by this organisation → explained with the date the window closed or the rating already recorded. E-VALIDATION → rating missing or comment too long, per IC-02. E-SERVER, E-TIMEOUT → submission failed with retry, entries kept. E-FORBIDDEN → role cannot rate (for example `shipper.finance`, Phase 3 §5.1).
- **Empty states:** EM-5: the section exists only when rating is allowed (delivered load, window open, not yet rated, permitted role).
- **Reuse potential:** PG-40, notification deep links.
- **Technical notes:** Idempotent per (load, rater organisation); an idempotency key from `lib/utils/reference-id.ts` makes retries safe. Invalidates `scorecardKeys.detail(orgId)` and the load's attention items. Audit `rating.submitted`; analytics `rating.counterparty.submitted` with score and tag enums, never the comment (NFR-PRIV-3). Comment limit `RATING_COMMENT_MAX_LENGTH` from constants.

### SH-11 — Audit history

- **Purpose:** Record who changed what, when and why (BR-26).
- **Responsibilities:** Present audit entries for a scope with actor, actor role, organisation, view-as origin (BR-27), action, target, reason, before and after values, time and correlation ID; state the retention boundary (7 years); allow export where the role permits (Phase 3 §5.1a).
- **Data requirements:** `use-audit-log({ scope, scopeId, actor, action, from, to, cursor })`, cursor-paginated, page size 50 (maximum 200); audit action vocabulary from `lib/enums/`; values the role cannot read are masked by the server (BR-05).
- **Interaction model:** Read-only; filter by actor, action and date range (IC-20), all in the URL; load older entries on request (IC-21); expand an entry for field-level before and after values (IC-32); export the filtered set as a background job (IC-65) for permitted roles.
- **Device needs:** DV-DESK: investigate and export. DV-PHONE: need not be supported beyond reading one entry from a link. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** Entries as a list in a labelled region; before and after values as text pairs ("Detention free time: 2 h → 3 h"), never a visual diff alone (G-3); view-as entries state both identities in text; filter group per IC-20; count announced after filtering (IC-14).
- **Loading states:** LS-1 inside its own boundary; LS-2 on filter change with previous entries kept; LS-5 when requesting older entries; LS-7 for export.
- **Error states:** E-SERVER, E-TIMEOUT → retry (IC-60) with loaded entries kept. E-FORBIDDEN on export → who can export. E-VALIDATION on a date range outside retention → state the boundary. E-CONTRACT → as E-SERVER.
- **Empty states:** EM-1: "No changes recorded." for a new scope; EM-2 for filters with no match, with the retention boundary (BR-26, Phase 3 §13).
- **Reuse potential:** PG-25, PG-51, PG-52, PG-50, PG-63.
- **Technical notes:** Read-only endpoint; never editable; no client write path exists (BR-26). Query key `auditKeys.list(scope, params)`. Reading emits no audit event; export emits `audit_log.exported` with reason. Analytics `audit.searched`, `audit.exported` with counts only. IP and user agent in entries are Confidential and shown only to `internal.admin` and `org.security` (NFR-PRIV-1).

### SH-12 — Guided next steps

- **Purpose:** Move a new organisation to its first value.
- **Responsibilities:** Determine which setup tasks remain for the organisation and role (shipper: quote, invite, add facility; carrier: complete onboarding, add fleet, search the load board) and route to each; report completion as a count.
- **Data requirements:** `use-onboarding()` → remaining tasks with completion state and route; computed by the server for the session's organisation.
- **Interaction model:** The user follows a task; completed tasks drop out; the section disappears when all are complete or the user dismisses it; dismissal is per user and reversible from settings.
- **Device needs:** DV-DESK and DV-PHONE: follow one task at a time. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** A labelled region; progress expressed as text ("2 of 4 done"); each task is a named link stating its destination; dismissal announces "Setup guide hidden" and moves focus to the next region (SSB-6).
- **Loading states:** LS-1 silently: absent until resolved, so no placeholder is announced.
- **Error states:** E-SERVER, E-UNAVAILABLE → absent on failure; the dashboard's other sections carry the page (SSB-3). E-CONTRACT reported with correlation ID.
- **Empty states:** EM-5: all tasks done → the section is absent; it renders only while tasks remain and it has not been dismissed.
- **Reuse potential:** PG-18, PG-19.
- **Technical notes:** Dismissal stored per user via `lib/utils/local-storage.ts` (`useSyncExternalStore`), cleared on sign-out (SSB-10); query key `organizationKeys.onboarding()`, invalidated by each onboarding step mutation. Analytics `onboarding.task.opened`, `onboarding.guide.dismissed` with task enum. No audit event (no mutation).

### SH-13 — Step progression

- **Purpose:** Carry a user through a multi-step entry flow without losing work (PP-06).
- **Responsibilities:** Track the current step, completed steps and validity; allow moving back without loss; persist the draft; restore it on return; clear it on successful submission; never submit until the final step is confirmed.
- **Data requirements:** Local draft through `useSyncExternalStore` + `localStorage` (via `lib/utils/local-storage.ts`), expiring after 30 days (NFR-PRIV-4); server draft through the flow's hook where Phase 4 says so; current step in `?step=`.
- **Interaction model:** Follows IC-15. Moving forward validates the current step; moving back never validates; jumping is allowed only to completed steps. The draft is saved on every step change and on input settling. On return, the saved draft is restored and the user is taken to the earliest incomplete step.
- **Device needs:** DV-PHONE: one step at a time; the on-screen keyboard never hides the focused entry (WCAG 2.4.11). DV-DESK: fast keyboard progression without pointer use. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** Step navigation is a labelled list with the current step marked by `aria-current="step"`; current step and total announced on step change ("Step 2 of 4: Billing"); focus moves to the step's heading; errors summarised with links to the fields (IC-02); restored drafts are announced once.
- **Loading states:** LS-1 while a server draft is fetched; restoring a local draft is immediate and announced once ("Draft restored from 2 days ago"); LS-5 while a step saves to the server.
- **Error states:** Draft restore failed or corrupt → start fresh and say so. E-VALIDATION → IC-02 summary on the current step, entries kept. E-PRECONDITION on a server draft edited on another device → IC-67: state what changed and when, keep both versions for the user to choose. E-OFFLINE → local draft keeps accumulating; server save retried on reconnect. E-AUTH → local draft kept, redirect to PG-10 with return path.
- **Empty states:** EM-5: the flow always renders the entries of its opening step; there is no collection to be empty.
- **Reuse potential:** PG-16, PG-17, PG-27, PG-45, PG-08; implemented once and reused by reference (location per Phase 7 §12).
- **Technical notes:** Reducer with typed actions; draft keyed by flow and user ID; drafts cleared on successful submission and on sign-out (SSB-10); drafts never contain Restricted values (passwords, bank details, tax IDs are re-entered, NFR-PRIV-1). Server drafts carry a version for SSB-8. Analytics `<flow>.step.completed`, `<flow>.draft.restored` with step index and duration; audit events are the flow's own (for example `onboarding.step_saved`).

### SH-14 — Money breakdown

- **Purpose:** Explain an amount completely before and after commitment (PP-01).
- **Responsibilities:** Break an amount into its parts (linehaul, fuel, accessorials, fees, deductions, quick pay fee), state how each was derived and which are pending approval or disputed (BR-16); show only the side of the price the role may read (BR-05); state the quote validity end where one applies (BR-06).
- **Data requirements:** The role-shaped money object on the parent record (quote, load, invoice or settlement), including per-part derivation text keys, status (agreed, pending approval, disputed) and currency; no separate fetch.
- **Interaction model:** Read-only; the user can open the derivation of any part (IC-32 or IC-56). Pending and disputed parts are reached from their own sections, not changed here.
- **Device needs:** DV-PHONE: read the total and each part before committing. DV-DESK: reconcile against an invoice or settlement. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** A labelled region naming the record; amounts read with currency and cents; totals labelled as totals; pending and disputed parts described as such in text (G-3); each amount is programmatically associated with its label (WCAG 1.3.1) so it is read with its label.
- **Loading states:** LS-1 and LS-2 follow the parent record; no independent boundary.
- **Error states:** Follows the parent record. E-CONTRACT on the money object → the whole breakdown is withheld, never partially rendered, because a partial amount would mislead (PP-01).
- **Empty states:** EM-5: the parent record always carries a money object; the section is not rendered without one.
- **Reuse potential:** PG-27, PG-28, PG-31, PG-33, PG-34, PG-38, PG-40; implemented once and reused by reference (location per Phase 7 §12).
- **Technical notes:** Currency formatting in one shared formatter (`lib/utils/currency.ts`); never computed client-side except display rounding; totals come from the server (Phase 7 §18). Rates, margins and pay are Confidential (NFR-PRIV-1) and never enter analytics; `money.breakdown.opened` carries the part enum only. Read-only: no audit event.

### SH-15 — Driver and truck assignment

- **Purpose:** Assign a suitable driver and equipment to a booked load (XF-05) before the BR-09 deadline.
- **Responsibilities:** Offer eligible drivers and vehicles, check equipment against requirements, choose the tracking source (driver device or ELD), invite a new driver without leaving the assignment, confirm the assignment; state the assignment deadline (2 hours before the pickup window opens, BR-09); require a reason on reassignment.
- **Data requirements:** `use-fleet({ availableFor: loadId })` → drivers and vehicles with availability and equipment; `use-assign-load(loadId)` mutation; invitation through `use-invitations`; deadline lead time `ASSIGNMENT_LEAD_HOURS` from constants.
- **Interaction model:** The user selects driver and vehicle (IC-06), sees eligibility results per option, chooses the tracking source, and confirms (IC-11); reassignment requires a reason and states that the previous driver loses access to the trip; an invite (IC-39) made without leaving the assignment adds a driver who can be assigned once accepted.
- **Device needs:** DV-PHONE: assign in one sitting from a notification. DV-DESK: assign many loads in a row with the keyboard. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** Ineligible options remain perceivable and state why in text (G-5); the deadline is text with time zone and a countdown within the last hour (IC-46); confirmation announced politely (IC-14) with the driver and vehicle named; focus returns to the load's assignment status (SSB-6).
- **Loading states:** LS-1 while the fleet loads; LS-5 while the assignment is submitted, the confirm action busy (G-6).
- **Error states:** E-CONFLICT (driver or vehicle assigned to an overlapping load, load no longer booked) → reason and refreshed options. E-VALIDATION (equipment mismatch, missing reason on reassignment) → field message (IC-02). E-FORBIDDEN (`carrier.driver` or view-as without write consent) → who can assign. E-PRECONDITION → the load changed since opening (IC-67). E-SERVER, E-TIMEOUT → retry with selections kept.
- **Empty states:** EM-1: no drivers → invite one without leaving the assignment (XS-02) with what the driver receives; no eligible vehicle → route to PG-37 to add one.
- **Reuse potential:** PG-40, PG-35, PG-19; implemented once and reused by reference (location per Phase 7 §12).
- **Technical notes:** Server validates equipment and availability; deadline from BR-09 in constants; query keys `fleetKeys.available(loadId)` and `loadKeys.detail(loadId)` invalidated on success. Audit `load.driver_assigned` and `load.driver_reassigned` (with reason); analytics `load.assigned` with lead time before deadline. Driver phone numbers are Confidential (NFR-PRIV-1). View-as without write consent is read-only (BR-27).

---

## 3. Public Pages

### PG-01 — Home

#### SC-01.1 — Intent routing
- **Purpose:** Let visitors declare whether they ship or haul and route them accordingly.
- **Responsibilities:** Explain the value for each side and hand the declared intent to PG-11 (`?side=shipper` or `?side=carrier`) or PG-05; offer signed-in visitors their role root instead of registration.
- **Data requirements:** Copy from constants; side vocabulary from the side enum shared with SC-11.1; session presence read on the server only to choose between registration and role root.
- **Interaction model:** The visitor chooses a side; the choice is carried in the URL, not stored, and no personal data is collected here; each choice is a plain navigation that works without client JavaScript.
- **Device needs:** DV-PHONE: choose with one thumb within seconds of arriving. DV-DESK: compare both sides' value before choosing. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** Each route is a named link describing its destination ("Start shipping with Haulr", "Apply to haul for Haulr"); the two value statements are separate labelled regions with headings in document order (WCAG 1.3.1, 2.4.4).
- **Loading states:** No LS class applies: the section is statically generated with the page and fetches nothing at runtime, so it is complete on arrival.
- **Error states:** No runtime error can occur (static content, no request). A failure of the whole page falls to the segment `error.tsx` (Phase 3 §14).
- **Empty states:** EM-5: static copy from constants is always present at build time.
- **Reuse potential:** PG-02 conversion route; the side enum and routes are shared with SC-11.1.
- **Technical notes:** Static; no client JavaScript required; counts toward PG-01's LCP ≤ 2.0 s budget. Analytics `marketing.journey.selected` with the side enum, recorded on the server from the destination request. No audit event (no mutation, no account).

#### SC-01.2 — Lane price entry
- **Purpose:** Start a price check from the home page.
- **Responsibilities:** Accept origin, destination and equipment and hand them to PG-05 as URL parameters; accept free text when suggestions are unavailable.
- **Data requirements:** Location suggestions via `use-location-suggestions(query)` (Route Handler, debounced); equipment vocabulary from `lib/enums/equipment-type.ts`; lane schema from `lib/validations/lane.ts`.
- **Interaction model:** Location entries follow IC-05 and equipment IC-07; submitting (IC-11) validates presence of origin and destination, then navigates to PG-05 with parameters; nothing is stored or sent until a suggestion request.
- **Device needs:** DV-PHONE: enter a lane with the on-screen keyboard and suggestions reachable by touch. DV-DESK: enter a lane entirely by keyboard. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** Labelled inputs; suggestions per IC-05 (combobox semantics, count announced politely); missing entries reported through IC-02 with focus moved to the summary.
- **Loading states:** LS-2 while suggestions are pending per IC-05, the entered text staying editable; no page-level loading.
- **Error states:** E-UNAVAILABLE or E-SERVER on suggestions → free-text accepted; PG-05 resolves it. E-RATE-LIMIT on suggestions → free text accepted silently. E-VALIDATION → origin or destination missing, per IC-02.
- **Empty states:** EM-5: the section is an entry form and always renders; no suggestions for a query is IC-05's own "No matching places" state.
- **Reuse potential:** SC-05.1 uses the same schema.
- **Technical notes:** Schema shared with SC-05.1 in `lib/validations/`; suggestion debounce `SEARCH_DEBOUNCE_MS` via `use-debounced-search`; anonymous suggestion calls are rate-limited per IP (SEC-10). Analytics `pricing.estimate.started` with equipment enum and city-level region codes only (NFR-PRIV-3). Loaded as a client island so the rest of PG-01 stays static.

#### SC-01.3 — Network proof
- **Purpose:** Establish credibility with verifiable network facts.
- **Responsibilities:** Present aggregate network statistics (approved carriers, loads delivered, on-time rate) with the period they cover and when they were computed.
- **Data requirements:** Public stats endpoint (backend `stats` module extension), cached (revalidate hourly); aggregate values only, classified Public (NFR-PRIV-1).
- **Interaction model:** Read-only; no user action: the statement is informational and carries no links or controls of its own.
- **Device needs:** DV-PHONE and DV-DESK: read the statement in passing. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** Numbers as text with context ("12,400 approved carriers as of 1 September"), formatted by the shared number formatter; no number conveyed by a graphic alone (G-3).
- **Loading states:** Rendered at build or revalidation; no client loading, so no LS class applies at runtime.
- **Error states:** E-UNAVAILABLE or E-SERVER at revalidation → the previous cached statistics keep serving; with no cached value the statement is withheld entirely (PG-01 error state), never replaced by a placeholder.
- **Empty states:** EM-5: the statement renders only when statistics exist; otherwise it is withheld as stated in Error states.
- **Reuse potential:** Deliberately single-use: network-wide aggregates serve acquisition only; workspace metrics use SH-08.
- **Technical notes:** Fetched in a server component with `revalidate` of 3600 s; no client JavaScript. No analytics or audit events.

#### SC-01.4 — Access routing
- **Purpose:** Get returning users into the product.
- **Responsibilities:** Route signed-out users to PG-10 and signed-in users to their role root (Phase 3 §4).
- **Data requirements:** Session presence (server) and role key for the role root; no client fetch.
- **Interaction model:** Single navigation; signed-out users arrive at PG-10 without a return path; signed-in users skip sign-in entirely.
- **Device needs:** DV-PHONE and DV-DESK: one step into the product. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** Link names state the destination ("Sign in", "Go to your dashboard"); the link is reachable by keyboard in reading order (WCAG 2.4.4).
- **Loading states:** None at runtime: the destination is decided during server rendering, so no LS class applies.
- **Error states:** Session unreadable or expired → treated as signed out (E-AUTH semantics without a redirect); no message is needed on a public page.
- **Empty states:** EM-5: one of the two routes always renders.
- **Reuse potential:** PG-06, PG-09.
- **Technical notes:** Session read server-side via `lib/utils/session.ts`; the page stays statically cacheable by rendering the signed-in variant only in a dynamic island. No analytics or audit events.

### PG-02 — Public Tracking

#### SC-02.1 — Status and ETA
- **Purpose:** Tell an outside party the load's status and arrival estimate.
- Instance of **SH-02**, scoped to a tracking token. Overrides: position is approximate (rounded to city level between stops); no check-call request; refresh every 2 minutes; expired token handled by SC-02.3. Data comes from `use-tracking(token)` polled at `PUBLIC_TRACKING_REFRESH_MS` (120 s, Phase 7 §13, paused when hidden), access is the token alone (`public.tracking`, one load, read-only, no session) and the payload never carries rates, contacts or documents (BR-21); E-UNAVAILABLE from the ETA service → status and stops remain and the ETA is withheld with a statement that it is temporarily unavailable; EM-4 before pickup states "Tracking starts at pickup" with the scheduled pickup window, and after delivery the delivery time replaces the ETA. Analytics `tracking.page.viewed` carries the token's load ID hash only; no map interaction is required on DV-PHONE, and DV-WALL use on a dock computer refreshes unattended with its age stated.

#### SC-02.2 — Stop progress
- **Purpose:** Tell the outside party which stops are done and which remain.
- Instance of **SH-01**, public variant. Overrides: only stop arrival, departure and delivery events; city-level locations; no actors, rates or documents (BR-21). Data comes from the same `use-tracking(token)` payload (no separate timeline request and no pagination), refreshed with SC-02.1 every 120 s; there is no category filter or evidence expansion; EM-4 before pickup names the pickup city and window; token errors are handled once by SC-02.3.

#### SC-02.3 — Link validity and help
- **Purpose:** Explain the tracking link's scope and lifetime.
- **Responsibilities:** State who shared the link (organisation name only), when it expires (7 days after delivery, BR-21), and what to do when it has expired or is invalid; offer conversion routes (PG-01, PG-11).
- **Data requirements:** Token metadata from `use-tracking(token)`: sharing organisation name, expiry time, delivery time; no contact details.
- **Interaction model:** Read-only; conversion navigation; an expired link shows when tracking ended and when the load was delivered (Phase 3 §14), not a not-found page.
- **Device needs:** DV-PHONE is the common device (opened from a text message); DV-DESK and DV-WALL supported unchanged. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** Expiry as absolute date and time text with time zone; the expired and invalid states are announced as the page's main heading content so they are heard on arrival (SSB-6); conversion routes are named links.
- **Loading states:** Server-rendered with the page; no client loading, so no LS class applies until the SC-02.1 refresh cycle.
- **Error states:** E-NOT-FOUND (invalid token) → not-found message without detail, never revealing whether a load exists. Expired token → the expired state of this section (not an error class; BR-21). E-RATE-LIMIT (SEC-10, per IP) → state the wait from `Retry-After`. E-SERVER → retry with correlation ID.
- **Empty states:** EM-5: a valid token always carries its metadata; invalid and expired tokens have their own states in Error states.
- **Reuse potential:** Deliberately single-use: only public tracking has token-scoped access with expiry.
- **Technical notes:** `noindex, nofollow`; token verified server-side on every request; tokens are never logged in analytics (only a hash). Analytics `tracking.public.conversion_followed` with destination enum. No audit event on view; the token's creation and revocation are audited where shared (`tracking_link.created`, `tracking_link.revoked`).

### PG-03 — Carrier Public Profile

#### SC-03.1 — Identity and authority
- **Purpose:** Establish that the carrier is real and authorised.
- **Responsibilities:** Present legal name, USDOT and MC numbers, authority status and date verified, years operating, equipment types and operating regions; state the Haulr approval date.
- **Data requirements:** `use-carrier-profile(carrierId)` (ISR on the server); public fields only (no contacts, no insurance amounts, no pay); approved carriers only.
- **Interaction model:** Read-only; registry reference is a link to the public registry, opening an external site and stating so in its name.
- **Device needs:** DV-PHONE and DV-DESK: check the facts quickly; DV-DESK compares carriers in separate tabs. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** Verification status stated in text ("Authority active, verified 12 August 2026"), never by a visual-only cue (G-3); identifiers are exposed as labelled term and value pairs; the external link states that it leaves Haulr.
- **Loading states:** Server-rendered with ISR; no client loading, so no LS class applies.
- **Error states:** E-NOT-FOUND: unknown or unapproved carrier → PG-53 (never revealing a pending or rejected carrier). E-UNAVAILABLE at revalidation → the cached profile keeps serving with its verification date.
- **Empty states:** EM-5: the page renders only for approved carriers, whose identity fields are mandatory.
- **Reuse potential:** SC-51.1 (internal, richer).
- **Technical notes:** Revalidated hourly and by tag on compliance change; Organization structured data; USDOT and MC are Public. Analytics `carrier.profile.viewed` with carrier ID and viewer role enum. No audit event.

#### SC-03.2 — Carrier scorecard
- Instance of **SH-09** for the carrier: on-time pickup and delivery, tracking compliance, tender acceptance, rating. Data comes from `use-scorecard(carrierId)` server-rendered with ISR and revalidated by tag on new ratings; public to everyone for approved carriers; EM-4 for a new carrier states that the scorecard begins after 5 delivered loads; AggregateRating structured data only at 5 or more ratings (PG-03).

#### SC-03.3 — Relationship with viewer
- **Purpose:** Let a signed-in shipper act on the carrier.
- **Responsibilities:** State loads shared with this carrier and the shipper's own ratings; add to or remove from preferred carriers (XF-04).
- **Data requirements:** `use-carrier-relationship(carrierId)` → shared load count, recent loads, own ratings, preferred state; `use-preferred-carriers` mutations; signed-in `shipper.*` and internal roles only.
- **Interaction model:** `shipper.admin` adds or removes, with confirmation for removal (IC-12) stating that pending tenders to this carrier are unaffected; `shipper.member` and internal roles read the relationship only (Phase 3 §5.1).
- **Device needs:** DV-DESK and DV-PHONE: add a carrier after checking its profile. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** Preferred state announced on change (IC-14) and exposed as text; unavailable add or remove actions state why (G-5); the region is labelled with the viewer's organisation name.
- **Loading states:** LS-1 after hydration, separately after the public part, which is never delayed by it; LS-5 during add or remove.
- **Error states:** E-SERVER, E-UNAVAILABLE on read → the section says what could not load and offers retry (IC-60); the public profile stays. E-FORBIDDEN on a mutation → only admins manage preferred carriers. E-CONFLICT → already added or removed elsewhere; refresh and state the current state.
- **Empty states:** EM-1: no shared history → "You haven't worked with this carrier yet." with posting a load with a preferred tender (PG-27) as the next step.
- **Reuse potential:** SC-29.1.
- **Technical notes:** Client-rendered after hydration so the page stays ISR-cacheable; query key `preferredCarrierKeys.relationship(carrierId)`. Audit `preferred_carrier.added`, `preferred_carrier.removed`; analytics `carrier.preferred.added`, `carrier.preferred.removed`. View-as can read only unless write consent exists (BR-27).

### PG-04 — Shipper Public Profile

#### SC-04.1 — Shipper identity
- **Purpose:** Establish who the shipper is.
- **Responsibilities:** Present name, time on Haulr, volume band, typical lanes (regions).
- **Data requirements:** `use-shipper-profile(shipperId)`; public or Internal fields only, no pricing (BR-05), no contacts.
- **Interaction model:** Read-only; no actions: carriers bid and book from the load (PG-33, PG-34), never from the profile.
- **Device needs:** DV-PHONE: check a shipper before bidding. DV-DESK: the same from the load board. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** Text values presented as labelled term and value pairs; volume band stated in words ("50 to 200 loads per month"); regions as a list.
- **Loading states:** LS-1 inside its own boundary.
- **Error states:** E-NOT-FOUND: unknown shipper → PG-53. E-SERVER → retry (IC-60) with correlation ID.
- **Empty states:** EM-5: identity fields are mandatory for every active shipper.
- **Reuse potential:** Deliberately single-use: the internal view (SC-52.2) carries richer account data with different permissions.
- **Technical notes:** No pricing fields in the DTO (BR-05); query key `profileKeys.shipper(shipperId)`, stale time 1 hour. Analytics `shipper.profile.viewed` with viewer role enum.

#### SC-04.2 — Shipper scorecard
- Instance of **SH-09** for the shipper: facility dwell time, detention frequency, accessorial approval rate, payment timeliness, carrier rating. Data from `use-scorecard(shipperId)`; readable by `carrier.dispatcher`, `carrier.admin` and internal roles; LS-1 per part with aggregates cached for 1 hour; EM-4 until 5 rated loads; payment timeliness is a band, never an amount (BR-05).

### PG-05 — Lane Rate Estimator

#### SC-05.1 — Lane query
- **Purpose:** Capture the lane to estimate.
- **Responsibilities:** Accept origin, destination, equipment and date; validate; write them to the URL so the estimate is shareable.
- **Data requirements:** `use-location-suggestions`; equipment enum; lane schema from `lib/validations/lane.ts`.
- **Interaction model:** IC-05 for locations, IC-09 for equipment (three types, all visible), IC-08 for date; estimating runs on submit and when a shared URL is opened; changing an entry after an estimate keeps the previous estimate until the next submit.
- **Device needs:** DV-PHONE: a quick check in a meeting. DV-DESK: users run many lanes in a row with the keyboard. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** Labelled inputs; errors per IC-02 with focus moved to the summary; date entry per IC-08 with the expected format stated.
- **Loading states:** LS-2 for suggestions only (IC-05); the section itself never waits, because it holds entry state and fetches no data of its own.
- **Error states:** E-VALIDATION: unresolvable location → suggestions; past date or missing field → IC-02. E-UNAVAILABLE on suggestions → free text accepted and resolved by the estimate request.
- **Empty states:** EM-5: the entry form always renders; a URL without parameters shows empty entries. A location query with no match is EM-2: check the spelling or enter a ZIP code.
- **Reuse potential:** SC-01.2, SC-27.2 (same lane schema).
- **Technical notes:** Lane schema in `lib/validations/lane.ts` composed over the contract; parameters `origin`, `destination`, `equipment`, `date` in the URL through `lib/utils/query-string.ts`. Analytics `pricing.estimate.requested` with equipment enum and region codes.

#### SC-05.2 — Estimate and basis
- **Purpose:** Give the estimate and explain it.
- **Responsibilities:** Present point estimate, range, confidence, per-mile rate, miles and the basis (recent comparable loads, market index); state that an estimate is not a quote and is not honoured (BR-06 applies only to instant quotes).
- **Data requirements:** `use-rate-estimate(lane)` through the anonymous Route Handler; values are Public for estimates.
- **Interaction model:** Read-only; open the basis explanation (IC-32).
- **Device needs:** DV-PHONE: read the range in words. DV-DESK: compare several estimates across tabs. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** Result announced politely when it arrives (IC-14, "Estimate ready: between $1,840 and $2,120"); range read as "between X and Y"; confidence as a word band, not a visual cue (G-3).
- **Loading states:** LS-5 while the estimate is requested ("Estimating…", announced politely); LS-2: previous estimate retained while pending; LS-3 after 5 s; LS-4 at 15 s becomes E-TIMEOUT; NFR-PERF-4 targets ≤ 3 s.
- **Error states:** Low data (a result, not an error) → low-confidence statement and custom quote route. E-RATE-LIMIT → the wait and the sign-up route. E-UNAVAILABLE (pricing service, NFR-AV-4) → "Estimates are unavailable right now" with retry after the stated interval. E-VALIDATION → lane unresolvable, back to SC-05.1. E-TIMEOUT or E-SERVER → retry (IC-60) with entries kept.
- **Empty states:** EM-1: no lane yet → what to enter (origin, destination, equipment, date).
- **Reuse potential:** SC-27.4 (instant quote uses the same money presentation via SH-14).
- **Technical notes:** Anonymous calls go through a route handler that applies rate limiting (SEC-10); query key `quoteKeys.estimate(lane)`, stale time 5 min. Analytics `pricing.estimate.delivered` with confidence band and duration; `pricing.estimate.rate_limited`. No audit event.

#### SC-05.3 — Lane trend
- **Purpose:** Show whether the lane is getting more or less expensive.
- **Responsibilities:** Present 30-day rate history and direction for the lane and equipment.
- **Data requirements:** `use-lane-trend(lane)` → daily points (date, rate per mile, sample count).
- **Interaction model:** Explore values by date (IC-45); read-only.
- **Device needs:** DV-DESK mainly; DV-PHONE gets the direction in words without loading the graphical rendering. DV-AT: full parity with DV-DESK through the tabular equivalent.
- **Accessibility requirements:** Tabular data equivalent (IC-45); direction stated in words ("up 6% over 30 days").
- **Loading states:** LS-1 inside its own boundary, never delaying SC-05.2; LS-2 on lane change with previous values kept.
- **Error states:** E-SERVER or E-UNAVAILABLE → withheld with a one-line reason; SC-05.2 unaffected. E-RATE-LIMIT → withheld with the wait.
- **Empty states:** EM-4: not enough history → say so and name the minimum number of days required.
- **Reuse potential:** SH-08 metric rendering.
- **Technical notes:** Chart in native SVG with keyboard and pointer exploration (visx, approved in Phase 7 §15, is not needed for it), loaded with `next/dynamic` after the text direction; query key `quoteKeys.trend(lane)`, stale time 1 h. Analytics `pricing.trend.explored`.

#### SC-05.4 — Continue to quote
- **Purpose:** Convert the estimate into a real quote (XS-10 → XF-01).
- **Responsibilities:** Carry the lane to PG-27 through sign-in or registration; allow signed-in users to save the estimate.
- **Data requirements:** Session presence; `use-saved-estimates` (signed-in shipper roles).
- **Interaction model:** Navigation with the lane in `?lane=`; signed-out users pass through PG-10 or PG-11 with a validated return path; save confirms (SSB-5, SU-1).
- **Device needs:** DV-PHONE and DV-DESK: continue in one step. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** Link names state the destination ("Get a bookable quote for this lane"); save result announced politely (IC-14).
- **Loading states:** LS-5: save pending, the save action busy (G-6).
- **Error states:** E-SERVER, E-TIMEOUT → save failed, retry. E-AUTH → signed-out save redirects to PG-10 with the return path. E-FORBIDDEN → carrier roles cannot save shipper estimates; the save action is not offered to them.
- **Empty states:** EM-5: rendered only once an estimate exists.
- **Reuse potential:** Deliberately single-use: the conversion hand-off is specific to the estimator.
- **Technical notes:** Return path validated with `lib/utils/internal-path.ts`. Audit `estimate.saved`; analytics `pricing.estimate.converted` (KPI-01) and `pricing.estimate.saved`.

### PG-06 — Help Center

#### SC-06.1 — Help search
- **Purpose:** Find an answer by typing the question.
- **Responsibilities:** Full-text search across articles; results grouped by category (Phase 3 §6); suggestions for no results.
- **Data requirements:** Build-time search index; `use-help-search(q)` over the local index.
- **Interaction model:** IC-19 (search input), debounced; query in `?q=`; results update as input settles; Enter moves to the results.
- **Device needs:** DV-PHONE: search and open an answer. DV-DESK: the same. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** Search landmark labelled "Help"; result count announced politely after each change (IC-14); results grouped by category, each group named.
- **Loading states:** Index loads lazily on first focus (Phase 7 §17); LS-1 with "Loading search" announced only after 1 s; queries typed meanwhile run when it arrives.
- **Error states:** E-UNAVAILABLE (index failed to load) → category browsing remains (SC-06.2) and the user is told search is unavailable.
- **Empty states:** EM-2: no results → related categories and SC-06.3, with the query repeated.
- **Reuse potential:** Global quick find pattern (Phase 3 §9).
- **Technical notes:** Index generated at build from the content source; no server request per query. Analytics `help.search.performed` with result count and no query text (NFR-PRIV-3); `help.search.no_results_returned`.

#### SC-06.2 — Category browsing
- **Purpose:** Let users explore help by topic.
- **Responsibilities:** Enumerate categories (Phase 3 §6) and their articles; signed-in users get articles relevant to their role.
- **Data requirements:** Static content; role from session (server) for the role-relevant set.
- **Interaction model:** The user opens a category to see its articles or opens an article directly; signed-in users also reach the role-relevant set; every destination is a plain navigation that preserves browser history.
- **Device needs:** DV-PHONE and DV-DESK: browse by topic. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** Categories as a navigation landmark with a label ("Help categories"); article counts as text.
- **Loading states:** Statically generated; no LS class applies. The signed-in role-relevant set streams with LS-1.
- **Error states:** Static content cannot fail at runtime; if the role-relevant set fails (E-SERVER), it is omitted and the full category set remains.
- **Empty states:** EM-5: categories are defined at build time and always present.
- **Reuse potential:** SC-07.3.
- **Technical notes:** Static generation; the role-relevant set is a small dynamic island keyed by role so the category pages stay cacheable. Analytics `help.category.opened` with category key.

#### SC-06.3 — Escalation to support
- **Purpose:** Offer a human route when self-service fails.
- **Responsibilities:** Route to PG-08 carrying the search query as context; state support hours (OPS-1).
- **Data requirements:** The current `?q=` query and the originating article slug where present; no fetch.
- **Interaction model:** Navigation to PG-08 with the query and origin as context parameters; the context prefills the ticket and remains editable there; nothing is submitted from this section.
- **Device needs:** DV-PHONE: reach a person in one step after a failed search. DV-DESK: the same. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** Named link ("Contact support about this"); support hours as text.
- **Loading states:** No data to load; no LS class applies.
- **Error states:** No request is made; failures belong to PG-08.
- **Empty states:** EM-5: always offered.
- **Reuse potential:** SC-07.2, SC-54.1.
- **Technical notes:** Context passed as URL parameters (length-limited). Analytics `help.escalation.followed` (ticket deflection measure).

### PG-07 — Help Article

#### SC-07.1 — Article
- **Purpose:** Answer one question completely.
- **Responsibilities:** Present the article body with its last-updated date and category trail.
- **Data requirements:** Static article by slug (body, category, last-updated date, related slugs) from the in-repo content source (PG-06 note).
- **Interaction model:** Reading; in-article anchors move to sections and update the URL fragment so a step can be shared; linked terms open their explanation (IC-56).
- **Device needs:** DV-PHONE: follow steps while doing the task in another app. DV-DESK: the same in another tab. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** Proper heading structure; step lists as ordered lists; last-updated date as text; in-article anchors move focus to their target (WCAG 2.4.3).
- **Loading states:** Statically generated; no LS class applies.
- **Error states:** E-NOT-FOUND: unknown slug → PG-53 with help search.
- **Empty states:** EM-5: every published slug has a body.
- **Reuse potential:** PG-09 document rendering.
- **Technical notes:** `generateStaticParams`; Article and BreadcrumbList structured data. Analytics `help.article.viewed` with slug.

#### SC-07.2 — Helpfulness feedback
- **Purpose:** Learn whether the article solved the problem.
- **Responsibilities:** Record yes or no with an optional reason code (no free text, NFR-PRIV-2); route "no" to SC-06.3.
- **Data requirements:** `use-article-feedback(slug)` → accepts the helpful flag and an optional reason code, returns acceptance only; no identity is required.
- **Interaction model:** Single choice (IC-09), then an optional reason code (IC-09); one submission per session.
- **Device needs:** DV-PHONE and DV-DESK: answer in one action after reading. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** The choice is a labelled group; result announced politely (IC-14); focus stays on the section's confirmation.
- **Loading states:** LS-5: submission pending, the choice locked against duplicates (G-6) while the article stays readable.
- **Error states:** E-SERVER, E-TIMEOUT, E-RATE-LIMIT → the user is told the feedback was not recorded, with a retry offer; reading is unaffected.
- **Empty states:** EM-5: the choice always renders.
- **Reuse potential:** Deliberately single-use: feedback is specific to help content.
- **Technical notes:** Fire-and-forget mutation; one per session held in session storage. No free text is collected; `help.feedback.submitted` carries the yes or no value and the reason code.

#### SC-07.3 — Related help
- **Purpose:** Offer the next likely question.
- **Responsibilities:** Enumerate related articles defined in content metadata.
- **Data requirements:** Static related-article slugs and titles from the article's front matter, resolved at build.
- **Interaction model:** Navigation to a related article; no other action.
- **Device needs:** DV-PHONE and DV-DESK: continue to the next likely answer. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** Labelled list ("Related help"); link names are article titles.
- **Loading states:** Statically generated; no LS class applies.
- **Error states:** Static content cannot fail at runtime.
- **Empty states:** EM-5: none defined → absent; the section renders only when front matter lists related articles.
- **Reuse potential:** SC-06.2.
- **Technical notes:** From article front matter, validated at build so a related slug that does not exist fails the build rather than rendering a dead link. No analytics beyond `help.article.viewed` on the destination.

### PG-08 — Contact Support

#### SC-08.1 — Ticket creation
- **Purpose:** Open a ticket with the right context once.
- **Responsibilities:** Capture category, subject, description, urgency, optional load reference and attachments; prefill context from the URL; persist the draft; return the ticket reference and expected response time (OPS-2).
- **Data requirements:** Ticket categories enum; `use-create-ticket`; draft via SH-13 persistence.
- **Interaction model:** Single-step entry (not a multi-step flow); submit through a Server Action; attachments via IC-24; validation on submit per IC-02; success is SU-1 with the `TKT-` reference.
- **Device needs:** DV-PHONE: report with a photo from the road. DV-DESK: detailed reports with several attachments. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** Errors per IC-02; confirmation announced with the reference; urgency choice is a labelled group with its response target in text.
- **Loading states:** LS-5: submission pending; attachments show per-file progress (SH-03 behaviour).
- **Error states:** E-SERVER, E-TIMEOUT → draft retained with retry. E-VALIDATION → per field. E-RATE-LIMIT (anonymous, SEC-10) → the wait. E-OFFLINE → draft kept, "Sending needs a connection".
- **Empty states:** EM-5: the entry form always renders.
- **Reuse potential:** Support contexts from PG-54, PG-06.
- **Technical notes:** Anonymous submissions require an email and are rate-limited by the backend; idempotency key from `lib/utils/reference-id.ts`. Audit `ticket.created`; analytics `support.ticket.created` with category and urgency enums. Descriptions are Confidential free text (NFR-PRIV-3).

#### SC-08.2 — Ticket history
- Instance of **SH-05** over the user's tickets. Overrides: signed-in only; filters by status only; each ticket opens its conversation (SH-04). Data from `use-tickets({ status, cursor })` scoped to the requesting user; E-AUTH on history → history withheld while the ticket form stays usable (no redirect); EM-1 "No tickets yet" with what to do when something goes wrong; no bulk actions or export.

### PG-09 — Legal

#### SC-09.1 — Legal document
- **Purpose:** Publish one legal document with its version.
- **Responsibilities:** Present the document text, version, effective date and change summary; offer a printable form; list sub-processors where the document is the privacy policy (NFR-PRIV-7).
- **Data requirements:** Static content by document key (terms of service, privacy policy, carrier agreement, shipper terms) with version, effective date and change summary.
- **Interaction model:** Reading; in-document anchors update the URL fragment so a clause can be cited; printing uses the browser's print function with the full text and version.
- **Device needs:** DV-PHONE and DV-DESK: read the full text; printable. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** Heading structure; print output keeps reading order; version and effective date as text.
- **Loading states:** Statically generated; no LS class applies.
- **Error states:** E-NOT-FOUND: unknown document → PG-53.
- **Empty states:** EM-5: every published document key has a body.
- **Reuse potential:** SC-07.1 rendering; consent references in SC-11.2 and SC-17.4.
- **Technical notes:** Version identifier exported as a constant and recorded with every consent (BR-04, CMP-4). Analytics `legal.document.viewed`.

---

## 4. Access Pages

### PG-10 — Sign In

#### SC-10.1 — Credential entry
- **Purpose:** Authenticate a returning user.
- **Responsibilities:** Accept email and password, submit, hand off to MFA when enrolled, redirect to the validated return path or role root; hand members of SSO-required organisations to their identity provider after the email is entered, keeping password entry only for the designated break-glass admin (BR-24).
- **Data requirements:** `use-sign-in-flow` (sequences the email and password steps over `use-login`); `app/api/session`; the `next` return path read on the server and validated by `lib/utils/internal-path.ts`.
- **Interaction model:** Identity-first: the email is taken first (IC-01) and the identity policy resolved (SC-10.3) before any password is asked for (IC-03); IC-11 submit; Enter submits; double submission prevented; validation on submit only (IC-02: submit never disabled for invalid state); on success, SU-2 to the return path, role root or PG-14 MFA challenge.
- **Device needs:** DV-PHONE: password manager and passkey autofill with one hand. DV-DESK: the same, keyboard only. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** `autocomplete="username"` and `"current-password"`; error announced assertively and linked to the form; focus moves to the error summary (IC-02); the lockout cooldown is text with the time remaining (IC-46), not announced every second.
- **Loading states:** LS-5: pending submission announced ("Signing in…"), the submit action busy (G-6); LS-4 after 30 s becomes E-TIMEOUT with entries kept.
- **Error states:** `INVALID_CREDENTIALS` (generic; E-VALIDATION without revealing which field or whether the account exists); locked with cooldown (E-RATE-LIMIT, SEC-10) stating when to try again and the PG-12 route; E-OFFLINE, E-SERVER or E-TIMEOUT → network retry (IC-60) with the email kept and the password cleared; E-FORBIDDEN: address outside the organisation's IP allow-list → the reason and to contact the organisation's security admin; SSO required → the identity provider route instead of an error.
- **Empty states:** EM-5: the entry form always renders.
- **Reuse potential:** Deliberately single-use: password entry happens only on PG-10; re-authentication inside the workspace is IC-13, and SSO members leave through SC-10.3.
- **Technical notes:** Credentials are submitted only through `use-login` (wrapped by `use-sign-in-flow`): one sign-in submission path, never forked. Session cookie rotated on sign-in (SEC-3). Audit `session.signed_in` and `session.sign_in_failed` (server, with IP and user agent). Analytics `auth.sign_in.succeeded` and `auth.sign_in.failed` with method enum and failure class only. Credentials are Restricted (NFR-PRIV-1) and never persisted client-side.

#### SC-10.2 — Recovery routes
- **Purpose:** Get users who cannot sign in to the right recovery.
- **Responsibilities:** Route to PG-12 (forgot password), PG-11 (no account), PG-08 (other trouble); state support hours for sign-in problems (OPS-1, urgent target ≤ 15 min, OPS-2).
- **Data requirements:** Route constants only; no fetch.
- **Interaction model:** Navigation to the chosen recovery page; no entry is carried over except the typed email to PG-12, passed in memory, never in the URL.
- **Device needs:** DV-PHONE and DV-DESK: reach recovery in one step. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** Named links stating the destination ("Reset your password", "Create an account", "Get help signing in"); grouped as a labelled navigation region in reading order after the credential entry.
- **Loading states:** No data to load; no LS class applies.
- **Error states:** No request is made; failures belong to the destination page.
- **Empty states:** EM-5: always rendered, because every signed-out user needs a recovery route.
- **Reuse potential:** PG-14 recovery.
- **Technical notes:** Routes from constants (`LOGIN_ROUTE` family). Analytics `auth.recovery.followed` with destination enum. No audit event.

#### SC-10.3 — SSO sign-in routing
- **Purpose:** Send members of SSO organisations to their identity provider (BR-24, XS-13).
- **Responsibilities:** Detect a verified email domain after the email is entered; route to the organisation's identity provider; honour enforcement by withholding password entry for enforced domains, except for the break-glass admin; return to the validated `next` path after the identity-provider round trip.
- **Data requirements:** `useSsoDiscovery(email)` in `use-auth-recovery.ts` → `{ ssoRequired, providerName, startUrl }`; never reveals whether the email itself has an account.
- **Interaction model:** The user enters an email (IC-01) and continues. If SSO applies, the user is told which provider they will be sent to and continues there. Otherwise password entry follows (SC-10.1). A "use a different account" route resets the step.
- **Device needs:** DV-DESK and DV-PHONE: identical journey, with the identity provider opened in the same tab. DV-AT: provider name announced before redirect.
- **Accessibility requirements:** Redirect is never automatic without a user action (WCAG 3.2.2); the destination is named in the action's accessible name.
- **Loading states:** LS-5 while discovering (≤ 1 s typical); LS-4 after 15 s becomes E-TIMEOUT.
- **Error states:**
  - E-UNAVAILABLE: identity provider unreachable; the break-glass route is named for admins only, and support is named for others.
  - Returned assertion failure: the failing step in plain words plus the correlation ID as support reference (assertion details go to PG-60 diagnostics, never to the user).
  - E-RATE-LIMIT: discovery throttled per IP.
- **Empty states:** EM-5: part of a form; always has input.
- **Reuse potential:** PG-15 (invitation acceptance for SSO organisations) and PG-14 (step-up).
- **Technical notes:** Discovery responses are identical in timing and shape for unknown and password-only domains to prevent enumeration (SEC-10). Audit: `session.created` with identity provider ID. Analytics: `auth.sso.redirected`, `auth.sso.completed`.

### PG-11 — Register

#### SC-11.1 — Side selection
- **Purpose:** Establish whether the user ships or hauls.
- **Responsibilities:** Record the side; accept preselection from `?side=`; state in plain words what each side means ("I ship freight", "I haul freight").
- **Data requirements:** Side enum (shared with SC-01.1); consent document keys per side from constants.
- **Interaction model:** IC-09 single choice; the choice changes which consent documents apply (shipper terms or carrier agreement) and is validated on submit with SC-11.2; changing side keeps every other entry.
- **Device needs:** DV-PHONE: choose with one thumb. DV-DESK: choose by keyboard. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** Group labelled with the question; a preselected side from the URL is exposed as checked, not only implied; the consent change is announced politely (IC-14).
- **Loading states:** No data to load; no LS class applies.
- **Error states:** E-VALIDATION: not chosen → error per IC-02, focus to the group.
- **Empty states:** EM-5: both options always render.
- **Reuse potential:** Deliberately single-use: side is chosen once per account and never changed afterwards.
- **Technical notes:** Side stored in the register request; drives onboarding route (PG-16 or PG-17). Unknown `?side=` values are ignored. Analytics `auth.side.selected` with side enum and whether it was preselected.

#### SC-11.2 — Account creation
- **Purpose:** Create the account with valid consent.
- **Responsibilities:** Capture name, work email, password, consent to the current terms version; submit; start email verification.
- **Data requirements:** `use-register`, `app/api/register`; schema composed over the contract register DTO; current terms version `TERMS_VERSION` from constants.
- **Interaction model:** IC-01, IC-03 with policy feedback, IC-38 consent; submit via IC-11; all fields validated on submit with server re-validation (G-7); success is SU-2 to PG-14.
- **Device needs:** DV-PHONE: complete one-handed with autofill. DV-DESK: complete by keyboard. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** Password rules stated before entry; `autocomplete="name"`, `"email"` and `"new-password"`; consent links open the document without losing entries; errors per IC-02 with focus to the summary.
- **Loading states:** LS-5: pending announced ("Creating your account…"), the submit action busy (G-6).
- **Error states:** E-CONFLICT: email exists → sign-in and reset routes; `SESSION_UNAVAILABLE` → sign-in route (the account exists; only the session failed). E-VALIDATION: password short of policy or breached (SEC-1), missing consent. E-RATE-LIMIT: bot protection (SEC-10) with the wait. E-FORBIDDEN: the email's domain requires SSO → route to the identity provider (BR-24). E-SERVER → retry with entries kept except the password.
- **Empty states:** EM-5: the entry form always renders.
- **Reuse potential:** SC-15.1 (new-user acceptance).
- **Technical notes:** `PASSWORD_MIN_LENGTH` from constants; terms version recorded (BR-04, CMP-4). Audit `account.registered`, `consent.recorded`; analytics `auth.account.registered` with side enum (acquisition, BG-01). Name and email are Confidential and never sent to analytics (NFR-PRIV-3).

### PG-12 — Forgot Password

#### SC-12.1 — Reset request
- **Purpose:** Send a reset link.
- **Responsibilities:** Accept an email; submit; confirm identically whether or not the account exists; state that the link expires in 30 minutes and where to look for it; route members of SSO-required organisations to their identity provider in the same confirmation wording, without confirming membership (BR-24).
- **Data requirements:** `use-request-password-reset` (Server Action in `use-auth-recovery.ts`); email schema composed over the contract reset DTO; no data returned beyond acceptance.
- **Interaction model:** IC-01 email entry, IC-11 submit; the email format is validated on submit; on acceptance the entry is replaced in place by the confirmation (SU-1) with a route back to PG-10; resubmitting is allowed after the rate-limit wait.
- **Device needs:** DV-PHONE: request a link and open it in the same browser from the mail app. DV-DESK: the same. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** `autocomplete="email"`; errors per IC-02 with focus to the summary; the confirmation is announced politely (IC-14) and receives focus (SSB-6); the 30-minute expiry is stated as text.
- **Loading states:** LS-5: pending announced ("Sending link…"), the submit action busy (G-6); LS-4 after 30 s becomes E-TIMEOUT.
- **Error states:** E-RATE-LIMIT (per IP and per account, SEC-10) → the wait time from `Retry-After`, submit re-enabled after it. E-VALIDATION → malformed email, per IC-02. E-SERVER or E-TIMEOUT → retry (IC-60) with the entered email kept. A non-existent account is never an error (no enumeration).
- **Empty states:** EM-5: the section is a single entry form and always renders.
- **Reuse potential:** Deliberately single-use: password recovery is the only unauthenticated request of this kind; the enumeration-safe confirmation wording is shared with PG-15 resend through constants.
- **Technical notes:** No account enumeration: identical response body and comparable latency for existing and unknown emails. Audit `password_reset.requested` (server, recorded only for existing accounts); analytics `auth.reset.requested` without the email (NFR-PRIV-3). The email is Confidential and never logged.

### PG-13 — Reset Password

#### SC-13.1 — New password
- **Purpose:** Set a new password from a valid token.
- **Responsibilities:** Validate the token server-side; accept and confirm the new password against the policy (SEC-1: `PASSWORD_MIN_LENGTH`, breached-password check, no composition rules); revoke other sessions; state that other devices will be signed out.
- **Data requirements:** `use-reset-password(token)`; token validity resolved on the server before render; password schema composed over the contract DTO.
- **Interaction model:** IC-03 for new password and confirmation with policy feedback while typing; IC-11 submit validates match and policy; success (SU-2) signs the user in or sends them to PG-10 with the outcome announced there.
- **Device needs:** DV-PHONE: complete from the email link with a password manager suggestion. DV-DESK: the same. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** Policy stated before entry; `autocomplete="new-password"`; mismatch and breached-password results explained per IC-02; show-password control per IC-03 announces its state.
- **Loading states:** Token check before render on the server (no client LS state); LS-5 on submit with the action busy (G-6).
- **Error states:** E-NOT-FOUND (token invalid, used or expired after 30 minutes) → say so and link to PG-12 (Phase 3 §14). E-VALIDATION → mismatch, short of policy or breached, per field. E-RATE-LIMIT → the wait. E-SERVER → retry with entries kept in memory only.
- **Empty states:** EM-5: the section renders only when the token is valid; otherwise the expired state replaces it.
- **Reuse potential:** SC-47.1 password change (same policy feedback and schema).
- **Technical notes:** Token read from URL on the server only and never stored client-side beyond the request. Audit `password.reset` and `session.revoked_all`; organisation admins notified for sensitive roles (Phase 4 §2.8). Analytics `auth.password.reset`. Passwords are Restricted and never enter drafts, logs or analytics (NFR-PRIV-1).

### PG-14 — Verify

#### SC-14.1 — Email verification
- **Purpose:** Confirm the user owns the email.
- **Responsibilities:** Consume a verification link; allow resending; report status (verified, pending, expired); continue verified users to onboarding (PG-16, PG-17) or role root.
- **Data requirements:** `use-verify-email(token)`, `use-resend-verification`; resend cooldown `VERIFICATION_RESEND_COOLDOWN_S` from constants; partially authenticated session.
- **Interaction model:** Verification runs automatically when the link is opened; the resend action is available only after the cooldown, with the remaining wait stated (IC-46); success is SU-2 to the next step.
- **Device needs:** DV-PHONE: open the link from the mail app and continue. DV-DESK: the same. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** Status announced politely (IC-14) and held in the page's main heading text; the cooldown is text, not a per-second announcement (IC-46); resend result announced.
- **Loading states:** LS-5: "Verifying your email…" announced after 1 s; LS-5 on resend with the action busy.
- **Error states:** E-NOT-FOUND (expired or used link) → resend route. E-RATE-LIMIT → cooldown with the wait. E-CONFLICT → already verified; continue. E-SERVER → retry (IC-60).
- **Empty states:** EM-5: the section always renders a verification status.
- **Reuse potential:** Email change (SC-46.2).
- **Technical notes:** Cooldown from constants; resend limited per account (SEC-10). Audit `email.verified`, `email_verification.resent`; analytics `auth.email.verified` with time since registration.

#### SC-14.2 — MFA challenge
- **Purpose:** Complete a second factor.
- **Responsibilities:** Accept a one-time code, passkey assertion or backup code (SEC-1); report remaining attempts; state what to do if the user cannot access their factor (PG-08).
- **Data requirements:** `use-mfa-challenge`; enrolled method and attempts remaining from the partial session.
- **Interaction model:** IC-04 one-time code input; auto-submit when complete; the user can switch to a backup code; each wrong code states remaining attempts.
- **Device needs:** DV-PHONE: autofill of codes from the authenticator app, or a passkey (SEC-1). DV-DESK: typing or pasting a code. DV-AT: full parity with DV-DESK, including auto-submit that never moves focus unexpectedly.
- **Accessibility requirements:** `autocomplete="one-time-code"`; errors announced assertively with attempts remaining; switching to backup code moves focus to its entry (IC-04).
- **Loading states:** LS-5: pending while the code is checked, entry locked (G-6).
- **Error states:** E-VALIDATION: wrong code with attempts remaining. E-RATE-LIMIT: too many attempts → cooldown with the wait. E-AUTH: partial session expired → back to PG-10 with the return path.
- **Empty states:** EM-5: the challenge always renders for a partial session.
- **Reuse potential:** Re-authentication (IC-13).
- **Technical notes:** Partial session cookie distinct from `SESSION_COOKIE`; full session issued and rotated on success (SEC-3). Audit `mfa.challenge_passed`, `mfa.challenge_failed`, `mfa.backup_code_used`; analytics `auth.mfa.verified` with method enum. Codes are Restricted.

### PG-15 — Accept Invitation

#### SC-15.1 — Invitation acceptance
- **Purpose:** Join an organisation.
- **Responsibilities:** State organisation, inviter and role; accept for an existing account (sign in) or create credentials for a new one; explain the one-organisation rule when the email belongs elsewhere.
- **Data requirements:** `use-invitation(token)`, `use-accept-invitation`; account existence for the invited email resolved server-side.
- **Interaction model:** Single decision; new users set a password (IC-03) and consent (IC-38), except in an SSO-required organisation, where acceptance completes through the identity provider and no Haulr password is set (BR-24); existing users sign in to accept; success (SU-2) continues drivers to SC-15.2 and others to their role root.
- **Device needs:** DV-PHONE: drivers accept from SMS and finish within a minute. DV-DESK: office staff accept from email. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** Organisation and role in the page's main heading text; password rules stated before entry; errors per IC-02.
- **Loading states:** Token validated server-side before render; LS-5 on accept with the action busy (G-6).
- **Error states:** Expired, revoked or other-organisation invitations are explained: E-NOT-FOUND: expired or revoked token → say so and whom to ask (the inviter). E-CONFLICT: email already in another organisation → explain the one-organisation rule; invitation already accepted → route to sign-in. E-VALIDATION → password policy. E-FORBIDDEN: SSO required → route to the identity provider. E-RATE-LIMIT (SEC-10) → the wait.
- **Empty states:** EM-5: the section renders only for a resolvable token; other cases are error states.
- **Reuse potential:** SC-11.2 credential creation.
- **Technical notes:** Token single-use. Audit `invitation.accepted`, `member.joined`; analytics `team.invitation.accepted` with role enum and time since invitation (driver activation, XF-05).

#### SC-15.2 — Driver location consent
- **Purpose:** Obtain informed location consent from drivers (Phase 1 §12).
- **Responsibilities:** Explain when location is collected (active assigned trips only) and why; request browser permission; record consent; state that consent can be withdrawn later (SC-39.5).
- **Data requirements:** `use-location-consent`; consent text version `LOCATION_CONSENT_VERSION` from constants.
- **Interaction model:** IC-38 consent then the browser permission prompt; declining is allowed and recorded; the browser prompt is requested only after the explanation is acknowledged.
- **Device needs:** DV-CAB and DV-PHONE: read and decide in seconds with gloves (targets per G-2, 44 × 44); the decision never blocks joining the organisation. DV-DESK: not expected for drivers but supported. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** Explanation available before the browser prompt, as a labelled region with its own heading; consent follows IC-38 and states in its label exactly what is agreed; declining is an equally available named action; the decision result is announced politely (IC-14) and focus moves to the next step (SSB-6).
- **Loading states:** LS-5 while consent is recorded; the browser permission prompt is requested only once the decision is recorded or queued.
- **Error states:** Permission blocked at browser level → how to enable it in this browser, and that the trip will rely on ELD or check calls meanwhile. E-OFFLINE → the decision is queued and replayed in order (PP-06). E-SERVER or E-TIMEOUT → retry (IC-60) with the decision kept.
- **Empty states:** EM-5: the explanation always renders for drivers without a recorded decision.
- **Reuse potential:** SC-20.3, SC-39.5.
- **Technical notes:** Consent version recorded with time and device; location is never sampled before consent and only while a trip is active and assigned (Phase 1 §12). Audit `location_consent.granted`, `location_consent.declined`; analytics `driver.location_consent.decided` with the decision enum. Driver location is Restricted (NFR-PRIV-1) and sensitive personal data under CMP-7.

---

## 5. Onboarding

### PG-16 — Shipper Onboarding

#### SC-16.1 — Onboarding progression
- Instance of **SH-13** with steps: company, billing and credit, team and facilities. Overrides: each completed step saves to the server; posting remains blocked until billing is complete. The server draft comes from `use-onboarding()` (step mutation per step, carrying the draft version for SSB-8) and is restored on any device, with the local draft only bridging unsaved entries; access is `shipper.admin` of the organisation being onboarded, and other roles reach PG-18 with SH-06 stating that setup is incomplete; the team and facilities step may be skipped, and quoting (XF-01) is allowed before completion (PG-16). Audit `onboarding.step_saved` per step; analytics `onboarding.shipper.step_completed` with step index and duration.

#### SC-16.2 — Company and shipping profile
- **Purpose:** Capture who the shipper is and how they ship.
- **Responsibilities:** Record legal name, address, tax ID, typical lanes, monthly volume band, equipment needs; screen the organisation for sanctions on submission (CMP-11) without exposing the result to the user beyond a review state.
- **Data requirements:** `use-onboarding` step mutation; organisation schema composed over the organisation DTO; equipment and volume band vocabularies from `lib/enums/` and constants.
- **Interaction model:** IC-01, IC-05, IC-07; save on continue; each field validated on continue with IC-02; the address resolves through IC-05 with free text accepted when suggestions fail.
- **Device needs:** DV-DESK mainly, with tax documents at hand; resumable on DV-PHONE from the server draft. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** IC-02 error summary with links to fields; the tax ID format stated before entry; the volume band is a labelled group with bands in words.
- **Loading states:** Restoring announced once (SH-13); LS-5 while the step saves, the continue action busy (G-6).
- **Error states:** E-VALIDATION per field (tax ID format, address unresolved). E-PRECONDITION: the step was saved on another device → IC-67 with both versions. E-SERVER or E-TIMEOUT → retry with entries kept in the draft. E-UNAVAILABLE (address suggestions) → free text.
- **Empty states:** EM-5: the step always renders its entries, prefilled from any saved draft.
- **Reuse potential:** SC-48.1.
- **Technical notes:** Schema composed over the organisation DTO. The tax ID is Restricted (NFR-PRIV-1): never held in the local draft and masked after save. Audit `organization.profile_updated`; analytics `onboarding.shipper.profile_saved` with volume band and equipment enums.

#### SC-16.3 — Billing and credit
- **Purpose:** Decide how the shipper pays.
- **Responsibilities:** Capture billing contacts; submit a credit application or set up prepay; report the decision with the approved terms (default net 30, BR-14) or the reason for decline; capture ACH debit authorisation where chosen (CMP-6).
- **Data requirements:** `use-credit-application`, `use-payment-methods`; processor hosted fields for cardholder and bank data (CMP-5); decision status polled while the user remains.
- **Interaction model:** Choice between terms and prepay (IC-09); processor entry via IC-42; submitting the credit application is confirmed with a summary of what will be checked; the user may continue other steps while a decision is pending.
- **Device needs:** DV-DESK: complete with company finance details. DV-PHONE: can check the decision and switch to prepay. DV-AT: full parity with DV-DESK, including the hosted fields.
- **Accessibility requirements:** Decision announced politely (IC-14) and stated as text with terms or reason; the hosted payment entry is labelled and its errors are surfaced in the IC-02 summary (IC-42).
- **Loading states:** LS-7: credit decision pending (may take minutes; the user may continue, and the decision arrives by notification, XS-03); LS-5 while the payment method is saved.
- **Error states:** Declined → prepay route without loss (a result, not an error). E-VALIDATION → hosted-field errors per IC-42. E-UNAVAILABLE (credit provider or processor) → state which is affected and that prepay or a later retry is possible. E-SERVER → retry with non-sensitive entries kept.
- **Empty states:** EM-5: the step always renders the two payment options.
- **Reuse potential:** SC-49.2, SC-49.3.
- **Technical notes:** Credit decision arrives by notification if not immediate; processor SDK loaded only here (Phase 7 §17). Cardholder and bank data never touch Haulr systems (A6, CMP-5). Audit `credit_application.submitted`, `payment_method.added` (Sensitive, admins notified); analytics `onboarding.shipper.billing_chosen` with the option enum.

#### SC-16.4 — Team and facilities
- **Purpose:** Bring colleagues and facilities in.
- **Responsibilities:** Invite members with roles; add facilities; allow skipping; state that both can be done later from PG-48 and PG-32.
- **Data requirements:** `use-invitations`, `use-facilities`; role vocabulary from `lib/enums/role-key.ts`.
- **Interaction model:** IC-39 invite; facility entry reuses SC-32.2 behaviour; each invitation and facility is saved on entry; "skip" completes the step without data.
- **Device needs:** DV-DESK: invite several colleagues in a row. DV-PHONE: add one facility or colleague. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** Each added item announced politely (IC-14, "Invitation sent to a colleague as shipper.member"); errors per invite follow IC-02 and keep the other entries.
- **Loading states:** LS-5 per mutation, only the triggering entry busy.
- **Error states:** Per invite: E-CONFLICT (email already a member here or in another organisation) → explained; E-VALIDATION (email format, role missing); E-RATE-LIMIT on invitations (SEC-10) → the wait. Facility errors per SC-32.2.
- **Empty states:** EM-1: skippable; with nothing added, state that colleagues and facilities can be added later and why they help (faster posting, shared visibility).
- **Reuse potential:** SC-48.3, SC-32.2.
- **Technical notes:** Same mutations as their home pages; query keys `memberKeys.invitations()` and `facilityKeys.list()`. Audit `invitation.sent`, `facility.created`; analytics `onboarding.shipper.team_invited` with count.

### PG-17 — Carrier Onboarding

#### SC-17.1 — Onboarding progression
- Instance of **SH-13** with steps: authority, company and capability, documents and agreement, payout, review. Overrides: resumable across devices from the server draft. The draft comes from `use-onboarding()` with a version per step (SSB-8, IC-67 on conflict); access is `carrier.admin` only, and dispatchers see PG-19 with SH-06 stating that approval is pending; uploads persist before submission, the review step (SC-17.6) replaces progression once submitted, and every step works on DV-PHONE because carriers often onboard from the cab. Audit `onboarding.step_saved`; analytics `onboarding.carrier.step_completed` (activation, BG-04).

#### SC-17.2 — Authority lookup
- **Purpose:** Establish the carrier's operating authority.
- **Responsibilities:** Accept USDOT and MC numbers; fetch the registry record; confirm the match with the user; allow manual entry for review if the lookup is unavailable; explain why booking is not possible when authority is inactive (BR-03).
- **Data requirements:** `use-authority-lookup({ usdot, mc })` → legal name, address, authority status and type, registry date.
- **Interaction model:** IC-01 numeric entry; lookup on submit; user confirms "this is my company"; declining the match returns to entry; the manual path records the numbers for compliance review.
- **Device needs:** DV-PHONE and DV-DESK: enter two numbers and confirm. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** Lookup result announced politely (IC-14) with the legal name; numeric entry uses `inputmode="numeric"` with format stated; confirmation is a named action.
- **Loading states:** Lookup pending announced (LS-5, after 1 s); LS-3 after 5 s offers the manual path.
- **Error states:** E-VALIDATION: USDOT or MC format → the expected format stated; E-NOT-FOUND (not found) → check the numbers or use the manual path; inactive authority → explanation (a result, not an error); E-UNAVAILABLE (source down, NFR-AV-4) → manual path; E-CONFLICT → authority already registered to another Haulr organisation, route to PG-08; E-RATE-LIMIT → the wait.
- **Empty states:** EM-5: the entry always renders.
- **Reuse potential:** SC-51.1.
- **Technical notes:** Registry calls made by the backend only. USDOT and MC are Public. Audit `authority.looked_up`, `authority.confirmed`; analytics `compliance.authority.looked_up` with outcome enum.

#### SC-17.3 — Company and capability
- **Purpose:** Record what the carrier can haul and where.
- **Responsibilities:** Capture contacts, fleet size, equipment types, preferred lanes and regions.
- **Data requirements:** `use-onboarding`; equipment enum; region vocabulary from constants.
- **Interaction model:** IC-07 multi-select for equipment; IC-05 for lanes; saved on continue with IC-02 validation.
- **Device needs:** DV-PHONE: owner-operators pick equipment and home regions in a few selections. DV-DESK: fleet carriers enter many lanes by keyboard. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** IC-02 summary; multi-select announces the selected count (IC-07); lanes are a labelled list with a named remove action per lane.
- **Loading states:** LS-5 per save, continue action busy.
- **Error states:** E-VALIDATION: at least one equipment type, contacts format. E-PRECONDITION → IC-67. E-SERVER → retry with entries kept.
- **Empty states:** EM-5: the step always renders its entries.
- **Reuse potential:** SC-48.1.
- **Technical notes:** Lanes feed recommendations (SC-19.3). Contacts are Confidential. Audit `organization.capability_updated`; analytics `onboarding.carrier.capability_saved` with equipment enums and lane count.

#### SC-17.4 — Compliance documents and agreement
- **Purpose:** Collect insurance, W-9 and the signed carrier agreement.
- **Responsibilities:** Accept uploads or insurer-linked verification; report each document's check result; capture the agreement signature with consent to electronic records (CMP-4); collect the W-9 for tax reporting (CMP-10).
- **Data requirements:** `use-document-upload`, `use-sign-agreement`; required document set and insurance minimums from the server; agreement version `CARRIER_AGREEMENT_VERSION`.
- **Interaction model:** Instance of SH-03 behaviour for uploads; IC-26 e-signature; each upload is checked asynchronously and its result appears when ready; signing is available once the agreement has been presented in full.
- **Device needs:** DV-PHONE: photograph certificates (IC-25). DV-DESK: upload scans. DV-AT: full parity with DV-DESK, including e-signature by keyboard.
- **Accessibility requirements:** Check results in text ("Insurance accepted, expires 3 March 2027"); outstanding documents listed as text; e-signature per IC-26 states signer intent in words.
- **Loading states:** Per upload: LS-5 with progress; LS-7 for the document check, which may complete after the user moves on.
- **Error states:** Rejected with reason and re-upload (E-VALIDATION: unreadable, expired, short of the minimums, failed scan). E-VALIDATION: agreement consent missing. E-OFFLINE during upload → uploads persisted and resumed on reconnect (overrides SH-03). E-UNAVAILABLE (insurer link or e-signature provider) → upload path or retry later. E-SERVER → retry, uploaded files kept.
- **Empty states:** EM-1: required documents listed as outstanding with why each is needed.
- **Reuse potential:** SC-43.2.
- **Technical notes:** Agreement version from constants. W-9 tax IDs are Restricted (NFR-PRIV-1). Audit `document.uploaded`, `agreement.signed` (with version, IP and time, BR-04); analytics `onboarding.carrier.documents_completed`.

#### SC-17.5 — Payout setup
- Instance of **SC-49.2** behaviour for payout methods, embedded in onboarding. Uses `use-payment-methods` with processor hosted fields (IC-42, CMP-5) and sanctions screening of the payee (CMP-11); `carrier.admin` only, entering a payout method is Sensitive (Phase 4 §2.8), so it requires re-authentication within 10 minutes (IC-13), notifies organisation admins and emits the audit event `payout_method.added`; EM-1 states that payout details are needed before any settlement can be paid; view-as can never write here (BR-27).

#### SC-17.6 — Review status
- **Purpose:** Tell the carrier where they stand.
- **Responsibilities:** Report compliance status, outstanding items, reasons for any request or rejection, expected decision time; state that booking and bidding stay unavailable until approval (BR-03); route an approved carrier to PG-19.
- **Data requirements:** `use-compliance-status()` → status (compliance status enum from `lib/enums/compliance-status.ts`), outstanding items with fix routes, reasons, expected decision time and submission time.
- **Interaction model:** Follow a fix route to the relevant step; resubmit after fixing (IC-11), which confirms what is being resubmitted; status changes arrive by notification and on return to the page.
- **Device needs:** DV-PHONE: check status from a notification and fix one item. DV-DESK: the same with uploads from files. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** A labelled region; status and reasons as text (IC-59), never a visual-only cue; a status change seen while the page is open is announced politely (IC-14); expected decision time as absolute text.
- **Loading states:** LS-1 inside its own boundary; LS-2 on window focus (standing data is fresh ≤ 60 s, Phase 4 §2.6); LS-5 on resubmission.
- **Error states:** E-SERVER, E-UNAVAILABLE → retry (IC-60) with the last known status and its age. E-CONFLICT on resubmit → already under review; refresh and state since when. E-VALIDATION on resubmit → items still outstanding, each linked.
- **Empty states:** EM-5: a submitted carrier always has a status; the section replaces progression only after submission.
- **Reuse potential:** SH-06 standing data.
- **Technical notes:** Updates also arrive by notification (XS-03). Query key `complianceKeys.status()` shared with SH-06 so both update together. Audit `compliance.resubmitted`; analytics `onboarding.carrier.submitted` and `onboarding.carrier.approved` (time to approval). Rejection reasons are Internal and shown only to `carrier.admin`.

---

## 6. Role Dashboards

### PG-18 — Shipper Dashboard

#### SC-18.1 — Shipper attention
- Instance of **SH-07** for shipper roles. Item types: bid awaiting decision, approval awaiting the viewer as `shipper.approver` (with its deadline), the viewer's own request in `PendingApproval`, uncovered near pickup, late ETA, open exception, POD pending, accessorial approval, invoice due (finance), claim response due. Data from `use-attention-items({ role })` refreshed every 60 s and on focus; `shipper.finance` receives invoice-related items only, `shipper.admin` all, and `shipper.approver` additionally the approvals awaiting decision, never their own requests (PG-18, BR-23); bid acceptance runs through IC-28 and routes to approval when over the member's spend limit (BR-23); an approval already decided by another approver is E-CONFLICT naming who decided, an approval whose deadline passed (quote or bid expired, BR-06) states that it expired and offers the requester a re-quote, and an approval decision states the resulting load state (posted, bid accepted, or returned to `Draft`); EM-3 "Nothing needs you right now" with last check time, and EM-1 for a new organisation defers to SC-18.4. View-as (BR-27) reads the viewed member's items and cannot act without write consent.

#### SC-18.2 — Active load overview
- **Purpose:** Give a count of active loads by state and route into each.
- **Responsibilities:** Report counts per load state group (posted, booked, in transit, delivered awaiting POD) with late counts; route to PG-26 filtered; state when the counts were computed.
- **Data requirements:** `use-load-counts()` for the session's organisation; state groups mapped from `lib/enums/load-status.ts`; counts computed server-side, never summed from a collection.
- **Interaction model:** Each count navigates to the filtered collection (PG-26 with `status` from Phase 3 §10, and the late subset); no other action.
- **Device needs:** DV-DESK: triage many loads by state. DV-PHONE: read counts and jump to late loads. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** Counts with labels as text ("3 in transit, 1 late"); each count is a named link describing its destination; computed time as text; count changes on refresh announced politely only when a late count increases (IC-14).
- **Loading states:** LS-1 in its own boundary; LS-2 every 60 s and on focus (Phase 4 §2.6), stale label after 5 min; paused when hidden.
- **Error states:** E-SERVER, E-UNAVAILABLE, E-TIMEOUT → retry (IC-60) with last counts and their age (SSB-2). E-CONTRACT → counts withheld, never partially rendered.
- **Empty states:** EM-1: no active loads → SH-12 or quote route.
- **Reuse potential:** SC-19.2.
- **Technical notes:** Filter parameters from Phase 3 §10; query key `loadKeys.counts()`, stale time 60 s, invalidated by every load mutation. Read-only: no audit event. Analytics `dashboard.load_count.opened` with state group enum.

#### SC-18.3 — Service and spend
- Instance of **SH-08**: on-time pickup and delivery, tracking compliance, spend, average cost per mile, time to coverage. Finance role receives spend only. Data from `use-metrics({ scope: 'shipper', period })` with the period chosen through IC-17; spend and cost per mile are Confidential and absent (not zero) for roles that may not view shipper price; EM-4 until a delivered load exists; drilling in opens PG-26 or PG-30 filtered.

#### SC-18.4 — New organisation guidance
- Instance of **SH-12**. Tasks: get a quote, invite a colleague, add a facility (PG-18 empty state); data from `use-onboarding()`; offered to `shipper.admin` and `shipper.member`, not to `shipper.finance`; EM-5, absent once complete or dismissed.

#### SC-18.5 — Shipper account standing
- Instance of **SH-06**. Blockers relevant to shippers: onboarding incomplete, payment method missing or failed, credit limit reached; data from `use-account-standing()`; fix routes to PG-16 or PG-49 for roles that can act (`shipper.admin`, `shipper.finance` for payment), and a statement naming who can fix it for other roles; EM-5 absent without blockers.

### PG-19 — Carrier Dashboard

#### SC-19.1 — Carrier attention
- Instance of **SH-07** for carrier roles. Item types: needs assignment (with BR-09 deadline), tender awaiting response, counter-offer received, amendment awaiting response (BR-25, opens PG-64), exception on load, POD missing, document expiring. Data from `use-attention-items({ role })` every 60 s and on focus; assignment uses SH-15, tender responses use IC-28 with the exclusive window as a countdown (IC-46, BR-08); document-expiring items appear for `carrier.admin` only; EM-3 with last check time, and not-yet-approved carriers see SC-19.5 instead.

#### SC-19.2 — Active loads
- **Purpose:** Report the carrier's in-flight loads and their health.
- **Responsibilities:** Report active loads with next stop, tracking freshness and exceptions; route to PG-40; flag loads still needing a driver against the BR-09 deadline.
- **Data requirements:** `use-loads({ scope: 'carrier', status: active })`, cursor-paginated, page size 50 (maximum 200); server-shaped so carrier pay appears only for carrier roles (BR-05).
- **Interaction model:** Navigate to a load; assign via SH-15 where needed, without leaving the dashboard; the collection refreshes on the position cycle.
- **Device needs:** DV-PHONE: owner-operators check their one or two trucks. DV-DESK: dispatchers scan many trucks and assign in sequence. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** A labelled region; freshness as text ("Position 12 min ago", stale labelled per PP-03); each load named by reference and lane; exceptions and states as text (IC-59); the assignment deadline as text with a countdown within the last hour (IC-46).
- **Loading states:** LS-1 inside its own boundary; LS-2 every 60 s (`TRACKING_REFRESH_MS`) and on focus, previous data kept; paused when hidden.
- **Error states:** E-SERVER, E-UNAVAILABLE, E-TIMEOUT → retry (IC-60) with last data and its age. E-CONFLICT while assigning from the dashboard → per SH-15.
- **Empty states:** EM-1: no active loads → load board route (Phase 3 §13).
- **Reuse potential:** SC-18.2, SH-05.
- **Technical notes:** Shares the loads query key (`loadKeys.list({ scope: 'carrier', status: 'active' })`) with PG-35 so assignments update both. Read-only apart from SH-15 (audit per SH-15). Analytics `dashboard.active_load.opened`.

#### SC-19.3 — Recommended loads
- **Purpose:** Suggest loads for trucks becoming empty.
- **Responsibilities:** Offer posted loads matched to each truck's expected empty location and time and the carrier's lanes; explain why each was recommended; include only loads the carrier is eligible to book (BR-03) and that are still `Posted` (BR-07).
- **Data requirements:** `use-recommended-loads()` → loads with carrier pay, lane, pickup window, truck matched and reason codes; keyed by carrier (PG-19 note).
- **Interaction model:** Open a load, book it (PG-34, confirmed through IC-27) or watch it (IC-33, optimistic); dismiss a recommendation, which removes it for this user.
- **Device needs:** DV-PHONE: find the next load for a truck in a few actions. DV-DESK: review recommendations across the fleet. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** Recommendation reason as text ("Matches truck 12 empty in Dallas on Tuesday"); carrier pay with currency and per-mile rate; watch state announced (IC-33); dismissal announced and focus moved to the next recommendation (SSB-6).
- **Loading states:** LS-1 inside its own boundary; LS-2 every 5 minutes and on focus, paused when hidden; LS-5 during watch or dismiss.
- **Error states:** E-SERVER, E-UNAVAILABLE → withheld with retry (IC-60); the dashboard continues. E-CONFLICT on opening → the load was booked by another carrier; it leaves the set with that reason. E-FORBIDDEN → carrier not approved; SC-19.5 explains.
- **Empty states:** EM-2: no matches → save a search route (PG-36) and a load board route.
- **Reuse potential:** SC-33.2 result behaviour.
- **Technical notes:** Refresh every 5 minutes (`RECOMMENDATIONS_REFRESH_MS`); query key `loadBoardKeys.recommended()`. Audit `load.watched` on watch; analytics `load.recommendation.opened`, `load.recommendation.dismissed`, `load.recommendation.booked` (KPI-08). Carrier pay is Confidential.

#### SC-19.4 — Pay outlook
- **Purpose:** Tell the carrier what money is coming and when.
- **Responsibilities:** Report pending settlement totals by expected date, quick-pay-eligible amount, failed payouts; state the standard timing (3 business days after POD verification, BR-15).
- **Data requirements:** `use-settlement-summary()` → totals by expected date, quick-pay-eligible total, failed payout count; amounts server-shaped by role.
- **Interaction model:** Navigate to PG-38 filtered by expected date or by failed status; quick pay itself is requested on PG-38.
- **Device needs:** DV-PHONE: owner-operators check when money arrives. DV-DESK: admins reconcile. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** Amounts with currency; dates as text; failed payouts stated in words with count; each total is a named link to its filtered view.
- **Loading states:** LS-1 inside its own boundary; LS-2 on focus (settlements refetched on focus, Phase 4 §2.6).
- **Error states:** E-SERVER, E-UNAVAILABLE → retry (IC-60); processor delay → "awaiting processor" with age.
- **Empty states:** EM-4: nothing pending → when the next settlement is expected (after POD verification).
- **Reuse potential:** SC-38.1.
- **Technical notes:** Amounts for `carrier.admin` only (server-shaped); dispatchers receive dates without amounts (PG-19 permissions). Totals come from the ledger, never summed client-side. Query key `settlementKeys.summary()`. Carrier pay is Confidential (NFR-PRIV-1). Analytics `dashboard.pay_outlook.opened`.

#### SC-19.5 — Carrier account standing
- Instance of **SH-06**. Blockers: onboarding incomplete, compliance hold, insurance expiring or lapsed, authority inactive (BR-18), payout method failed; data from `use-account-standing()`; fix routes to PG-17 or PG-49 for `carrier.admin`, while dispatchers are told who can fix it; blocking notices name the capabilities lost (book, bid) and not-yet-approved carriers see onboarding status and what is missing (PG-19 empty state).

### PG-20 — Driver Home

#### SC-20.1 — Current trip entry
- **Purpose:** Get the driver into the current trip immediately.
- **Responsibilities:** Identify the current trip and its next stop and route to PG-39; offer to go straight to it when exactly one active trip exists (PG-20).
- **Data requirements:** `use-driver-trips()` (cached for offline) → assigned trips for the signed-in driver only, with next stop name, city and appointment window.
- **Interaction model:** One navigation; no other action is required to start working.
- **Device needs:** DV-CAB: gloves; glare; seconds of attention; a single target meeting 44 × 44 (G-2). DV-PHONE: the same off the truck. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** The route to the current trip is a named link describing the trip and its next stop ("Continue trip HL-7K2M9QXA: pickup in Joliet at 14:00 CDT"); the page's main heading states whether a trip is active; nothing conveyed by visual cue alone (G-3).
- **Loading states:** LS-6: cached value immediately with its age; LS-2 refreshes in the background without replacing what is shown (SSB-2); LS-1 only on a device with no cached trip.
- **Error states:** E-OFFLINE → cached trip with "Saved <age> ago". E-SERVER, E-UNAVAILABLE → cached trip with age and retry (IC-60). E-NOT-FOUND for a trip reassigned away → removed with "This trip was reassigned by dispatch".
- **Empty states:** EM-1: no trip → how to reach dispatch (Phase 3 §13). EM-4: next trip assigned but not yet dispatched → when it starts.
- **Reuse potential:** Deliberately single-use: the driver entry point exists only on PG-20.
- **Technical notes:** Cache persisted per SC-39.5 (IndexedDB, Phase 7 §13) and purged on sign-out (SSB-10). Query key `tripKeys.driver()`. Analytics `driver.trip.opened` with time from app open. JS budget ≤ 150 KB for the driver route (Phase 7 §18).

#### SC-20.2 — Upcoming trips
- **Purpose:** Let the driver plan ahead.
- **Responsibilities:** Enumerate assigned future trips with pickup city and appointment; state which are read-only until active.
- **Data requirements:** `use-driver-trips()` — the same payload as SC-20.1, no second request.
- **Interaction model:** Open a trip (read-only until active); no stop events can be recorded on a future trip.
- **Device needs:** DV-PHONE: plan the week off-duty. DV-CAB: need not browse future trips while driving. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** A labelled list; dates as text with facility time zone; each trip named by reference, pickup city and appointment.
- **Loading states:** LS-6: cached with age, refreshed in the background.
- **Error states:** E-OFFLINE → cached list with age. E-SERVER → cached list with age and retry.
- **Empty states:** EM-1: none assigned → "No upcoming trips. Dispatch will assign your next one."
- **Reuse potential:** Deliberately single-use: driver-only future trips.
- **Technical notes:** Same query as SC-20.1 (`tripKeys.driver()`), persisted for offline and purged on sign-out (SSB-10). Read-only: no audit event. Analytics `driver.upcoming_trip.opened`.

#### SC-20.3 — Sync and permission state
- **Purpose:** Tell the driver whether their updates are reaching dispatch.
- **Responsibilities:** Report queued offline events, last sync time, location permission state; route to fix permission; confirm when the queue drains (PG-20 success state).
- **Data requirements:** Offline queue state (`use-stop-events` queue via `lib/utils/offline-queue.ts`), permission API, consent state from `use-location-consent`.
- **Interaction model:** Retry sync; open permission help; replay happens automatically on reconnect, in order.
- **Device needs:** DV-CAB: understand at a glance whether updates are going through. DV-PHONE: the same. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** Queue count changes announced politely (IC-14, IC-55); last sync time as text; permission state in words with the fix route as a named link.
- **Loading states:** LS-6 for the queue (local state, available immediately); no network loading of its own.
- **Error states:** Sync failing → reason (E-OFFLINE, E-SERVER, E-AUTH needing sign-in again without losing the queue). Permission off → how to turn it on and why.
- **Empty states:** EM-3: everything synced → stated once with the last sync time.
- **Reuse potential:** SC-39.5.
- **Technical notes:** Shared with PG-39. Queued items carry `nanoid` IDs and device time; the server de-duplicates (Phase 7 §13); the queue survives sign-out under the SSB-10 driver exception (kept encrypted and bound to the driver, replayed at next sign-in for up to 7 days) and is removed only by an explicit discard confirmed with IC-12. Analytics `driver.queue.drained` with item count and delay.

### PG-21 — Operations Dashboard

#### SC-21.1 — Exception volume
- **Purpose:** Tell operations how many exceptions exist by type and severity.
- **Responsibilities:** Report counts and age (oldest open, oldest unclaimed); route to PG-50 filtered; claim the next exception.
- **Data requirements:** `use-exception-summary()` → counts by exception type and severity (enums from `lib/enums/exception-type.ts`), unclaimed count and oldest age; network-wide for internal roles.
- **Interaction model:** Navigate to PG-50 with `type` and `severity` filters (Phase 3 §10), or claim next (IC-47), which assigns the next unclaimed exception by the server's ordering to the agent and opens PG-50 focused on it (SU-2). `internal.admin` reads only and is not offered claim (G-5 explains why).
- **Device needs:** DV-DESK: often left open during a shift. DV-WALL: read at a distance by several people, refreshing unattended, with the last refresh time always stated. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** A labelled region; counts as text with type and severity names; last refresh time stated; count changes are not announced on DV-WALL, and on DV-DESK only a new high-severity count is announced politely, at most once per refresh (IC-14); claim result announced before navigation.
- **Loading states:** LS-1 in its own boundary; LS-2 every 30 seconds (`EXCEPTION_SUMMARY_REFRESH_MS`, PG-21) and on focus, previous counts kept; LS-5 while claiming, the claim action busy (G-6).
- **Error states:** E-SERVER, E-UNAVAILABLE, E-TIMEOUT → counts kept with their age stated (PP-03, "Feed delayed, last updated 3 min ago") and retry (IC-60). E-CONFLICT on claim → the exception was claimed by another agent; state who and offer the next one. E-FORBIDDEN on claim → role is read-only.
- **Empty states:** EM-3: zero with refresh time ("No open exceptions. Last checked 14:02").
- **Reuse potential:** SC-22.1 pattern (count, age and claim-next over a server-ordered queue).
- **Technical notes:** Paused when hidden; stale label after 5 min (Phase 4 §2.6, dashboards and counts). Query key `exceptionKeys.summary()`, invalidated by claims and resolutions. Audit `exception.claimed`; analytics `exception.claim.requested` with type and severity enums and queue age (KPI-10).

#### SC-21.2 — Coverage risk
- **Purpose:** Surface loads at risk of not being covered.
- **Responsibilities:** Report posted loads picking up within 24 hours with their risk score and tender state; allow bulk re-tender; state each load's pickup window and time remaining.
- **Data requirements:** `use-coverage-risk({ cursor })` → posted loads with risk band, tender state (BR-08), pickup window and shipper; cursor-paginated, page size 50 (maximum 200).
- **Interaction model:** Open, re-tender (IC-12 confirmation stating the carriers and loads affected), or claim as an exception (IC-47). Bulk re-tender follows IC-23 with scope and totals stated before running and per-load outcomes after; for more than 100 loads it runs as a background job (LS-7).
- **Device needs:** DV-DESK: review and act on many loads with the keyboard. DV-WALL: need not support actions; the list may be read at a distance. DV-AT: full parity with DV-DESK, including bulk selection.
- **Accessibility requirements:** Risk expressed as text band ("High risk"), never a visual-only cue (G-3); time to pickup as text with time zone; selection count announced (IC-23); bulk outcomes listed per load in text.
- **Loading states:** LS-1 in its own boundary; LS-2 every 30 s and on focus with the rest of PG-21; LS-5 during re-tender; LS-7 for more than 100 loads.
- **Error states:** E-SERVER, E-UNAVAILABLE → retry (IC-60) with last list and age. E-CONFLICT per load → booked or cancelled meanwhile; outcome states the new state. E-FORBIDDEN → `internal.admin` is read-only here. E-PRECONDITION → tender rules changed since opening; refresh and re-apply.
- **Empty states:** EM-3: no risk → "No loads at risk in the next 24 hours" with last check time.
- **Reuse potential:** Built on SH-05 collection behaviour (cursor pagination, selection, bulk outcome reporting); the risk band itself is specific to PG-21.
- **Technical notes:** Risk computed server-side; query key `exceptionKeys.coverageRisk(params)`. Re-tender carries one idempotency key per load. Audit `tender.restarted` per load and `bulk.retender.requested`; analytics `ops.coverage.retendered` with count. Shipper price and carrier pay are both readable by `internal.ops` (Phase 3 §5.1) and remain Confidential.

#### SC-21.3 — Tracking health
- **Purpose:** Report network tracking compliance now (KPI-05).
- **Responsibilities:** Report percentage of in-transit loads with fresh positions and the loads that are stale; state the thresholds used (60 min stale, 90 min exception, BR-10).
- **Data requirements:** `use-tracking-health()` → compliance percentage, in-transit count, stale count and stale load references with age of last position.
- **Interaction model:** Navigate to stale loads (PG-26 or PG-50 filtered); open one load's tracking (PG-40).
- **Device needs:** DV-DESK: investigate stale loads. DV-WALL: the percentage and stale count read at a distance, refreshing unattended. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** Text values ("94% of 212 in-transit loads tracking; 13 stale"); each stale load named by reference with its age in text; last refresh time stated.
- **Loading states:** LS-1 in its own boundary; LS-2 every 30 s with the rest of PG-21 and on focus, paused when hidden.
- **Error states:** E-SERVER, E-UNAVAILABLE → age stated (PP-03) with retry; last values kept (SSB-2). E-CONTRACT → withheld with correlation ID.
- **Empty states:** EM-5: the percentage always renders while any load is in transit; with none in transit it states "No loads in transit" rather than a percentage.
- **Reuse potential:** Rendered with SH-08 metric behaviour; the stale-load drill-down reuses the PG-26 filtered collection.
- **Technical notes:** Threshold from BR-10 constants (`TRACKING_STALE_MINUTES`); query key `positionKeys.health()`. Read-only: no audit event. Analytics `ops.tracking_health.stale_opened`. No positions are returned, only ages, so the payload carries no Restricted data.

#### SC-21.4 — Personal throughput
- Instance of **SH-08** scoped to the agent: claimed, resolved, median time to resolve, this shift. Data from `use-metrics({ scope: 'agent', period: 'shift' })` for the signed-in `internal.ops` user only (never another agent's figures); refreshed with the dashboard every 30 s; EM-1 at shift start ("Nothing claimed yet this shift"); no period selector beyond shift and last 7 days.

### PG-22 — Compliance Dashboard

#### SC-22.1 — Vetting queue
- Instance of **SH-07** and **SH-05** over carriers awaiting review. Overrides: SLA age per item; opens PG-51. Data from `use-carrier-vetting({ status, cursor })`, cursor-paginated (PG-22), with SLA computed server-side and shown as text with a countdown near breach (IC-46); access `internal.compliance` only; EM-3 "Queue clear" with last check time; decisions themselves are taken on PG-51, so the queue emits no audit events of its own.

#### SC-22.2 — Monitoring changes
- **Purpose:** Surface authority and insurance changes since the last review.
- **Responsibilities:** Report each change with carrier, change type, effective date and automatic action taken (BR-18: booking eligibility suspended at once); allow acknowledging with a note; link affected loads (SC-22.3).
- **Data requirements:** `use-monitoring-events({ acknowledged, cursor })` → events with carrier, change type enum, effective date, source and automatic action; cursor-paginated, page size 50 (maximum 200).
- **Interaction model:** Open the carrier (PG-51); acknowledge with a note (required, validated on submit); acknowledged events leave the default view and remain retrievable by filter.
- **Device needs:** DV-DESK: review and acknowledge in sequence by keyboard. DV-AT: full parity with DV-DESK. DV-PHONE: not required.
- **Accessibility requirements:** Change type as text ("Insurance lapsed"); effective date and automatic action as text; acknowledgement announced politely (IC-14) with focus moved to the next event (SSB-6).
- **Loading states:** LS-1 in its own boundary; LS-2 every 60 s and on focus; LS-5 during acknowledgement.
- **Error states:** E-UNAVAILABLE (registry source) → last successful fetch time stated (PG-22). E-SERVER → retry (IC-60). E-CONFLICT → acknowledged by another agent; state who. E-VALIDATION → note missing.
- **Empty states:** EM-3: no changes → "No monitoring changes since your last review" with last fetch time.
- **Reuse potential:** Deliberately single-use: monitoring events are specific to the compliance role; PG-51 shows a carrier's own history through SH-11.
- **Technical notes:** Cursor-paginated. Query key `complianceKeys.monitoring(params)`. Audit `monitoring_event.acknowledged` with note; analytics `compliance.monitoring.acknowledged` with change type enum and age (CMP-2 evidence retained 7 years).

#### SC-22.3 — Affected loads
- **Purpose:** Identify booked loads affected by a compliance change.
- **Responsibilities:** Report loads whose carrier became ineligible; route to operations exceptions; state that the carrier stays on already booked loads (BR-18).
- **Data requirements:** `use-loads({ affectedByCompliance: true })`, cursor-paginated, page size 50 (maximum 200), with carrier, pickup window, state and linked exception.
- **Interaction model:** Open load; the linked exception is handled in PG-50; no mutation is available here.
- **Device needs:** DV-DESK: cross-check with the monitoring event. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** Text: each load by reference, carrier, state and pickup window; the linked exception as a named link.
- **Loading states:** LS-1 in its own boundary; LS-2 on focus and every 60 s.
- **Error states:** E-SERVER, E-UNAVAILABLE → retry (IC-60) with last list and age.
- **Empty states:** EM-3: none affected → "No booked loads are affected by current compliance changes."
- **Reuse potential:** Built on SH-05 collection behaviour without selection or bulk actions; the same filtered view is reachable from PG-50.
- **Technical notes:** Read-only here; query key `loadKeys.list({ affectedByCompliance: true })`. No audit event. Analytics `compliance.affected_load.opened`.

### PG-23 — Finance Operations Dashboard

#### SC-23.1 — POD verification queue
- **Purpose:** Verify PODs that failed automatic checks.
- **Responsibilities:** Present the document and load context (consignee, delivery time, piece count, signature presence); verify or reject with reason; request recapture from the carrier; invoicing starts on verification (BR-13, BR-14).
- **Data requirements:** `use-pod-queue({ cursor })`, `use-verify-pod`; reason vocabulary from constants; document via signed URL (SEC-7).
- **Interaction model:** Keyboard-driven review: verify, reject with reason (IC-12 for reject), next (IC-49 shortcuts). Verification is SU-1 with the item removed and the next one opened; reject requires a reason and notifies the carrier to recapture.
- **Device needs:** DV-DESK: review dozens of PODs in sequence with the keyboard. DV-AT: full parity with DV-DESK, including the document's text metadata.
- **Accessibility requirements:** Document has text metadata (IC-58); decisions announced politely (IC-14) with the load reference; shortcuts are discoverable and remappable (IC-49, WCAG 2.1.4); focus moves to the next item after a decision.
- **Loading states:** Next item prefetched; LS-1 for the queue; LS-5 during a decision; LS-2 every 60 s and on focus.
- **Error states:** Decision failed → item stays with the reason. E-CONFLICT → already decided by another agent; state who. E-VALIDATION → reason missing on reject. E-SERVER → retry with the decision kept.
- **Empty states:** EM-3: queue clear with last check time.
- **Reuse potential:** SH-03 preview.
- **Technical notes:** Optimistic removal with rollback; idempotent decision per POD version. Audit `pod.verified`, `pod.rejected` (with reason); analytics `pod.verification.completed` with outcome and time in queue (KPI-07).

#### SC-23.2 — Disputes
- Instance of **SH-05** over open disputes and claims needing finance. Opens PG-45. Data from `use-claims({ status, type, cursor })` with `status` and `type` filters (Phase 3 §10); access `internal.finance` (act) per Phase 3 §5.1; EM-3 "No disputes waiting for finance" with last check time; disputed amounts only are shown as held (BR-16); no bulk actions.

#### SC-23.3 — Receivables ageing
- Instance of **SH-08** for receivables by age bucket, with drill-down to invoices. Data from `use-metrics({ scope: 'receivables', period })` with totals from the ledger endpoint, never summed client-side (PG-23); drill-down opens PG-30 filtered by due date; `internal.finance` only; EM-4 until an invoice has been issued.

#### SC-23.4 — Payout failures
- **Purpose:** Resolve failed carrier payouts.
- **Responsibilities:** Report failures with reason (processor code mapped to plain words); retry after correction; contact the carrier.
- **Data requirements:** `use-payout-failures({ cursor })`, `use-retry-payout`; cursor-paginated, page size 50 (maximum 200).
- **Interaction model:** Retry (IC-12 confirmation stating amount and payee), message the carrier admin (SH-04 on the settlement's load thread); a retry is offered only once the payout method has changed or the processor reason allows it (G-5 explains otherwise).
- **Device needs:** DV-DESK: work through failures with processor detail and messaging in one session. DV-PHONE: not required. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** Reason text in plain words, never a raw processor code alone; amounts with currency; payee named in text; retry result announced politely (IC-14) and focus moved to the next failure (SSB-6).
- **Loading states:** LS-1; LS-2 every 60 s and on focus; LS-5 during retry; LS-7 when the processor accepts the retry for later settlement.
- **Error states:** Retry result explained: E-CONFLICT (already paid or retried), E-UNAVAILABLE (processor, "awaiting processor" with age), E-SERVER → retry.
- **Empty states:** EM-3: none failed, with last check time.
- **Reuse potential:** Built on SH-05 collection behaviour; the retry mutation is shared with PG-38 settlement detail.
- **Technical notes:** Idempotent retry with an idempotency key (Phase 7 §19). Audit `payout.retried`; analytics `payout.retry.requested`. Bank details are Restricted and never shown beyond the last 4 digits.

#### SC-23.5 — Quick pay activity
- Instance of **SH-08** for quick pay volume, fee revenue and average time to pay. Data from `use-metrics({ scope: 'quick_pay', period })`, ledger-sourced; `internal.finance` only; fee revenue is Confidential; EM-4 until a quick pay request exists (BR-15).

### PG-24 — Support Console

#### SC-24.1 — Ticket queue
- Instance of **SH-07** and **SH-05** over tickets with SLA. Selected ticket in `?ticket=`. Data from `use-tickets({ status, urgency, cursor })` with SLA timers from OPS-2 (urgent ≤ 15 min first response) as text and countdown near breach (IC-46); access `internal.support`; claiming follows IC-47 and E-CONFLICT states which agent holds a ticket; EM-3 "Queue clear" with last check time.

#### SC-24.2 — Ticket conversation
- Instance of **SH-04** for the selected ticket. Overrides: internal notes visible only to internal roles; hand-off to ops, compliance or finance (IC-48). Data from `use-messages(threadId)` polled every 10 s; notes are never delivered to the requester and are marked as internal in text; hand-off records a reason and emits `ticket.handed_off`; view-as sessions (XS-16) started from here are linked to the ticket and indicated throughout (IC-64).

#### SC-24.3 — Requester context
- **Purpose:** Give the agent the requester's situation.
- **Responsibilities:** Report organisation, role, account standing, recent loads, open exceptions and prior tickets; route to each; offer view-as from the ticket where resolution needs it (BR-27, XS-16).
- **Data requirements:** `use-requester-context(userId)` → organisation, roles, standing blockers, recent loads (last 10), open exceptions and prior tickets; read-all scope for `internal.support` (Phase 3 §5.1), with money fields shaped as for internal read roles.
- **Interaction model:** Navigate to any listed record (read-only for support); look up by email or load reference when unmatched, the lookup result linking the ticket to the matched user; start view-as (SC-24.4) with a member and reason, read-only unless the organisation granted write consent on the ticket.
- **Device needs:** DV-DESK: consult while working the ticket conversation, without switching tools. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** A labelled region naming the requester; values as labelled term and value pairs in text; standing blockers and exception severities as text (IC-59); the lookup is a labelled search (IC-19) whose result count is announced politely.
- **Loading states:** LS-1 in its own boundary, never delaying the ticket conversation; LS-2 when the selected ticket changes (`?ticket=`), previous context replaced only when the new one arrives; LS-5 during lookup.
- **Error states:** Unmatched requester (a result, not an error) → lookup by email or load reference. E-NOT-FOUND on lookup → "No account matches" with the value repeated. E-SERVER, E-TIMEOUT → retry (IC-60). E-FORBIDDEN on view-as → no linked ticket or consent missing for write, with the reason (XS-16).
- **Empty states:** EM-1: new user with no activity → "No loads, exceptions or prior tickets yet" with the organisation's onboarding status.
- **Reuse potential:** SC-52.2.
- **Technical notes:** Read-only. Query key `ticketKeys.requesterContext(userId)`. Reading a customer's context as support emits the audit event `requester_context.viewed` visible to the organisation (BR-27); view-as start and end emit `view_as.started` and `view_as.ended`. Analytics `support.requester.looked_up` with match outcome only. Emails are Confidential and never sent to analytics (NFR-PRIV-3).

#### SC-24.4 — View-as session
- **Purpose:** Let an agent see a customer's workspace exactly as a member does, within BR-27.
- **Responsibilities:** Start a view-as session from the selected ticket for a chosen member, with a reason. Apply read-only unless the ticket carries write consent. Block payout, security, API key and export capabilities always. End the session on request, at 60 minutes or on ticket closure. Record every action with both identities.
- **Data requirements:** `useViewAs(ticketId)` in `use-tickets.ts` → eligibility, consent state, remaining time; session start and end via Server Actions returning a scoped session.
- **Interaction model:** The agent chooses a member (IC-07), states a reason (IC-01, required), and starts. The workspace opens with the view-as indicator (IC-64) on every page. The agent ends the session through IC-64 and returns to the ticket.
- **Device needs:** DV-DESK only; the internal console is not supported on phones. DV-AT: full parity, with the view-as state announced on every page load.
- **Accessibility requirements:** Session state and remaining time are text in IC-64; the expiry warning is announced at 5 minutes (IC-46 thresholds).
- **Loading states:** LS-5 while the scoped session is issued.
- **Error states:**
  - E-FORBIDDEN: no linked ticket, the agent lacks the role, or the target is an internal member.
  - E-CONFLICT: the ticket closed during the session, so the session ends and the agent is returned to the console.
- **Empty states:** EM-4: available only once a ticket with a matched requester is selected.
- **Reuse potential:** SC-52.4 starts the same session from the accounts page.
- **Technical notes:** A separate session cookie carries origin identity. SSB-10 cache purge on start and end. Audit: `view_as.started`, `view_as.ended`, and every action tagged `via_view_as` with both identities. Analytics: `support.view_as.started`, and `support.view_as.ended` with the duration only (as on PG-24).

### PG-25 — Admin Dashboard

#### SC-25.1 — Pending approvals
- Instance of **SH-07** over organisation approvals and access requests. Data from `use-accounts({ status: 'pending' })`; access `internal.admin`; each approve or reject follows IC-62 with a required reason and IC-12 for rejection; EM-3 "Nothing pending" with last check time; audit `organization.approved`, `organization.rejected`, `access_request.decided`.

#### SC-25.2 — Platform configuration
- **Purpose:** Change platform parameters safely.
- **Responsibilities:** Present configurable values (quote validity, custom quote margin floor, response time, and validity default and cap (BR-31), tender window, detention free time, tracking thresholds) with current value and history; preview impact; apply with reason; state the default each value falls back to (the frontend constant of the same name).
- **Data requirements:** `use-platform-config()` → values with type, allowed range, current value, version, last change (actor, time, reason); `use-update-config`; impact preview computed server-side (for example loads currently in a tender window affected by a change).
- **Interaction model:** Edit, preview impact, confirm with reason (IC-12, IC-13 re-authentication). Values are validated against their allowed range on preview; the preview must be current before apply; apply carries the version the admin started from (SSB-8) and a stale edit is resolved through IC-67.
- **Device needs:** DV-DESK: change one value at a time with its impact understood. DV-PHONE: not supported for changes; reading only. DV-AT: full parity with DV-DESK, including re-authentication.
- **Accessibility requirements:** Impact preview as text ("Changes the tender window on 14 loads currently tendering"); each value labelled with its unit and allowed range; history as a list with before and after values in text; the applied change announced politely (IC-14, SU-1).
- **Loading states:** LS-1 for the values in their own boundary; LS-5 during preview and apply, the apply action busy (G-6).
- **Error states:** Conflict → impact explained (E-CONFLICT: change conflicts with active loads, the preview states which and how). E-PRECONDITION → another admin changed the value; IC-67 shows both and keeps the entry. E-VALIDATION → out of range or reason missing. E-FORBIDDEN → re-authentication expired; IC-13 again. E-SERVER → retry with entries kept.
- **Empty states:** EM-5: the platform always has a value (at worst the constant default) for every configurable parameter.
- **Reuse potential:** Deliberately single-use: platform-wide parameters are edited only here; organisation policies use their own settings pages.
- **Technical notes:** Server-side values override frontend constants of the same name (Phase 7 §10); query key `adminKeys.config()`, invalidated on apply, and the dependent feature queries refetch on focus. Audit `platform_config.updated` with before and after values and reason (Sensitive, Phase 4 §2.8); analytics `admin.config.changed` with parameter key only. Changes to business-rule defaults (BR-06, BR-08, BR-10, BR-11) need product and compliance sign-off before they are applied (Phase 1 §11).

#### SC-25.3 — Platform audit
- Instance of **SH-11** scoped to the platform. Data from `use-audit-log({ scope: 'platform', actor, action, from, to, cursor })`, readable by `internal.admin` only (BR-26: no role can edit or delete entries); EM-2 for filters with no match states the 7-year retention boundary; export runs through IC-65 as a background job and emits `audit_log.exported`.

---

## 7. Shipper Workspace

### PG-26 — Shipments

#### SC-26.1 — Load collection
- Instance of **SH-05** over the organisation's loads through `use-loads(params)` (key `loadKeys.list(params)`, page size 50, maximum 200), scoped server-side to the session's organisation (SEC-5) and readable by `shipper.member` and `shipper.admin`. Filters: status (`status`, including `PendingApproval`), dates (`from`, `to`, `dateField`), origin, destination, equipment, carrier (`carrier`), late only, exceptions only. Bulk actions: export, share tracking (SC-26.3). Overrides: per-load actions come from the same (role, state) mapping as SC-40.2; EM-1 routes to a new quote (XF-01) and EM-2 states the active criteria count with a clear action; view-as (BR-27) reads the collection and never runs bulk actions or exports.

#### SC-26.2 — Shipments map
- Instance of **SH-02**, collection variant. Overrides: latest locations for in-transit loads matching SC-26.1 criteria through `use-load-positions` for the loads in the current page only, polled every 60 s and paused while the document is hidden (Phase 7 §13), with each location labelled stale after 60 min (§2.6, BR-10); the map view and the list view share one query and one URL (`view=map`); selecting a load navigates to PG-40; the text equivalent enumerates each load with city, age of fix and ETA (PP-08); EM-2 when no in-transit load matches ("No loads in transit match these filters") with the criteria count.

#### SC-26.3 — Tracking share and export
- **Purpose:** Share tracking and export data for selected loads.
- **Responsibilities:** Generate tracking links (IC-44) for selected loads; export selected or filtered loads as CSV; report the outcome per load and deliver the export file when ready.
- **Data requirements:** `use-tracking-links` (create), `use-export-loads(params | loadIds)` returning an export job reference; operates on the SC-26.1 selection or its current filter set.
- **Interaction model:** Operates on the selection from SC-26.1; the user chooses "share tracking" or "export", sees the scope and count stated (IC-23) and confirms; export runs server-side through IC-65 and, over 100 loads, becomes a background job the user may leave (LS-7) with a notification when ready; tracking links for several loads are created in one request and each result is reported.
- **Device needs:** DV-DESK: select many loads and export or share in one pass. DV-PHONE: share tracking for a single load only; export is not offered. DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** Scope and count read before confirmation (IC-23); job acceptance and completion announced politely (IC-14) with the file name and record count; per-load failures presented as a list with the load reference and reason in text; focus returns to the triggering action after completion (SSB-6).
- **Loading states:** LS-5 while the request is accepted ("Preparing export…"); LS-7 for exports over 100 loads with progress when viewed and a notification on completion (SU-3); LS-4 after 30 s for link creation.
- **Error states:** E-VALIDATION: selection exceeds the export limit → reduce or export by filter instead. E-FORBIDDEN: view-as (bulk actions and export are never available in view-as), or a role without share capability → reason and who can grant it. E-RATE-LIMIT: tracking-link creation throttled (SEC-10) → wait stated from `Retry-After`. E-UNAVAILABLE / E-SERVER: export job could not start → retry with support reference. Partial failure: per-load outcome with the loads whose link could not be created.
- **Empty states:** EM-5: the actions are unavailable until at least one load is selected or a filter set is active, and the unavailable action states that reason.
- **Reuse potential:** SC-40.15 shares the tracking-link behaviour; the export job pattern (IC-65, LS-7) is reused by SC-30.2 and SC-38.2 bulk downloads.
- **Technical notes:** Exports generated by the backend; files contain shipper price only (BR-05, Confidential per NFR-PRIV-1) and are delivered through signed URLs that expire within 5 min (SEC-7); one `nanoid` idempotency key per request; audit events `export.requested` (with filter and count) and `tracking_link.created` per load; analytics `load.export.requested` and `tracking.link.bulk_created` with counts only (NFR-PRIV-3); export is a sensitive action (§2.8), never available in view-as (Phase 3 §5.2).

### PG-27 — Post a Load

#### SC-27.1 — Posting progression
- Instance of **SH-13** with steps: lane and schedule, freight and equipment, quote, tender strategy, review. Overrides: local draft keyed by flow and user ID, then a server draft after the lane step (audit `load.drafted`); prefill from `?from=` (copy of an existing load) or `?lane=`; drafts older than 30 days expire (NFR-PRIV-4); a restored server draft edited in another tab is refused with E-PRECONDITION and resolved through IC-67; the quote step invalidates when an earlier step changes; view-as (BR-27) may open drafts read-only and cannot advance without write consent.

#### SC-27.2 — Lane and schedule
- **Purpose:** Define where and when.
- **Responsibilities:** Capture ordered stops (pickup, delivery, additional stops), facility, appointment windows, time zone, references.
- **Data requirements:** `use-facilities` (organisation facilities for matching), `use-location-suggestions(query)`; stop type vocabulary from `lib/enums/stop-type.ts`.
- **Interaction model:** IC-05 locations with facility match (choosing a saved facility fills address, hours and time zone); IC-08 date-time windows entered in the facility's time zone; add or remove stops (IC-40 for reordering). Each field validates on blur and the step validates as a whole when the user moves forward (IC-15); removing a stop that has entries asks for confirmation.
- **Device needs:** DV-DESK: keyboard-speed entry of multi-stop loads. DV-PHONE: single-stop loads (one pickup, one delivery); reordering is supported but not optimised. DV-AT: full parity, including reordering by keyboard (IC-40).
- **Accessibility requirements:** Stop count announced politely on change ("3 stops"); each stop is a labelled group naming its type and sequence number; window errors linked from the error summary (IC-02); time zone stated in text with every window (WCAG 3.3.2).
- **Loading states:** LS-2 for suggestions as the user types (earlier suggestions stay until new ones arrive); LS-3 after 5 s states that the address can still be typed in full; the step itself never waits on a fetch.
- **Error states:** E-VALIDATION: window in the past; delivery before pickup; window end before start; unknown address → field messages with entries kept. E-UNAVAILABLE: location suggestions down → typed address accepted and verified server-side at the quote step (NFR-AV-4).
- **Empty states:** EM-5: the step always starts with one pickup and one delivery stop, so it cannot be empty; with no saved facilities, suggestions come from address search only.
- **Reuse potential:** SC-05.1 lane schema; the stop schema is reused by PG-56 bulk import row validation (BR-28).
- **Technical notes:** Stop schema composed over the contract stop DTO (`.extend`, never restated); stop count limit and window rules from `lib/loads/constants.ts`; times stored with the facility's IANA zone and formatted through `lib/utils/date-formatter.ts`; addresses are Internal and facility contacts are Confidential (NFR-PRIV-1) and never sent to analytics; analytics `load.draft.lane_completed` with stop count only.

#### SC-27.3 — Freight and equipment
- **Purpose:** Define what is moving and what it needs.
- **Responsibilities:** Capture equipment, commodity, weight, pallets, temperature range (reefer), hazmat flag, special requirements.
- **Data requirements:** Enums from `lib/enums/equipment-type.ts` and the contract's commodity and requirement vocabularies; legal weight limit from `lib/loads/constants.ts`.
- **Interaction model:** IC-07 for equipment and requirements, IC-01 numeric with units for weight, pallets and temperature; conditional requirements appear per equipment (temperature range required for reefer, hazmat details when the flag is set). Fields validate on blur; the step validates on forward navigation (IC-15).
- **Device needs:** DV-DESK: fast keyboard entry. DV-PHONE: complete the step with numeric keypads for numeric fields. DV-AT: full parity; conditional fields announced when they appear.
- **Accessibility requirements:** Units in labels ("Weight (lb)", "Temperature (°F)"); newly required conditional fields announced politely when equipment changes; hazmat flag has a text explanation (IC-56); errors summarised with links (IC-02).
- **Loading states:** Not applicable — the step renders from local enums and constants and never fetches.
- **Error states:** E-VALIDATION: over legal weight; temperature missing or minimum exceeding maximum for reefer; pallets not a whole number → field messages with entries kept. No network errors occur because the step does not fetch.
- **Empty states:** EM-5: every field renders from constants and enums, so the step always has content.
- **Reuse potential:** The section is single-use in the posting flow; its schema is reused by PG-56 bulk import rows and by amendment proposals that change equipment (BR-25).
- **Technical notes:** Conditional validation via Zod discriminated unions on equipment type, composed over the generated load DTO; units formatted through `lib/utils/units.ts`; changing equipment or weight invalidates any held quote (SC-27.4); analytics `load.draft.freight_completed` with equipment enum only.

#### SC-27.4 — Instant quote
- **Purpose:** Price the load and hold the price (BR-06).
- **Responsibilities:** Request a quote; present it with SH-14 breakdown, confidence and validity countdown (IC-46); re-quote; request a custom quote; state when posting at this price will need approval (BR-23).
- **Data requirements:** `use-quote(draft)` returning quote ID, shipper price breakdown, confidence, `validUntil` and whether the amount exceeds the requester's spend limit.
- **Interaction model:** Quote requested automatically when prior steps are valid; changes to earlier steps invalidate the quote and require a new request; the user may re-quote at any time or request a custom quote from operations (SC-27.7, XS-18) with the draft saved and attached. When the response indicates the requester's spend limit is exceeded, the section states that posting will go to approval, who can approve, and that approval must happen within the validity window.
- **Device needs:** DV-DESK and DV-PHONE: read the price, breakdown and remaining validity and re-quote. DV-AT: full parity, including the breakdown's derivations.
- **Accessibility requirements:** Countdown announced at 5 minutes and 1 minute remaining only (IC-46); quote arrival announced politely with the total; expiry announced assertively once; confidence stated in words ("High confidence"), not only as a scale; approval requirement stated in text.
- **Loading states:** LS-5 "Getting your price…" announced after 1 s; LS-3 after 5 s; LS-4 after 30 s becomes E-TIMEOUT; earlier steps stay editable while pending.
- **Error states:** Unserviceable (quote response) → custom quote route. E-CONFLICT: quote expired → re-quote with the previous price shown for comparison. E-UNAVAILABLE: pricing service down → entries kept, draft saved and retry offered (IC-60), with the custom quote route (NFR-AV-4). E-VALIDATION: draft no longer valid → link back to the failing step. E-RATE-LIMIT: too many re-quotes → wait stated. E-TIMEOUT: retry.
- **Empty states:** EM-4: no quote until the lane and freight steps are valid; the section names the step that is incomplete.
- **Reuse potential:** SC-05.2 (public estimator presentation); quote presentation reused by PG-57 templates and PG-56 priced batches.
- **Technical notes:** Quote ID carried to posting; validity 30 min from constants (BR-06); p95 ≤ 3 s (NFR-PERF-4); key `quoteKeys.detail(draftHash)` with no background refetch; shipper price is Confidential (NFR-PRIV-1); audit `quote.issued`; analytics `load.quote.requested`, `load.quote.expired` with lane region and equipment enums only; custom quote events belong to SC-27.7.

#### SC-27.5 — Tender strategy
- **Purpose:** Decide who gets offered the load.
- **Responsibilities:** Choose open market, preferred waterfall, or both; review the lane's preferred order; choose bid mode or book-now; state each strategy's consequence and timing.
- **Data requirements:** `use-preferred-carriers({ lane })` with eligibility per carrier; lane tender rule from `use-tender-rules()`.
- **Interaction model:** IC-09 strategy choice and IC-09 mode choice; the lane's preferred sequence is shown read-only with each carrier's window (default 15 min, BR-08); route to PG-29 to edit rules (draft kept). The step validates on forward navigation; a waterfall with no eligible carrier cannot be chosen.
- **Device needs:** DV-DESK and DV-PHONE: choose a strategy and mode. DV-AT: full parity. Editing rules is a DV-DESK task on PG-29.
- **Accessibility requirements:** Consequence of each strategy stated in its accessible description ("Offered to 3 carriers in turn for up to 45 minutes, then the open market"); ineligible carriers state why in text; choice group labelled (IC-09).
- **Loading states:** LS-1 for the preferred list; strategy choice remains usable with open market while it loads; LS-2 on return from PG-29.
- **Error states:** Ineligible preferred carriers flagged with reason (BR-03, BR-18) and skipped in the sequence. E-SERVER / E-UNAVAILABLE: preferred list could not load → open market remains available and the waterfall option states it is unavailable, with retry.
- **Empty states:** EM-1: no preferred carriers for this lane → open market only, with a route to PG-29 explaining how preferred carriers speed coverage.
- **Reuse potential:** SC-29.2 shares the sequence presentation; the strategy choice is reused by PG-57 templates.
- **Technical notes:** Strategy and mode enums from `lib/loads/constants.ts`; waterfall does not start while the load is `PendingApproval` (XF-16); analytics `load.draft.strategy_selected` with strategy and mode enums.

#### SC-27.6 — Review and post
- **Purpose:** Confirm everything and post.
- **Responsibilities:** Summarise the load in text, money via SH-14, strategy; post with confirmation (IC-12); hand off to PG-40; route an over-limit post into approval (BR-23).
- **Data requirements:** `use-post-load` (Server Action returning the load ID and resulting state `Posted` or `PendingApproval`); the held quote from SC-27.4.
- **Interaction model:** Edit routes back to any step without losing entries; post once through IC-12 stating the price, strategy and quote expiry; the confirm label repeats the action ("Post load"). A post over the requester's spend limit is submitted the same way and returns `PendingApproval`; the requester may add a note for the approver. Duplicate submissions are blocked while pending (G-6).
- **Device needs:** DV-DESK and DV-PHONE: review and post. DV-AT: full parity.
- **Accessibility requirements:** Summary as a description list with one group per step; each group's edit route named by the step ("Edit lane and schedule"); post result announced on the destination page's heading (SU-2); approval requirement and approvers stated in text before confirmation.
- **Loading states:** LS-5 "Posting…" with the confirm action busy; LS-4 after 30 s becomes E-TIMEOUT and is retried with the same idempotency key.
- **Error states:** E-CONFLICT: quote expired → re-quote in SC-27.4 with entries kept. E-FORBIDDEN: organisation blocked (XF-13) → SH-06 fix route; view-as without write consent → reason. E-VALIDATION: server rejects a field → link to the owning step. E-TIMEOUT / E-UNAVAILABLE: automatic retry with the same key. E-OFFLINE: posting needs a connection; the draft is kept locally (PP-06).
- **Empty states:** EM-5: the review step is reachable only when every previous step is valid, so it always has content.
- **Reuse potential:** Deliberately single-use: posting is the only commit point of this flow; PG-56 has its own priced-batch confirmation.
- **Technical notes:** Server Action with a `nanoid` idempotency key generated once per review visit; SU-2 to PG-40, where a `PendingApproval` load states the approvers and deadline (XF-16); invalidates `loadKeys.list` and `useLoadCounts`; audit `load.posted` or `approval_request.created` with the quote ID; analytics `load.posted` or `load.approval.requested` with time-to-post; the draft is cleared on success (SH-13).

#### SC-27.7 — Custom quote request
- **Purpose:** Get a price from operations when the instant quote cannot give one (BR-31, XS-18).
- **Responsibilities:** Offer a request when the instant quote is unavailable or low-confidence, or the lane is unserviceable; send the draft's lane, equipment, dates and freight with an optional note; report the request's status (requested, priced, declined, lapsed, withdrawn) and its response deadline; present a priced quote with its breakdown (SH-14) and the validity the agent set (BR-31, IC-46) so SC-27.6 can post on it; let the shipper withdraw; void a priced quote when the draft's lane, dates or equipment change.
- **Data requirements:** `use-quote-requests({ draftId })` → request ID, status, deadline, priced shipper price breakdown, `validUntil` and decline reason; `use-request-custom-quote` and `use-withdraw-quote-request` mutations; note length from `LIMITS` (notes, 500 characters).
- **Interaction model:** Requesting is one action (IC-11) from SC-27.4's unavailable, low-confidence or unserviceable result; the draft is saved first, so the shipper can leave and return from PG-26 drafts or from the notification (XS-03). A priced quote takes the instant quote's role in the flow, and posting it goes through SC-27.6. Withdrawing uses IC-12.
- **Device needs:** DV-DESK and DV-PHONE: request, follow the status and post on the priced quote from a notification. DV-AT: full parity.
- **Accessibility requirements:** Status changes announced politely (IC-14) while the user is present; deadline and validity stated in words, with IC-46 announcements; the decline reason given in text.
- **Loading states:** LS-5 "Requesting a quote…"; LS-2 every 30 s while a request is open and the draft is in view, paused when hidden (Phase 7 §13); stale label after 2 min (Phase 4 §2.6).
- **Error states:** E-CONFLICT: already priced, declined or withdrawn elsewhere → current state shown. E-VALIDATION: note too long → IC-02. E-PRECONDITION: the draft changed after pricing → the quote is void, stated, and a new request or an instant quote is offered. A request past its deadline is a status, not an error: the shipper is told it was escalated and the new expectation (BR-31, XF-08). E-OFFLINE, E-SERVER, E-TIMEOUT → draft kept; retry (IC-60).
- **Empty states:** EM-4: no request until the instant quote is unavailable, low-confidence or unserviceable; the section says when a request becomes possible.
- **Reuse potential:** PG-56 raises the same request for each unpriced row and reports its status per row; PG-26 lists drafts awaiting a custom quote.
- **Technical notes:** The request carries a `nanoid` idempotency key; the priced quote ID replaces the instant quote ID for posting (SC-27.6); carrier pay never reaches the shipper (BR-05); spend authority applies on post (BR-23); audit `quote_request.created`, `quote_request.withdrawn`; analytics `quote.custom.requested` (reason: unavailable, low confidence, unserviceable), `quote.custom.accepted`, `quote.custom.lapsed`.

### PG-28 — Compare Bids

#### SC-28.1 — Load context
- **Purpose:** Remind the shipper what the bids are for.
- **Responsibilities:** Summarise lane, schedule, equipment, target price and time posted.
- **Data requirements:** `use-load(loadId)` shipper-shaped.
- **Interaction model:** Read-only; a named route to PG-40 for full details.
- **Device needs:** DV-DESK and DV-PHONE: confirm which load is being decided. DV-AT: full parity.
- **Accessibility requirements:** Summary as a description list with the load reference in the section's accessible name; times stated with the facility time zone; target price read with currency.
- **Loading states:** LS-1 streamed server-side and hydrated through `HydrationBoundary`, so the context is present on arrival; LS-2 on focus refetch without clearing content.
- **Error states:** E-NOT-FOUND: load gone or inaccessible → PG-53. E-SERVER: context unavailable with retry while SC-28.2 remains usable.
- **Empty states:** EM-5: the page renders only for an existing load the user can access, so the context always has content.
- **Reuse potential:** SC-40.3 stop presentation; reused as the load summary in PG-58 approval requests.
- **Technical notes:** Shares `loadKeys.detail(loadId)` with PG-40 so a bid acceptance invalidates both; target price is Confidential (NFR-PRIV-1).

#### SC-28.2 — Bid comparison
- **Purpose:** Let the shipper compare bids on value and reliability.
- **Responsibilities:** Present each bid's amount, difference from target, expiry, round, carrier scorecard (SH-09) and equipment; let the user sort and compare selected bids.
- **Data requirements:** `use-bids(loadId)`, refetch every 20 seconds while the document is not hidden (Phase 7 §13); scorecard summaries embedded in the bid response.
- **Interaction model:** Sort by amount, difference, expiry or score (IC-22); select bids to compare against each other; new bids arrive without moving focus or resetting sort or selection; expired bids remain listed as expired until the next refresh removes them.
- **Device needs:** DV-DESK: compare many bids and scorecards. DV-PHONE: review and decide on a single bid from a notification. DV-AT: full parity, including comparison.
- **Accessibility requirements:** New bid arrival announced politely with count ("2 new bids"); comparisons available as a data table with row and column headers and `aria-sort` (IC-22); each bid's expiry as text (IC-46); scorecard values read with units (SH-09).
- **Loading states:** LS-1 on arrival; LS-2 every 20 s keeps the current bids usable; bids labelled stale after 60 s without a successful refresh (§2.6).
- **Error states:** E-SERVER / E-UNAVAILABLE: refresh failed → last bids kept with their age and "Live updates paused" with retry (SSB-2). E-NOT-FOUND: load no longer accessible → PG-53. E-CONTRACT: treated as E-SERVER and never partially rendered.
- **Empty states:** EM-4: no bids yet → tender progress (SC-28.4) and when the load reaches the open market.
- **Reuse potential:** SH-05 sorting and selection behaviour; the bid summary is reused by SC-40.4 and PG-58 approval review.
- **Technical notes:** Bid amounts are shipper-side prices (BR-05, Confidential); key `bidKeys.list(loadId)`; `refetchIntervalInBackground: false`; page size 50 (maximum 200); analytics `bid.comparison.opened` with bid count only.

#### SC-28.3 — Negotiation
- **Purpose:** Accept, decline or counter a bid (BR-02).
- **Responsibilities:** Offer only the transitions legal for the bid's state and round; capture a counter amount; confirm acceptance; route an over-limit acceptance into approval (BR-23).
- **Data requirements:** `use-bid-actions(loadId)` returning the resulting bid and load state.
- **Interaction model:** IC-28 bid response; counter amount validates on entry (greater than zero, within the round limit); acceptance confirmed via IC-12 stating the amount and that other bids will close; decline asks for an optional reason code. An acceptance over the member's spend limit returns `PendingApproval`: the bid stays open until its expiry and the approvers and deadline are stated.
- **Device needs:** DV-DESK and DV-PHONE: accept, decline or counter one bid. DV-AT: full parity.
- **Accessibility requirements:** Whose turn it is stated in text; the confirmation describes the consequence (IC-12); outcome announced politely (SU-1); focus returns to the bid row or, if the bid closed, to the section heading (SSB-6).
- **Loading states:** LS-5 per action with the action busy and duplicates blocked; LS-4 after 30 s.
- **Error states:** E-CONFLICT: bid expired, withdrawn, or accepted by another member meanwhile → refresh and state who acted and the new state. E-CONFLICT: load booked through the waterfall meanwhile → state the booking carrier. E-VALIDATION: counter out of range. E-FORBIDDEN: view-as without write consent. E-TIMEOUT: retried with the same idempotency key.
- **Empty states:** EM-5: actions render only for a selected open bid, so the section is never empty.
- **Reuse potential:** SC-40.4 carrier-side bidding (IC-28) and PG-58 approval completion reuse the same mutations.
- **Technical notes:** Idempotent Server Actions keyed per (bid, action) attempt; invalidates `bidKeys.list(loadId)`, `loadKeys.detail(loadId)` and `useLoadCounts`; audit `bid.accepted`, `bid.declined`, `bid.countered`, `approval_request.created`; analytics `bid.accepted`, `bid.declined`, `bid.countered` with round and time-to-decision.

#### SC-28.4 — Tender progress
- **Purpose:** Report where the preferred waterfall stands.
- **Responsibilities:** Report the current tender holder and remaining window, past responses and when the load reaches the open market.
- **Data requirements:** `use-tenders(loadId)`.
- **Interaction model:** Read-only progress; skip to the open market through IC-12 stating that remaining preferred carriers will not be offered the load.
- **Device needs:** DV-DESK and DV-PHONE: see who holds the tender and skip if needed. DV-AT: full parity.
- **Accessibility requirements:** Countdown per IC-46 (announced at 5 and 1 minutes remaining only); past responses as an ordered list with outcome in text; skip result announced politely.
- **Loading states:** LS-1 on arrival; LS-2 refreshed with bids every 20 s; stale after 60 s (§2.6).
- **Error states:** E-SERVER / E-UNAVAILABLE: last progress kept with age and retry. E-CONFLICT: skip after the current holder accepted → state the booking. E-FORBIDDEN: view-as without write consent cannot skip.
- **Empty states:** EM-5: absent for open-market-only loads, because there is no waterfall to report.
- **Reuse potential:** SC-40.4 coverage state.
- **Technical notes:** Refresh with bids (same 20 s interval, key `bidKeys.tenders(loadId)`); window lengths from BR-08 constants; audit `tender.skipped`; analytics `tender.waterfall.skipped` with steps completed.

### PG-29 — Preferred Carriers

#### SC-29.1 — Preferred roster
- Instance of **SH-05** over preferred carriers with SH-09 scorecard through `use-preferred-carriers(params)`, readable by `shipper.member` and editable only by `shipper.admin`. Overrides: add from carrier search; remove with confirmation (IC-12 stating the lanes whose sequences lose the carrier); eligibility flag per carrier with reason (BR-03, BR-18); EM-1 explains how to add from a carrier profile or a past load; audit `preferred_carrier.added` and `preferred_carrier.removed`; view-as is read-only.

#### SC-29.2 — Lane tender rules
- **Purpose:** Define who gets offered each lane and in which sequence (BR-08).
- **Responsibilities:** Create lane rules; set sequence of carriers and acceptance window; choose fallback to the open market; edit and delete rules.
- **Data requirements:** `use-tender-rules()` with each rule's version.
- **Interaction model:** IC-40 reorderable sequence (keyboard-operable); IC-01 window minutes (default 15); IC-09 fallback choice; save validates the whole rule; delete through IC-12. Edits carry the rule version (SSB-8).
- **Device needs:** DV-DESK: create and reorder rules. DV-PHONE: read rules only. DV-AT: full parity, including reordering.
- **Accessibility requirements:** New place in the sequence announced on move ("Moved to 2 of 5"); window minutes labelled with units; ineligible carriers state why in text; save result announced politely.
- **Loading states:** LS-1 for the rule set; LS-5 on save or delete.
- **Error states:** E-CONFLICT: duplicate lane rule → open the existing rule. E-PRECONDITION: rule changed by another admin → IC-67 comparison with input kept. E-VALIDATION: window outside the configured range, empty sequence, or the same carrier twice in a rule. E-FORBIDDEN: non-admin or view-as without consent. E-SERVER: retry.
- **Empty states:** EM-1: no rules → how rules work and the single action to create one.
- **Reuse potential:** SC-27.5 presents the lane's sequence read-only.
- **Technical notes:** Edit requires `shipper.admin`; key `bidKeys.tenderRules()`; window limits from `lib/loads/constants.ts` (BR-08); audit `tender_rule.created`, `tender_rule.updated`, `tender_rule.deleted` with before and after sequence; analytics `tender.rule.saved`.

### PG-30 — Invoices

#### SC-30.1 — Payables position
- **Purpose:** Report what the organisation owes.
- **Responsibilities:** Report outstanding, due within 7 days, overdue, disputed totals and credit used against limit.
- **Data requirements:** `use-invoice-summary()`.
- **Interaction model:** Each total filters SC-30.2 by writing its filter to the URL.
- **Device needs:** DV-DESK: review totals and drill in. DV-PHONE: read totals. DV-AT: full parity.
- **Accessibility requirements:** Amounts with labels and currency; each total's filter action named by its effect ("Show 4 overdue invoices"); disputed total described as excluded from collection (BR-16).
- **Loading states:** LS-1 per total group; LS-2 on focus without clearing values.
- **Error states:** E-SERVER / E-UNAVAILABLE: totals withheld with reason and retry; SC-30.2 stays usable. E-FORBIDDEN: role without invoice access → PG-55 at route level.
- **Empty states:** EM-4: no invoice issued yet → invoices are issued automatically on POD verification (BR-14); once invoices exist, zero totals are values, not an empty state.
- **Reuse potential:** SC-38.1 (carrier counterpart); SC-49.3 shares the credit figures.
- **Technical notes:** Server totals only, never summed client-side; key `invoiceKeys.summary()`, refetched on focus; amounts and credit are Confidential (NFR-PRIV-1); invalidated by SC-30.3 and SC-31.3.

#### SC-30.2 — Invoice collection
- Instance of **SH-05** over invoices through `use-invoices(params)` (page size 50, maximum 200) for `shipper.finance` and `shipper.admin` of the organisation. Filters: status (`status`), due date and issued date (`from`, `to`, `dateField`), load (`load`), carrier (`carrier`). Bulk: pay selected (SC-30.3), download (LS-7 over 100 invoices). Overrides: disputed invoices state the disputed and payable amounts (BR-16); EM-4 states that invoices are issued automatically on POD verification; view-as reads only and never downloads in bulk (data export).

#### SC-30.3 — Batch payment
- **Purpose:** Pay several invoices at once.
- **Responsibilities:** Total the selection, choose method, confirm, report per-invoice outcome.
- **Data requirements:** `use-pay-invoices`, `use-payment-methods` for the verified methods.
- **Interaction model:** IC-23 states the scope; IC-43 payment confirmation stating total, count, method and date; disputed amounts are excluded from the total (BR-16); the confirmation cannot be dismissed while processing; outcome itemises paid, failed and skipped invoices.
- **Device needs:** DV-DESK: select and pay many invoices. DV-PHONE: not supported for batches (single payment via SC-31.3). DV-AT: full parity with DV-DESK.
- **Accessibility requirements:** Total, count, method and date in the confirmation description (IC-43); outcome summary announced politely ("8 paid, 1 failed"); per-invoice failures listed with reason in text.
- **Loading states:** LS-5 "Processing payment…"; LS-7 over 100 invoices with progress and a notification on completion (SU-3).
- **Error states:** Partial failure per invoice with reason. E-CONFLICT: an invoice already paid or newly disputed → skipped and named. E-VALIDATION: method unverified or credit rule breached → PG-49. E-FORBIDDEN: role without pay capability, or view-as (paying is never available in view-as). E-TIMEOUT / E-UNAVAILABLE: retried with the same batch key; nothing is charged twice.
- **Empty states:** EM-5: the action is unavailable with a stated reason until at least one payable invoice is selected.
- **Reuse potential:** SC-31.3 single payment; SC-38.3 follows the same confirmation pattern.
- **Technical notes:** One idempotency key per batch; processor tokenised flow (CMP-5); invalidates `invoiceKeys.list` and `invoiceKeys.summary()`; audit `payment_batch.submitted` and `invoice.paid` per invoice; analytics `invoice.batch_pay.confirmed` with count and outcome counts; amounts are Confidential.

### PG-31 — Invoice Detail and Pay

#### SC-31.1 — Charge verification
- **Purpose:** Let AP check charges against the agreement.
- **Responsibilities:** Break down charges via SH-14 with the agreed rate, approved accessorials and their evidence references, terms and due date.
- **Data requirements:** `use-invoice(invoiceId)` shipper-shaped.
- **Interaction model:** Open the evidence for any line (SC-31.2 preview); select lines to dispute (SC-31.4).
- **Device needs:** DV-DESK: verify lines against evidence. DV-PHONE: read the breakdown and due date. DV-AT: full parity.
- **Accessibility requirements:** Line items as a data table with headers (IC-22); totals labelled as totals; each line's evidence link named by its document; due date as text with days remaining.
- **Loading states:** LS-1 server-streamed; LS-2 on focus.
- **Error states:** E-NOT-FOUND: invoice missing or inaccessible → PG-53. E-SERVER: retry with support reference; SC-31.2 remains usable.
- **Empty states:** EM-5: an invoice always carries at least its linehaul line.
- **Reuse potential:** SH-14 presentation; SC-38.4 is the carrier counterpart.
- **Technical notes:** Key `invoiceKeys.detail(invoiceId)`; carries Haulr's broker MC number (CMP-1); amounts Confidential; analytics `invoice.viewed`.

#### SC-31.2 — Invoice evidence
- Instance of **SH-03** scoped to the invoice's load documents (POD, rate agreement, accessorial evidence) through `use-documents({ scope: 'load', loadId, types })`. Read-only: no upload or new version from this page. Overrides: EM-5, because invoices are issued only after POD verification with the POD and rate agreement attached (BR-14); downloads through signed URLs expiring within 5 min (SEC-7).

#### SC-31.3 — Payment
- **Purpose:** Pay the invoice.
- **Responsibilities:** Choose method, pay full or undisputed amount, confirm, provide remittance.
- **Data requirements:** `use-pay-invoices`, `use-payment-methods`.
- **Interaction model:** IC-43 with method choice (default method preselected, never a silent non-default); full or undisputed amount choice when a dispute exists (BR-16); confirmation states amount, method and date; outcome gives a reference and remittance.
- **Device needs:** DV-DESK and DV-PHONE: pay one invoice. DV-AT: full parity.
- **Accessibility requirements:** Amount and method read before confirmation; outcome announced politely with the payment reference; remittance link named by its content.
- **Loading states:** LS-5 "Processing payment…" with the confirmation non-dismissible (IC-43); LS-4 after 30 s.
- **Error states:** Declined → alternatives. E-VALIDATION: verification needed → PG-49. E-CONFLICT: already paid by another member → state who and the reference. E-UNAVAILABLE: processor down → nothing charged, pay later. E-FORBIDDEN: view-as (paying is never available in view-as). E-TIMEOUT: retried with the same key.
- **Empty states:** EM-1: no payment method → PG-49 to add one.
- **Reuse potential:** SC-30.3 uses the same mutation.
- **Technical notes:** Processor tokenised flow (CMP-5); ACH authorisation captured by the processor (CMP-6); one idempotency key per confirmation; audit `invoice.paid`; analytics `invoice.paid` with method type enum.

#### SC-31.4 — Dispute initiation
- **Purpose:** Dispute a specific charge (BR-16).
- **Responsibilities:** Select disputed lines, state reason and amount, route to claim creation with the invoice linked.
- **Data requirements:** `use-create-claim`.
- **Interaction model:** Navigate to PG-45 prefilled, or file in place for simple disputes (one line, billing type); amount validates against the line total; submit through IC-11.
- **Device needs:** DV-DESK: select lines and file. DV-PHONE: not optimised; route to PG-45. DV-AT: full parity.
- **Accessibility requirements:** Selected lines announced with count and total; reason and amount labelled; filing result announced (SU-2 when routed to PG-45).
- **Loading states:** LS-5 while filing.
- **Error states:** E-CONFLICT: window closed or invoice already disputed → state the window end. E-VALIDATION: amount over the line total or reason missing. E-FORBIDDEN: view-as without write consent.
- **Empty states:** EM-5: the section acts on lines of an existing invoice, which always has at least one line.
- **Reuse potential:** SC-38.4 carrier dispute route.
- **Technical notes:** Disputed amount held out of collection only (BR-16); transitions the load to `Disputed`; audit `invoice.disputed` and `claim.filed`; analytics `invoice.disputed`.

### PG-32 — Locations

#### SC-32.1 — Facility collection
- Instance of **SH-05** over facilities through `use-facilities(params)` for `shipper.member` and `shipper.admin`. Filters: type (pickup, delivery), city. Overrides: EM-1 explains why saved facilities speed posting (SC-27.2) with the action to add one; archive rather than delete when a facility is referenced by an active load (E-CONFLICT with reason).

#### SC-32.2 — Facility editor
- **Purpose:** Create or update a facility.
- **Responsibilities:** Capture name, address with verified geocode, hours, appointment rules, dock instructions, contacts.
- **Data requirements:** `use-facilities` mutations, geocoding through `use-location-suggestions`.
- **Interaction model:** IC-05 address; pin adjustment on the map with a text coordinate alternative (IC-30); hours and rules through IC-01 and IC-07; save validates the whole record and carries its version (SSB-8).
- **Device needs:** DV-DESK: create and edit facilities. DV-PHONE: read details only. DV-AT: full parity through the coordinate alternative.
- **Accessibility requirements:** Coordinate alternative for setting the pin (IC-30); errors summarised (IC-02); save announced politely.
- **Loading states:** LS-2 for address suggestions; LS-5 while the address is verified ("Checking address…") and on save.
- **Error states:** E-VALIDATION: unverifiable address → confirm adjusted pin; missing or overlapping hours; invalid time zone. E-PRECONDITION: edited elsewhere → IC-67 with input kept. E-CONFLICT: facility used by active loads → the change applies to future loads only, and this is stated. E-UNAVAILABLE: geocoding down → save with manual coordinates flagged for verification.
- **Empty states:** EM-5: the editor always renders its fields, empty for a new facility.
- **Reuse potential:** SC-16.4, SC-27.2.
- **Technical notes:** Geocode verified server-side; contacts are Confidential personal data and never sent to analytics; audit `facility.created`, `facility.updated`; analytics `facility.created` or `facility.updated`.

---

## 8. Carrier Workspace

### PG-33 — Load Board

#### SC-33.1 — Search criteria
- **Purpose:** Capture what the carrier is looking for.
- **Responsibilities:** Accept origin with radius, destination (city, state or region, or anywhere) with radius, pickup date range, equipment, minimum rate and rate per mile, maximum weight; write all to the URL; apply a saved search.
- **Data requirements:** `use-location-suggestions`, enums, `use-saved-searches`.
- **Interaction model:** IC-05, IC-07, IC-08, IC-18 radius; criteria apply after settling (debounced) or on explicit search on phone; each criterion validates on change; applying a saved search replaces all criteria and says so.
- **Device needs:** DV-PHONE: set criteria quickly with defaults from the carrier's lanes. DV-DESK: rapid adjustments. DV-CAB: not supported (drivers do not search). DV-AT: full parity.
- **Accessibility requirements:** IC-20 filter group; result count announced after change; each criterion reset-able by name.
- **Loading states:** Not applicable to the criteria (local URL state); suggestions follow IC-05 with LS-2; results loading belongs to SC-33.2.
- **Error states:** E-VALIDATION: invalid combinations explained (radius without origin, date end before start, negative rate). E-UNAVAILABLE: suggestions down → typed city accepted.
- **Empty states:** EM-5: defaults from the carrier's lanes (or "anywhere") always apply, so criteria are never empty.
- **Reuse potential:** SC-36.2 (saved search editing) opens this section with stored parameters.
- **Technical notes:** Parameters from Phase 3 §10 (`origin`, `originRadius`, `destination`, `destinationRadius`, `from`, `to`, `equipment`, `minRate`, `minRpm`, `maxWeight`); debounce via `use-debounced-search`; analytics `load_board.search.performed` with equipment enums and counts, never coordinates finer than city (NFR-PRIV-3).

#### SC-33.2 — Load results
- Instance of **SH-05** over posted loads through `use-load-board(params)` (page size 50, maximum 200) for `carrier.dispatcher` and `carrier.admin`, limited server-side to `Posted` loads and to private tenders the carrier currently holds (Phase 3 §5.2). Overrides: carrier pay via SH-14; deadhead computed from the search origin; shipper score (SH-09 summary); instant-book or bid mode; loads booked by others while viewing are marked as gone; refresh every 30 seconds while the document is not hidden (LS-2); watch a load (IC-33); ineligible carriers see results with booking unavailable (BR-03); EM-2 offers widening or saving as an alert (XS-09); p95 ≤ 1.2 s (NFR-PERF-3).

#### SC-33.3 — Results map
- Instance of **SH-02**, collection variant over the result set: origin points and lanes rather than live locations. Shares SC-33.2's query and URL (`view=map`). Overrides: no location polling (refreshes with SC-33.2 every 30 s); the text equivalent is the results list; EM-2 as SC-33.2.

#### SC-33.4 — Save search and alert
- **Purpose:** Turn the current search into an alert (XS-09).
- **Responsibilities:** Name the search; choose channel and frequency; confirm.
- **Data requirements:** `use-saved-searches` mutations.
- **Interaction model:** IC-34; name validates on entry; saving stores the current URL parameters.
- **Device needs:** DV-PHONE and DV-DESK: save the current search. DV-AT: full parity.
- **Accessibility requirements:** Saved state announced politely with the search name; channel and frequency labelled groups.
- **Loading states:** LS-5 on save.
- **Error states:** E-CONFLICT: limit reached → manage in PG-36. E-VALIDATION: duplicate or empty name. E-FORBIDDEN: view-as without write consent.
- **Empty states:** EM-5: always acts on the current criteria, which always have values (SC-33.1).
- **Reuse potential:** SC-36.2.
- **Technical notes:** Stores the URL parameter set; searches are personal; limit from constants; audit `saved_search.created`; analytics `load_board.search.saved` with channel and frequency enums.

#### SC-33.5 — Booking eligibility
- Instance of **SH-06** through `use-account-standing()`. Overrides: states which booking capabilities are blocked (BR-03) while leaving search fully usable; names the exact failing check (authority, insurance minimum, compliance status) and its fix route; absent when the carrier is eligible.

### PG-34 — Book Load

#### SC-34.1 — Terms review
- **Purpose:** Let the carrier understand exactly what they are committing to.
- **Responsibilities:** Present stops, schedules, requirements, accessorial terms (detention, TONU, layover), carrier pay via SH-14 and cancellation consequences (BR-12).
- **Data requirements:** `use-load(loadId)` carrier-shaped.
- **Interaction model:** Read-only; expand any term's explanation (PP-07, IC-56).
- **Device needs:** DV-PHONE and DV-DESK: read every term before booking. DV-AT: full parity.
- **Accessibility requirements:** Terms as structured text with headings per group; stops as an ordered list; term explanations reachable by keyboard (IC-56).
- **Loading states:** LS-1 server-rendered and hydrated.
- **Error states:** E-NOT-FOUND or E-CONFLICT: load gone or booked → similar loads route to PG-33.
- **Empty states:** EM-5: the page renders only for a `Posted` load, which always has stops and terms.
- **Reuse potential:** SC-40.3.
- **Technical notes:** Carrier pay only, never shipper price (BR-05); key `loadKeys.detail(loadId)`; analytics `load.terms.viewed`.

#### SC-34.2 — Eligibility and availability
- **Purpose:** Confirm the carrier may book this load now.
- **Responsibilities:** Report eligibility checks (authority, insurance minimums, equipment) and availability; block booking with an exact reason when failing.
- **Data requirements:** Server-side check on render and again on booking; results come from the compliance status behind `use-account-standing()` and the load's requirements.
- **Interaction model:** Read the result of each check; follow fix routes (PG-43 for insurance documents, PG-37 for equipment, PG-17 for incomplete onboarding); booking in SC-34.3 stays unavailable, with the failing check named, until every check passes.
- **Device needs:** DV-PHONE and DV-DESK: read each check's result and follow a fix route. DV-AT: full parity.
- **Accessibility requirements:** Each check result as text ("Insurance: $750,000 cargo cover required, $500,000 on file"); a failing check announced once on load; fix routes are named links; state never conveyed by a visual cue alone (G-3).
- **Loading states:** LS-1 server-rendered, so results are present on arrival; no client polling; the check re-runs server-side at booking.
- **Error states:** E-UNAVAILABLE: check service unavailable → booking blocked with retry, because the server never books without a passing check (NFR-AV-4). E-CONFLICT: load no longer available (taken or expired) → similar loads route to PG-33. E-NOT-FOUND: load not accessible → PG-53.
- **Empty states:** EM-5: the section always reports the authority, insurance, equipment and availability checks.
- **Reuse potential:** SH-06 blocker wording and fix routes.
- **Technical notes:** Server is authoritative (SEC-4); BR-03 and BR-18 define the checks; a compliance change between render and booking surfaces as E-FORBIDDEN in SC-34.3; analytics `load.booking.blocked` with the failing check enum.

#### SC-34.3 — Rate confirmation signing
- **Purpose:** Make the booking binding (BR-04).
- **Responsibilities:** Present the rate confirmation document; capture acceptance with IC-26; submit booking; handle the race for the load.
- **Data requirements:** `use-book-load` (Server Action returning the booked load or a conflict); rate confirmation document and version from the load response.
- **Interaction model:** The user reads the rate confirmation, accepts it through IC-26 (signer intent and consent to electronic records, CMP-4), then books through IC-27 with IC-12 confirmation stating carrier pay, pickup window and cancellation consequences; 409 → "load taken" with similar loads. Duplicate submissions are blocked while pending.
- **Device needs:** DV-PHONE and DV-DESK: read, accept and book. DV-AT: full parity, including reading the whole document as text.
- **Accessibility requirements:** Document readable as text with headings, not only as a file; acceptance control labelled with the document version; outcome announced politely on success (SU-1, then SC-34.4) and assertively for "load taken"; focus moves to the outcome (SSB-6).
- **Loading states:** LS-5 "Booking…" announced after 1 s; LS-4 after 30 s becomes E-TIMEOUT and is retried with the same key.
- **Error states:** E-CONFLICT: taken by another carrier → state it and route to similar loads. E-FORBIDDEN: carrier became ineligible since render → the failing check and fix route; view-as → acceptance refused because signer intent must be the member's own (CMP-4, BR-27). Signature failure with grace period: the booking holds for the grace period while acceptance is retried, then releases. E-TIMEOUT / E-UNAVAILABLE: automatic retry with the same idempotency key. E-OFFLINE: booking needs a connection.
- **Empty states:** EM-5: renders only for a `Posted` load, which always has a rate confirmation document.
- **Reuse potential:** SC-28.3 acceptance handoff; IC-26 acceptance is reused by amendment acceptance on PG-64 (BR-25).
- **Technical notes:** `nanoid` idempotency key generated once per attempt; acceptance records user, time, IP and document version (BR-04) and is retained 7 years (BR-20, CMP-3); invalidates `loadKeys.detail(loadId)`, `loadKeys.list` and load board results; audit `rate_confirmation.accepted` and `load.booked`; analytics `load.booked` with time-from-view and mode enum.

#### SC-34.4 — Assignment handoff
- **Purpose:** Move straight into dispatch after booking (XF-05).
- **Responsibilities:** Offer assignment now via SH-15 or later with the BR-09 deadline stated.
- **Data requirements:** As SH-15: `use-fleet()`, `use-assign-load(loadId)`; the pickup window from the booked load for the deadline.
- **Interaction model:** Continue into SH-15 in place, or defer and go to PG-40; deferring states the deadline and that a missed deadline becomes an operations exception (BR-09).
- **Device needs:** DV-PHONE: assign in one sitting straight after booking. DV-DESK: assign or defer. DV-AT: full parity.
- **Accessibility requirements:** Deadline as text with the facility time zone and time remaining ("Assign by 06:00 CST, in 14 hours"); both choices named by their effect.
- **Loading states:** Per SH-15: LS-1 for the fleet while the defer choice stays usable.
- **Error states:** Per SH-15: E-CONFLICT (driver or truck taken by another load) and E-VALIDATION (equipment mismatch) with reason; E-FORBIDDEN for view-as without write consent.
- **Empty states:** Per SH-15: EM-1 with no drivers → invite one without leaving the assignment (XS-02).
- **Reuse potential:** SH-15; the same handoff follows bid acceptance on the carrier side.
- **Technical notes:** Deadline computed server-side from BR-09 constants; audit `load.assigned` when assigned here; analytics `load.assignment.deferred` or `load.assigned` with minutes from booking.

### PG-35 — My Loads (carrier)

#### SC-35.1 — Carrier load collection
- Instance of **SH-05** over the carrier's loads through `use-loads(params)` scoped server-side to loads booked by the session's carrier (page size 50, maximum 200), for `carrier.dispatcher` and `carrier.admin`. Filters: status, dates, shipper, driver, needs assignment, exceptions only. Overrides: tracking freshness per load (stale after 60 min, §2.6), positions refreshed every 60 s and paused when hidden; loads within the BR-09 window without an assignment state the deadline; a load with an open amendment states its response deadline and reaches PG-64 in one step, and a lapsed amendment states that operations has an exception (XF-08); per-load actions from the SC-40.2 mapping; EM-1 routes to the load board (XF-02); view-as reads only.

#### SC-35.2 — Assignment
- Instance of **SH-15**, invoked for a selected load from the collection through `use-assign-load(loadId)`, for `carrier.dispatcher` and `carrier.admin`. Overrides: returns focus to the originating load after confirmation; the collection refetches that load so its "needs assignment" state clears; reassignment of a dispatched load requires a reason.

### PG-36 — Saved Loads and Searches

#### SC-36.1 — Watched loads
- Instance of **SH-05** over watched loads through `use-watched-loads()`, personal to the user. Overrides: current availability per load (booked or expired loads stated as no longer available); unwatch optimistically (IC-33) with revert on failure; EM-1 explains how to watch a load from the load board.

#### SC-36.2 — Saved searches and alerts
- **Purpose:** Manage saved searches and their alerts.
- **Responsibilities:** Rename, edit criteria (opens PG-33 with parameters), change channel and frequency, pause, delete; report new matches since last viewed.
- **Data requirements:** `use-saved-searches` with new-match counts per search.
- **Interaction model:** IC-34 for channel, frequency and pause; rename through IC-01 validated on save; edit criteria navigates to PG-33 with the stored parameters and saving there updates the search; delete with IC-12.
- **Device needs:** DV-PHONE and DV-DESK: pause, rename and open searches. DV-AT: full parity.
- **Accessibility requirements:** Alert state announced on change ("Alerts paused for Chicago reefer"); new-match count stated in text per search; delete confirmation names the search.
- **Loading states:** LS-1 for the list; LS-5 per mutation with only the affected search busy.
- **Error states:** E-VALIDATION: empty or duplicate name, or an invalid alert frequency or quiet period. E-NOT-FOUND: search deleted in another session → removed with explanation. E-FORBIDDEN: view-as without write consent. E-SERVER: per mutation with revert and retry.
- **Empty states:** EM-1: nothing saved → how to save a search from the load board (Phase 3 §13).
- **Reuse potential:** SC-33.4.
- **Technical notes:** Key `savedSearchKeys.list()`; searches are personal to the user; audit `saved_search.updated`, `saved_search.deleted`; analytics `saved_search.alert.paused` and `saved_search.deleted`.

### PG-37 — Fleet

#### SC-37.1 — Vehicles
- Instance of **SH-05** over trucks and trailers through `use-fleet(params)`, with create and edit (readable by `carrier.dispatcher`, editable by `carrier.admin`). Overrides: ELD connection state per vehicle (read-only, reported by the backend integration); filter by equipment (`equipment`); edits carry the vehicle version (SSB-8, IC-67); a vehicle assigned to an active load cannot be retired (E-CONFLICT with the load reference); a duplicate VIN or plate is E-VALIDATION; E-UNAVAILABLE from the ELD integration → the link state stated with its age; EM-1 explains that vehicles are needed for assignment (BR-09); audit `vehicle.created`, `vehicle.updated`.

#### SC-37.2 — Drivers and invitations
- **Purpose:** Manage drivers and bring new ones in.
- **Responsibilities:** Enumerate drivers with status and current assignment; invite by phone or email (IC-39); resend or revoke invitations; deactivate a driver.
- **Data requirements:** `use-fleet`, `use-invitations`.
- **Interaction model:** IC-39 validates phone or email on entry; resend is limited per invitation; revoke through IC-12; deactivate with IC-12 (blocked while assigned to an active load).
- **Device needs:** DV-PHONE: invite a driver on the spot. DV-DESK: manage the roster. DV-AT: full parity.
- **Accessibility requirements:** Invitation state as text with expiry; driver status and current load stated in text; outcome of each invite announced politely.
- **Loading states:** LS-1 for drivers and invitations independently; LS-5 per invitation action.
- **Error states:** E-VALIDATION: malformed phone or email. E-CONFLICT: already a member, or driver assigned to an active load on deactivate → the load named. E-RATE-LIMIT: invitation sending throttled (SEC-10). E-FORBIDDEN: view-as without write consent. Invite failures reported per invitee.
- **Empty states:** EM-1: no drivers → why they are needed (BR-09 assignment) and the invite action.
- **Reuse potential:** SC-48.3.
- **Technical notes:** Drivers are members with role `carrier.driver`; driver phone and email are Confidential personal data, never in analytics; deactivation revokes the driver's sessions (SEC-3); events already queued on the driver's device follow the SSB-10 driver exception and are never purged silently (NFR-AV-6); audit `invitation.sent`, `invitation.revoked`, `member.deactivated`; analytics `fleet.driver.invited`.

### PG-38 — Settlements

#### SC-38.1 — Pay outlook totals
- **Purpose:** Report money owed to the carrier.
- **Responsibilities:** Report pending, scheduled, paid this month, quick-pay-eligible and failed totals.
- **Data requirements:** `use-settlement-summary()`.
- **Interaction model:** Each total filters SC-38.2 by writing its filter to the URL.
- **Device needs:** DV-PHONE and DV-DESK: read totals and drill in. DV-AT: full parity.
- **Accessibility requirements:** Amounts with labels and currency; failed total described with its fix route in text; dispatchers are told that amounts are available to carrier admins.
- **Loading states:** LS-1 per total group; LS-2 on focus.
- **Error states:** E-SERVER / E-UNAVAILABLE: totals withheld with reason and retry; SC-38.2 stays usable.
- **Empty states:** EM-4: nothing yet → settlements appear on POD verification and are paid 3 business days later (BR-15).
- **Reuse potential:** SC-19.4.
- **Technical notes:** Amounts for admin only (`carrier.admin`); dispatchers receive dates and counts (role-shaped server-side); key `settlementKeys.summary()`; amounts Confidential.

#### SC-38.2 — Settlement collection
- Instance of **SH-05** over settlements through `use-settlements(params)` (page size 50, maximum 200). Filters: status (`status`), expected date (`from`, `to`, `dateField`), load (`load`), shipper (`shipper`). Bulk: download remittances (LS-7 over 100). Overrides: amounts only for `carrier.admin`, dates for `carrier.dispatcher`; disputed settlements state the held amount (BR-16); EM-4 states that settlements appear on POD verification.

#### SC-38.3 — Quick pay
- **Purpose:** Pay the carrier sooner for a stated fee (BR-15).
- **Responsibilities:** State fee, net and arrival time for the selected settlements; confirm; report outcome.
- **Data requirements:** `use-quick-pay`.
- **Interaction model:** IC-43 variant stating fee and net; the fee percentage and arrival time come from the server quote for the selection; per-settlement outcome reported.
- **Device needs:** DV-PHONE and DV-DESK: request quick pay for one or several settlements. DV-AT: full parity.
- **Accessibility requirements:** Fee and net read before confirmation; outcome announced politely with the arrival time.
- **Loading states:** LS-5 "Processing…" with the confirmation non-dismissible.
- **Error states:** E-VALIDATION: payout method unverified → PG-49. E-CONFLICT: settlement no longer eligible (paid, disputed) → skipped and named. E-FORBIDDEN: not `carrier.admin`, or view-as (payouts are never writable in view-as, XS-16). E-UNAVAILABLE: processor down → quick pay unavailable; settlement data stays readable. E-TIMEOUT: retried with the same key.
- **Empty states:** EM-4: nothing eligible → why (POD not yet verified, already scheduled, or disputed).
- **Reuse potential:** SC-30.3 pattern.
- **Technical notes:** Idempotent (one key per confirmation); invalidates `settlementKeys.list` and `settlementKeys.summary()`; audit `settlement.quick_pay_requested`; analytics `settlement.quick_pay.requested` with count.

#### SC-38.4 — Deductions and disputes
- **Purpose:** Explain deductions and let the carrier dispute them.
- **Responsibilities:** Break down each settlement via SH-14 with reason for each deduction; route to PG-45 with the settlement linked.
- **Data requirements:** `use-settlement(settlementId)`.
- **Interaction model:** Open breakdown; dispute route to PG-45 prefilled with the settlement and selected deduction.
- **Device needs:** DV-PHONE and DV-DESK: read deductions and start a dispute. DV-AT: full parity.
- **Accessibility requirements:** Each deduction read with amount, currency and reason in text; totals labelled; the dispute route named by the deduction it disputes.
- **Loading states:** LS-1 when a breakdown opens; LS-2 on focus.
- **Error states:** E-NOT-FOUND: settlement inaccessible → "no longer available" in the section. E-SERVER: retry with support reference.
- **Empty states:** EM-5: every settlement has at least its linehaul line; with no deductions the breakdown states "No deductions".
- **Reuse potential:** SC-31.4.
- **Technical notes:** Key `settlementKeys.detail(settlementId)`; disputes hold only the disputed amount (BR-16); amounts Confidential; analytics `settlement.dispute.started`.

---

### PG-65 — Dispatch Board

#### SC-65.1 — Week plan
- **Purpose:** Show every truck's week as one plan (XF-17).
- **Responsibilities:** Present each truck's booked, in-flight and unavailable periods in time order, with where the truck ends up after each load; state each truck's position source and age (PP-03); move between weeks; focus one truck; report the week's counts of loads needing assignment, conflicts and open windows.
- **Data requirements:** `use-fleet-plan({ week, truck, driver, equipment })` → trucks with entries (load reference, stops, windows, carrier pay, assignment, status), unavailable periods, last position with source and time, and server-computed conflicts and open windows; key `fleetPlanKeys.week(carrierId, week)`.
- **Interaction model:** IC-68 planning grid of trucks by days; each entry opens PG-40; `week`, `truck`, `driver` and `equipment` are URL parameters (Phase 3 §10); changing week keeps the focused truck.
- **Device needs:** DV-DESK: a week for up to 60 trucks by keyboard. DV-PHONE: one truck at a time for the next three days. DV-AT: full parity; each truck's week is also available as an ordered text account.
- **Accessibility requirements:** IC-68 grid semantics; each entry's accessible name states the load, lane, window and assignment; conflicts and open windows are named in text, never conveyed by colour alone (G-3); week changes announced politely with the counts.
- **Loading states:** LS-1 for the plan; LS-2 every 60 s and on focus, paused when hidden; stale label after 5 min (Phase 4 §2.6); a week change is LS-2, keeping the previous week until the new one arrives.
- **Error states:** E-SERVER, E-TIMEOUT, E-UNAVAILABLE → last plan kept with its age; retry (IC-60). E-OFFLINE → cached plan read-only, stated. E-FORBIDDEN: carrier not yet approved → SH-06.
- **Empty states:** EM-1: no trucks → route to PG-37. EM-1: no booked loads this week → route to PG-33 with the fleet's equipment. EM-2: filters match nothing → clear them.
- **Reuse potential:** Deliberately single-use: the plan is the carrier's view of its own fleet; PG-35 stays the list of its loads.
- **Technical notes:** Read-only projection computed server-side; no client-side scheduling or hours arithmetic; positions are read per truck, not streamed (Phase 7 §13); carrier pay is Confidential (NFR-PRIV-1); analytics `fleet.plan.viewed` with a fleet-size band.

#### SC-65.2 — Conflicts and deadlines
- **Purpose:** Surface what will go wrong this week before it does.
- **Responsibilities:** Report scheduling conflicts: overlapping windows on one truck, a next pickup that cannot be reached from the previous drop in time, loads past or near their assignment deadline (BR-09), and amendments awaiting response that change a planned window (BR-25); sort them by deadline; route each to its fix (assignment through SC-65.3, a response on PG-64). Report each driver's remaining hours exactly as a connected ELD reports them, as information about that driver, never as a conflict or warning of its own. Hours are returned only to the carrier's own users; `internal.ops` reads the plan without them (CMP-12).
- **Data requirements:** Conflicts from `use-fleet-plan` with type, load, truck, driver and deadline; per driver, the ELD connection state and the remaining hours the ELD reports, with the reading's time.
- **Interaction model:** Each conflict routes to its fix; fixing the cause clears it on the next refresh; conflicts never block a move. Hours are information only, so there is nothing to acknowledge, override or justify to Haulr.
- **Device needs:** DV-DESK and DV-PHONE: find what needs action soonest and act on it. DV-AT: full parity.
- **Accessibility requirements:** Conflict count announced politely when it changes; each conflict's text names its type, load and deadline; each driver's hours are stated with the ELD as their source and the reading's age.
- **Loading states:** LS-1 with the plan; LS-2 with the plan's refresh.
- **Error states:** E-UNAVAILABLE from the ELD integration → that driver's hours shown as unavailable, with the last reading's age; no estimate is offered. E-SERVER → last list kept with its age; retry (IC-60).
- **Empty states:** EM-3: no conflicts this week, with the time it was checked.
- **Reuse potential:** SC-19.1 and the PG-35 needs-assignment filter use the same deadline source.
- **Technical notes:** Conflicts are computed by the backend from distance, windows and assignment deadlines, and are advisory. ELD hours are passed through for display only: never evaluated against hours-of-service rules, never stored as a Haulr judgement, and no carrier decision about hours is recorded (counsel confirms before launch, Phase 8 §5). Analytics `fleet.plan.conflict_resolved` with the type; no hours values in any event (NFR-PRIV-3).

#### SC-65.3 — Move and assign
- Instance of **SH-15**, started from the plan through `use-fleet({ availableFor: loadId })` and `use-assign-load(loadId)` with the load version, for `carrier.dispatcher` and `carrier.admin`. Overrides: the target truck and driver can be chosen with IC-68's keyboard move as well as IC-06; both trucks' weeks are previewed before saving; a move that would overlap a load on the target truck is refused with the overlap named (E-CONFLICT); audit `assignment.changed` with a reason; analytics `fleet.plan.load_moved`.

#### SC-65.4 — Open windows and truck availability
- **Purpose:** Fill empty time with paying loads, and record when a truck cannot work.
- **Responsibilities:** State each open window's truck, location, start, length and the empty miles to matching freight; open PG-33 filtered to the window; offer recommended loads that fit it; record unavailable periods per truck (maintenance, driver time off) with a reason, and end them early; bring the dispatcher back to the plan after booking.
- **Data requirements:** Open windows from `use-fleet-plan`; recommended loads from `use-recommended-loads({ truck, window })`; `use-truck-availability(truckId)` mutation for unavailable periods; default search radius from constants.
- **Interaction model:** From a window, finding loads navigates to PG-33 with `origin`, `originRadius`, `from`, `to` and `equipment` set (Phase 3 §10) and a return path; a recommended load opens PG-34 directly; booking returns to PG-65 (SU-1). An unavailable period uses IC-08 for its range and IC-07 for its reason.
- **Device needs:** DV-DESK and DV-PHONE: fill a window and mark a truck unavailable. DV-AT: full parity.
- **Accessibility requirements:** Each window's accessible name states the truck, place, time and length; the number of recommendations announced politely; date range per IC-08.
- **Loading states:** LS-1 for recommendations, independent of the plan; LS-5 when saving an unavailable period ("Saving…").
- **Error states:** E-CONFLICT: a recommended load was taken → removed, similar loads offered. E-VALIDATION: an unavailable period that covers a booked load or ends before it starts. E-UNAVAILABLE on recommendations → the PG-33 route remains. E-FORBIDDEN: view-as without write consent.
- **Empty states:** EM-2: no recommended load fits the window → widen the radius or time in PG-33. EM-3: no open windows this week.
- **Reuse potential:** SC-19.3 recommended loads (same source, scoped here to one window).
- **Technical notes:** Unavailable periods feed the recommendation service and lane alerts (XS-09); window search links are built by `appRoutes` (IC-51); audit `vehicle.unavailable_set`, `vehicle.unavailable_ended`; analytics `fleet.plan.window_filled` with an empty-miles band, `fleet.truck.unavailable_set`.

## 9. Driver

### PG-39 — Driver Trip

#### SC-39.1 — Current stop
- **Purpose:** Tell the driver where to go next and what to do there.
- **Responsibilities:** Present the current stop's facility, address, appointment, reference numbers, instructions and contacts; hand off to the device's navigation app.
- **Data requirements:** `use-trip(loadId)` (cached in IndexedDB after each successful fetch).
- **Interaction model:** Open navigation (IC-31); call facility (tel link); the current stop advances when the departure event is recorded in SC-39.2. An amendment accepted during the trip (BR-25) updates the stops; the change is announced assertively once and the driver is told what changed.
- **Device needs:** DV-CAB: glanceable in seconds with gloves and glare, targets at least 44 × 44 (G-2). DV-PHONE: read details before arrival. DV-AT: full parity.
- **Accessibility requirements:** Address and appointment as text with the facility time zone; phone numbers as `tel:` links named by who is called; stop number and total in the section's accessible name ("Stop 2 of 3").
- **Loading states:** LS-6: cached trip rendered immediately with its age ("Saved 14 min ago"); LS-2 refresh on reconnect and focus.
- **Error states:** E-OFFLINE: cached data with age (SSB-4). E-NOT-FOUND: driver unassigned from the load → "This trip is no longer assigned to you" and route to PG-20.
- **Empty states:** EM-5: renders only while the assigned trip has an incomplete stop; after the final departure the page reports completion instead.
- **Reuse potential:** SC-40.3 (stop data).
- **Technical notes:** Navigation handoff via platform map URLs; key `tripKeys.detail(loadId)`; availability target 99.95% (NFR-AV-2); cache purged on sign-out (SSB-10); facility contacts are Confidential.

#### SC-39.2 — Stop event reporting
- **Purpose:** Record arrival, loading or unloading, and departure (XF-06).
- **Responsibilities:** Offer only the next legal event for the current stop (Phase 2 §5); record it with device time and location; allow undo within 5 minutes; record seal and piece count at departure.
- **Data requirements:** `use-stop-events(loadId)` with offline queue (`lib/utils/offline-queue.ts`).
- **Interaction model:** IC-29 stop event action: one action for the next legal event, recorded on activation without a confirmation step because undo covers mistakes; each event acknowledged immediately and synced later if offline; seal and piece count validated at departure (required, whole numbers); undo is a named action for 5 minutes and itself queues offline.
- **Device needs:** DV-CAB: gloves, glare, one action per step, works without signal. DV-AT: full parity.
- **Accessibility requirements:** Event recorded announced politely with time ("Arrived recorded at 14:02"); undo available as a named action for its window with time remaining in text; queued state stated in text.
- **Loading states:** Not applicable as a wait — events are optimistic (IC-29) and acknowledged at once; LS-6 while events are queued, stating the count and age of the oldest unsynced event.
- **Error states:** E-OFFLINE: event queued and replayed in order on reconnect; the driver can keep recording. Sync failure (E-SERVER, E-TIMEOUT, E-UNAVAILABLE) retried automatically with the same event ID because events are idempotent. E-CONFLICT: conflict with a server-recorded event (geofence) → server wins, driver told which event was kept and its time. E-VALIDATION: seal or piece count missing or not a whole number at departure. E-NOT-FOUND: driver unassigned while events are queued → queued events still replay for audit and the driver is told the trip is no longer theirs.
- **Empty states:** EM-5: a next legal event always exists until the final departure, after which the section is replaced by trip completion.
- **Reuse potential:** Carrier dispatchers and admins and operations record events on a driver's behalf in SC-40.2 through the same event types and mapping (Phase 3 §5.1).
- **Technical notes:** Events carry `nanoid` IDs and device time; replay in order; the server de-duplicates by ID; NFR-AV-6: no accepted event may be lost, including events queued offline and replayed within 7 days, so the queue lives in IndexedDB and survives reloads; sign-out with unsynced events first attempts replay, then tells the driver the count, and signing out keeps the queue encrypted and bound to the driver for replay at their next sign-in, removed only by an explicit discard confirmed with IC-12 (SSB-10 driver exception); precise location is Restricted (NFR-PRIV-1) and never sent to analytics; audit `stop_event.recorded` (with source driver and queued delay) and `stop_event.undone`; analytics `driver.stop_event.recorded` with event type, queued flag and sync delay; invalidates `loadKeys.detail(loadId)` and the load timeline on sync.

#### SC-39.3 — POD capture
- **Purpose:** Capture the signed delivery receipt (XF-09).
- **Responsibilities:** Capture one or more pages by camera or file, receiver name, OS&D notes; run quality checks; queue offline; confirm verification outcome.
- **Data requirements:** `use-pod-upload(loadId)` (presigned direct-to-storage upload, offline queue).
- **Interaction model:** IC-25 camera capture or IC-24 file pick per page; quality checks run on each page at capture and failing pages ask for a retake with the reason; retake per page; receiver name required and OS&D notes optional; submit sends all pages as one POD; the outcome of automatic verification is reported when it arrives.
- **Device needs:** DV-CAB: phone camera in poor light, with gloves, without signal. DV-PHONE: file pick from the gallery. DV-AT: full parity, including capture by file pick and page review by text.
- **Accessibility requirements:** Each captured page announced ("Page 2 captured"); rejection reasons as text ("Too dark: move to better light"); upload progress per page announced at start, completion and failure only; verification outcome announced politely.
- **Loading states:** LS-5 upload progress per page, cancellable; LS-6 while queued offline with the count of pages waiting; verification result arrives later (SU-3 style notification).
- **Error states:** E-VALIDATION: blurry, too dark or cropped → specific reason and retake; unsupported type or over the upload limit → reason. E-OFFLINE: queued and uploaded on reconnect. E-SERVER / E-TIMEOUT: page upload retried automatically with the same ID. Upload rejected by virus scan → retake or re-pick. Verification failed (BR-13) → finance review stated with what happens next.
- **Empty states:** EM-4: available only once the final delivery stop is reached; before that the section states the event that enables it.
- **Reuse potential:** SH-03 upload behaviour; operations and finance capture through SH-03 on PG-40.
- **Technical notes:** Client-side image downscale before upload; checks repeated server-side; NFR-AV-6: no loss of accepted POD images, including pages queued offline and replayed within 7 days; POD retained 7 years (BR-20); upload limits in `lib/constants.ts`; signed URLs expire within 5 min (SEC-7); receiver name is Confidential personal data and never in analytics; audit `pod.uploaded`; analytics `driver.pod.captured` with page count, retake count and queued flag.

#### SC-39.4 — Issue and delay reporting
- **Purpose:** Let the driver report problems quickly.
- **Responsibilities:** Record delay (reason, new ETA), breakdown, refused freight, lumper paid (with receipt photo), other issues; notify dispatch and operations.
- **Data requirements:** `use-report-issue(loadId)`.
- **Interaction model:** Choose issue type (IC-09), add optional note and photo (required receipt photo for lumper), new ETA for delays through IC-08, send; queued offline; acknowledged at once and replayed on reconnect.
- **Device needs:** DV-CAB: report in seconds with gloves and without signal. DV-PHONE: add a note and photo. DV-AT: full parity.
- **Accessibility requirements:** Issue types as a labelled group (IC-09); required evidence stated before sending; sent or queued state announced politely.
- **Loading states:** Not applicable as a wait — optimistic acknowledgement; LS-6 while queued with count.
- **Error states:** E-OFFLINE: queued. E-VALIDATION: lumper without receipt photo, or delay without a new ETA. E-SERVER / E-TIMEOUT: retried automatically with the same `nanoid` ID.
- **Empty states:** EM-5: the issue type vocabulary always renders from `lib/enums/exception-type.ts`.
- **Reuse potential:** Creates exceptions for SC-50.x.
- **Technical notes:** Accessorial evidence (BR-11, PP-09): lumper receipts and delay times feed SC-40.9; queued through `lib/utils/offline-queue.ts` and replayed in order; free-text notes never sent to analytics (NFR-PRIV-3); audit `issue.reported`; analytics `driver.issue.reported` with issue type and queued flag.

#### SC-39.5 — Sync state
- Instance of **SC-20.3** scoped to this trip. Overrides: counts only this trip's queued stop events, issue reports and POD pages with the age of the oldest; states the NFR-AV-6 guarantee in plain words ("Saved on this phone; sends when you have signal"); warns before sign-out while anything is queued (SSB-10).

#### SC-39.6 — Trip overview
- **Purpose:** Let the driver see the whole trip.
- **Responsibilities:** Enumerate all stops with status and appointments; trip documents the driver may see (rate confirmation excluded).
- **Data requirements:** `use-trip(loadId)`.
- **Interaction model:** Read-only; open a stop's details; open a permitted document (IC-58).
- **Device needs:** DV-PHONE and DV-CAB: skim the stop sequence. DV-AT: full parity.
- **Accessibility requirements:** Stops as an ordered list with status and appointment in text; current stop identified in its accessible name.
- **Loading states:** LS-6 cached with age; LS-2 on reconnect.
- **Error states:** E-OFFLINE: cached with age. E-NOT-FOUND: unassigned → route to PG-20.
- **Empty states:** EM-5: every trip has at least one pickup and one delivery stop.
- **Reuse potential:** SH-01 trip variant.
- **Technical notes:** Shares `tripKeys.detail(loadId)` with SC-39.1; rate confirmation and carrier pay excluded server-side (BR-05, Phase 3 §5.1).

#### SC-39.7 — Contact dispatch
- **Purpose:** Reach the dispatcher or Haulr operations.
- **Responsibilities:** Offer call and message routes to dispatch and operations; message via SH-04.
- **Data requirements:** Contacts from `use-trip`; thread through `use-messages(threadId)`.
- **Interaction model:** `tel:` link or conversation in the load's thread.
- **Device needs:** DV-CAB and DV-PHONE: call in one action. DV-AT: full parity.
- **Accessibility requirements:** Named links ("Call dispatch, Maria"); message route named by the thread.
- **Loading states:** LS-6 cached contacts.
- **Error states:** E-OFFLINE: call route remains; messages queue per SH-04.
- **Empty states:** EM-5: operations support is always reachable 24/7 (OPS-1), even when the carrier lists no dispatcher.
- **Reuse potential:** SH-04.
- **Technical notes:** Operations number from constants; dispatcher phone is Confidential personal data; analytics `driver.contact.opened` with channel enum.

---

## 10. Shared Records and Utilities

### PG-40 — Load Details

#### SC-40.1 — Load identity and state
- **Purpose:** Establish which load this is and where it is in its life.
- **Responsibilities:** Present reference numbers, status label, lane summary, parties (as permitted) and whose action is awaited.
- **Data requirements:** `use-load(loadId)` role-shaped.
- **Interaction model:** Copy reference (IC-44 copy behaviour).
- **Device needs:** DV-DESK and DV-PHONE: identify the load, its state and whose action is awaited. DV-AT: full parity.
- **Accessibility requirements:** Status as text (IC-59, G-3); copy success announced politely; awaited action stated in words ("Waiting for carrier to assign a driver"); `PendingApproval` stated with the approvers.
- **Loading states:** LS-1 server-rendered, so identity is present on arrival; LS-2 when any load mutation invalidates the key.
- **Error states:** E-NOT-FOUND: PG-53 if inaccessible (403 on a record is treated as not found, Phase 3 §5.2). E-SERVER: page-level error (PG-54) because nothing else can render without identity.
- **Empty states:** EM-5: the page renders only for an existing, accessible load.
- **Reuse potential:** SC-28.1.
- **Technical notes:** Status labels from constants; key `loadKeys.detail(loadId)`; parties shown per BR-05 role shaping.

#### SC-40.2 — Next actions
- **Purpose:** Offer exactly the actions this role may take in this state.
- **Responsibilities:** Derive legal actions from (role, state) via the single mapping function; perform them with confirmation where irreversible; record operations actions on behalf of parties.
- **Data requirements:** `use-load-actions(loadId)`; mapping in `lib/loads/transitions.ts`.
- **Interaction model:** IC-11 actions; IC-12 for cancel and other irreversible actions, stating TONU or penalty consequences (BR-12); actions that require a reason (hold, release, operations on behalf) cannot be submitted without one (SSB-9); state conflicts (409) → refresh and explain. Money-committing actions over the member's spend limit return `PendingApproval` (BR-23); the client never hides them.
- **Device needs:** DV-DESK and DV-PHONE: take any offered action. DV-AT: full parity.
- **Accessibility requirements:** Each action named by its effect; disabled actions state why; result announced politely (SU-1) and focus moves to the new state when the action disappears (SSB-6).
- **Loading states:** LS-5 per action, duplicates blocked; LS-4 after 30 s.
- **Error states:** E-CONFLICT: illegal transition because the state moved on → new state explained with who moved it and the next legal action. E-FORBIDDEN: view-as without write consent, or capability missing → reason and who can grant it. E-VALIDATION: reason missing. E-TIMEOUT: retried with the same idempotency key.
- **Empty states:** EM-4: no action is legal for this role in this state → state who acts next, the event that will return an action to this role and, when known, its deadline.
- **Reuse potential:** PG-26, PG-35 per-load actions.
- **Technical notes:** Mapping unit-tested against Phase 2 §5 table; idempotency key per attempt; invalidates `loadKeys.detail(loadId)`, `loadKeys.list` and `useLoadCounts`; audit `load.<transition>` (for example `load.cancelled`, `load.put_on_hold`) with actor, on-behalf party and reason; analytics `load.action.performed` with from and to states.

#### SC-40.3 — Lane, stops and schedule
- **Purpose:** State where and when the load moves.
- **Responsibilities:** Present each stop with facility, appointment window, time zone, references, instructions; actual arrival and departure once recorded.
- **Data requirements:** `use-load(loadId)`.
- **Interaction model:** Read-only; shippers can edit instructions before dispatch (IC-01), saved with the load version (SSB-8); changes to stops or schedule after booking go through the amendment flow (BR-25), not this section.
- **Device needs:** DV-DESK and DV-PHONE: read the schedule; edit instructions on DV-DESK. DV-AT: full parity.
- **Accessibility requirements:** Stops as an ordered list; times with time zone in text; late arrival stated in words, not by a visual cue alone (G-3).
- **Loading states:** LS-1 server-rendered; LS-5 on instruction save.
- **Error states:** Reads follow SC-40.1. Instruction edits: E-VALIDATION (over the length limit), E-PRECONDITION (edited by someone else → IC-67 with input kept), E-CONFLICT (load dispatched meanwhile → editing closed and explained).
- **Empty states:** EM-5: a load always has at least one pickup and one delivery stop; actual times show as "Not yet recorded" until the event exists.
- **Reuse potential:** SC-34.1, SC-39.6.
- **Technical notes:** Times in facility zone through `lib/utils/date-formatter.ts`; shares `loadKeys.detail(loadId)`; instruction edits carry the load version (SSB-8) and invalidate the load key; facility contacts are Confidential (NFR-PRIV-1); audit `load.instructions_updated` with before and after text; analytics `load.instructions.updated` without the text (NFR-PRIV-3).

#### SC-40.4 — Coverage state
- **Purpose:** Report how the load is being covered (posted, tendered, bids).
- **Responsibilities:** Report tender progress (SC-28.4 behaviour) and bid summary; route shippers to PG-28 and carriers to bid (IC-28) or book (PG-34).
- **Data requirements:** `use-tenders`, `use-bids`, polled every 20 s while the document is not hidden.
- **Interaction model:** Per role: shippers open PG-28; carriers bid or counter through IC-28 or book through PG-34; operations may act on behalf with a reason.
- **Device needs:** DV-DESK and DV-PHONE: see coverage progress and act. DV-AT: full parity.
- **Accessibility requirements:** Whose turn stated; bid count changes announced politely; countdowns per IC-46.
- **Loading states:** LS-1; LS-2 every 20 s; stale after 60 s (§2.6).
- **Error states:** E-SERVER / E-UNAVAILABLE: last coverage kept with age and retry. E-CONFLICT: carrier bid on a load booked meanwhile → booked state explained.
- **Empty states:** EM-5: absent outside `Posted`, because coverage only exists while posted; no bids yet is stated as a count of zero with the tender state.
- **Reuse potential:** SC-28.2, SC-28.4.
- **Technical notes:** Present only while `Posted`; carriers receive only their own bid (BR-05); audit `bid.submitted`, `bid.countered`; analytics `bid.submitted`.

#### SC-40.5 — Assignment
- Instance of **SH-15** through `use-fleet()` and `use-assign-load(loadId)`. Carrier roles and operations only; shippers receive the assigned driver's given name and truck number after dispatch. Overrides: operations assign on behalf with a reason; the BR-09 deadline stated in text with the facility time zone; view-as cannot assign without write consent; EM-1 invites a driver without leaving the assignment (XS-02).

#### SC-40.6 — Tracking
- Instance of **SH-02** for this load through `use-load-positions(loadId)`, polled every 60 s and paused while the document is hidden. Overrides: shipper and carrier parties and internal roles read; check call (IC-10) for carrier and operations roles only; EM-4 before pickup ("Tracking starts at pickup" with the appointment); exception at 90 min without update (BR-10).

#### SC-40.7 — Timeline
- Instance of **SH-01** for this load through `use-load-timeline(loadId)`. Overrides: events role-shaped server-side (no carrier pay events for shippers and no shipper price events for carriers, BR-05); operations actions on behalf show both actor and party; view-as actions show the staff member (BR-27); EM-4 for drafts.

#### SC-40.8 — Money
- Instance of **SH-14** role-shaped: shipper price for shipper roles, carrier pay for carrier roles, both for internal roles (BR-05). Overrides: parts awaiting approval (`PendingApproval`, BR-23) or pending accessorials are stated as pending in text; follows `loadKeys.detail(loadId)`; amounts Confidential.

#### SC-40.9 — Accessorials
- **Purpose:** Manage extra charges with evidence (BR-11).
- **Responsibilities:** Report accruing and requested accessorials with evidence; carriers request; shippers approve or dispute amounts over the configured threshold; operations adjudicates.
- **Data requirements:** `use-accessorials(loadId)`.
- **Interaction model:** Request (IC-01 amount, IC-24 evidence), approve or dispute (IC-12). An approval over the approving member's spend limit enters `PendingApproval` (BR-23) and names the approvers.
- **Device needs:** DV-PHONE: approve from a notification. DV-DESK: review evidence. DV-AT: full parity.
- **Accessibility requirements:** Timer-based accruals expressed as text durations ("Detention: 1 h 20 min after 2 free hours"); approval outcome announced politely.
- **Loading states:** LS-1; LS-5 per request or decision.
- **Error states:** E-VALIDATION: evidence missing or amount invalid. E-CONFLICT: already decided by another member → decision and actor stated. E-FORBIDDEN: view-as without write consent. E-SERVER: retry.
- **Empty states:** EM-4: absent unless accruing or requested; a detention timer appears after recorded arrival.
- **Reuse potential:** SC-31.1.
- **Technical notes:** Detention accrual computed server-side (2 free hours, BR-11); thresholds from constants with the server value winning; audit `accessorial.requested`, `accessorial.approved`, `accessorial.disputed`, `accessorial.adjudicated`; analytics `accessorial.request.submitted`.

#### SC-40.10 — Documents
- Instance of **SH-03** scoped to the load through `use-documents({ scope: 'load', loadId })`. Overrides: carriers and operations upload; shippers upload their own documents; drivers upload POD through PG-39; rate confirmation versions (including amendments, BR-25) shown to parties per BR-05; EM-4 for POD before delivery.

#### SC-40.11 — Conversation
- Instance of **SH-04** for the load's thread through `use-messages(threadId)`, polled every 10 s while open. Overrides: participants are the load's parties and internal roles (BR-19); drivers see only threads for assigned loads; view-as cannot send without write consent.

#### SC-40.12 — Exceptions
- **Purpose:** Inform parties of open exceptions on this load and their handling.
- **Responsibilities:** Report open and resolved exceptions with owner and what happens next; operations can claim from here.
- **Data requirements:** `use-exceptions({ loadId })`.
- **Interaction model:** Read for parties (type, severity, owner role, next step and expected time); claim for operations (IC-47) with the exception's version, then continue in PG-50 with `?exception=`.
- **Device needs:** DV-DESK and DV-PHONE: parties see what is being handled. DV-WALL: not required (the queue is PG-50). DV-AT: full parity, including claiming.
- **Accessibility requirements:** Severity as text; exceptions as a list with open and resolved states in words; ownership changes announced politely; claim action named by the exception ("Claim tracking gap exception").
- **Loading states:** LS-1 in its own boundary; LS-2 on focus and whenever the load key is invalidated; LS-5 on claim.
- **Error states:** E-SERVER / E-UNAVAILABLE: exceptions withheld with retry while the rest of PG-40 stays usable. E-CONFLICT: claimed by another agent → owner named (IC-47). E-PRECONDITION: exception changed since read → refreshed before claim.
- **Empty states:** EM-5: absent when the load has never had an exception, because there is nothing to inform parties about.
- **Reuse potential:** SC-50.2.
- **Technical notes:** Key `exceptionKeys.list({ loadId })`; parties receive a party-safe summary without internal notes or other parties' contact details (server-shaped); audit `exception.claimed`; analytics `exception.claimed` with type and source page.

#### SC-40.13 — Claims
- **Purpose:** Connect the load to its claims.
- **Responsibilities:** Report claims on the load; route to PG-45; start a new claim within the window.
- **Data requirements:** `use-claims({ loadId })`.
- **Interaction model:** Navigate to a claim's PG-45; start a new claim through `/claims/new?load=` (prefilled), offered only after delivery and within the filing window; roles with read-only claim access (`internal.support`, Phase 3 §5.1) and view-as sessions without write consent see status only.
- **Device needs:** DV-DESK and DV-PHONE: read claim status and start one. DV-AT: full parity.
- **Accessibility requirements:** Claims as a list with type, status, whose turn and deadline as text; the start route states the window end ("File by 12 June 2027").
- **Loading states:** LS-1 in its own boundary; LS-2 on focus.
- **Error states:** E-SERVER / E-UNAVAILABLE: claims withheld with retry while the rest of PG-40 stays usable. E-NOT-FOUND on a listed claim → "no longer available" and the list refetched.
- **Empty states:** EM-4: before delivery → claims become available at delivery. EM-1: after delivery with no claims → file-a-claim route with the window end, within 9 months (BR-17).
- **Reuse potential:** SH-05 collection behaviour shared with SC-44.1.
- **Technical notes:** Key `claimKeys.list({ loadId })`; claim amounts are Confidential; analytics `claim.start.opened` with source page.

#### SC-40.14 — Rating
- Instance of **SH-10**, present after delivery within the rating window, through `use-rate-counterparty(loadId)`. Overrides: shipper roles rate the carrier and carrier roles the shipper (BR-22); 30-day window; view-as cannot rate.

#### SC-40.15 — Tracking link sharing
- **Purpose:** Share public tracking with an outside party (XF-07).
- **Responsibilities:** Generate, copy, send by email or SMS, and revoke a tracking link; state its expiry (BR-21).
- **Data requirements:** `use-tracking-links(loadId)`.
- **Interaction model:** IC-44: generate a link (or reuse the active one), copy it, share it, or send it to an email address or phone number validated on entry; revoke through IC-12 stating that anyone holding the link loses access at once. Available to `shipper.member`, `shipper.admin`, `internal.ops` and `internal.support` (Phase 3 §5.1).
- **Device needs:** DV-PHONE: share through the device share sheet. DV-DESK: copy. DV-AT: full parity, with copy and send reachable by keyboard.
- **Accessibility requirements:** Copy success announced politely; expiry stated as a date and days remaining; revoke outcome announced; the link's accessible name states what it exposes (status, ETA, approximate location).
- **Loading states:** LS-5 while generating, sending or revoking; the existing link stays usable during a refresh.
- **Error states:** E-SERVER / E-UNAVAILABLE: generation failed → retry. E-VALIDATION: malformed email or phone. E-RATE-LIMIT: sending throttled (SEC-10) → wait stated. E-CONFLICT: load past the expiry boundary (7 days after delivery) → sharing closed and explained. E-FORBIDDEN: view-as without write consent.
- **Empty states:** EM-1: no link yet → what an outside party will see and the action to create one.
- **Reuse potential:** SC-26.3.
- **Technical notes:** Web Share API where available; links expose status, ETA and approximate location only and expire 7 days after delivery (BR-21); recipients' emails and phone numbers are Confidential personal data and never in analytics (NFR-PRIV-3); key `trackingKeys.links(loadId)`; audit `tracking_link.created`, `tracking_link.sent`, `tracking_link.revoked`; analytics `tracking.link.created` and `tracking.link.shared` with channel enum.

#### SC-40.16 — Amendments
- **Purpose:** Propose, track and resolve changes to a booked load's terms (XF-15, BR-25).
- **Responsibilities:** Let shipper roles and operations propose changes to not-yet-completed stops, schedule, equipment, weight, rate and accessorial terms. Re-price and classify materiality. Route to spend approval when needed (BR-23). Report the open amendment's state, deadline and whose turn it is. Link the carrier to PG-64. List every past version of the rate confirmation.
- **Data requirements:** `useAmendments(loadId)` in `use-loads.ts` → open amendment, history, governing version; `useProposeAmendment` mutation; versions via SH-03 (document type `rateConfirmation`).
- **Interaction model:** The proposer edits the proposed terms. Only amendable fields accept input, and completed stops are locked with the reason stated. The proposer reviews the comparison (IC-66) and money effect (SH-14), then submits (IC-12, stating that the carrier must accept). The proposer may withdraw before acceptance (IC-12). Carriers open PG-64.
- **Device needs:** DV-DESK: propose and compare. DV-PHONE: track status and withdraw. DV-AT: comparison as a table.
- **Accessibility requirements:** State changes (accepted, declined, lapsed) announced politely; deadline as absolute and relative text.
- **Loading states:** LS-1 with the load; LS-2 polling every 30 s while an amendment is open; LS-5 for submit and withdraw.
- **Error states:**
  - E-CONFLICT: the load passed an affected stop, or another amendment is open; the page names it.
  - E-PRECONDITION: the load changed since the proposal started (IC-67).
  - E-VALIDATION: no actual change, or the change is outside allowed ranges.
  - E-UNAVAILABLE: re-pricing down; rate-affecting changes are blocked, schedule-only changes are allowed.
- **Empty states:** EM-4: no amendment history until a change is proposed; states which changes are possible in the current state. EM-5: not shown before booking.
- **Reuse potential:** The comparison logic is shared with SC-64.1 through IC-66.
- **Technical notes:** One open amendment per load, enforced server-side. Idempotent submit. Audit: `amendment.proposed`, `amendment.withdrawn`. Analytics: `load.amendment.proposed` with materiality.

#### SC-40.17 — Approval status
- **Purpose:** Tell everyone on the load when it is waiting for spend approval (BR-23, XF-16).
- **Responsibilities:** Report the pending request, the approvers who can act, the deadline (quote expiry) and the outcome. Let the requester withdraw. Let an approver decide in place with PG-58 behaviour (IC-62).
- **Data requirements:** `useApprovalRequests({ subjectId: loadId })` in `use-approvals.ts`.
- **Interaction model:** Requester: withdraw (IC-12). Approver: approve or reject with reason (IC-62). Others: read-only.
- **Device needs:** DV-PHONE: approvers decide from a notification. DV-DESK and DV-AT: full parity.
- **Accessibility requirements:** Deadline per IC-46 thresholds; decision outcome announced.
- **Loading states:** LS-2 polling every 30 s while pending; LS-5 on decision.
- **Error states:**
  - E-CONFLICT: already decided by another approver, or the quote expired; the page names who decided or states the expiry.
  - E-FORBIDDEN: approver is the requester.
- **Empty states:** EM-5: the part appears only while a request exists or after a decision for the load's history.
- **Reuse potential:** SC-58.3 decision behaviour.
- **Technical notes:** Audit and analytics as PG-58.

### PG-41 — Messages

#### SC-41.1 — Thread collection
- Instance of **SH-05** over the user's threads through `use-threads(params)`, limited server-side to threads the user participates in (load parties and ticket requesters, BR-19; internal roles may join load threads). Filters: unread, load, ticket. Overrides: unread counts per thread, refreshed with the notifications count every 60 s; selection sets `?thread=`; EM-1 states that threads start from a load or a support ticket (there is no free-form messaging); message previews are never sent to analytics.

#### SC-41.2 — Selected conversation
- Instance of **SH-04** for the selected thread through `use-messages(threadId)`, polled every 10 s while open and paused while the document is hidden (Phase 7 §13). Overrides: E-NOT-FOUND when the user loses access to the thread → "no longer available" and selection cleared; EM-4 when no thread is selected ("Choose a conversation"); view-as reads only unless write consent exists.

### PG-42 — Notifications

#### SC-42.1 — Notification feed
- Instance of **SH-05** over notifications through `use-notifications(params)`, own notifications only. Filters: unread, event type. Overrides: each notification routes to its subject and is marked read on open (IC-53, optimistic with revert); a subject the user can no longer access is reported as "no longer available" (E-NOT-FOUND); EM-1 explains which events notify and links to preferences (PG-47); EM-3 when everything is read ("You're all caught up") with the time of the last check.

#### SC-42.2 — Read management
- **Purpose:** Let the user clear notifications in bulk.
- **Responsibilities:** Mark all read, mark selected read; route to preferences (PG-47).
- **Data requirements:** `use-notifications` mutations.
- **Interaction model:** Bulk action with count stated ("Mark 14 as read"); no confirmation because the action only changes read state and is reversible per notification; applied optimistically with revert on failure.
- **Device needs:** DV-PHONE and DV-DESK: clear the feed. DV-AT: full parity.
- **Accessibility requirements:** Result announced politely with the count; the unread count exposed to assistive technology updates in the same announcement (IC-53).
- **Loading states:** LS-5 while the mutation is in flight; the feed stays usable.
- **Error states:** E-SERVER / E-UNAVAILABLE: optimistic change reverted and the failure stated with retry. E-OFFLINE: action needs a connection (SSB-4).
- **Empty states:** EM-3: nothing unread → the actions are unavailable with that reason.
- **Reuse potential:** Deliberately single-use: bulk read state exists only for the notification feed; the unread count it updates is shared everywhere.
- **Technical notes:** Invalidates the unread-count key (`notificationKeys.unread()`), shared with the global indicator; mark-all applies to notifications up to the latest ID the user has seen, so arrivals during the request stay unread; analytics `notification.feed.marked_read` with count.

### PG-43 — Documents

#### SC-43.1 — Document collection
- Instance of **SH-05** combined with **SH-03** over the organisation's documents through `use-documents({ scope: 'organisation', ...params })`, for organisation members except drivers, with per-document access checked server-side. Filters: type (`docType`), load (`load`), date (`from`, `to`), party. Overrides: bulk download over 100 documents runs as LS-7; rate confirmations and invoices follow BR-05 role shaping; EM-1 states what will appear and when (Phase 3 §13); downloads through signed URLs expiring within 5 min (SEC-7); bulk download is a data export and never available in view-as.

#### SC-43.2 — Company compliance documents
- **Purpose:** Keep company documents current (insurance, W-9, agreements).
- **Responsibilities:** Report each required company document with status and expiry; replace with a new version; remind before expiry (XS-12).
- **Data requirements:** `use-documents({ scope: 'organisation' })` filtered to required company document types; upload through `use-document-upload`.
- **Interaction model:** SH-03 upload behaviour: pick a file (IC-24), see type and limits before upload, upload with progress; the new version replaces the old one once accepted and the old version stays in history.
- **Device needs:** DV-DESK: replace documents. DV-PHONE: photograph and upload a certificate. DV-AT: full parity.
- **Accessibility requirements:** Expiry as text date and days remaining; status in words ("Expires in 12 days", "Expired"); upload progress and outcome announced.
- **Loading states:** LS-1 for the requirement list; LS-5 per upload with progress.
- **Error states:** E-VALIDATION: upload rejected with reason (type, limit, unreadable). Virus scan rejection → reason and re-pick. E-FORBIDDEN: role without upload capability or view-as without write consent. E-SERVER: retry.
- **Empty states:** EM-1: required documents outstanding → each missing document named with why it is required.
- **Reuse potential:** SC-17.4.
- **Technical notes:** Carrier replacements trigger compliance re-check (BR-18); W-9 and tax IDs are Restricted (NFR-PRIV-1, CMP-10); reminders at the lead times in constants; audit `document.uploaded`, `document.version_replaced`; analytics `document.compliance.replaced` with document type.

### PG-44 — Claims

#### SC-44.1 — Claim collection
- Instance of **SH-05** over claims through `use-claims(params)` (page size 50, maximum 200), scoped to claims where the organisation is a party (internal finance sees all). Filters: status (`status`), type, whose turn, load (`load`). Overrides: deadline per claim as text; EM-1 states that claims can be filed within 9 months of delivery (BR-17) from a load; amounts are Confidential.

#### SC-44.2 — Awaiting my response
- Instance of **SH-07** filtered to claims where it is the user's turn, with deadlines, through `use-attention-items({ role, type: 'claim' })`. Overrides: each item routes to SC-45.3; EM-3 "No claims are waiting on you" with the time of last check.

### PG-45 — Claim Detail

#### SC-45.1 — Claim filing
- **Purpose:** File a complete claim once.
- **Responsibilities:** Capture type (overage, shortage, damage, billing), load, amount, description; enforce the filing window (BR-17); state required evidence per type.
- **Data requirements:** `use-create-claim`; draft via SH-13 persistence.
- **Interaction model:** Single-page entry with IC-02 validation on blur and on submit; required evidence per type stated before submission and uploaded through SH-03; submit via IC-11; duplicate submissions blocked.
- **Device needs:** DV-DESK: file with documents. DV-PHONE: photograph damage and file. DV-AT: full parity.
- **Accessibility requirements:** Required evidence stated before submission; error summary links to fields (IC-02); filing result announced on the new claim's heading (SU-2).
- **Loading states:** LS-5 "Filing claim…"; LS-4 after 30 s retried with the same key.
- **Error states:** E-CONFLICT: window closed → the delivery date and window end stated. E-VALIDATION: missing evidence or amount out of range. E-FORBIDDEN: view-as without write consent. E-OFFLINE: filing needs a connection; the draft is kept locally (PP-06).
- **Empty states:** EM-5: the form always renders; with `?load=` the load is prefilled.
- **Reuse potential:** SC-31.4.
- **Technical notes:** `?load=` prefill; `nanoid` idempotency key per submission; draft cleared on success and expired after 30 days (NFR-PRIV-4); descriptions are free text and never in analytics; audit `claim.filed`; analytics `claim.filed` with type and evidence count.

#### SC-45.2 — Claim evidence
- Instance of **SH-03** scoped to the claim through `use-documents({ scope: 'claim', claimId })`. Overrides: parties and internal finance upload while the claim is open; evidence becomes read-only once resolved; EM-1 names the evidence required for the claim type.

#### SC-45.3 — Response exchange
- **Purpose:** Let parties respond to each other and to finance.
- **Responsibilities:** Record responses with evidence; state whose turn and deadline.
- **Data requirements:** `use-claim(claimId)`.
- **Interaction model:** Respond with note and documents when it is the user's turn; responses validate for a non-empty note; submitted responses are final records and cannot be edited.
- **Device needs:** DV-DESK and DV-PHONE: read and respond. DV-AT: full parity.
- **Accessibility requirements:** Turn and deadline as text; responses as an ordered list with author role and time; submission announced politely.
- **Loading states:** LS-1; LS-5 on respond; LS-2 on focus.
- **Error states:** E-CONFLICT: turn moved on (another member responded) → refreshed with who responded. E-PRECONDITION: the other party responded meanwhile → their response shown and input kept (SSB-8). E-VALIDATION: empty note. E-FORBIDDEN: not the user's turn, or view-as without write consent. E-SERVER: retry with input kept.
- **Empty states:** EM-4: no responses yet → whose turn and the deadline.
- **Reuse potential:** SH-04 behaviour.
- **Technical notes:** Distinct from free messaging; responses are formal records; key `claimKeys.detail(claimId)`; audit `claim.responded`; analytics `claim.responded`.

#### SC-45.4 — Resolution
- **Purpose:** Conclude the claim.
- **Responsibilities:** Present the proposed resolution; accept or contest; finance records the decision and money adjustment.
- **Data requirements:** `use-claim-actions`.
- **Interaction model:** IC-12 confirmation stating money effect; contest requires a reason; finance records the decision with a reason code.
- **Device needs:** DV-DESK and DV-PHONE: accept or contest. DV-AT: full parity.
- **Accessibility requirements:** Money effect as text with currency ("Your next invoice is reduced by $1,240.00"); outcome announced politely.
- **Loading states:** LS-5 per action.
- **Error states:** E-CONFLICT: resolution changed or already decided → refreshed with the current proposal. E-VALIDATION: reason missing. E-FORBIDDEN: role cannot decide, or view-as.
- **Empty states:** EM-4: no proposal yet → which step leads to one.
- **Reuse potential:** Deliberately single-use: only claims conclude through a proposed resolution.
- **Technical notes:** Adjusts invoice or settlement server-side (BR-16); audit `claim.resolution_accepted`, `claim.resolution_contested`, `claim.resolved`; analytics `claim.resolution.decided`.

### PG-46 — Profile

#### SC-46.1 — Personal details
- **Purpose:** Keep the user's personal details correct.
- **Responsibilities:** Edit name, phone, avatar; present role and organisation read-only.
- **Data requirements:** `use-profile` (backend `GET /users/me`).
- **Interaction model:** IC-01 fields validated on blur; IC-24 avatar with type and limit stated; save validates the whole form and carries the profile version (SSB-8).
- **Device needs:** DV-DESK and DV-PHONE: edit details. DV-AT: full parity.
- **Accessibility requirements:** IC-02 error summary; save announced politely; avatar has a text alternative naming the user.
- **Loading states:** LS-1; LS-5 on save; LS-5 per avatar upload with progress.
- **Error states:** E-VALIDATION: field messages with entries kept. E-PRECONDITION: changed in another session → IC-67. Where SSO provisions names (BR-24), those fields are read-only and say so. E-FORBIDDEN: view-as.
- **Empty states:** EM-5: the form always renders with the current values.
- **Reuse potential:** Deliberately single-use: only the signed-in user edits their own profile.
- **Technical notes:** Avatar via Next.js Image; name and phone are Confidential personal data; audit `user.profile_updated`.

#### SC-46.2 — Email change
- **Purpose:** Change email with verification.
- **Responsibilities:** Accept a new email; require re-authentication; send verification; keep the old email until verified.
- **Data requirements:** `use-change-email`.
- **Interaction model:** IC-13 re-authentication then IC-01; resend verification after a wait.
- **Device needs:** DV-DESK and DV-PHONE: request the change and verify from the inbox. DV-AT: full parity.
- **Accessibility requirements:** Pending verification state as text with the pending address.
- **Loading states:** LS-5 on submit.
- **Error states:** E-CONFLICT: email in use. E-VALIDATION: malformed. E-RATE-LIMIT: resend throttled. E-FORBIDDEN: SSO-managed email (BR-24) or view-as.
- **Empty states:** EM-5: the form always renders with the current email.
- **Reuse potential:** SC-14.1.
- **Technical notes:** Security notification to the old email; audit `user.email_change_requested`, `user.email_changed`.

### PG-47 — Settings

#### SC-47.1 — Password and MFA
- **Purpose:** Secure the account.
- **Responsibilities:** Change password; enrol, regenerate backup codes for, or remove MFA (removal blocked for roles that require it).
- **Data requirements:** `use-change-password`, `use-mfa`.
- **Interaction model:** IC-13 re-authentication; IC-03 for the new password with the breached-password check on submit; IC-04 to confirm enrolment codes; backup codes shown once.
- **Device needs:** DV-DESK and DV-PHONE: change password and enrol MFA. DV-AT: full parity, including the text setup secret.
- **Accessibility requirements:** Setup secret available as text as well as a scannable code; password rules stated before entry; outcome announced politely.
- **Loading states:** LS-5 per action.
- **Error states:** E-VALIDATION: wrong current password; invalid code; breached password. E-FORBIDDEN: MFA removal for a role that requires it (SEC-1); SSO-enforced organisations (BR-24); view-as (security settings are read-only in view-as). E-RATE-LIMIT: repeated failures (SEC-10).
- **Empty states:** EM-5: always renders the current password and MFA state.
- **Reuse potential:** SC-13.1.
- **Technical notes:** SEC-1 password and MFA rules; sessions rotate on change (SEC-3); credentials and secrets are Restricted and never logged; audit `user.password_changed`, `user.mfa_enrolled`, `user.mfa_removed`; security notification to the user.

#### SC-47.2 — Sessions
- **Purpose:** Let the user control where they are signed in.
- **Responsibilities:** Enumerate active sessions (device, location, last active); revoke one or all others.
- **Data requirements:** `use-sessions`.
- **Interaction model:** Revoke with IC-12 naming the device.
- **Device needs:** DV-DESK and DV-PHONE: review and revoke. DV-AT: full parity.
- **Accessibility requirements:** Current session identified in text; revoke outcome announced politely.
- **Loading states:** LS-1; LS-5 per revoke.
- **Error states:** E-NOT-FOUND: session already ended → removed. E-FORBIDDEN: view-as. E-SERVER: retry.
- **Empty states:** EM-5: the current session always exists; with no others the section says so.
- **Reuse potential:** Deliberately single-use: own sessions only; PG-52 revokes others' access through SC-52.2.
- **Technical notes:** Revocation effective within 5 min (SEC-3); location is city-level only; audit `session.revoked`.

#### SC-47.3 — Notification preferences
- **Purpose:** Control what the user is told and how (XS-03).
- **Responsibilities:** Set channels per event type; quiet hours; state which events cannot be disabled.
- **Data requirements:** `use-notification-preferences`.
- **Interaction model:** Each event and channel is switched on or off through IC-36 and saved per change optimistically; quiet hours through IC-08.
- **Device needs:** DV-DESK and DV-PHONE: change preferences. DV-AT: full parity.
- **Accessibility requirements:** Each preference labelled with event and channel; locked events state why; save outcome announced politely.
- **Loading states:** LS-1; per-toggle LS-5.
- **Error states:** Per change with revert and the failure stated (E-SERVER, E-OFFLINE). E-VALIDATION: invalid quiet hours. E-FORBIDDEN: view-as.
- **Empty states:** EM-5: the event catalogue always renders from enums.
- **Reuse potential:** Deliberately single-use: preferences are per user.
- **Technical notes:** Event catalogue from enums; critical events cannot be fully disabled (XS-03); audit `user.notification_preferences_updated`.

### PG-48 — Organization and Team

#### SC-48.1 — Organisation details
- **Purpose:** Keep organisation details correct.
- **Responsibilities:** Edit legal name, address, contacts; present identifiers read-only (tax ID, USDOT/MC).
- **Data requirements:** `use-organization`.
- **Interaction model:** IC-01 fields validated on blur; save validates the whole form and carries the organisation version (SSB-8); a carrier change to legal name or address states before saving that it triggers re-vetting and may pause booking eligibility.
- **Device needs:** DV-DESK: edit details. DV-PHONE: read only. DV-AT: full parity.
- **Accessibility requirements:** IC-02 error summary; read-only identifiers labelled as read-only with how to change them (contact support); save outcome announced politely.
- **Loading states:** LS-1 server-rendered; LS-5 on save.
- **Error states:** E-VALIDATION: field messages with entries kept. E-PRECONDITION: changed by another admin → IC-67 comparison with input kept. E-FORBIDDEN: non-admin (members read only) or view-as without write consent.
- **Empty states:** EM-5: organisation details always exist after registration.
- **Reuse potential:** SC-16.2, SC-17.3.
- **Technical notes:** Changes to carrier identity trigger re-vetting (XF-12, BR-18); tax ID Restricted and USDOT/MC Internal (NFR-PRIV-1); key `organizationKeys.detail()`; audit `organization.updated` with before and after values; analytics `team.organization_details.saved`.

#### SC-48.2 — Members and roles
- Instance of **SH-05** over members through `use-members(params)`, readable by members and editable by admins (Phase 3 §5.1). Overrides: change role (IC-07 with IC-12 for privilege reduction), remove (IC-12; last admin blocked); role changes are sensitive (§2.8): re-authentication within 10 minutes (IC-13), notification to organisation admins and audit `member.role_changed` or `member.removed` with reason; where SCIM provisions roles (BR-24, SEC-2) the change is refused with that reason; spend limits for shipper members are set in SC-48.4 (BR-23); view-as never changes roles.

#### SC-48.3 — Invitations
- **Purpose:** Manage pending invitations.
- **Responsibilities:** Invite (IC-39), resend, revoke; state expiry.
- **Data requirements:** `use-invitations`.
- **Interaction model:** IC-39: enter one or more email addresses and a role, validated on entry; each invitation is sent and reported individually; resend is limited per invitation; revoke via IC-12 naming the invitee. Admins invite any role; carrier dispatchers invite drivers only (Phase 3 §5.1).
- **Device needs:** DV-DESK and DV-PHONE: invite, resend and revoke. DV-AT: full parity.
- **Accessibility requirements:** Expiry as text with days remaining; each invitation's state in words (pending, expired, revoked); per-invitee outcome announced politely.
- **Loading states:** LS-1 for pending invitations; LS-5 per invitation action.
- **Error states:** Per invite: E-VALIDATION (malformed address or role not grantable), E-CONFLICT (already a member or already invited → resend offered), E-RATE-LIMIT (invitation sending throttled, SEC-10). E-FORBIDDEN: role cannot invite, SCIM-managed membership (BR-24), or view-as.
- **Empty states:** EM-1: none pending → why invite teammates and the invite action.
- **Reuse potential:** SC-16.4, SC-37.2.
- **Technical notes:** Invitation expiry from constants; invitee emails are Confidential personal data and never in analytics; key `memberKeys.invitations()`; audit `invitation.sent`, `invitation.resent`, `invitation.revoked`; analytics `team.invitation.sent` with role enum.

#### SC-48.4 — Spend limits
- **Purpose:** Set how much each shipper member can commit without approval (BR-23).
- **Responsibilities:** Set, change or remove per-load limits per member; name the approvers; set delegation defaults; report members without an eligible approver.
- **Data requirements:** `useMembers` (limits included); `useSpendPolicy` in `use-approvals.ts`.
- **Interaction model:** An admin edits a member's limit (IC-01 currency) and saves. Lowering a limit below pending requests states their effect (IC-12). All changes are sensitive (IC-13).
- **Device needs:** DV-DESK only; DV-AT full parity.
- **Accessibility requirements:** Limits read with currency; "no limit" expressed in words.
- **Loading states:** LS-1 while member limits load with the member collection; LS-5 on save, with that member's limit busy until the server confirms and pending requests re-evaluated.
- **Error states:**
  - E-VALIDATION: a limit that is not a positive amount; a limit set on an approver who is the only approver.
  - E-PRECONDITION: the member changed meanwhile (IC-67).
- **Empty states:** EM-1: no limits set; explains that without limits nothing needs approval.
- **Reuse potential:** None beyond PG-48; limits are organisation policy.
- **Technical notes:** Shipper organisations only. Audit: `spend_limit.changed` with before and after values.

### PG-49 — Payment and Payout Methods

#### SC-49.1 — Method collection
- Instance of **SH-05** over methods through `use-payment-methods()`, for `shipper.admin`, `shipper.finance` and `carrier.admin`. Overrides: set default; remove (IC-12; blocked for the only verified method while money is scheduled, E-CONFLICT naming the scheduled amount); both actions are sensitive (§2.8): re-authentication within 10 minutes (IC-13), notification to organisation admins, audit `payment_method.default_changed` and `payment_method.removed`; only masked details (type and last four digits) are ever present; view-as is always read-only here (XS-16); EM-1 routes to SC-49.2.

#### SC-49.2 — Method entry and verification
- **Purpose:** Add and verify a method securely (XS-08).
- **Responsibilities:** Host the processor's tokenised entry; run instant verification or micro-deposit flow; resume pending verification.
- **Data requirements:** `use-payment-methods` (add, verify, resume) returning the processor token reference and verification state.
- **Interaction model:** IC-13 re-authentication before changes; IC-42 hosted entry; the user chooses instant verification or micro-deposits; a pending micro-deposit verification can be resumed later by entering the two amounts; payout method changes trigger OFAC screening before use (CMP-11).
- **Device needs:** DV-DESK: add and verify methods. DV-PHONE: resume a pending verification. DV-AT: full parity, dependent on the processor meeting WCAG 2.2 AA.
- **Accessibility requirements:** Processor entry must meet WCAG 2.2 AA (vendor requirement in Phase 7 §15); verification state stated in text with the next step and expected timing; outcome announced politely; focus moves into the hosted entry on open and returns to the triggering action on close (IC-42).
- **Loading states:** Processor entry loading announced (LS-1 within the hosted entry's own loading boundary); LS-5 while verifying; micro-deposit verification is a multi-day wait stated in text.
- **Error states:** E-VALIDATION: verification failed (wrong amounts, account mismatch) with attempts remaining. E-UNAVAILABLE: processor down → nothing stored, try later (NFR-AV-4). E-FORBIDDEN: view-as, or re-authentication not completed. E-RATE-LIMIT: too many verification attempts.
- **Empty states:** EM-5: the entry flow always renders the hosted form; pending verifications are listed in SC-49.1.
- **Reuse potential:** SC-16.3, SC-17.5.
- **Technical notes:** No raw account data in Haulr code (CMP-5, SAQ-A); ACH authorisation retained by the processor (CMP-6); bank details Confidential (NFR-PRIV-1); notification to organisation admins on every change; audit `payment_method.added`, `payment_method.verified`; analytics `billing.method.added` with type and verification route enums.

#### SC-49.3 — Terms and credit
- **Purpose:** Tell shippers their payment terms and credit position.
- **Responsibilities:** Present terms, credit limit, credit used; request a limit increase.
- **Data requirements:** `use-credit()`.
- **Interaction model:** Read terms and credit; request increase (IC-11) with an amount and optional justification, validated on submit; one open request at a time.
- **Device needs:** DV-DESK: review credit and request an increase. DV-PHONE: read the credit figures. DV-AT: full parity.
- **Accessibility requirements:** Amounts as text with currency; credit used also stated as remaining ("$12,000 of $50,000 used, $38,000 available"); request outcome announced politely.
- **Loading states:** LS-1; LS-5 on request.
- **Error states:** E-SERVER / E-UNAVAILABLE: credit figures withheld with retry. E-CONFLICT: a request is already open → its state stated. E-VALIDATION: amount not greater than the current limit. E-FORBIDDEN: view-as (PG-49 is never available in view-as, Phase 3 §5.2).
- **Empty states:** EM-1: prepay organisations → how to apply for terms.
- **Reuse potential:** SC-30.1 shares the credit figures.
- **Technical notes:** Shipper roles only (carrier roles never receive this section); key `organizationKeys.credit()`; amounts Confidential; audit `credit.increase_requested`; analytics `billing.credit_increase.requested`.

---

## 11. Internal Tools

### PG-50 — Exception Queue

#### SC-50.1 — Exception queue
- Instance of **SH-07** and **SH-05** over exceptions through `use-exceptions(params)` for `internal.ops` (all types) and compliance and finance for their own types. Filters: type (`type`), severity (`severity`), owner (`owner`), age. Overrides: claim next (IC-47); refresh every 15 seconds while the document is not hidden, stale after 60 s (§2.6); selection in `?exception=`; DV-WALL use is supported read-only with the count, oldest age and severity mix stated in text and no focus-stealing announcements; EM-3 "Queue clear" with the last refresh time.

#### SC-50.2 — Exception context
- **Purpose:** Give the agent everything needed to decide.
- **Responsibilities:** Present the rule that fired, evidence, load summary, tracking (SH-02), timeline (SH-01), parties and contacts, prior actions.
- **Data requirements:** `use-exception(exceptionId)`.
- **Interaction model:** Read; navigate to the load; call or message a party from its contact route.
- **Device needs:** DV-DESK: decide with full evidence. DV-PHONE: read context from a paged alert. DV-AT: full parity.
- **Accessibility requirements:** Evidence as text; rule that fired stated in words with its threshold ("No location for 94 minutes; threshold 90"); selection change moves focus to the context heading and announces the exception reference.
- **Loading states:** LS-1 per context part (tracking and timeline in their own boundaries); the next exception is prefetched so moving on shows content at once.
- **Error states:** E-NOT-FOUND: exception resolved or removed → "no longer available" and selection cleared. E-SERVER / E-UNAVAILABLE: context part withheld with retry; other parts remain.
- **Empty states:** EM-4: no selection → choose an exception or claim next.
- **Reuse potential:** SC-40.12.
- **Technical notes:** Prefetch next exception; key `exceptionKeys.detail(exceptionId)`; party contacts are Confidential personal data and never in analytics; analytics `exception.context.opened` with type.

#### SC-50.3 — Resolution actions
- **Purpose:** Act on the exception.
- **Responsibilities:** Offer actions by exception type (contact party, re-tender, reassign, approve accessorial, cancel with TONU decision, put on hold); resolve with a reason code.
- **Data requirements:** `use-exception-actions`.
- **Interaction model:** IC-12 for irreversible actions (cancel, re-tender) stating the consequence; reason codes via IC-07 required before resolving (SSB-9); actions available only to the current owner; shortcuts per IC-49.
- **Device needs:** DV-DESK: keyboard shortcuts (IC-49). DV-PHONE: resolve a single exception. DV-AT: full parity without shortcuts.
- **Accessibility requirements:** Shortcuts are discoverable; single-character shortcuts can be turned off or remapped, or work only while focus is within the queue (WCAG 2.1.4); action outcome announced politely.
- **Loading states:** LS-5 per action; the exception stays selected while pending.
- **Error states:** Action failed → exception stays claimed and the failure is stated with retry. E-CONFLICT: load state moved on → new state and next legal action. E-PRECONDITION: exception changed since read → refreshed with input kept. E-VALIDATION: resolution without a reason code. E-FORBIDDEN: not the owner.
- **Empty states:** EM-5: actions render only for a selected, claimed exception, and every type has at least resolve.
- **Reuse potential:** SC-40.2.
- **Technical notes:** Actions recorded in audit (`exception.resolved`, `exception.put_on_hold`, plus the load transition's own event) with reason code; idempotency key per action; invalidates `exceptionKeys.list` and the affected load; analytics `exception.resolved` with type, reason code and time to resolve.

#### SC-50.4 — Ownership and handoff
- **Purpose:** Prevent collisions and allow handoff.
- **Responsibilities:** State owner; claim, release, hand off to a named agent with a note.
- **Data requirements:** `use-exception-actions`.
- **Interaction model:** IC-47 for claim and release; handoff through IC-48 with a required note and a named agent.
- **Device needs:** DV-DESK: claim and hand off. DV-PHONE: claim or release. DV-AT: full parity.
- **Accessibility requirements:** Ownership changes announced politely with the owner's name; current owner stated in text.
- **Loading states:** LS-5 while claiming, releasing or handing off.
- **Error states:** E-CONFLICT: claimed by another → owner named (IC-47). E-PRECONDITION: version changed → refreshed. E-VALIDATION: handoff without a note.
- **Empty states:** EM-5: every exception has an ownership state (unclaimed or owned).
- **Reuse potential:** SC-24.2 handoff.
- **Technical notes:** Optimistic lock with version; audit `exception.claimed`, `exception.released`, `exception.handed_off`; analytics `exception.ownership.changed`.

### PG-51 — Carrier Vetting Review

#### SC-51.1 — Authority and safety
- **Purpose:** Evidence of legal authority and safety record.
- **Responsibilities:** Present registry record, authority history, safety rating, inspection and out-of-service data, match against submitted details.
- **Data requirements:** `use-carrier-vetting(carrierId)`.
- **Interaction model:** Read; refresh from source on request, which records the fetch time.
- **Device needs:** DV-DESK: review evidence. DV-AT: full parity.
- **Accessibility requirements:** Mismatches stated in text with both values; fetch time as text.
- **Loading states:** LS-1; LS-5 on refresh from source; LS-3 after 5 s with the rest of the review usable.
- **Error states:** E-UNAVAILABLE: source down → last fetch time and data shown as stale.
- **Empty states:** EM-5: every carrier awaiting review has a registry lookup from onboarding.
- **Reuse potential:** SC-03.1.
- **Technical notes:** Key `complianceKeys.vetting(carrierId)`, fetched on open and on explicit refresh only; registry data is Public and submitted details Internal (NFR-PRIV-1); vetting evidence retained 7 years (CMP-2); audit `vetting.source_refreshed`; analytics `compliance.vetting_source.refreshed` with source enum and outcome.

#### SC-51.2 — Insurance and documents
- Instance of **SH-03** scoped to the carrier's compliance documents, plus insurance verification results, through `use-documents({ scope: 'organisation', orgId: carrierId })` and `use-carrier-vetting(carrierId)`, for `internal.compliance`. Overrides: read and verify only (no upload by reviewers); each certificate states coverage against minimums in text; EM-1 names missing required documents; evidence retained 7 years (CMP-2).

#### SC-51.3 — Identity and fraud signals
- **Purpose:** Detect impersonation and fraud.
- **Responsibilities:** Report identity checks, contact verification, device and network signals, duplicate-account matches with explanations.
- **Data requirements:** `use-carrier-vetting(carrierId)`.
- **Interaction model:** Read; mark a signal as reviewed with a note.
- **Device needs:** DV-DESK: review signals. DV-AT: full parity.
- **Accessibility requirements:** Signal severity as text; explanations in plain words; reviewed state announced.
- **Loading states:** LS-1; LS-5 on mark reviewed.
- **Error states:** E-SERVER: retry. E-PRECONDITION: signal reviewed by another reviewer → refreshed.
- **Empty states:** EM-1: no signals → stated with the time signals were last computed.
- **Reuse potential:** Deliberately single-use: fraud signals are shown only to compliance reviewers.
- **Technical notes:** Signals computed by the backend; device and network signals are Restricted (NFR-PRIV-1); audit `vetting.signal_reviewed`.

#### SC-51.4 — Decision
- **Purpose:** Approve, request information, reject or suspend.
- **Responsibilities:** Capture decision, reason code and note; refuse approval while the FMCSA safety rating is Unsatisfactory or an out-of-service order is active, and require a recorded reason to accept a Conditional rating (BR-03, CMP-2); reinstate a suspended carrier once the cause is resolved; state consequences for booked loads (BR-18).
- **Data requirements:** `use-vetting-decision`.
- **Interaction model:** Choose the decision (IC-09), reason code (IC-07) and note (IC-01), all required; IC-12 with reason stating the consequence for booked loads; IC-13 not required. "Request information" sends the carrier a list of what is needed and keeps the review open.
- **Device needs:** DV-DESK: decide with the evidence from SC-51.1 to SC-51.3. DV-AT: full parity.
- **Accessibility requirements:** Consequences as text ("3 booked loads become operations exceptions"); required fields marked in their labels; outcome announced politely.
- **Loading states:** LS-5 while submitting; the evidence sections stay usable.
- **Error states:** E-CONFLICT: conflict with another reviewer → the other decision and reviewer stated, input kept. E-VALIDATION: reason code or note missing. E-UNAVAILABLE from a source (SC-51.1) → the decision can be deferred with a reason. E-FORBIDDEN: role is not `internal.compliance`.
- **Empty states:** EM-5: the decision options always render for a carrier awaiting review.
- **Reuse potential:** Deliberately single-use: vetting decisions are made only here.
- **Technical notes:** Audited (`vetting.decided` with decision, reason and reviewer); retained 7 years (CMP-2); analytics `compliance.vetting.decided`.

#### SC-51.5 — Decision history
- Instance of **SH-11** scoped to the carrier through `use-audit-log({ scope: 'carrier', carrierId })`, for `internal.compliance`. Overrides: filters vetting and compliance actions only; EM-1 "No decisions recorded"; retention boundary stated (BR-26).

### PG-52 — Accounts

#### SC-52.1 — Account search
- Instance of **SH-05** over organisations and users through `use-accounts(params)`, for `internal.admin`. Filters: type, status, role. Overrides: EM-2 only (accounts always exist); personal fields are Confidential and never in analytics; starting view-as (XS-16) requires a linked ticket (BR-27).

#### SC-52.2 — Access changes
- **Purpose:** Change an account's access safely.
- **Responsibilities:** Suspend or reactivate organisations and users, change roles, reset MFA; preview impact on active loads; require reason.
- **Data requirements:** `use-accounts` mutations.
- **Interaction model:** Choose the change; the impact preview loads (active loads, scheduled money, members affected); enter a required reason; IC-13 re-authentication within 10 minutes; IC-12 confirmation repeating the action and stating the impact. Changes carry the account version (SSB-8).
- **Device needs:** DV-DESK: change access with the impact preview. DV-PHONE: not supported for changes (read only). DV-AT: full parity.
- **Accessibility requirements:** Impact as text ("4 active loads become operations exceptions; 2 sessions end"); reason field labelled as required; outcome announced politely.
- **Loading states:** LS-1 for the impact preview (the confirm action unavailable until it resolves); LS-5 on submit.
- **Error states:** E-CONFLICT: account state changed meanwhile (already suspended, last admin) → conflict explained with the current state. E-PRECONDITION: account edited by another admin → IC-67. E-VALIDATION: reason missing. E-FORBIDDEN: re-authentication expired → IC-13 again. E-UNAVAILABLE: impact preview unavailable → change blocked until it can be previewed.
- **Empty states:** EM-5: renders only for an account selected in SC-52.1.
- **Reuse potential:** SC-48.2 (organisation-side role changes share the role mutation and its rules).
- **Technical notes:** Backend `users` module extended; suspension and MFA reset revoke sessions within 5 min (SEC-3); sensitive action per §2.8 with notification to the organisation's admins; audit `account.suspended`, `account.reactivated`, `member.role_changed`, `user.mfa_reset` with reason and the internal actor; analytics `admin.account.changed` with change type.

#### SC-52.3 — Account audit
- Instance of **SH-11** scoped to the selected account through `use-audit-log({ scope: 'organisation', orgId })` or `({ scope: 'user', userId })`. Overrides: includes view-as sessions and their actions (BR-27); read-only (BR-26).

#### SC-52.4 — Support access
- Instance of **SC-24.4**, started from the accounts page. Overrides: requires selecting an open ticket for the account; `internal.admin` may also start view-as; the organisation's recent view-as sessions for this account are listed from SH-11 with action counts.

---

### PG-66 — Quote Desk

#### SC-66.1 — Request queue
- **Purpose:** Put the next request due in front of an operations agent.
- **Responsibilities:** List open custom quote requests sorted by response deadline, with lane, equipment, dates, requesting organisation, owner and time remaining; claim and release them (IC-47); filter by `status`, `equipment` and `due` (Phase 3 §10); mark overdue requests.
- **Data requirements:** `use-quote-requests(params)` polled through a Route Handler every 30 s (Phase 7 §13); claim and release mutations with the request version.
- **Interaction model:** Instance of SH-05 for the collection (IC-20, IC-21, IC-22); IC-47 to claim and release; the selected request in `?request=`; IC-49 shortcuts for next request, claim and release.
- **Device needs:** DV-DESK, keyboard-driven. DV-AT: full parity. DV-PHONE, DV-WALL: not targeted.
- **Accessibility requirements:** Deadlines stated in words with IC-46 announcements at 15 and 5 minutes remaining for the claimed request; the queue announces only when its count changes; claim outcomes announced (IC-14).
- **Loading states:** LS-1, then LS-2 every 30 s, paused when hidden; stale label after 2 min (Phase 4 §2.6); the selected request keeps focus during refresh; LS-5 on claim.
- **Error states:** E-CONFLICT: claimed by someone else → owner named. E-UNAVAILABLE or E-SERVER on refresh → last queue kept with its age; retry (IC-60).
- **Empty states:** EM-3: no open requests, with the last refresh time. EM-2: filters match nothing → clear them.
- **Reuse potential:** Same claim model as SC-50.1; overdue requests also appear in PG-50 as exceptions (XF-08).
- **Technical notes:** The backend raises an exception when a request passes its deadline, and the request stays in this queue marked overdue; audit `quote_request.claimed`, `quote_request.released`; analytics `quote.custom.claimed`.

#### SC-66.2 — Lane evidence
- **Purpose:** Give the agent the facts to price the lane.
- **Responsibilities:** Present the request (lane, stops, windows, equipment, freight, note) with the lane's market range, recent comparable Haulr loads (shipper price, carrier pay, date, on-time outcome) and why the instant quote failed (unavailable, low confidence, unserviceable).
- **Data requirements:** `use-quote-request(requestId)`; `use-lane-evidence({ lane, equipment, window })` → market range with source and age, and comparables (Confidential).
- **Interaction model:** Read-only; comparables sort through IC-22; each comparable opens PG-40.
- **Device needs:** DV-DESK. DV-AT: full parity.
- **Accessibility requirements:** The market range stated in words with its source and age (PP-03); comparables follow IC-22.
- **Loading states:** LS-1, independent of the queue; LS-3 after 5 s.
- **Error states:** E-UNAVAILABLE from market data → comparables only, stated. E-SERVER, E-TIMEOUT → retry (IC-60).
- **Empty states:** EM-4: no comparable Haulr loads on the lane yet → market data only, stated as such.
- **Reuse potential:** SC-05.2 presents the same market range to shippers; money follows SH-14.
- **Technical notes:** Comparables omit other organisations' identities; both money values are visible to operations only (BR-05, NFR-PRIV-1).

#### SC-66.3 — Price or decline
- **Purpose:** Answer the request.
- **Responsibilities:** Set shipper price and carrier pay separately, with accessorial expectations; state the margin against the floor (BR-31); set the quote's validity, starting from the configured default and never beyond the cap; send the priced quote, or decline with a reason code and a message to the shipper; release the claim when done.
- **Data requirements:** `use-price-quote-request(requestId)` and `use-decline-quote-request(requestId)` with the request version; the margin floor and the validity default and cap returned with the request by the server (BR-31; set in SC-25.2, which operations cannot read directly); decline reason codes from `lib/ops/constants.ts`.
- **Interaction model:** IC-01 money entries with an SH-14 preview; validity chosen through IC-07 from durations up to the cap; IC-12 confirmation stating the price, the validity and that the shipper will be notified; a decline takes an IC-09 reason and an IC-01 message; both carry the request version.
- **Device needs:** DV-DESK. DV-AT: full parity.
- **Accessibility requirements:** The margin against the floor stated in words; a below-floor refusal is tied to the price entry (IC-02).
- **Loading states:** LS-5 "Sending quote…" or "Declining…"; LS-4 after 30 s becomes E-TIMEOUT and is retried with the same idempotency key.
- **Error states:** E-VALIDATION: price below the floor, validity beyond the cap, or a decline without a reason. E-CONFLICT: the request was withdrawn or answered meanwhile. E-PRECONDITION: the draft changed since the request was opened (SSB-8). E-SERVER, E-TIMEOUT → retry with entries kept.
- **Empty states:** EM-5: the section opens only for a claimed request, so it always has one.
- **Reuse potential:** SH-14 for the breakdown; the decline-with-reason pattern of IC-62.
- **Technical notes:** The server enforces the floor and claim ownership; one idempotency key per answer; the shipper is notified through XS-03; audit `quote_request.priced` (shipper price, carrier pay), `quote_request.declined` (reason); analytics `quote.custom.priced` with time to price, `quote.custom.declined` with the reason code.

## 12. System Pages

### PG-53 — Not Found

#### SC-53.1 — Recovery routes
- **Purpose:** Get the user somewhere useful.
- **Responsibilities:** State that the page was not found without revealing whether a record exists; route to the role root or home; offer quick find (signed in) or help search (signed out).
- **Data requirements:** Session presence and role (to resolve the role root); no record data is read.
- **Interaction model:** Navigation to the role root (signed in) or home (signed out); IC-19 search running quick find through `use-quick-find` when signed in, or help search through `use-help-search` when signed out.
- **Device needs:** DV-DESK, DV-PHONE and DV-CAB (a driver following a stale link): reach the role root in one action. DV-AT: full parity.
- **Accessibility requirements:** Heading states the problem and receives focus on arrival (SSB-6); the page title says "Page not found · Haulr" (SSB-7); recovery routes are named links; the search is a labelled search landmark.
- **Loading states:** Not applicable to the page, which renders from the session alone; search results follow IC-19 with LS-2.
- **Error states:** Not applicable to the page itself; a failed search follows IC-19 (E-SERVER with retry) while the navigation routes remain.
- **Empty states:** EM-5: the recovery routes always render; an empty search follows EM-2 within IC-19.
- **Reuse potential:** Per-group `not-found.tsx`; also rendered for records the user cannot access (Phase 3 §5.2).
- **Technical notes:** HTTP 404, identical for missing and inaccessible records so existence is never confirmed; the requested path is never echoed; analytics `system.not_found.viewed` with route group only (no path parameters).

### PG-54 — Server Error

#### SC-54.1 — Retry and report
- **Purpose:** Recover from a failure.
- **Responsibilities:** State that something went wrong; retry via `reset()`; route to PG-08 with the error digest.
- **Data requirements:** Error digest and the request's correlation ID (`x-request-id`) where available; no other data is read.
- **Interaction model:** Retry re-renders the failed segment through `reset()` (IC-60); report routes to PG-08 with the digest and correlation ID prefilled as the support reference; after 3 failed retries the report route is stated as the next step (E-TIMEOUT rule).
- **Device needs:** DV-DESK, DV-PHONE and DV-CAB: retry in one action and reach support. DV-AT: full parity.
- **Accessibility requirements:** Focus moves to the heading; the heading states the problem in plain words; the support reference is text that can be copied (IC-44 copy behaviour) and read aloud; retry outcome announced politely.
- **Loading states:** LS-5 while the retry re-renders the segment, with the retry action busy.
- **Error states:** E-SERVER / E-CONTRACT: retry fails → report route with the same reference. E-OFFLINE: retry needs a connection (SSB-4) and says so instead of failing silently.
- **Empty states:** EM-5: the page always renders its message, retry and report routes.
- **Reuse potential:** Every segment `error.tsx`; `global-error.tsx` for root failures.
- **Technical notes:** No stack traces; no console logging in components; errors are reported by the error-reporting service with release, route and correlation ID and without PII (NFR-OBS-2); HTTP 500 status for server-rendered failures; analytics `system.error.viewed` and `system.error.retried` with route group.

### PG-55 — Access Denied

#### SC-55.1 — Access explanation
- **Purpose:** Explain why the route is unavailable.
- **Responsibilities:** State that the user's role does not include this area; name organisation admins who can change access; route to role root.
- **Data requirements:** Role, admins (display names of the organisation's admins from `use-members`, server-read).
- **Interaction model:** Navigation to the role root; the admins' names are informational (no request-access flow).
- **Device needs:** DV-DESK and DV-PHONE: understand the refusal and return to the role root. DV-AT: full parity.
- **Accessibility requirements:** Heading states the problem and receives focus on arrival (SSB-6); the page title says "Access denied · Haulr" (SSB-7); admin names and the route are text and named links.
- **Loading states:** Not applicable — server-rendered from the session and a single admin lookup; no client fetch.
- **Error states:** Not applicable to the route decision; if the admin lookup fails the page still renders without names and says "Ask an organisation admin".
- **Empty states:** EM-5: the explanation and role-root route always render; when the organisation has no other admin, the organisation's own admin role is named instead.
- **Reuse potential:** Deliberately single-use: used only when a whole route is outside the user's role; record-level refusals use PG-53 (Phase 3 §5.2). A view-as session reaching a route excluded by BR-27 (payout and payment methods, API keys, data export) also lands here with that reason.
- **Technical notes:** HTTP 403; admins' names are Confidential and only the viewer's own organisation's admins are listed; the E-FORBIDDEN event is recorded with the capability (§2.2); analytics `system.forbidden.viewed` with route group and role enum.

## 12a. Enterprise Pages

### PG-56 — Bulk Load Import

#### SC-56.1 — File intake and mapping
- **Purpose:** Accept a file and map its columns to load fields.
- **Responsibilities:** Offer the template download and the column dictionary. Accept CSV or XLSX up to 5 MB and 500 rows (BR-28). Detect headers. Propose a mapping, reusing the last saved mapping for this organisation. Let the user correct and save the mapping.
- **Data requirements:** `useImportBatch()` in `use-bulk-import.ts` (create batch, upload URL, mapping proposals); saved mappings via `useImportMappings`.
- **Interaction model:** The user selects a file (IC-61), reviews the proposed mapping, adjusts unmapped or mis-mapped columns (IC-07 per column) and continues to validation. Mandatory fields must be mapped before continuing.
- **Device needs:** DV-DESK: full. DV-AT: mapping available as a labelled list of column-to-field pairs. DV-PHONE: not supported; the page says so and offers batch status only.
- **Accessibility requirements:** File outcome announced; each unmapped mandatory field listed in the IC-02 summary.
- **Loading states:** LS-5 during upload with progress; LS-7 for server parse (≤ 10 s for 500 rows).
- **Error states:** E-VALIDATION: wrong type, over 5 MB, over 500 rows, no header row, unreadable encoding; each is named and nothing is created.
- **Empty states:** EM-1: no file yet; explains the template.
- **Reuse potential:** IC-61 is generic, so future bulk imports (facilities, fleet) reuse this section's pattern.
- **Technical notes:** Parsing server-side only; file stored 30 days then deleted (NFR-PRIV-4). Audit: `import.uploaded`. Analytics: `load.import.started` with row count.

#### SC-56.2 — Row validation and correction
- **Purpose:** Show the outcome of every row and let the user fix problems.
- **Responsibilities:**
  - Classify each row as valid, warning or invalid, with every reason.
  - Detect duplicates within the file and against existing loads.
  - Match facilities, or offer to create them.
  - Allow a row to be corrected and re-validated in place.
  - Allow excluding rows.
- **Data requirements:** `useImportRows(batchId, { outcome, cursor })`; `useUpdateImportRow`.
- **Interaction model:** The user filters rows by outcome (IC-20), corrects fields in place (IC-01, IC-05, IC-08) with immediate row re-validation, excludes rows (IC-23), and continues when no invalid rows remain included.
- **Device needs:** DV-DESK: keyboard-efficient correction of many rows. DV-AT: rows as a data table with row headers (reference) and cell-level error descriptions.
- **Accessibility requirements:** Outcome counts announced after each re-validation; each invalid cell has its error text associated (`aria-describedby`); IC-22 table semantics.
- **Loading states:** LS-2 per re-validated row; LS-7 for full-batch re-validation.
- **Error states:**
  - Row errors are outcomes, not failures.
  - E-PRECONDITION: the batch changed in another tab, so reload.
  - E-UNAVAILABLE: facility matching unavailable; rows are marked as "needs facility review".
- **Empty states:** EM-3: no invalid rows; states that the batch is ready to price.
- **Reuse potential:** Row-outcome behaviour is reused by future bulk imports.
- **Technical notes:** Page size 100 rows; duplicate key = shipper reference + pickup date. Analytics: `load.import.validated` with outcome counts.

#### SC-56.3 — Batch pricing and confirmation
- **Purpose:** Price valid rows and post them only on confirmation.
- **Responsibilities:**
  - Price every valid row, with quote validity (BR-06).
  - Total the batch.
  - Split rows into post-now, needs-approval (BR-23) and draft (unpriced).
  - Apply one tender strategy to the batch.
  - Confirm and post.
- **Data requirements:** `usePriceImportBatch`, `useConfirmImportBatch`.
- **Interaction model:** The user reviews totals (SH-14) and the split, chooses the tender strategy (IC-09), and confirms (IC-12 stating count, total and approvals needed). Re-pricing is offered when quotes approach expiry (IC-46).
- **Device needs:** DV-DESK and DV-AT: full parity.
- **Accessibility requirements:** Totals and counts are text; quote countdown per IC-46.
- **Loading states:** LS-7 for pricing, with progress; LS-5 for confirmation.
- **Error states:**
  - E-CONFLICT: some quotes expired before confirmation; re-price them.
  - E-UNAVAILABLE: pricing down; those rows go to draft with a custom-quote request.
  - Partial post failure is reported per row.
- **Empty states:** EM-5: reached only with at least one valid row. EM-4: no priced rows yet while validation runs.
- **Reuse potential:** SH-14 totals; IC-23 bulk-scope confirmation.
- **Technical notes:** Idempotent by batch ID. Audit: `load.import.confirmed`, then `load.posted` per load with the batch ID. Analytics: `load.import.confirmed` with counts per outcome.

#### SC-56.4 — Batch history and results
- Instance of **SH-05** over the organisation's import batches (last 90 days). Overrides: `useImportBatches({ cursor })`; each batch offers its results file (CSV of every row with its final outcome and created load reference); EM-1 when none; batch status polled every 5 s while any batch is processing.

### PG-57 — Templates and Recurring Loads

#### SC-57.1 — Template collection
- Instance of **SH-05** over templates. Overrides: `useLoadTemplates({ owner, shared, q, cursor })`; filters by owner and lane; actions per template: post now (opens PG-27 with `?template=`), edit, duplicate, delete (IC-12); EM-1 explains saving from PG-40 or PG-27.

#### SC-57.2 — Template editor
- **Purpose:** Define what a template pre-fills.
- **Responsibilities:** Edit the lane, stops, freight, equipment, reference pattern (for example `PO-{date}`), tender strategy and sharing. Validate against current facilities and enums.
- **Data requirements:** `useLoadTemplates` mutations; `useFacilities`.
- **Interaction model:** Same entry behaviours as SC-27.2 and SC-27.3 without quoting; save; sharing requires `shipper.admin`.
- **Device needs:** DV-DESK; DV-AT full parity; DV-PHONE read-only.
- **Accessibility requirements:** IC-02 validation summary.
- **Loading states:** LS-1 while the template and current facilities load; LS-5 on save, with entries kept if the save fails.
- **Error states:**
  - E-VALIDATION: a referenced facility was deleted, or the reference pattern is invalid.
  - E-PRECONDITION: the template was edited by a colleague (IC-67).
- **Empty states:** EM-5: editing an existing or new template always has a form.
- **Reuse potential:** Shares schemas with SC-27.2 and SC-27.3 (`lib/validations/load.ts`).
- **Technical notes:** Templates never store quotes. Audit: `load_template.created`, `load_template.updated`, `load_template.deleted`.

#### SC-57.3 — Recurrence schedule
- **Purpose:** Generate loads from a template on a schedule.
- **Responsibilities:**
  - Set weekdays, start and end dates (horizon ≤ 12 weeks), generation lead time (default 72 h) and auto-post or draft.
  - Set a price guardrail for auto-post.
  - List upcoming occurrences with their status.
  - Pause, resume and skip single occurrences.
- **Data requirements:** `useRecurrences(templateId)`.
- **Interaction model:** Choose days (IC-07 multi), dates (IC-08), and mode (IC-09); the guardrail uses IC-01 currency. Pausing and skipping use IC-12 when occurrences are already generated.
- **Device needs:** DV-DESK full; DV-PHONE pause, resume and skip; DV-AT full parity.
- **Accessibility requirements:** Upcoming occurrences as a list with absolute dates.
- **Loading states:** LS-1 while the recurrence and its next 12 weeks of occurrences load; LS-5 on change, after which upcoming occurrences are recomputed server-side and refreshed.
- **Error states:** E-VALIDATION: horizon over 12 weeks; auto-post chosen without a guardrail, or with a guardrail above the owner's spend limit (BR-23). E-UNAVAILABLE: pricing down → occurrences are created as drafts.
- **Empty states:** EM-1: no recurrence; explains scheduling.
- **Reuse potential:** None; recurrence rules are specific to load generation.
- **Technical notes:** Generation happens server-side in the facility time zone. Audit: `recurrence.created`, `recurrence.updated`, `recurrence.paused`, `recurrence.resumed`, `occurrence.skipped`.

### PG-58 — Approvals

#### SC-58.1 — Approval queue
- Instance of **SH-07** and **SH-05** over approval requests. Overrides: `useApprovalRequests({ status, type, requester, cursor })`; default view is pending requests the user may decide; requesters reach their own requests read-only and are never offered a decision on them; each item carries type, amount versus limit, requester, and time remaining until quote or bid expiry; EM-3 "Nothing awaiting approval" with last-checked time; polling every 30 s.

#### SC-58.2 — Request evidence
- **Purpose:** Give the approver what they need to judge the request.
- **Responsibilities:**
  - Present the subject summary (lane, dates, equipment or bid or amendment change).
  - Present the amount with its SH-14 breakdown.
  - Compare the amount with the 90-day lane median and range for the organisation.
  - Present the carrier scorecard for bids (SH-09).
  - Present the requester's note and prior decisions on similar requests.
- **Data requirements:** `useApprovalRequest(requestId)` in `use-approvals.ts`.
- **Interaction model:** Read; open the subject record (PG-40, PG-28).
- **Device needs:** DV-PHONE: the essentials (amount, lane, deadline, comparison) available without navigation. DV-DESK and DV-AT: full.
- **Accessibility requirements:** Comparison expressed in words ("14% above your 90-day median").
- **Loading states:** LS-1 with the request; lane statistics load separately (LS-1) so the decision is never blocked by the comparison; LS-3 after 5 s states that the comparison is still loading.
- **Error states:** E-NOT-FOUND: request withdrawn.
- **Empty states:** EM-4: lane history unavailable for new lanes; the page says so.
- **Reuse potential:** SC-40.17 shows the same evidence for a single load.
- **Technical notes:** Lane statistics from the reporting service. Classification: Confidential.

#### SC-58.3 — Decision
- **Purpose:** Approve or reject with accountability.
- **Responsibilities:** Offer approve and reject (reason required) or request changes. Refuse self-approval. Complete the original action on approval and report its result.
- **Data requirements:** `useDecideApproval` in `use-approvals.ts`.
- **Interaction model:** IC-62.
- **Device needs:** DV-PHONE decision in under 30 s; DV-DESK and DV-AT full parity.
- **Accessibility requirements:** Per IC-62.
- **Loading states:** LS-5 while deciding; both decision actions are busy (G-6) until the server confirms and the downstream action (post, accept) reports its result.
- **Error states:**
  - E-CONFLICT: decided by another approver, or the subject expired; the page names who decided or states the expiry.
  - E-FORBIDDEN: self-approval.
  - E-UNAVAILABLE: the original action could not complete; the approval stands, and the requester is told to retry.
- **Empty states:** EM-5: present only for a pending request.
- **Reuse potential:** SC-40.17.
- **Technical notes:** Version-checked (SSB-8). Audit: `approval.approved` and `approval.rejected` with reason. Analytics: `approval.decided` with latency.

#### SC-58.4 — Delegation
- **Purpose:** Keep approvals moving while an approver is away.
- **Responsibilities:** Set a delegate (another eligible approver) with a date range. Report active delegations. Enforce that delegates cannot approve their own requests.
- **Data requirements:** `useApprovalDelegations()` in `use-approvals.ts` → active and scheduled delegations for the current approver; eligible delegates (`shipper.approver` and `shipper.admin`, who may both approve) from `useMembers`.
- **Interaction model:** Choose delegate (IC-07) and dates (IC-08); save; end early.
- **Device needs:** DV-DESK, DV-PHONE; DV-AT full parity.
- **Accessibility requirements:** Active delegation stated as text.
- **Loading states:** LS-1 while delegations load; LS-5 on save or end, with the delegation state announced once confirmed.
- **Error states:** E-VALIDATION: the delegate is not eligible, or the dates overlap an existing delegation.
- **Empty states:** EM-1: no delegation.
- **Reuse potential:** Single-use by design: delegation is an approval-policy concern; no other workflow delegates authority.
- **Technical notes:** Audit: `approval.delegated`, `approval.delegation_ended`.

### PG-59 — Reports

#### SC-59.1 — Report catalogue and filters
- **Purpose:** Choose a report and scope it.
- **Responsibilities:** Enumerate the catalogue (spend, lane cost, service, carrier performance, accessorials, facility dwell and detention, invoice ageing) filtered by role (Phase 3 §5.1a). Apply period, lane, facility, carrier and equipment filters in the URL. Save named report views.
- **Data requirements:** Catalogue from constants; saved views via `useSavedReports`.
- **Interaction model:** Select report; set filters (IC-20, IC-17); save view (IC-01 name).
- **Device needs:** DV-DESK full; DV-PHONE open saved views; DV-AT full parity.
- **Accessibility requirements:** Filters per IC-20; the chosen report and period are announced when results change.
- **Loading states:** The catalogue comes from constants and needs no fetch; saved views load with LS-1; saving a view is LS-5.
- **Error states:** E-VALIDATION: period over 36 months.
- **Empty states:** EM-5: the catalogue is never empty for a permitted role.
- **Reuse potential:** Filter parameter names shared with Phase 3 §10.
- **Technical notes:** Analytics: `report.viewed` with report ID.

#### SC-59.2 — Report results
- Instance of **SH-08**, extended to full reports. Overrides: `useReport(reportId, filters)`; every figure has a definition and the data-currency time; charts follow IC-45 with a data table; EM-4 states how many delivered loads the report needs; LS-3 for periods over 12 months; totals reconcile with the ledger.

#### SC-59.3 — Schedules and exports
- **Purpose:** Deliver reports on a schedule or as files.
- **Responsibilities:** Export the current view (CSV, XLSX) as a background job. Schedule a view weekly or monthly to named organisation members. List and cancel schedules.
- **Data requirements:** `useReportSchedules`, `useRequestExport` (IC-65).
- **Interaction model:** Export via IC-65; schedule with recipients (IC-07 multi from members), cadence (IC-09) and time (IC-08); cancel with IC-12.
- **Device needs:** DV-DESK; DV-AT full parity.
- **Accessibility requirements:** Schedule summary as text ("Mondays 07:00 CT to 3 people").
- **Loading states:** LS-7 exports; LS-5 schedule changes.
- **Error states:** E-RATE-LIMIT: concurrent exports; E-VALIDATION: recipients must be organisation members.
- **Empty states:** EM-1: no schedules.
- **Reuse potential:** IC-65 export behaviour shared with PG-62, PG-63.
- **Technical notes:** Scheduled deliveries send an authenticated link, never an attachment with Confidential data. Audit: `report.exported`, `report_schedule.changed`.

### PG-60 — Security and SSO

#### SC-60.1 — Domain verification
- **Purpose:** Prove the organisation owns its email domains.
- **Responsibilities:** Add a domain; issue a DNS TXT challenge; verify on request and automatically every 6 hours for 7 days; report status; remove a domain (IC-12, blocked while SSO is enforced for it).
- **Data requirements:** `useVerifiedDomains` in `use-security.ts`.
- **Interaction model:** Add a domain (IC-01), copy the TXT value (IC-44), verify, then read the result.
- **Device needs:** DV-DESK; DV-AT full parity.
- **Accessibility requirements:** Challenge value available as selectable text; result announced.
- **Loading states:** LS-5 verification (≤ 10 s).
- **Error states:**
  - E-VALIDATION: not a registrable domain; a public email domain such as gmail.com.
  - E-CONFLICT: verified by another organisation; the page routes to support.
  - TXT record not found: the page states the propagation expectation.
- **Empty states:** EM-1: explains why verification is needed.
- **Reuse potential:** Single-use by design: domain ownership is proven once per organisation and consumed by SC-60.2 and SC-10.3 through `useVerifiedDomains`.
- **Technical notes:** Sensitive action (IC-13). Audit: `domain.added`, `domain.verified`, `domain.removed`.

#### SC-60.2 — SSO connection and test
- **Purpose:** Connect the identity provider and prove it works.
- **Responsibilities:** Configure SAML (metadata URL or file, entity ID, ACS URL provided) or OIDC (issuer, client ID, secret). Report certificate expiry. Run a test sign-in with the admin's own identity and report assertion diagnostics.
- **Data requirements:** `useSsoConnection` in `use-security.ts`.
- **Interaction model:** Choose protocol (IC-09); enter or upload configuration (IC-01, IC-24); save after re-authentication (IC-13); run test (IC-11) in a new window; read diagnostics.
- **Device needs:** DV-DESK only; DV-AT full parity.
- **Accessibility requirements:** Diagnostics as a list of named checks with pass or fail in text.
- **Loading states:** LS-5 for save; the test waits up to 30 s for the round trip, then E-TIMEOUT.
- **Error states:**
  - E-VALIDATION: malformed metadata, or a certificate that is expired or expires within 14 days (warning).
  - Test failures name the check: audience, recipient, signature, clock skew, missing email or name attributes.
- **Empty states:** EM-1: prerequisites listed.
- **Reuse potential:** Single-use by design: one SSO connection per organisation; the diagnostics format is reused by support in PG-52 read-only.
- **Technical notes:** The OIDC client secret is write-only, never returned. Audit: `sso_connection.created`, `sso_connection.updated`, `sso.test_succeeded`, `sso.test_failed`.

#### SC-60.3 — Role mapping and SCIM
- **Purpose:** Assign Haulr roles from identity-provider groups and automate membership.
- **Responsibilities:**
  - Map groups to role keys, including `org.security` and `shipper.approver`.
  - Set the default role for unmapped users (or deny).
  - Enable SCIM and issue its token (IC-63), rotate it and report last sync.
  - Report provisioning errors.
- **Data requirements:** `useScim`, `useRoleMappings` in `use-security.ts`.
- **Interaction model:** Add a mapping (IC-01 group name, IC-07 role); reorder precedence (IC-40); generate or rotate the token (IC-63 with IC-13).
- **Device needs:** DV-DESK; DV-AT full parity.
- **Accessibility requirements:** Precedence changes announced (IC-40).
- **Loading states:** LS-1 while mappings and SCIM status load; SCIM last-sync time refreshes on focus (LS-2); LS-5 on mapping save and token rotation.
- **Error states:** E-VALIDATION: a mapping to a role the organisation side cannot hold (for example `carrier.driver` for a shipper). SCIM sync errors are listed with the affected user and reason.
- **Empty states:** EM-1: no mappings, and the default role is stated.
- **Reuse potential:** Single-use by design: identity-provider group mapping has no other consumer; role keys come from the shared enum.
- **Technical notes:** Deprovisioning revokes sessions within 5 min (BR-24). Audit: `role_mapping.changed`, `scim.enabled`, `scim_token.rotated`, `member.provisioned`, `member.deprovisioned`.

#### SC-60.4 — Enforcement and session policy
- **Purpose:** Decide how strictly the policy applies.
- **Responsibilities:** Toggle SSO enforcement with a designated break-glass admin. Set idle timeout (15–120 min) and IP allow-list (CIDR list, for admin roles). Require MFA for password users. Preview who is affected.
- **Data requirements:** `useSessionPolicy` in `use-security.ts`.
- **Interaction model:** Change settings; review the impact preview ("12 members will be signed out"); confirm (IC-12 with IC-13).
- **Device needs:** DV-DESK; DV-AT full parity.
- **Accessibility requirements:** Impact stated as text before confirmation.
- **Loading states:** LS-5 while the impact preview is computed (≤ 3 s) and again while the policy is applied; the list of affected members stays available during both.
- **Error states:**
  - E-PRECONDITION: enforcing without a passing test in the last 24 h, without a break-glass admin, or with an IP list that excludes the current admin's IP.
  - E-VALIDATION: invalid CIDR.
- **Empty states:** EM-5: policy always has values (defaults from SEC-3).
- **Reuse potential:** Single-use by design: organisation session policy is set in one place (BR-24).
- **Technical notes:** Audit: `sso.enforcement_changed`, `session_policy.changed`, `ip_allowlist.changed`.

#### SC-60.5 — Security policy history
- Instance of **SH-11** scoped to security-policy actions of the organisation.

### PG-61 — Integrations

#### SC-61.1 — API keys
- **Purpose:** Issue and control API credentials (BR-29).
- **Responsibilities:** Create keys with name, scopes and expiry (≤ 12 months). Reveal once (IC-63). Rotate with an overlap window (≤ 7 days). Revoke immediately. Report last use (time, IP) and status.
- **Data requirements:** `useApiKeys` in `use-integrations.ts`.
- **Interaction model:** Create (IC-01, IC-07 multi scopes, IC-08 expiry) then IC-13 then IC-63 reveal. Rotate with IC-12 stating the overlap end. Revoke with IC-12.
- **Device needs:** DV-DESK full; DV-PHONE revoke only; DV-AT full parity.
- **Accessibility requirements:** Secret reveal per IC-63; expiry as text.
- **Loading states:** LS-1 while keys load (metadata only, never secrets); LS-5 on create, rotate and revoke, with the reveal (IC-63) following creation immediately.
- **Error states:** E-VALIDATION: no scope, too many scopes for the role, or expiry beyond 12 months. E-FORBIDDEN: scope not permitted for the organisation.
- **Empty states:** EM-1: no keys; links API documentation.
- **Reuse potential:** Single-use by design; the reveal-once behaviour is shared through IC-63 with SC-60.3 and SC-61.2.
- **Technical notes:** Keys stored hashed; prefix displayed for identification. Keys expiring within 14 days are notified. Audit: `api_key.created`, `api_key.rotated`, `api_key.revoked`.

#### SC-61.2 — Webhooks and deliveries
- **Purpose:** Push events to customer systems and diagnose delivery.
- **Responsibilities:** Register HTTPS endpoints with event subscriptions. Rotate the signing secret (IC-63). Send a test event. Present the 30-day delivery log with attempts and response codes. Replay single or filtered failed deliveries.
- **Data requirements:** `useWebhooks`, `useWebhookDeliveries(endpointId, filters)` in `use-integrations.ts`.
- **Interaction model:** Add endpoint (IC-01 URL, IC-07 events); test (IC-11); filter deliveries (IC-20); replay (IC-23 bulk scope, IC-12).
- **Device needs:** DV-DESK; DV-PHONE health only; DV-AT full parity (delivery log as table).
- **Accessibility requirements:** Health summary as text ("98.2% delivered in 24 h, 3 failing").
- **Loading states:** LS-1; LS-2 delivery log every 60 s while viewed; LS-5 test (≤ 10 s); LS-7 replay.
- **Error states:**
  - E-VALIDATION: non-HTTPS URL, private or loopback address, or no events selected.
  - Test failure: the page reports the code and latency.
  - E-RATE-LIMIT: replay over 1,000 events.
- **Empty states:** EM-1: no endpoints. EM-3: no failed deliveries.
- **Reuse potential:** Single-use by design; delivery-log filtering reuses IC-20 and replay reuses IC-23 bulk scope rules.
- **Technical notes:** HMAC-SHA256 signatures with timestamp; retries with exponential back-off for 24 h (BR-29). Audit: `webhook.created`, `webhook.updated`, `webhook.deleted`, `webhook.replayed`, `webhook_secret.rotated`.

#### SC-61.3 — EDI connections
- **Purpose:** Request and monitor EDI trading-partner connections.
- **Responsibilities:** Request a connection (transaction sets 204, 990, 214, 210; test or production). Report setup status set by Haulr operations. Report the transaction log (7 days) with acknowledgements (997) and errors.
- **Data requirements:** `useEdiConnections` in `use-integrations.ts`.
- **Interaction model:** Request (IC-07 transaction sets, IC-01 partner IDs); read status; filter transactions (IC-20).
- **Device needs:** DV-DESK; DV-AT full parity.
- **Accessibility requirements:** Transaction log as table.
- **Loading states:** LS-1; LS-2 every 60 s while viewed.
- **Error states:** E-VALIDATION: missing partner qualifiers; rejected transactions listed with reason codes.
- **Empty states:** EM-1: no connections; explains the setup process and lead time.
- **Reuse potential:** Single-use by design: EDI setup is operations-assisted and specific to trading partners.
- **Technical notes:** Setup completed by operations outside this page. Audit: `edi_connection.requested`, `edi_connection.status_changed`.

### PG-62 — Data and Privacy

#### SC-62.1 — Organisation exports
- **Purpose:** Export the organisation's data (NFR-PRIV-6).
- **Responsibilities:** Choose datasets (loads, stops and events, documents, invoices, settlements, claims, members, audit), format (CSV, JSON) and range (≤ 24 months per export). Run as a job. List jobs with status, size and expiry. Download.
- **Data requirements:** `useExports` in `use-privacy.ts` (IC-65).
- **Interaction model:** IC-65 with IC-13.
- **Device needs:** DV-DESK; DV-AT full parity.
- **Accessibility requirements:** Job status changes announced politely while viewed.
- **Loading states:** LS-7; LS-2 job status every 10 s while viewed.
- **Error states:** E-VALIDATION: range over 24 months, with splitting suggested. E-NOT-FOUND: expired download, with re-issue offered.
- **Empty states:** EM-1: no exports; describes datasets.
- **Reuse potential:** IC-65 shared with PG-59 and PG-63.
- **Technical notes:** Export includes a manifest with row counts and checksums. Audit: `export.requested`, `export.downloaded`.

#### SC-62.2 — Personal data requests
- **Purpose:** Let any user exercise privacy rights (BR-30).
- **Responsibilities:** Submit access, correction or deletion requests. Re-verify identity (IC-13). Present due dates and status. Deliver outcome reports. Explain retained data and its legal basis.
- **Data requirements:** `usePrivacyRequests` in `use-privacy.ts`.
- **Interaction model:** Choose request type (IC-09); for deletion, review blocking obligations and consequences (IC-12); submit.
- **Device needs:** DV-PHONE and DV-DESK; DV-AT full parity.
- **Accessibility requirements:** Consequences of deletion as text before confirmation.
- **Loading states:** LS-1 while request history loads; LS-5 on submission after re-authentication (IC-13), with the due date announced on acknowledgement.
- **Error states:**
  - E-CONFLICT: deletion blocked by named obligations; the request resumes automatically when they close.
  - E-VALIDATION: a duplicate open request of the same type.
- **Empty states:** EM-1: explains rights and response times.
- **Reuse potential:** Single-use by design: privacy requests are a legal process (BR-30) with their own fulfilment workflow.
- **Technical notes:** Deletion of the last admin is blocked until another admin exists. Audit: `privacy_request.submitted`, `privacy_request.fulfilled`.

### PG-63 — Audit Log

#### SC-63.1 — Audit search and detail
- Instance of **SH-11** scoped to the organisation. Overrides: `useAuditLog({ scope: 'organisation', actor, actorType, action, targetType, targetId, from, to, cursor })`; actor types member, Haulr staff via view-as, API key and system are always distinguished; event detail shows before and after values with Restricted values masked; page size 100; LS-3 for ranges over 90 days; EM-2 states the retention boundary (BR-26).

#### SC-63.2 — Audit export
- **Purpose:** Produce audit evidence files.
- **Responsibilities:** Export the current filters as CSV or JSON via IC-65, with a checksum file. List recent audit exports.
- **Data requirements:** `useRequestExport({ dataset: 'audit', filters })`.
- **Interaction model:** IC-65.
- **Device needs:** DV-DESK; DV-AT full parity.
- **Accessibility requirements:** Per IC-65.
- **Loading states:** LS-7 while the export job runs; status polled every 10 s while the page is open (Phase 7 §13); the user may leave and is notified on completion.
- **Error states:** E-RATE-LIMIT: concurrent exports. E-VALIDATION: range outside retention.
- **Empty states:** EM-1: no exports yet.
- **Reuse potential:** SC-62.1 job listing.
- **Technical notes:** Exports themselves are audited (`audit_log.exported`, as SH-11).

### PG-64 — Review Amendment

#### SC-64.1 — Change comparison
- **Purpose:** Show exactly what the amendment changes.
- **Responsibilities:** Compare governing and proposed terms field by field, including stops, appointments with time zones, equipment, weight and accessorial terms. Mark added, removed and changed values. State materiality and the response deadline.
- **Data requirements:** `useAmendment(loadId, amendmentId)` in `use-loads.ts`.
- **Interaction model:** IC-66.
- **Device needs:** DV-PHONE: full comparison readable from a notification. DV-DESK and DV-AT: full parity.
- **Accessibility requirements:** Changes described in words ("Delivery appointment changed from 14:00 to 17:00 CDT"), never only by marking.
- **Loading states:** LS-1 server-rendered with the amendment, so the comparison is complete on arrival; LS-2 re-checks the amendment version every 30 s while open (SSB-8).
- **Error states:** E-PRECONDITION: the amendment was revised after opening; the new comparison is loaded and the change stated. E-NOT-FOUND: not a party.
- **Empty states:** EM-5: an amendment always changes at least one field (server rule).
- **Reuse potential:** SC-40.16.
- **Technical notes:** Classification: Confidential.

#### SC-64.2 — Money effect
- Instance of **SH-14** showing before and after for the viewer's side only (BR-05): carrier pay for carriers, shipper price for shipper roles, both for internal roles; the difference stated in words.

#### SC-64.3 — Decision and signature
- **Purpose:** Accept or decline bindingly (BR-25).
- **Responsibilities:** Accept with signature evidence (IC-26). Decline with reason; for material amendments, offer penalty-free cancellation (IC-12 stating the consequence). Let shipper roles withdraw instead.
- **Data requirements:** `useDecideAmendment` in `use-loads.ts`.
- **Interaction model:** IC-26 then IC-11 accept; decline via IC-12 with reason.
- **Device needs:** DV-PHONE and DV-DESK; DV-AT full parity.
- **Accessibility requirements:** Deadline per IC-46; outcome announced.
- **Loading states:** LS-5 while signing and submitting; the decision actions are busy (G-6) and the comparison stays readable; timeout after 30 s becomes E-TIMEOUT with the same idempotency key on retry.
- **Error states:**
  - E-CONFLICT: withdrawn, lapsed or already decided; the page states the governing version.
  - E-VALIDATION: signature name mismatch.
- **Empty states:** EM-5: present only while the amendment is open.
- **Reuse potential:** Signature behaviour from SC-34.3.
- **Technical notes:** Idempotent with the amendment version. Audit: `amendment.accepted`, `amendment.declined`. Analytics: `amendment.decided`.

#### SC-64.4 — Trip impact
- **Purpose:** Help the carrier judge feasibility.
- **Responsibilities:** State the assigned driver, current trip progress and position age, whether the new appointments are reachable from the current ETA, and whether the change requires reassignment.
- **Data requirements:** `useLoadPositions(loadId)`, `useLoad(loadId)`.
- **Interaction model:** Read-only.
- **Device needs:** DV-PHONE and DV-DESK; DV-AT full parity.
- **Accessibility requirements:** Feasibility stated in words ("New delivery appointment is 3 h after current ETA").
- **Loading states:** LS-1; LS-2 per SH-02 interval.
- **Error states:** E-UNAVAILABLE: ETA unavailable; the page says the feasibility check cannot be computed.
- **Empty states:** EM-4: no driver assigned yet; the page says so.
- **Reuse potential:** SH-02 data.
- **Technical notes:** Read-only; no audit events.

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
| PG-10 | SC-10.1 … SC-10.3 | 3 |
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
| PG-24 | SC-24.1 … SC-24.4 | 4 |
| PG-25 | SC-25.1 … SC-25.3 | 3 |
| PG-26 | SC-26.1 … SC-26.3 | 3 |
| PG-27 | SC-27.1 … SC-27.7 | 7 |
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
| PG-40 | SC-40.1 … SC-40.17 | 17 |
| PG-41 | SC-41.1, SC-41.2 | 2 |
| PG-42 | SC-42.1, SC-42.2 | 2 |
| PG-43 | SC-43.1, SC-43.2 | 2 |
| PG-44 | SC-44.1, SC-44.2 | 2 |
| PG-45 | SC-45.1 … SC-45.4 | 4 |
| PG-46 | SC-46.1, SC-46.2 | 2 |
| PG-47 | SC-47.1 … SC-47.3 | 3 |
| PG-48 | SC-48.1 … SC-48.4 | 4 |
| PG-49 | SC-49.1 … SC-49.3 | 3 |
| PG-50 | SC-50.1 … SC-50.4 | 4 |
| PG-51 | SC-51.1 … SC-51.5 | 5 |
| PG-52 | SC-52.1 … SC-52.4 | 4 |
| PG-53 | SC-53.1 | 1 |
| PG-54 | SC-54.1 | 1 |
| PG-55 | SC-55.1 | 1 |
| PG-56 | SC-56.1 … SC-56.4 | 4 |
| PG-57 | SC-57.1 … SC-57.3 | 3 |
| PG-58 | SC-58.1 … SC-58.4 | 4 |
| PG-59 | SC-59.1 … SC-59.3 | 3 |
| PG-60 | SC-60.1 … SC-60.5 | 5 |
| PG-61 | SC-61.1 … SC-61.3 | 3 |
| PG-62 | SC-62.1, SC-62.2 | 2 |
| PG-63 | SC-63.1, SC-63.2 | 2 |
| PG-64 | SC-64.1 … SC-64.4 | 4 |
| PG-65 | SC-65.1 … SC-65.4 | 4 |
| PG-66 | SC-66.1 … SC-66.3 | 3 |
| **Total** | **15 shared + 223 page sections** | **238** |

---

Previous: [Phase 4 — Page Blueprints](./phase-4-page-blueprints.md) · Next: [Phase 6 — Interaction Contracts](./phase-6-interaction-contracts.md)
