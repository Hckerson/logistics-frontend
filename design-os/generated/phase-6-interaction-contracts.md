# Phase 6 — Interaction Contracts

`Haulr Design OS` · `Version 1.0.0` · `2026-09-30` · Previous: [Phase 5 — Section Blueprints](./phase-5-section-blueprints.md) · Next: [Phase 7 — Frontend Architecture](./phase-7-frontend-architecture.md)

How every interactive element behaves. Sections in [Phase 5](./phase-5-section-blueprints.md) cite these contracts by ID (`IC-nn`). A contract defines behaviour only: inputs, states, keyboard and assistive-technology behaviour, validation, loading, errors and content rules. Which components exist, how they are grouped and how they look is decided when pages are built.

Baseline: WCAG 2.2 AA and the WAI-ARIA Authoring Practices patterns named in each contract. Copy referenced below lives in `lib/constants.ts` or feature constants (host rule 1).

## Table of Contents

1. [Contract Format and Global Rules](#1-contract-format-and-global-rules)
2. [Entry and Validation](#2-entry-and-validation) — IC-01 … IC-10
3. [Actions and Confirmation](#3-actions-and-confirmation) — IC-11 … IC-14
4. [Navigation and Structure](#4-navigation-and-structure) — IC-15 … IC-18
5. [Finding and Collections](#5-finding-and-collections) — IC-19 … IC-23
6. [Files, Capture and Signature](#6-files-capture-and-signature) — IC-24 … IC-26
7. [Freight Transactions](#7-freight-transactions) — IC-27 … IC-31
8. [Disclosure, Preferences and Social](#8-disclosure-preferences-and-social) — IC-32 … IC-41
9. [Money](#9-money) — IC-42, IC-43
10. [Sharing, Data and Time](#10-sharing-data-and-time) — IC-44 … IC-46
11. [Internal Operations](#11-internal-operations) — IC-47 … IC-49
12. [Global Utilities](#12-global-utilities) — IC-50 … IC-60
13. [Contract Usage Index](#13-contract-usage-index)

---

## 1. Contract Format and Global Rules

Each contract specifies: **Purpose**, **Inputs**, **States**, **Accessibility**, **Keyboard support**, **ARIA**, **Interaction patterns**, **Validation rules**, **Loading behavior**, **Error behavior**, **Content rules**, **Do**, **Don't** and **Dependencies**. The heading carries the **Name**.

Global rules that bind every contract:

- **G-1 Focus visible.** Every focusable element has a visible focus indicator meeting WCAG 2.4.7 and 2.4.11 (focus not obscured). How it looks is a build-time decision.
- **G-2 Target size.** Every pointer target meets WCAG 2.5.8 (minimum 24 × 24 CSS px) and the driver workflow (PG-39, PG-20) meets 44 × 44.
- **G-3 No colour-only meaning.** State is always conveyed in text or accessible name as well.
- **G-4 Motion respects preference.** Any animated transition honours `prefers-reduced-motion`; state changes never depend on animation completing.
- **G-5 Disabled means explained.** An unavailable action states why, through its accessible description, unless the reason is already stated in the same section.
- **G-6 Pending prevents duplicates.** An element whose action is in flight cannot be triggered again; the pending state is exposed via `aria-busy` or equivalent.
- **G-7 Server truth.** Client validation is a courtesy; the server validates again, and server errors map to the same field-level messages.

---

## 2. Entry and Validation

### IC-01 — Text input

- **Purpose:** Capture free text or numbers, including numbers with units (weight, miles, money).
- **Inputs:** `name`, label, value, type (text, email, tel, number-with-unit, currency), unit, required, min/max, pattern, autocomplete token, hint.
- **States:** empty, filled, focused, invalid, read-only, disabled, pending (async validation).
- **Accessibility:** Programmatic label always; hint and error associated through `aria-describedby`; units included in the accessible name ("Weight, pounds").
- **Keyboard support:** Standard text editing; Enter submits the enclosing form only for single-field forms.
- **ARIA:** `aria-invalid` when invalid; `aria-required` mirrors `required`; `inputmode` set for numeric types (`decimal`, `numeric`, `tel`).
- **Interaction patterns:** Validate on blur and on submit, never on each keystroke; once a field has shown an error, re-validate on change so the error clears as soon as it is fixed.
- **Validation rules:** From the Zod schema in `lib/validations/` composed over the contract; currency accepts at most 2 decimals; numbers accept locale grouping separators on input and normalise.
- **Loading behavior:** Async validation (for example email availability) runs after input settles and exposes pending.
- **Error behavior:** Message states what is wrong and how to fix it ("Enter a weight up to 45,000 lb"); server errors map to the field by name.
- **Content rules:** Labels are nouns ("Pickup reference"); hints state format; errors never blame ("Enter…" not "Invalid…").
- **Do:** Use the correct `autocomplete` token for personal data.
- **Don't:** Use placeholder text as the label; block paste.
- **Dependencies:** IC-02, `lib/validations/`.

### IC-02 — Form validation and error summary

- **Purpose:** Tell the user every problem in a form and get them to each.
- **Inputs:** Form schema, field errors (client and server), submit handler.
- **States:** pristine, dirty, submitting, submitted with errors, submitted successfully.
- **Accessibility:** On failed submit, a summary of errors receives focus; each entry links to its field; count stated ("3 problems").
- **Keyboard support:** Summary links move focus to the field.
- **ARIA:** Summary is a region with a heading and `role="alert"` on first appearance only; field errors via `aria-describedby`.
- **Interaction patterns:** Submit is always available (never disabled for invalid state); invalid submit shows the summary; valid submit enters pending (G-6).
- **Validation rules:** Single schema per form; server-returned field errors merged by field name; non-field errors appear in the summary.
- **Loading behavior:** Pending state on the submitting action; fields remain readable.
- **Error behavior:** Network failure keeps all entries and offers retry; nothing entered is ever cleared by an error.
- **Content rules:** Summary heading "There's a problem" (constant); entries mirror field messages.
- **Do:** Preserve entries across errors and navigation within a flow.
- **Don't:** Show errors before the user has interacted with a field or submitted.
- **Dependencies:** IC-01, IC-11.

### IC-03 — Password input

- **Purpose:** Capture a password securely.
- **Inputs:** Mode (current or new), policy (`PASSWORD_MIN_LENGTH` and rules), confirm required.
- **States:** hidden, revealed, invalid, policy-met.
- **Accessibility:** Reveal control is a toggle button with state; policy rules exposed as text and updated as met.
- **Keyboard support:** Reveal toggle reachable by Tab; Space/Enter toggles.
- **ARIA:** Reveal toggle uses `aria-pressed`; policy list with live updates polite and throttled.
- **Interaction patterns:** Reveal never persists across page loads; new-password mode shows policy before entry.
- **Validation rules:** Minimum length from constants; server strength check.
- **Loading behavior:** Not applicable.
- **Error behavior:** Mismatch with confirmation explained at the confirmation field.
- **Content rules:** Policy stated positively ("At least 8 characters").
- **Do:** Use `autocomplete="current-password"` or `"new-password"`.
- **Don't:** Block paste or password managers.
- **Dependencies:** IC-01.

### IC-04 — One-time code input

- **Purpose:** Capture MFA and verification codes.
- **Inputs:** Length (6), allowed characters, auto-submit flag.
- **States:** empty, partial, complete, verifying, invalid, locked.
- **Accessibility:** Single labelled input (not one input per digit); remaining attempts stated after an error.
- **Keyboard support:** Standard text entry; paste fills the code.
- **ARIA:** `autocomplete="one-time-code"`, `inputmode="numeric"`.
- **Interaction patterns:** Auto-submits when complete; a backup-code route is available.
- **Validation rules:** Length and charset only on the client.
- **Loading behavior:** Verifying state blocks re-entry.
- **Error behavior:** Wrong code clears the entry and keeps focus; lockout states the cooldown.
- **Content rules:** Tell the user where the code was sent.
- **Do:** Accept codes with spaces and strip them.
- **Don't:** Split into multiple inputs.
- **Dependencies:** IC-01.

### IC-05 — Location autocomplete

- **Purpose:** Resolve an address, city, region or known facility into a geocoded location.
- **Inputs:** Scope (address, city, region, facility-first for shippers), bias location, required.
- **States:** empty, typing, suggestions pending, suggestions available, no suggestions, selected, invalid, service unavailable.
- **Accessibility:** WAI-ARIA combobox with listbox popup; result count announced politely.
- **Keyboard support:** Down/Up move through suggestions; Enter selects; Escape closes then clears; Tab accepts the active suggestion only if one is active.
- **ARIA:** `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`; options `role="option"` with `aria-selected`.
- **Interaction patterns:** Suggestions after 2 characters and 250 ms settle (`use-debounced-search`); the organisation's facilities are offered alongside geocoder results and labelled as facilities; selection stores a structured location, not text.
- **Validation rules:** A selection is required unless the scope permits free text (SC-01.2 degradation).
- **Loading behavior:** Pending exposed on the combobox; previous suggestions stay until replaced.
- **Error behavior:** Service down → free text accepted where allowed, otherwise the field explains it cannot resolve locations now.
- **Content rules:** Suggestions include enough to disambiguate (city, state, ZIP).
- **Do:** Keep the typed text if the user leaves without selecting, and flag it invalid.
- **Don't:** Auto-select the first suggestion silently.
- **Dependencies:** `use-location-suggestions`, `use-facilities`.

### IC-06 — Assignment picker

- **Purpose:** Choose a driver and a vehicle for a load with eligibility shown.
- **Inputs:** Load requirements, fleet options with availability and eligibility reasons.
- **States:** loading, options available, none eligible, selected, conflict.
- **Accessibility:** Combobox or listbox per IC-07; ineligible options remain discoverable with their reason in the accessible description.
- **Keyboard support:** As IC-07; type-ahead by name or unit number.
- **ARIA:** `aria-disabled` on ineligible options with `aria-describedby` reason.
- **Interaction patterns:** Selecting a driver narrows vehicles to compatible ones; an inline "invite driver" route opens IC-39.
- **Validation rules:** Driver and vehicle required; equipment must satisfy load requirements; server rechecks availability.
- **Loading behavior:** Options pending.
- **Error behavior:** Conflict with another load → reason and alternatives.
- **Content rules:** Ineligibility reasons are specific ("Reefer required").
- **Do:** Offer the most recently used compatible pair as a suggestion, labelled as such.
- **Don't:** Hide ineligible options entirely.
- **Dependencies:** IC-07, IC-39, SH-15.

### IC-07 — Select and multi-select

- **Purpose:** Choose from a known set (enums, reason codes, roles).
- **Inputs:** Options (value, label, description, disabled reason), single or multiple, required.
- **States:** closed, open, selected, none selected, invalid, disabled.
- **Accessibility:** Native `select` where the option set is short and single; otherwise WAI-ARIA listbox or combobox pattern.
- **Keyboard support:** Arrow keys, type-ahead, Space toggles in multi-select, Escape closes.
- **ARIA:** `aria-multiselectable` for multiple; selected count announced.
- **Interaction patterns:** Options come from `lib/enums/`; labels from constants.
- **Validation rules:** Required selection; maximum selections where defined.
- **Loading behavior:** Remote option sets expose pending.
- **Error behavior:** Per IC-02.
- **Content rules:** Option labels plain-language (Phase 3 §7).
- **Do:** Group long option sets by category.
- **Don't:** Mix actions into option lists.
- **Dependencies:** `lib/enums/`.

### IC-08 — Date and time window picker

- **Purpose:** Capture a date, a date range, or an appointment window with time zone.
- **Inputs:** Mode (date, range, window), time zone (facility), min/max, step (15 min).
- **States:** empty, partial, complete, invalid, disabled dates.
- **Accessibility:** Typed entry is always possible; any calendar follows the WAI-ARIA date picker dialog pattern; time zone stated in text.
- **Keyboard support:** Arrow keys move days; Page Up/Down months; Home/End week; Enter selects; Escape closes.
- **ARIA:** Grid pattern for calendar; `aria-label` includes full date text.
- **Interaction patterns:** Window end cannot precede start; default duration from constants; values stored in ISO with zone.
- **Validation rules:** Not in the past for new loads; delivery after pickup; within booking horizon.
- **Loading behavior:** Not applicable.
- **Error behavior:** Specific ("Delivery window must end after pickup starts").
- **Content rules:** Times with zone abbreviation; format from `DATE_VALUE_FORMAT` for values.
- **Do:** Parse common typed formats via `lib/utils/date-parser.ts`.
- **Don't:** Rely on the browser's local zone for facility appointments.
- **Dependencies:** `date-fns`, `lib/utils/date-parser.ts`, `lib/utils/date-formatter.ts`.

### IC-09 — Single choice group

- **Purpose:** Choose one of a few mutually exclusive options where each needs explanation.
- **Inputs:** Options with label and description, required.
- **States:** none selected, selected, invalid, disabled option.
- **Accessibility:** Native radio group with a group label (`fieldset`/`legend`).
- **Keyboard support:** Arrow keys move and select; Tab enters and leaves the group.
- **ARIA:** Native semantics; descriptions via `aria-describedby`.
- **Interaction patterns:** Choice can reveal dependent entries; hidden entries are removed from validation.
- **Validation rules:** Required when stated.
- **Loading behavior:** Not applicable.
- **Error behavior:** Per IC-02 at group level.
- **Content rules:** Options state consequence ("Offer to preferred carriers first, then everyone").
- **Do:** Preselect only when one option is a safe default.
- **Don't:** Use for more than 5 options (use IC-07).
- **Dependencies:** IC-02.

### IC-10 — Check call request

- **Purpose:** Ask the carrier for a manual status and location update when tracking is stale.
- **Inputs:** Load ID, requester role, optional note.
- **States:** available, requested (with time), responded, unavailable (fresh data).
- **Accessibility:** Result announced; requested time as text.
- **Keyboard support:** As IC-11.
- **ARIA:** As IC-11.
- **Interaction patterns:** One open request per load; repeated request within 30 minutes is blocked with reason.
- **Validation rules:** Available only when position age exceeds the stale threshold (BR-10).
- **Loading behavior:** Pending per G-6.
- **Error behavior:** Failure → retry.
- **Content rules:** State who will be asked (dispatcher, driver).
- **Do:** Record the request on the load timeline.
- **Don't:** Allow requests on loads not in transit.
- **Dependencies:** IC-11, SH-02.

---

## 3. Actions and Confirmation

### IC-11 — Action button

- **Purpose:** Perform one action: submit, navigate to a transaction, run a mutation.
- **Inputs:** Accessible name (verb-first), action handler or form, variant intent (standard, destructive), pending text.
- **States:** enabled, focused, pending, disabled (with reason), success (transient).
- **Accessibility:** Native `button` for actions, `a` for navigation; name describes the effect; pending exposed.
- **Keyboard support:** Enter and Space activate buttons; Enter activates links.
- **ARIA:** `aria-busy` while pending; `aria-describedby` for disabled reason (G-5).
- **Interaction patterns:** Pending blocks re-activation (G-6); result announced via IC-14; mutations run through hooks or Server Actions, never direct client calls.
- **Validation rules:** Not applicable beyond the form it submits.
- **Loading behavior:** Pending label from constants ("Booking…").
- **Error behavior:** Errors are reported by the owning section, and focus stays on the button.
- **Content rules:** "Book load", "Accept bid", "Pay $2,140.00"; never "Submit", "OK" (Phase 3 §7).
- **Do:** Extend the existing `components/ui/button.tsx` primitive.
- **Don't:** Use a link for a mutation or a button for navigation.
- **Dependencies:** `components/ui/button.tsx`, IC-14.

### IC-12 — Irreversible action confirmation

- **Purpose:** Make sure the user intends an action that cannot be undone (PP-05).
- **Inputs:** Action name, consequence statement, affected scope (count, amount), optional required reason, confirm and cancel labels.
- **States:** closed, open, confirming (pending), failed.
- **Accessibility:** Implemented with IC-41 dialog; focus moves to the dialog heading; focus returns to the invoking element on close.
- **Keyboard support:** Escape cancels; Enter does not confirm by default for destructive actions; Tab cycles within.
- **ARIA:** `role="alertdialog"`, `aria-labelledby`, `aria-describedby` pointing to the consequence.
- **Interaction patterns:** Consequence states money and parties affected ("The carrier will be owed a $250 TONU"); reason-required actions validate the reason; the confirm label repeats the action.
- **Validation rules:** Reason required for internal actions (Phase 1 §11).
- **Loading behavior:** Confirming blocks both choices.
- **Error behavior:** Failure is shown inside the dialog, which stays open for retry.
- **Content rules:** Heading is a question ("Cancel load HL-7K2M9QXA?"); cancel label "Keep load".
- **Do:** State exactly what happens next.
- **Don't:** Use for reversible actions; stack confirmations.
- **Dependencies:** IC-41, IC-11.

### IC-13 — Re-authentication challenge

- **Purpose:** Require recent authentication for sensitive changes (XS-11, XS-08).
- **Inputs:** Freshness window (10 minutes), methods (password, MFA).
- **States:** not required, required, verifying, verified, failed.
- **Accessibility:** As IC-41; the reason is stated.
- **Keyboard support:** As IC-41.
- **ARIA:** As IC-41.
- **Interaction patterns:** Triggered by the server's "re-auth required" response; on success the original action resumes automatically.
- **Validation rules:** As IC-03, IC-04.
- **Loading behavior:** Verifying pending.
- **Error behavior:** Failure count and lockout per XS-01.
- **Content rules:** "Confirm it's you to change payout methods."
- **Do:** Resume the interrupted action.
- **Don't:** Discard the user's pending change.
- **Dependencies:** IC-03, IC-04, IC-41.

### IC-14 — Status announcement

- **Purpose:** Tell the user an action's outcome without moving focus (SSB-5).
- **Inputs:** Message, politeness (polite or assertive), optional action (undo, view), duration.
- **States:** queued, announced, dismissed, expired.
- **Accessibility:** Uses a single persistent live region; assertive only for failures that block the user.
- **Keyboard support:** Any included action is reachable by keyboard; the announcement persists until dismissed when it carries an action.
- **ARIA:** `role="status"` (polite) or `role="alert"` (assertive).
- **Interaction patterns:** At most one announcement at a time, with later ones queued; minimum duration 6 seconds, longer for longer text (WCAG 2.2.1).
- **Validation rules:** Not applicable.
- **Loading behavior:** Not applicable.
- **Error behavior:** Error announcements include a next step.
- **Content rules:** Past tense for success ("Bid accepted"); plain cause for failure.
- **Do:** Pair with a visible state change in the affected section.
- **Don't:** Use as the only record of an important outcome.
- **Dependencies:** `components/providers/` (announcer provider).

---

## 4. Navigation and Structure

### IC-15 — Step navigation

- **Purpose:** Move through a multi-step flow (SH-13).
- **Inputs:** Steps (id, title, completed, valid), current step (from `?step=`).
- **States:** step current, completed, available, locked.
- **Accessibility:** Current step announced ("Step 2 of 5, Freight and equipment"); step indicator uses `aria-current="step"`.
- **Keyboard support:** Continue and back as IC-11; completed steps navigable.
- **ARIA:** `aria-current="step"`; locked steps `aria-disabled` with reason.
- **Interaction patterns:** Continue validates; back never validates; browser back mirrors step back via the URL.
- **Validation rules:** Per-step schema slice.
- **Loading behavior:** Server save on continue shows pending.
- **Error behavior:** Save failure keeps the user on the step with retry.
- **Content rules:** Step titles are nouns.
- **Do:** Persist the draft on every step change.
- **Don't:** Lose data on back.
- **Dependencies:** SH-13, IC-02.

### IC-16 — Tabs

- **Purpose:** Switch between peer views of the same subject.
- **Inputs:** Tabs (id, label, count), selected (URL parameter `tab`).
- **States:** selected, unselected, disabled.
- **Accessibility:** WAI-ARIA tabs pattern.
- **Keyboard support:** Arrow keys move between tabs, with automatic activation when the panel is cheap and manual activation when it is expensive; Home/End.
- **ARIA:** `role="tablist"`, `tab`, `tabpanel`, `aria-selected`, `aria-controls`.
- **Interaction patterns:** Selected tab in the URL; panels lazy-load.
- **Validation rules:** Not applicable.
- **Loading behavior:** Panel loading per SSB-1.
- **Error behavior:** Panel-level.
- **Content rules:** Short nouns; counts as text.
- **Do:** Keep state per tab when switching.
- **Don't:** Use tabs for sequential steps (use IC-15).
- **Dependencies:** `lib/utils/query-string.ts`.

### IC-17 — Period selector

- **Purpose:** Choose the time period for metrics (SH-08).
- **Inputs:** Presets (7, 30, 90 days, quarter), custom range via IC-08.
- **States:** preset selected, custom.
- **Accessibility:** As IC-09 or IC-07.
- **Keyboard support:** As IC-09.
- **ARIA:** As IC-09.
- **Interaction patterns:** Period in the URL; comparison period derived automatically.
- **Validation rules:** Custom range ≤ 366 days.
- **Loading behavior:** Metrics refetch per SSB-2.
- **Error behavior:** Per IC-08.
- **Content rules:** "Last 30 days".
- **Do:** Apply to all metrics in the section.
- **Don't:** Reset on navigation.
- **Dependencies:** IC-08.

### IC-18 — Radius control

- **Purpose:** Set a search radius in miles.
- **Inputs:** Min, max, step, presets.
- **States:** value set, default.
- **Accessibility:** Native range input or WAI-ARIA slider with value text ("75 miles"), always paired with numeric entry.
- **Keyboard support:** Arrow keys step; Page Up/Down by 5 steps; Home/End.
- **ARIA:** `aria-valuetext` with unit.
- **Interaction patterns:** Changes apply after settling (debounced).
- **Validation rules:** Within min/max.
- **Loading behavior:** Results pending per SH-05.
- **Error behavior:** Clamp to range with explanation.
- **Content rules:** Unit always stated.
- **Do:** Offer numeric entry.
- **Don't:** Require dragging (WCAG 2.5.7).
- **Dependencies:** IC-01.

---

## 5. Finding and Collections

### IC-19 — Search input

- **Purpose:** Search a collection or index by text.
- **Inputs:** Scope, placeholder hint, URL parameter `q`, minimum length.
- **States:** empty, typing, searching, results, no results, error.
- **Accessibility:** `type="search"` inside a `role="search"` landmark; result count announced.
- **Keyboard support:** Enter searches immediately; Escape clears.
- **ARIA:** Labelled; `aria-describedby` for scope hint.
- **Interaction patterns:** Debounced 300 ms via `use-debounced-search` (exists); exact reference numbers resolve directly to the record (Phase 3 §9).
- **Validation rules:** Trim; minimum 2 characters except reference patterns.
- **Loading behavior:** Previous results kept while pending.
- **Error behavior:** Retry.
- **Content rules:** Hint names searchable keys ("Load, PO or BOL number").
- **Do:** Keep the query in the URL.
- **Don't:** Search on every keystroke without debounce.
- **Dependencies:** `lib/hooks/use-debounced-search.ts`.

### IC-20 — Filter group

- **Purpose:** Narrow a collection by criteria.
- **Inputs:** Filter definitions (parameter name from Phase 3 §10, control contract, options), current values from the URL.
- **States:** none applied, some applied (count), pending.
- **Accessibility:** Grouped with a label; applied filter count and result count announced after change; each applied filter removable by keyboard.
- **Keyboard support:** Per constituent contract; "clear all" reachable.
- **ARIA:** `fieldset`/`legend` or `role="group"` with `aria-labelledby`.
- **Interaction patterns:** On desktop, changes apply after settling; on phone, filters may be staged and applied together. Either way the URL is the source of truth.
- **Validation rules:** Unknown URL values are ignored and dropped from the URL.
- **Loading behavior:** Per SH-05.
- **Error behavior:** Invalid combinations explained.
- **Content rules:** Filter names match labeling conventions.
- **Do:** Preserve filters across pagination and view switches.
- **Don't:** Reset filters when the user opens a record and returns.
- **Dependencies:** IC-05, IC-07, IC-08, IC-18, `lib/utils/query-string.ts`.

### IC-21 — Pagination

- **Purpose:** Move through large collections by cursor.
- **Inputs:** Cursor, page size (from constants), has-next, has-previous.
- **States:** first page, middle, last page, loading more.
- **Accessibility:** "Load more" announces how many were added and moves focus to the first new item; numbered pagination is a `nav` landmark labelled "Pagination".
- **Keyboard support:** Standard link/button.
- **ARIA:** `aria-current="page"` for numbered pagination.
- **Interaction patterns:** Cursor in the URL; infinite scroll is not used without an equivalent "load more" action.
- **Validation rules:** Invalid cursor → restart from the beginning with notice.
- **Loading behavior:** Existing items remain.
- **Error behavior:** Retry at the point of failure.
- **Content rules:** "Showing 50 of 1,240".
- **Do:** Use TanStack Query infinite queries for load-more.
- **Don't:** Fetch unbounded collections (Phase 1 §16).
- **Dependencies:** TanStack Query.

### IC-22 — Sortable data table

- **Purpose:** Present records with comparable attributes for scanning and sorting.
- **Inputs:** Columns (key, label, sortable), rows, sort from the URL.
- **States:** loading, populated, empty, sorted ascending/descending.
- **Accessibility:** Native `table` with caption; sortable headers are buttons; row actions reachable without entering a grid mode.
- **Keyboard support:** Tab through interactive cells; no custom grid navigation unless the table is an editing grid.
- **ARIA:** `aria-sort` on the sorted column header.
- **Interaction patterns:** Sort changes update the URL; phone users receive an equivalent non-tabular form of the same records (decided at build).
- **Validation rules:** Not applicable.
- **Loading behavior:** Per SH-05.
- **Error behavior:** Per SH-05.
- **Content rules:** Numeric columns include units in the header.
- **Do:** Make the record reference a link to the record.
- **Don't:** Put essential actions only on hover.
- **Dependencies:** SH-05.

### IC-23 — Selection and bulk actions

- **Purpose:** Select records and act on them together.
- **Inputs:** Selectable records, permitted bulk actions, selection limit.
- **States:** none selected, some selected (count), all on page selected, all matching selected.
- **Accessibility:** Checkbox per record with the record's reference in its name; selection count announced.
- **Keyboard support:** Space toggles; Shift+Space range-select where supported.
- **ARIA:** Select-all checkbox uses `aria-checked="mixed"` for partial.
- **Interaction patterns:** Bulk actions state scope before running ("Pay 12 invoices, $18,420.00"); irreversible bulk actions use IC-12; partial failures reported per record.
- **Validation rules:** Actions available only if permitted for every selected record, otherwise the reason is given.
- **Loading behavior:** Per-record pending.
- **Error behavior:** Per-record outcome.
- **Content rules:** Always state count and totals.
- **Do:** Keep selection when records remain after refetch.
- **Don't:** Select across pages silently.
- **Dependencies:** IC-12, IC-14.

---

## 6. Files, Capture and Signature

### IC-24 — File upload

- **Purpose:** Upload documents and attachments.
- **Inputs:** Accepted types, max size (constants), multiple, document type, scope.
- **States:** idle, dragging over, selected, uploading (progress), uploaded, rejected, failed, cancelled.
- **Accessibility:** Native file input is always available; drag-and-drop is an enhancement; progress exposed; outcome announced.
- **Keyboard support:** Enter/Space opens the file chooser; cancel reachable during upload.
- **ARIA:** `role="progressbar"` with `aria-valuenow` per file.
- **Interaction patterns:** Client checks type and size before upload; direct-to-storage via presigned URL; retry per file.
- **Validation rules:** Type, size, count; server virus scan result.
- **Loading behavior:** Per-file progress.
- **Error behavior:** Specific reason per file; other files continue.
- **Content rules:** Limits stated before selection ("PDF, JPG or PNG, up to 20 MB").
- **Do:** Allow replacing a rejected file in place.
- **Don't:** Block the form while unrelated uploads complete.
- **Dependencies:** `use-document-upload`, SH-03.

### IC-25 — Camera capture

- **Purpose:** Capture document photos (POD, lumper receipts, damage) on phones.
- **Inputs:** Document type, pages allowed, quality checks.
- **States:** permission needed, ready, captured, checking, accepted, rejected, queued offline.
- **Accessibility:** Uses the platform camera through `<input type="file" accept="image/*" capture="environment">` so native accessibility applies; each page's status announced.
- **Keyboard support:** As IC-24.
- **ARIA:** As IC-24.
- **Interaction patterns:** Capture → check → retake or accept per page; submit all pages together; offline queue per PP-06.
- **Validation rules:** Resolution and blur threshold; page count ≥ 1.
- **Loading behavior:** Check pending per page.
- **Error behavior:** Rejections name the problem ("Too blurry to read the signature").
- **Content rules:** Tell the user what must be legible.
- **Do:** Downscale before upload to protect data plans.
- **Don't:** Require a custom in-browser camera UI.
- **Dependencies:** IC-24, `use-pod-upload`.

### IC-26 — E-signature acceptance

- **Purpose:** Record binding acceptance of a document (rate confirmation, carrier agreement).
- **Inputs:** Document (rendered text and downloadable file), version, signer identity, attestation text.
- **States:** unread, read, attested, signing, signed, failed.
- **Accessibility:** Document available as accessible text; attestation is a checkbox (IC-38) plus typed full name.
- **Keyboard support:** Standard.
- **ARIA:** Attestation and name associated with the document by `aria-describedby`.
- **Interaction patterns:** Signing records user, time, IP and version (BR-04); a copy is stored to SH-03.
- **Validation rules:** Attestation checked; typed name matches the account name (case-insensitive).
- **Loading behavior:** Signing pending.
- **Error behavior:** Failure keeps attestation and name; retry within grace period.
- **Content rules:** Attestation states the legal effect in plain words.
- **Do:** Offer download before and after signing.
- **Don't:** Require scrolling to the end as a condition (it is not evidence of reading and harms accessibility).
- **Dependencies:** IC-38, e-signature backend.

---

## 7. Freight Transactions

### IC-27 — Book load action

- **Purpose:** Commit to a load at its posted rate.
- **Inputs:** Load ID, carrier pay, idempotency key, eligibility result.
- **States:** available, ineligible (reason), confirming, booking, booked, taken.
- **Accessibility:** As IC-11 and IC-12; outcome announced.
- **Keyboard support:** As IC-11.
- **ARIA:** As IC-11.
- **Interaction patterns:** Activates IC-12 stating pay and key terms, then IC-26; conflict → "This load was just booked by another carrier" with similar loads.
- **Validation rules:** Eligibility rechecked server-side.
- **Loading behavior:** Booking pending; no other action on the load meanwhile.
- **Error behavior:** Taken, ineligible, network → retry with the same idempotency key.
- **Content rules:** Name includes amount ("Book for $2,380.00").
- **Do:** Generate one idempotency key per attempt with `nanoid`.
- **Don't:** Retry automatically after a conflict.
- **Dependencies:** IC-11, IC-12, IC-26, `use-book-load`.

### IC-28 — Bid entry and response

- **Purpose:** Submit, counter, accept, decline or withdraw bids (BR-02).
- **Inputs:** Bid state, round, permitted range, amount, expiry, note.
- **States:** composing, submitting, awaiting counter-party, countered, accepted, declined, withdrawn, expired.
- **Accessibility:** Whose turn stated in text; amount input per IC-01 currency.
- **Keyboard support:** Standard.
- **ARIA:** Status changes announced politely.
- **Interaction patterns:** Only legal transitions are offered; accept uses IC-12; round count visible in text ("Counter 2 of 3").
- **Validation rules:** Amount within permitted range; expiry within pickup window; round ≤ 3.
- **Loading behavior:** Pending per action.
- **Error behavior:** State moved on → explained with the new state.
- **Content rules:** Amounts from each party's perspective only (BR-05).
- **Do:** Show the difference from target price to the shipper side only.
- **Don't:** Reveal the other side's price to either party.
- **Dependencies:** IC-01, IC-12, `use-bid-actions`.

### IC-29 — Stop event action

- **Purpose:** Record the next stop event in the driver workflow.
- **Inputs:** Next legal event, stop, required extra data (seal, pieces), undo window.
- **States:** ready, recording (optimistic), recorded-queued (offline), recorded-synced, undo available, undone, conflict.
- **Accessibility:** Name states the event and stop ("Arrived at Acme DC, Dallas"); outcome announced; undo is a named action.
- **Keyboard support:** As IC-11.
- **ARIA:** As IC-11; queue state in `role="status"`.
- **Interaction patterns:** Single activation records the event with device time and position; extra data is collected with the event when required; undo available for 5 minutes.
- **Validation rules:** Only the next legal transition (Phase 2 §5).
- **Loading behavior:** Optimistic; sync state separate (SC-39.5).
- **Error behavior:** Server conflict (geofence already recorded) → server wins, driver told.
- **Content rules:** Past tense confirmation ("Arrival recorded 2:14 PM CDT").
- **Do:** Meet G-2 enlarged target size.
- **Don't:** Require typing for routine events.
- **Dependencies:** `use-stop-events`, SC-39.2.

### IC-30 — Interactive map

- **Purpose:** Present positions, stops and lanes geographically as a supplement to text.
- **Inputs:** Features (vehicle position with age, stops, route, result origins), bounds, selection.
- **States:** loading, ready, updating, failed, no features.
- **Accessibility:** Map container labelled; every feature also available in the text equivalent (SH-02); keyboard pan and zoom; selecting a feature by keyboard is possible; map is skippable (IC-52 pattern).
- **Keyboard support:** Arrow keys pan, +/- zoom, Tab cycles features, Enter selects, Escape exits the map.
- **ARIA:** `role="application"` is not used; the container is a labelled region with instructions available.
- **Interaction patterns:** Updates never reset the user's zoom or pan; "recentre" action available; selecting a load navigates to PG-40.
- **Validation rules:** Not applicable.
- **Loading behavior:** Tiles load progressively; text equivalent is available first.
- **Error behavior:** Map failure → text equivalent only with notice.
- **Content rules:** Position age stated for every vehicle.
- **Do:** Lazy-load the map library.
- **Don't:** Make any task map-only (PP-08).
- **Dependencies:** Map library (pending approval, Phase 7 §15), SH-02.

### IC-31 — Navigation handoff

- **Purpose:** Hand an address to the device's navigation app.
- **Inputs:** Stop coordinates and address.
- **States:** available, unavailable (no coordinates).
- **Accessibility:** Link named "Directions to Acme DC in your maps app"; opens outside the product, stated in the name.
- **Keyboard support:** Standard link.
- **ARIA:** None beyond the name.
- **Interaction patterns:** Uses platform map URLs; the address is also copyable (IC-44).
- **Validation rules:** Coordinates present.
- **Loading behavior:** Not applicable.
- **Error behavior:** Missing coordinates → address copy only.
- **Content rules:** Name states the destination.
- **Do:** Work offline with cached coordinates.
- **Don't:** Embed turn-by-turn navigation.
- **Dependencies:** SC-39.1.

---

## 8. Disclosure, Preferences and Social

### IC-32 — Disclosure

- **Purpose:** Reveal secondary detail on demand (derivations, evidence, explanations).
- **Inputs:** Summary label, content, initially open.
- **States:** collapsed, expanded.
- **Accessibility:** Native `details`/`summary` or WAI-ARIA disclosure button.
- **Keyboard support:** Enter/Space toggles.
- **ARIA:** `aria-expanded`, `aria-controls`.
- **Interaction patterns:** State not persisted unless the section says so.
- **Validation rules:** Not applicable.
- **Loading behavior:** Content may lazy-load on first expand.
- **Error behavior:** Inline retry.
- **Content rules:** Summary describes what is revealed.
- **Do:** Use for "How was this calculated?"
- **Don't:** Hide required information or errors inside.
- **Dependencies:** None.

### IC-33 — Watch toggle

- **Purpose:** Watch or unwatch a load (XS-09).
- **Inputs:** Load ID, watched state.
- **States:** unwatched, watched, pending.
- **Accessibility:** Toggle button with state.
- **Keyboard support:** Enter/Space.
- **ARIA:** `aria-pressed`.
- **Interaction patterns:** Optimistic with rollback on failure.
- **Validation rules:** Watch limit from constants.
- **Loading behavior:** Optimistic.
- **Error behavior:** Rollback with announcement.
- **Content rules:** Name "Watch load HL-…".
- **Do:** Announce the new state.
- **Don't:** Rely on icon alone.
- **Dependencies:** `use-watched-loads`.

### IC-34 — Saved search and alert configuration

- **Purpose:** Save a search and set its alerts.
- **Inputs:** Criteria (URL parameters), name, channels, frequency (instant, hourly, daily), paused.
- **States:** new, saved, editing, paused.
- **Accessibility:** Composed of IC-01, IC-09, IC-36.
- **Keyboard support:** As constituents.
- **ARIA:** As constituents.
- **Interaction patterns:** Default name generated from criteria; saving confirms via IC-14.
- **Validation rules:** Name unique per user; saved search limit.
- **Loading behavior:** Pending.
- **Error behavior:** Limit reached → route to PG-36.
- **Content rules:** Frequency options state expected volume.
- **Do:** Suggest digest when matches are frequent.
- **Don't:** Enable SMS by default.
- **Dependencies:** `use-saved-searches`.

### IC-35 — Message composer

- **Purpose:** Write and send a message in a conversation.
- **Inputs:** Thread ID, draft, attachments, participants.
- **States:** empty, composing, sending, sent, failed.
- **Accessibility:** Labelled with the thread subject; send outcome announced.
- **Keyboard support:** Enter inserts a new line; Ctrl/Cmd+Enter sends; the send action is also a button.
- **ARIA:** Multiline textbox.
- **Interaction patterns:** Draft persisted per thread; optimistic append; attachments via IC-24.
- **Validation rules:** Non-empty or has attachment; length limit.
- **Loading behavior:** Sending state on the message.
- **Error behavior:** Failed message stays with retry and delete.
- **Content rules:** State who will receive it ("Visible to Acme Shipping, FastHaul LLC and Haulr").
- **Do:** Preserve the draft across navigation.
- **Don't:** Send on Enter alone.
- **Dependencies:** SH-04, IC-24.

### IC-36 — Toggle switch

- **Purpose:** Turn a setting on or off with immediate effect.
- **Inputs:** Label, state, locked reason.
- **States:** on, off, pending, locked.
- **Accessibility:** WAI-ARIA switch or native checkbox.
- **Keyboard support:** Space toggles.
- **ARIA:** `role="switch"`, `aria-checked`.
- **Interaction patterns:** Saves on change; reverts on failure with announcement.
- **Validation rules:** Locked settings (critical notifications) cannot be turned off; reason given.
- **Loading behavior:** Pending per switch.
- **Error behavior:** Revert and announce.
- **Content rules:** Label states the setting, not the action.
- **Do:** Use only for immediate-effect settings.
- **Don't:** Use inside forms that save on submit (use IC-38).
- **Dependencies:** IC-14.

### IC-37 — Rating input

- **Purpose:** Rate a counter-party on a 1–5 scale.
- **Inputs:** Scale, value, reason tags.
- **States:** unrated, rated, submitted.
- **Accessibility:** Radio group with each value named ("4 out of 5, Good").
- **Keyboard support:** Arrow keys.
- **ARIA:** Native radio semantics.
- **Interaction patterns:** Reason tags offered after a value is chosen; tags depend on value.
- **Validation rules:** Value required.
- **Loading behavior:** Submit pending.
- **Error behavior:** Per IC-02.
- **Content rules:** Each value has a word label.
- **Do:** Allow submission without a comment.
- **Don't:** Rely on symbols alone.
- **Dependencies:** SH-10.

### IC-38 — Consent checkbox

- **Purpose:** Capture explicit agreement to a versioned document or practice.
- **Inputs:** Document link, version, required.
- **States:** unchecked, checked, invalid.
- **Accessibility:** Native checkbox; label contains the link to the document.
- **Keyboard support:** Space.
- **ARIA:** `aria-required`, `aria-invalid`.
- **Interaction patterns:** Never pre-checked; version recorded on submit.
- **Validation rules:** Required when stated.
- **Loading behavior:** Not applicable.
- **Error behavior:** Per IC-02.
- **Content rules:** "I agree to the Carrier Agreement (version 2026-09)".
- **Do:** Open documents without leaving the flow's data.
- **Don't:** Bundle unrelated consents in one checkbox.
- **Dependencies:** PG-09.

### IC-39 — Invitation entry

- **Purpose:** Invite a member or driver.
- **Inputs:** Email or phone, role (from permitted roles), personal note.
- **States:** composing, sending, sent, failed, duplicate.
- **Accessibility:** Composed of IC-01 and IC-07.
- **Keyboard support:** As constituents.
- **ARIA:** As constituents.
- **Interaction patterns:** Multiple invitations can be entered before sending; each result reported.
- **Validation rules:** Valid email or E.164 phone; role within inviter's permission; not already a member.
- **Loading behavior:** Per invitation.
- **Error behavior:** Per invitation.
- **Content rules:** State expiry (7 days).
- **Do:** Allow resend.
- **Don't:** Let a user invite to a role higher than their own.
- **Dependencies:** `use-invitations`.

### IC-40 — Reorderable sequence

- **Purpose:** Set the order of items (tender waterfall, stops).
- **Inputs:** Items, order, min/max length.
- **States:** idle, item grabbed (keyboard), moving, saved.
- **Accessibility:** Every reorder is possible without dragging (WCAG 2.5.7): move up/move down actions per item, plus keyboard grab mode.
- **Keyboard support:** Space grabs; arrows move; Space drops; Escape cancels.
- **ARIA:** Position announced ("Moved to position 2 of 5").
- **Interaction patterns:** Drag is an enhancement only.
- **Validation rules:** Sequence constraints (for stops: pickups before their deliveries).
- **Loading behavior:** Save pending.
- **Error behavior:** Invalid order explained and reverted.
- **Content rules:** Items named for announcement.
- **Do:** Announce every position change.
- **Don't:** Make drag the only method.
- **Dependencies:** IC-14.

### IC-41 — Dialog

- **Purpose:** Hold a focused task or decision that interrupts the current context.
- **Inputs:** Title, description, content, close behaviour.
- **States:** closed, open.
- **Accessibility:** Native `dialog` element with `showModal()` or equivalent semantics; focus moves to the title and is contained; background inert; focus returns on close.
- **Keyboard support:** Escape closes (unless a pending action blocks it); Tab cycles.
- **ARIA:** `aria-labelledby`, `aria-describedby`, `aria-modal="true"`.
- **Interaction patterns:** Opening a dialog never discards page state; dialogs are not nested.
- **Validation rules:** Per content.
- **Loading behavior:** Per content.
- **Error behavior:** Errors stay inside the dialog.
- **Content rules:** Title names the task.
- **Do:** Keep dialog tasks short.
- **Don't:** Use for content users need to compare with the page.
- **Dependencies:** None.

---

## 9. Money

### IC-42 — Hosted payment method entry

- **Purpose:** Add a bank account or card through the payments processor without Haulr handling raw data (A6).
- **Inputs:** Method types allowed, organisation, mode (payment or payout).
- **States:** loading processor, ready, submitting, verifying (instant or micro-deposit), verified, failed.
- **Accessibility:** The processor's embedded entry must meet WCAG 2.2 AA (vendor requirement); Haulr's surrounding flow labels and announces each state.
- **Keyboard support:** Per processor plus surrounding standard behaviour.
- **ARIA:** Frame titled when an iframe is used.
- **Interaction patterns:** Requires IC-13 before opening; on success, the method appears in SC-49.1 with verification state.
- **Validation rules:** Performed by the processor; Haulr validates only method type and ownership name match.
- **Loading behavior:** Processor load pending announced.
- **Error behavior:** Processor errors mapped to plain messages from constants.
- **Content rules:** State why verification is needed and how long micro-deposits take.
- **Do:** Resume pending verifications.
- **Don't:** Log or store raw payment data anywhere.
- **Dependencies:** Payments processor SDK (pending approval), IC-13.

### IC-43 — Payment confirmation

- **Purpose:** Commit a payment (invoice payment, quick pay) with full clarity (PP-01, PP-05).
- **Inputs:** Items, total, fees, net (quick pay), method, date, idempotency key.
- **States:** reviewing, confirming, processing, succeeded, partially succeeded, failed.
- **Accessibility:** Implemented through IC-12; amount, method and date are in the dialog description.
- **Keyboard support:** As IC-12.
- **ARIA:** As IC-12.
- **Interaction patterns:** Confirm label repeats the amount ("Pay $4,280.00"); outcome gives a reference and remittance link.
- **Validation rules:** Method verified; amount > 0; within credit or balance rules.
- **Loading behavior:** Processing state; the dialog cannot be dismissed while processing.
- **Error behavior:** Declines explained with alternatives; partial success itemised.
- **Content rules:** Money formatted with cents and currency.
- **Do:** Use one idempotency key per confirmation.
- **Don't:** Pre-select a non-default method silently.
- **Dependencies:** IC-12, `use-pay-invoices`, `use-quick-pay`.

---

## 10. Sharing, Data and Time

### IC-44 — Share and copy

- **Purpose:** Copy or share a link or value (tracking link, reference number, address).
- **Inputs:** Value, share title, channels (copy, email, SMS, system share).
- **States:** idle, copied, shared, failed.
- **Accessibility:** Outcome announced ("Tracking link copied").
- **Keyboard support:** Standard button.
- **ARIA:** Status announcement via IC-14.
- **Interaction patterns:** Uses Web Share API where available, else the Clipboard API; generation of tracking links happens on first share.
- **Validation rules:** Email or phone valid when sending through Haulr.
- **Loading behavior:** Link generation pending.
- **Error behavior:** Clipboard denied → the value is selectable text for manual copy.
- **Content rules:** State link expiry for tracking links (BR-21).
- **Do:** Allow revoking tracking links.
- **Don't:** Share rates or documents through tracking links.
- **Dependencies:** IC-14, `use-tracking-links`.

### IC-45 — Chart with data equivalent

- **Purpose:** Present trends and distributions with an accessible equivalent.
- **Inputs:** Series, units, period, definitions.
- **States:** loading, ready, empty, error.
- **Accessibility:** Every chart has a data table equivalent and a text summary of the key finding; charts are not the only carrier of any value (G-3).
- **Keyboard support:** Data points reachable by keyboard when the chart is interactive; otherwise the table carries interaction.
- **ARIA:** Chart container labelled with its summary; decorative SVG internals hidden.
- **Interaction patterns:** Hover and focus reveal values; drilling in navigates to the underlying collection.
- **Validation rules:** Not applicable.
- **Loading behavior:** Per SH-08.
- **Error behavior:** Per SH-08.
- **Content rules:** Units and period in the title.
- **Do:** State the comparison in words.
- **Don't:** Encode meaning in colour alone.
- **Dependencies:** Chart library (pending approval), SH-08.

### IC-46 — Countdown

- **Purpose:** Communicate time remaining (quote validity, tender window, undo window).
- **Inputs:** Deadline, thresholds for announcement, expiry action.
- **States:** running, warning threshold, expired.
- **Accessibility:** Remaining time available as text; announced only at thresholds (5 min, 1 min), never every second (WCAG 2.2.1 guidance).
- **Keyboard support:** Not interactive.
- **ARIA:** `role="timer"` with `aria-live="off"`; threshold announcements via IC-14.
- **Interaction patterns:** On expiry, the owning section changes state (for example quote → re-quote).
- **Validation rules:** Server deadline is authoritative; client clock skew corrected from server time.
- **Loading behavior:** Not applicable.
- **Error behavior:** Not applicable.
- **Content rules:** "Price held for 12 more minutes".
- **Do:** Offer extension where the rule allows (re-quote).
- **Don't:** Use countdowns to pressure users where no real deadline exists.
- **Dependencies:** IC-14.

---

## 11. Internal Operations

### IC-47 — Claim and ownership control

- **Purpose:** Claim, release or take the next item in a shared queue without collisions.
- **Inputs:** Item ID, version, current owner, next-item query.
- **States:** unclaimed, claimed by me, claimed by other, claiming, releasing.
- **Accessibility:** Owner stated in text; outcome announced.
- **Keyboard support:** Standard; shortcut per IC-49.
- **ARIA:** As IC-11.
- **Interaction patterns:** Optimistic lock with version; "claim next" takes the highest-risk unclaimed item (server decides).
- **Validation rules:** Role permitted for item type.
- **Loading behavior:** Pending.
- **Error behavior:** Claimed by other → owner named; item refreshed.
- **Content rules:** "Claimed by Jordan P. 3 min ago".
- **Do:** Release automatically after 30 minutes of inactivity (server rule).
- **Don't:** Allow two owners.
- **Dependencies:** `use-exception-actions`.

### IC-48 — Handoff and escalation

- **Purpose:** Pass an item to another team or agent with context.
- **Inputs:** Target (team or agent), note (required), severity change.
- **States:** composing, sending, handed off.
- **Accessibility:** Composed of IC-07 and IC-01.
- **Keyboard support:** As constituents.
- **ARIA:** As constituents.
- **Interaction patterns:** Handoff records in audit and notifies the target.
- **Validation rules:** Note required.
- **Loading behavior:** Pending.
- **Error behavior:** Per IC-02.
- **Content rules:** Target stated in confirmation.
- **Do:** Carry all prior notes.
- **Don't:** Hand off without a note.
- **Dependencies:** IC-01, IC-07.

### IC-49 — Keyboard shortcuts

- **Purpose:** Speed up repetitive internal work (PG-50, SC-23.1).
- **Inputs:** Shortcut map (constants), scope.
- **States:** enabled, disabled by user.
- **Accessibility:** WCAG 2.1.4: single-character shortcuts can be turned off or remapped, or are active only while focus is within their scope; a shortcut reference is available by `?`.
- **Keyboard support:** Defined per scope (for example J/K next/previous, C claim, R resolve).
- **ARIA:** `aria-keyshortcuts` on the corresponding actions.
- **Interaction patterns:** Shortcuts never trigger while typing in an input; every shortcut has an equivalent visible action.
- **Validation rules:** No conflicts with browser or assistive technology shortcuts.
- **Loading behavior:** Not applicable.
- **Error behavior:** Not applicable.
- **Content rules:** Reference lists every shortcut with its effect.
- **Do:** Scope shortcuts to the queue region.
- **Don't:** Ship shortcuts in customer-facing pages without an off switch.
- **Dependencies:** `lib/constants.ts`.

---

## 12. Global Utilities

### IC-50 — Global quick find

- **Purpose:** Find any permitted record by reference or text from any workspace page (Phase 3 §9).
- **Inputs:** Query, scope (organisation or internal).
- **States:** closed, open, searching, results (grouped), no results.
- **Accessibility:** Combobox pattern (IC-05 behaviour) inside IC-41 or inline; grouped results with group labels.
- **Keyboard support:** Ctrl/Cmd+K opens (with `aria-keyshortcuts`); arrows move; Enter opens; Escape closes.
- **ARIA:** As IC-05, with `role="group"` per entity type.
- **Interaction patterns:** Exact reference → direct navigation; otherwise grouped results.
- **Validation rules:** As IC-19.
- **Loading behavior:** Pending.
- **Error behavior:** Retry.
- **Content rules:** Results name entity type and reference.
- **Do:** Remember recent searches per user (local, convenience only).
- **Don't:** Return records outside the user's access.
- **Dependencies:** IC-05, IC-19, `use-quick-find`.

### IC-51 — Links and breadcrumbs

- **Purpose:** Navigate within the product.
- **Inputs:** Destination, accessible name, current flag.
- **States:** default, current.
- **Accessibility:** Descriptive names ("Load HL-7K2M9QXA", not "View"); breadcrumbs in a `nav` labelled "Breadcrumb" with `aria-current="page"` on the last item (Phase 3 §12).
- **Keyboard support:** Enter.
- **ARIA:** `aria-current`.
- **Interaction patterns:** Next.js `Link` for internal routes with prefetch defaults; return paths validated by `lib/utils/internal-path.ts`.
- **Validation rules:** Internal links only through route helpers; no hand-written paths (host rule 1).
- **Loading behavior:** Route transitions show loading per SSB-1.
- **Error behavior:** Not applicable.
- **Content rules:** Name states the destination.
- **Do:** Build hrefs from route constants.
- **Don't:** Open new tabs without saying so.
- **Dependencies:** `next/link`, `lib/utils/internal-path.ts`.

### IC-52 — Skip link

- **Purpose:** Bypass repeated blocks (WCAG 2.4.1).
- **Inputs:** Target ID.
- **States:** hidden until focused, focused.
- **Accessibility:** Present on every page as the initial focusable element; moves focus to the main landmark; also used to skip past maps.
- **Keyboard support:** Enter.
- **ARIA:** None beyond a clear name.
- **Interaction patterns:** Target receives focus programmatically.
- **Validation rules:** Target exists.
- **Loading behavior:** Not applicable.
- **Error behavior:** Not applicable.
- **Content rules:** "Skip to main content".
- **Do:** Include in the root layout.
- **Don't:** Omit on internal tools.
- **Dependencies:** `app/layout.tsx`.

### IC-53 — Notification item and unread count

- **Purpose:** Convey a notification and the count of unread ones.
- **Inputs:** Notification (type, subject, time, read), unread count query.
- **States:** unread, read.
- **Accessibility:** Unread state in text; count exposed in the accessible name of the route to PG-42 ("Notifications, 3 unread").
- **Keyboard support:** Standard link.
- **ARIA:** Count changes announced politely at most once per minute.
- **Interaction patterns:** Opening marks read; count shared via one query key.
- **Validation rules:** Not applicable.
- **Loading behavior:** Count may be absent while loading.
- **Error behavior:** Count omitted on failure.
- **Content rules:** Notification text states subject and change ("New bid on HL-… $2,300.00").
- **Do:** Link to the subject.
- **Don't:** Announce every increment.
- **Dependencies:** `use-notifications`.

### IC-54 — Session timeout warning

- **Purpose:** Prevent losing work when the session expires (WCAG 2.2.1).
- **Inputs:** Session expiry, warning lead time (2 minutes).
- **States:** active, warning, extended, expired.
- **Accessibility:** Warning uses IC-41 with a clear extend action; announced assertively.
- **Keyboard support:** As IC-41.
- **ARIA:** As IC-41.
- **Interaction patterns:** Extend refreshes the session; expiry preserves drafts (PP-06) and redirects to PG-10 with return path.
- **Validation rules:** Not applicable.
- **Loading behavior:** Extending pending.
- **Error behavior:** Extension failure → save drafts and sign in.
- **Content rules:** Time remaining stated.
- **Do:** Preserve drafts before redirect.
- **Don't:** Expire silently.
- **Dependencies:** `SESSION_MAX_AGE`, IC-41.

### IC-55 — Connectivity status

- **Purpose:** Tell users when they are offline and what that means (SSB-4).
- **Inputs:** Online state, queued mutation count.
- **States:** online, offline, reconnecting, synced.
- **Accessibility:** Changes announced politely once per transition.
- **Keyboard support:** Not interactive, except "retry now".
- **ARIA:** `role="status"`.
- **Interaction patterns:** On reconnect, queued work replays and the result is announced.
- **Validation rules:** Not applicable.
- **Loading behavior:** Reconnecting state.
- **Error behavior:** Replay failures listed per item.
- **Content rules:** "You're offline. Updates will send when you reconnect."
- **Do:** Use `navigator.onLine` plus failed-request detection.
- **Don't:** Block reading cached data.
- **Dependencies:** SC-20.3, SC-39.5.

### IC-56 — Term explanation

- **Purpose:** Explain industry terms in context (PP-07).
- **Inputs:** Term, definition (from glossary constants).
- **States:** closed, open.
- **Accessibility:** Toggletip pattern (button that reveals text), not hover-only tooltip; content announced.
- **Keyboard support:** Enter/Space toggles; Escape closes.
- **ARIA:** Button with `aria-expanded`; content in a live region on open.
- **Interaction patterns:** Definitions defined once in constants and reused.
- **Validation rules:** Not applicable.
- **Loading behavior:** Not applicable.
- **Error behavior:** Not applicable.
- **Content rules:** One or two sentences.
- **Do:** Use for TONU, detention, POD, OS&D, lumper, deadhead.
- **Don't:** Put essential instructions only in explanations.
- **Dependencies:** Glossary constants.

### IC-57 — Action menu

- **Purpose:** Offer several related actions from a single trigger.
- **Inputs:** Items (label, action, disabled reason, destructive flag).
- **States:** closed, open.
- **Accessibility:** WAI-ARIA menu button pattern.
- **Keyboard support:** Enter/Space/Down opens; arrows move; Escape closes and returns focus.
- **ARIA:** `aria-haspopup="menu"`, `aria-expanded`, `role="menu"`, `menuitem`.
- **Interaction patterns:** Destructive items trigger IC-12.
- **Validation rules:** Only legal actions listed (SC-40.2 mapping).
- **Loading behavior:** Not applicable.
- **Error behavior:** Per action.
- **Content rules:** Verb-first labels.
- **Do:** Name the trigger with its subject ("Actions for HL-…").
- **Don't:** Hide the only way to perform a frequent action.
- **Dependencies:** IC-12.

### IC-58 — Document preview

- **Purpose:** Let a user inspect a document without downloading.
- **Inputs:** Document URL (signed), type, title, pages.
- **States:** loading, ready, unsupported type, failed.
- **Accessibility:** Title and metadata as text; download alternative always offered; PDF previews rely on the browser's accessible viewer.
- **Keyboard support:** Standard; close via Escape when in IC-41.
- **ARIA:** Frame titled when embedded.
- **Interaction patterns:** Images: zoom and page navigation; PDFs: native viewer.
- **Validation rules:** Signed URL not expired (refresh if so).
- **Loading behavior:** Pending.
- **Error behavior:** Fall back to download.
- **Content rules:** State document type, version and upload time.
- **Do:** Use Next.js Image for image previews.
- **Don't:** Render untrusted HTML documents.
- **Dependencies:** SH-03.

### IC-59 — Status label

- **Purpose:** Convey the state of a load, bid, invoice, settlement, claim or exception consistently.
- **Inputs:** Entity type, state, optional qualifier (late, stale).
- **States:** One per enumerated state.
- **Accessibility:** State always in text (G-3); qualifiers are words ("In transit, running late").
- **Keyboard support:** Not interactive.
- **ARIA:** None required; not a live region unless within one.
- **Interaction patterns:** Labels from the single status-label constant map (Phase 3 §7).
- **Validation rules:** Unknown state → generic label and a reported contract mismatch (service-level logging).
- **Loading behavior:** Not applicable.
- **Error behavior:** Not applicable.
- **Content rules:** Plain words, sentence case.
- **Do:** Use the same label everywhere for the same state.
- **Don't:** Invent synonyms per page.
- **Dependencies:** `lib/enums/`, status constants.

### IC-60 — Retry control

- **Purpose:** Recover from a failed fetch or mutation in place.
- **Inputs:** Retry handler, failure message, attempt count.
- **States:** failed, retrying, recovered, failing repeatedly.
- **Accessibility:** Failure message and retry action associated; outcome announced.
- **Keyboard support:** Standard button.
- **ARIA:** As IC-11.
- **Interaction patterns:** TanStack Query `refetch` or mutation `reset` + re-run; after 3 failed attempts, route to support with context.
- **Validation rules:** Not applicable.
- **Loading behavior:** Retrying pending.
- **Error behavior:** Repeated failure → support route (PG-08).
- **Content rules:** "Couldn't load documents. Try again."
- **Do:** Keep other sections working.
- **Don't:** Retry mutations automatically unless idempotent.
- **Dependencies:** IC-11, TanStack Query.

---

## 13. Contract Usage Index

| Contract | Used by (Phase 5) |
| --- | --- |
| IC-01 | SC-11.2, SC-16.2, SC-17.2, SC-27.3, SC-29.2, SC-40.3, SC-40.9, SC-46.1, SC-48.1 |
| IC-02 | Every form; SH-13 |
| IC-03 | SC-10.1, SC-11.2, SC-13.1, SC-15.1, SC-47.1 |
| IC-04 | SC-14.2, SC-47.1 |
| IC-05 | SC-01.2, SC-05.1, SC-16.2, SC-17.3, SC-27.2, SC-32.2, SC-33.1 |
| IC-06 | SH-15 |
| IC-07 | SC-05.1, SC-17.3, SC-27.3, SC-33.1, SC-48.2, SC-50.3 |
| IC-08 | SC-05.1, SC-27.2, SC-33.1 |
| IC-09 | SC-11.1, SC-16.3, SC-27.5, SC-39.4 |
| IC-10 | SH-02 |
| IC-11 | All actions |
| IC-12 | SH-05 bulk, SC-27.6, SC-28.3, SC-40.2, SC-40.9, SC-45.4, SC-47.2, SC-48.2, SC-50.3, SC-51.4, SC-52.2 |
| IC-13 | SC-25.2, SC-46.2, SC-47.1, SC-49.2, SC-52.2 |
| IC-14 | SSB-5 everywhere |
| IC-15 | SH-13 |
| IC-16 | Build-time choice for multi-view pages |
| IC-17 | SH-08 |
| IC-18 | SC-33.1 |
| IC-19 | SC-06.1, SH-05, SC-53.1 |
| IC-20 | SH-05, SH-01, SC-33.1 |
| IC-21 | SH-05, SH-01, SH-04, SH-11 |
| IC-22 | SH-05 (desktop), SC-28.2, SC-31.1 |
| IC-23 | SH-05 |
| IC-24 | SH-03, SC-08.1, SC-40.9, SC-46.1 |
| IC-25 | SC-39.3, SH-03 |
| IC-26 | SC-17.4, SC-34.3 |
| IC-27 | SC-34.3 |
| IC-28 | SC-28.3, SC-40.4 |
| IC-29 | SC-39.2 |
| IC-30 | SH-02, SC-32.2 |
| IC-31 | SC-39.1 |
| IC-32 | SH-14, SC-34.1 |
| IC-33 | SC-19.3, SC-33.2, SC-36.1 |
| IC-34 | SC-33.4, SC-36.2 |
| IC-35 | SH-04 |
| IC-36 | SC-47.3, IC-34 |
| IC-37 | SH-10 |
| IC-38 | SC-11.2, SC-15.2, IC-26 |
| IC-39 | SC-16.4, SC-37.2, SC-48.3, IC-06 |
| IC-40 | SC-27.2, SC-29.2 |
| IC-41 | IC-12, IC-13, IC-54, IC-50 |
| IC-42 | SC-16.3, SC-49.2 |
| IC-43 | SC-30.3, SC-31.3, SC-38.3 |
| IC-44 | SC-40.1, SC-40.15, SC-26.3 |
| IC-45 | SH-08, SC-05.3 |
| IC-46 | SC-27.4, SC-28.4 |
| IC-47 | SC-21.1, SC-40.12, SC-50.1, SC-50.4 |
| IC-48 | SC-24.2 |
| IC-49 | SC-50.3, SC-23.1 |
| IC-50 | Workspace layouts (Phase 7 §3) |
| IC-51 | Everywhere |
| IC-52 | Root layout |
| IC-53 | SC-42.1, workspace layouts |
| IC-54 | Workspace layouts |
| IC-55 | Workspace and driver layouts |
| IC-56 | SC-34.1, SH-14 |
| IC-57 | SC-40.2, SH-05 row actions |
| IC-58 | SH-03 |
| IC-59 | Every status |
| IC-60 | SSB-3 everywhere |

**Total: 60 interaction contracts.**

---

Previous: [Phase 5 — Section Blueprints](./phase-5-section-blueprints.md) · Next: [Phase 7 — Frontend Architecture](./phase-7-frontend-architecture.md)
