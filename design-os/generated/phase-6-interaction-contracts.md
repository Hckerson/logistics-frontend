# Phase 6 — Interaction Contracts

`Haulr Design OS` · `Version 1.3.4` · `2026-10-10` · Previous: [Phase 5 — Section Blueprints](./phase-5-section-blueprints.md) · Next: [Phase 7 — Frontend Architecture](./phase-7-frontend-architecture.md)

How every interactive element behaves. Sections in [Phase 5](./phase-5-section-blueprints.md) cite these contracts by ID (`IC-nn`). A contract defines behaviour only: inputs, states, keyboard and assistive-technology behaviour, validation, loading, errors and content rules. Which components exist, how they are grouped and how they look is decided when pages are built.

Baseline: WCAG 2.2 AA and the WAI-ARIA Authoring Practices patterns named in each contract. Copy referenced below lives in `lib/constants.ts` or feature constants (host rule 1).

## Table of Contents

1. [Contract Format and Global Rules](#1-contract-format-and-global-rules)
2. [Entry and Validation](#2-entry-and-validation) — IC-01 … IC-10
3. [Actions and Confirmation](#3-actions-and-confirmation) — IC-11 … IC-14
4. [Navigation and Structure](#4-navigation-and-structure) — IC-15 … IC-18
5. [Finding and Collections](#5-finding-and-collections) — IC-19 … IC-23
6. [Files, Capture and Signature](#6-files-capture-and-signature) — IC-24 … IC-26
7. [Freight Transactions](#7-freight-transactions) — IC-27 … IC-31, IC-68
8. [Disclosure, Preferences and Social](#8-disclosure-preferences-and-social) — IC-32 … IC-41
9. [Money](#9-money) — IC-42, IC-43
10. [Sharing, Data and Time](#10-sharing-data-and-time) — IC-44 … IC-46
11. [Internal Operations](#11-internal-operations) — IC-47 … IC-49
12. [Global Utilities](#12-global-utilities) — IC-50 … IC-60
    - [Enterprise Contracts](#12a-enterprise-contracts) — IC-61 … IC-67
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

- **Purpose:** Capture free text or numbers, including numbers with units (weight, miles, money), as one labelled value that the owning form (IC-02) validates and submits.
- **Inputs:** `name`, label, value, type (text, email, tel, number-with-unit, currency), unit, required, min/max, maximum length, pattern, autocomplete token, hint, read-only reason, disabled reason.
- **States:** empty, filled, focused, invalid (message shown), pending (async validation), read-only (value readable and selectable, not editable, reason stated), disabled (not editable because a precondition in the form is unmet, reason stated per G-5), view-as read-only (BR-27, XS-16: read-only with the reason "Viewing as <member>. Changes need write consent on the ticket." unless write consent exists; IC-64).
- **Accessibility:** Programmatic label always (WCAG 1.3.1, 3.3.2); hint and error associated through `aria-describedby`; units included in the accessible name ("Weight, pounds"); errors are identified in text (3.3.1) and suggest the fix (3.3.3); the `autocomplete` token satisfies 1.3.5; read-only fields stay in the tab order so their value can be read; focus indicator per G-1.
- **Keyboard support:** Standard text editing including paste, undo and selection; Tab and Shift+Tab move in DOM order; Enter submits the enclosing form through native implicit submission (IC-02); no key is intercepted by the field.
- **ARIA:** `aria-invalid="true"` only while an error is shown; `aria-required` mirrors `required`; native `readonly` for read-only (never `disabled`, which removes the value from the tab order); `aria-busy="true"` while async validation is pending; `inputmode` set for numeric types (`decimal`, `numeric`, `tel`); currency and number-with-unit use a text input with `inputmode="decimal"` so grouping separators are accepted.
- **Interaction patterns:** Validate on blur and on submit, never on each keystroke; once a field has shown an error, re-validate on change so the error clears as soon as it is fixed; numbers are normalised on blur to the locale display form and submitted in the canonical form the contract schema defines; a field that edits a persisted record submits with the record version through its form (SSB-8), and a stale save opens IC-67 with this field's input kept for re-application.
- **Validation rules:** From the Zod schema in `lib/validations/` composed over the contract; leading and trailing whitespace trimmed; unless the schema is stricter, single-line text is at most 200 characters, email at most 254 characters in `local@domain` form, tel is E.164 (a `+` and up to 15 digits), currency at most 2 decimals and greater than or equal to 0, numbers inclusive of min/max (for example weight 1 to 45,000 lb); numbers accept locale grouping separators on input and normalise; the server validates every value again (G-7) and its field errors map to the same message by `name`.
- **Loading behavior:** LS-5 only while async validation runs (for example email availability): it starts after input settles, the field stays editable, pending is exposed through `aria-busy` and the hint text "Checking…", it is announced only if it exceeds 1 s (SSB-1), and a response for a superseded value is discarded; otherwise not applicable because the field never fetches data.
- **Error behavior:** E-VALIDATION: the message states what is wrong and how to fix it ("Enter a weight up to 45,000 lb"), the entry is kept, and server errors map to the field by `name`; E-RATE-LIMIT, E-TIMEOUT, E-OFFLINE or E-SERVER during async validation: pending clears without an error and the check is deferred to submit, where the server decides (G-7); E-PRECONDITION on save: handled by IC-02 and IC-67 with the entry kept.
- **Content rules:** Labels are nouns ("Pickup reference"); hints state format; errors never blame ("Enter…" not "Invalid…"); labels, hints and errors are whole sentences from constants with named placeholders, never concatenated fragments; numbers, money and units are displayed through `lib/utils/units.ts` and `lib/utils/currency.ts`, never hand-formatted; labels and messages tolerate 40% text expansion by wrapping, never truncating.
- **Do:** Use the correct `autocomplete` token for personal data; keep exactly what the user typed until blur normalisation.
- **Don't:** Use placeholder text as the label; block paste; use `type="number"` for money or identifiers.
- **Dependencies:** IC-02, `lib/validations/`, `lib/contract/`, `lib/utils/units.ts`, `lib/utils/currency.ts`.

### IC-02 — Form validation and error summary

- **Purpose:** Tell the user every problem in a form, get them to each, and submit valid entries to the server without ever losing what they typed.
- **Inputs:** Form schema, field errors (client and server), non-field errors, submit handler (a hook mutation or Server Action), record version for edits to persisted records (SSB-8), draft key when the flow persists drafts.
- **States:** pristine, dirty, submitting (LS-5), submitted with errors, submitted successfully (SU-1 or SU-2 per the owning page), stale (E-PRECONDITION; IC-67 open with entries kept), read-only (every field read-only, the submit action absent and the reason stated), view-as read-only (BR-27: as read-only, with "Viewing as <member>" as the reason unless write consent exists; IC-64).
- **Accessibility:** On failed submit, a summary of errors receives focus; each entry links to its field; count stated ("3 problems"); on success focus follows SSB-6; each field error remains adjacent in the reading order to its field and is associated through `aria-describedby` (WCAG 3.3.1, 3.3.3); nothing times out while the user is entering data (2.2.1, IC-54).
- **Keyboard support:** Summary links move focus to the field and scroll it into view; Enter in a single-line field submits the form; Tab from the summary continues into the form in DOM order.
- **ARIA:** Summary is a region with a heading and `role="alert"` on first appearance only; later submits that fail update the summary and move focus to it without re-alerting; field errors via `aria-describedby`; the form sets `aria-busy="true"` while submitting.
- **Interaction patterns:** Submit is always available (never disabled for invalid state); invalid submit shows the summary; valid submit enters pending (G-6); edits to persisted records submit the version the user started from (SSB-8), and an E-PRECONDITION response opens IC-67 showing what changed and by whom; reason-required actions cannot submit without the reason (SSB-9); success is confirmed per SSB-5.
- **Validation rules:** Single schema per form in `lib/validations/`, composed over `lib/contract/`; field limits come from each field's contract (IC-01, IC-07, IC-08); a required reason is 1 to 1,000 characters after trimming; server-returned field errors merged by field name (G-7); server errors naming an unknown field and non-field errors appear in the summary; conditional fields that are hidden are removed from validation (IC-09).
- **Loading behavior:** LS-5 on the submitting action with the pending label from constants; fields remain readable and focusable but not editable while submitting; a submit that exceeds 30 s becomes E-TIMEOUT (LS-4).
- **Error behavior:** E-VALIDATION: summary and field messages, entries kept; E-PRECONDITION: IC-67 with entries kept for re-application; E-CONFLICT: the new state explained and the next legal action offered; E-FORBIDDEN: the reason and who can grant access; E-AUTH: drafts saved, redirect to PG-10 with the return path; E-RATE-LIMIT: the wait from `Retry-After` stated and submit re-enabled after it; E-OFFLINE: entries kept, queued only where the page allows (PP-06), otherwise "This needs a connection"; E-SERVER, E-UNAVAILABLE, E-TIMEOUT, E-CONTRACT: entries kept, IC-60 retry and the support reference (correlation ID); nothing entered is ever cleared by an error.
- **Content rules:** Summary heading "There's a problem" (constant); the count uses plural rules from constants ("1 problem", "3 problems"), never string concatenation; entries mirror field messages exactly; messages come from `errorCopy.<class>` plus a context phrase, never raw server text (SSB-3).
- **Do:** Preserve entries across errors and navigation within a flow; store drafts only for the signed-in user and purge them per SSB-10 and NFR-PRIV-4 (30 days).
- **Don't:** Show errors before the user has interacted with a field or submitted; disable submit to signal invalid state.
- **Dependencies:** IC-01, IC-11, IC-60, IC-67, `lib/validations/`, `lib/utils/action-result.ts`.

### IC-03 — Password input

- **Purpose:** Capture a password securely for sign-in, reset, change or re-authentication (SEC-1).
- **Inputs:** Mode (current or new), policy (`PASSWORD_MIN_LENGTH` and rules), confirm required.
- **States:** empty, hidden, revealed, invalid, policy-met (new mode), disabled (password sign-in turned off for the member by an SSO requirement, BR-24, with the reason and a route to SSO sign-in), not offered in view-as (security settings are excluded from view-as, Phase 3 §5.2).
- **Accessibility:** Reveal control is a toggle button with state; policy rules exposed as text and updated as met; the field has a programmatic label per IC-01; the reveal control's name states what it reveals ("Show password"); entering a password never has a time limit (WCAG 2.2.1) and pasting is allowed (3.3.8 accessible authentication).
- **Keyboard support:** Reveal toggle reachable by Tab after the field; Space/Enter toggles; toggling keeps focus on the toggle and keeps the caret where it was in the field.
- **ARIA:** Reveal toggle uses `aria-pressed`; policy list with live updates polite and throttled (at most one announcement per second, only when a rule changes between met and unmet); `aria-invalid` and `aria-describedby` per IC-01.
- **Interaction patterns:** Reveal never persists across page loads; new-password mode shows policy before entry; the value is cleared from memory when the form unmounts; a confirmation field, when required, validates after the new password is valid.
- **Validation rules:** Minimum length `PASSWORD_MIN_LENGTH` (8, SEC-1); maximum 128 characters; any Unicode character including spaces is allowed and no composition rules apply (SEC-1); confirmation must match exactly; server strength and breached-password check at submit (SEC-1, G-7).
- **Loading behavior:** Not applicable — the field never fetches data; the server's strength and breach checks run inside the owning form's LS-5 on submit.
- **Error behavior:** E-VALIDATION: policy unmet, breached password ("This password has appeared in a data breach. Choose a different one."), or mismatch with confirmation explained at the confirmation field; wrong credentials on sign-in (E-VALIDATION, `INVALID_CREDENTIALS`, SC-10.1): a generic credentials message that never states whether the account exists (XS-01); E-RATE-LIMIT: lockout with the cooldown from `Retry-After` (SEC-10, XS-01); in every case the password field is cleared only after wrong credentials and on E-RATE-LIMIT, never for policy, breach or confirmation errors.
- **Content rules:** Policy stated positively ("At least 8 characters"); the minimum is inserted from `PASSWORD_MIN_LENGTH` through a named placeholder, never typed into copy; rule text tolerates 40% expansion.
- **Do:** Use `autocomplete="current-password"` or `"new-password"`.
- **Don't:** Block paste or password managers; log, analyse or echo the value anywhere (Restricted, NFR-PRIV-1).
- **Dependencies:** IC-01, `useLogin`, `useResetPassword`, `useChangePassword`, `PASSWORD_MIN_LENGTH`.

### IC-04 — One-time code input

- **Purpose:** Capture MFA and verification codes, including backup codes.
- **Inputs:** Length (6), allowed characters, auto-submit flag, delivery channel description, backup-code mode.
- **States:** empty, partial, complete, verifying, invalid (attempts remaining stated), expired (new code needed), locked (cooldown stated; input disabled until it ends), backup-code mode.
- **Accessibility:** Single labelled input (not one input per digit); remaining attempts stated after an error; the delivery destination is in the description; no time limit applies to entry beyond the code's own validity, which is stated (WCAG 2.2.1); paste and autofill are allowed (3.3.8).
- **Keyboard support:** Standard text entry; paste fills the code; Enter submits a partial code for a specific message rather than doing nothing; the backup-code route is a keyboard-reachable link.
- **ARIA:** `autocomplete="one-time-code"`, `inputmode="numeric"` (`inputmode="text"` in backup-code mode); `aria-invalid` and `aria-describedby` for the error and attempts remaining; `aria-busy="true"` while verifying.
- **Interaction patterns:** Auto-submits when complete; a backup-code route is available; wrong codes clear the field and keep focus in it.
- **Validation rules:** Length and charset only on the client: exactly 6 digits after stripping spaces and hyphens; backup codes are accepted case-insensitively in their issued format; attempt limits, expiry and correctness are decided by the server (G-7).
- **Loading behavior:** Verifying state blocks re-entry (LS-5, G-6); announced only if verification exceeds 1 s.
- **Error behavior:** E-VALIDATION: wrong code clears the entry, keeps focus and states attempts remaining; E-RATE-LIMIT: lockout states the cooldown from `Retry-After` and re-enables the input after it (XS-01); E-AUTH: the challenge expired, so sign-in restarts at PG-10 with the return path; E-OFFLINE, E-TIMEOUT, E-SERVER: the entry is kept, retry is offered, and the attempt is not counted.
- **Content rules:** Tell the user where the code was sent, masked ("the phone ending 42"); expiry stated with the relative time from `lib/utils/date-formatter.ts`; copy from constants with named placeholders.
- **Do:** Accept codes with spaces and strip them.
- **Don't:** Split into multiple inputs; reveal the full destination address or number.
- **Dependencies:** IC-01, `useMfaChallenge`, `useVerifyEmail`.

### IC-05 — Location autocomplete

- **Purpose:** Resolve an address, city, region or known facility into a geocoded location.
- **Inputs:** Scope (address, city, region, facility-first for shippers), bias location, required, whether free text is permitted on degradation.
- **States:** empty, typing, suggestions pending, suggestions available, no suggestions (EM-2), selected, invalid (typed text not resolved), service unavailable, read-only, disabled (reason stated), view-as read-only (BR-27).
- **Accessibility:** WAI-ARIA combobox with listbox popup; result count announced politely; facility suggestions are identified as facilities in their accessible name; a selected location is read back in full in the field's description.
- **Keyboard support:** Down/Up move through suggestions; Enter selects; Escape closes then clears; Tab accepts the active suggestion only if one is active; Home/End move within the text.
- **ARIA:** `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`, `aria-autocomplete="list"`; options `role="option"` with `aria-selected`; `aria-busy` on the combobox while suggestions are pending.
- **Interaction patterns:** Suggestions after 2 characters and 250 ms settle (`use-debounced-search`); the organisation's facilities are offered alongside geocoder results and labelled as facilities; selection stores a structured location (address components, coordinates, facility ID when chosen, facility time zone), not text.
- **Validation rules:** A selection is required unless the scope permits free text (SC-01.2 degradation); query 2 to 200 characters; country scope from constants (United States at launch, Phase 1 §16); the server re-geocodes and rejects unresolvable locations (G-7).
- **Loading behavior:** LS-2 for suggestions: pending exposed on the combobox; previous suggestions stay until replaced; responses for superseded queries are discarded; facility options load once per session and are cached with the `useFacilities` query key.
- **Error behavior:** E-UNAVAILABLE or E-TIMEOUT from the geocoder: free text accepted where allowed, otherwise the field explains it cannot resolve locations now and offers IC-60 retry; E-RATE-LIMIT: suggestions pause for the `Retry-After` wait with the reason stated; E-OFFLINE: facility suggestions from cache still work, geocoder suggestions are unavailable with the reason stated; E-VALIDATION on submit: typed but unselected text is flagged "Choose a location from the list".
- **Content rules:** Suggestions include enough to disambiguate (city, state, ZIP); address order follows the locale convention supplied by the geocoder, never rebuilt by concatenating parts in code; long facility names wrap, never truncate.
- **Do:** Keep the typed text if the user leaves without selecting, and flag it invalid.
- **Don't:** Auto-select any suggestion silently; send typed address text to analytics (NFR-PRIV-3).
- **Dependencies:** `use-location-suggestions` (`useLocationSuggestions`), `use-facilities` (`useFacilities`), `use-debounced-search`.

### IC-06 — Assignment picker

- **Purpose:** Choose a driver and a vehicle for a load with eligibility shown, before the BR-09 deadline.
- **Inputs:** Load requirements (equipment, pickup window), fleet options with availability and eligibility reasons, current assignment and its version, most recently used compatible pair.
- **States:** loading, options available, none eligible (EM-1 when the fleet has no drivers, EM-2 when none meet the requirements), selected, saving (LS-5), saved, conflict (driver or vehicle taken), stale (E-PRECONDITION, IC-67), read-only (load past the state where reassignment is legal, reason stated), view-as read-only (BR-27).
- **Accessibility:** Combobox or listbox per IC-07; ineligible options remain discoverable with their reason in the accessible description; the saved assignment is announced politely ("Assigned Dana R. and unit 214").
- **Keyboard support:** As IC-07 (arrows move, Enter selects, Escape closes, type-ahead); type-ahead matches driver name or unit number; the "invite driver" route is a keyboard-reachable action that opens IC-39 and returns focus to the picker on close.
- **ARIA:** `aria-disabled` on ineligible options with `aria-describedby` reason; otherwise as IC-07.
- **Interaction patterns:** Selecting a driver narrows vehicles to compatible ones; an "invite driver" route opens IC-39 without leaving the picker; saving submits the assignment with the load version (SSB-8); a changed assignment made by someone else opens IC-67; reassigning after dispatch notifies the previous driver.
- **Validation rules:** Driver and vehicle required; equipment must satisfy load requirements (BR-03); the driver must be an active member of the carrier organisation; the server rechecks availability and eligibility (G-7).
- **Loading behavior:** LS-1 for options on open with the picker usable for type-ahead once any options arrive; LS-5 on save with the pending label "Assigning…".
- **Error behavior:** E-CONFLICT: driver or vehicle assigned to an overlapping load → reason and alternatives; E-PRECONDITION: assignment changed by another member → IC-67 naming who changed it; E-VALIDATION: incompatible equipment named; E-FORBIDDEN: the member lacks the dispatch capability, with who can grant it; E-SERVER, E-TIMEOUT: selection kept with IC-60 retry; E-OFFLINE: "Assigning needs a connection", selection kept.
- **Content rules:** Ineligibility reasons are specific ("Reefer required"); availability times use `lib/utils/date-formatter.ts` in the facility zone; reason copy from constants with named placeholders.
- **Do:** Offer the most recently used compatible pair as a suggestion, labelled as such.
- **Don't:** Hide ineligible options entirely; expose driver precise location in the picker (Restricted, NFR-PRIV-1).
- **Dependencies:** IC-07, IC-39, IC-67, SH-15, `useFleet`, `useAssignLoad`.

### IC-07 — Select and multi-select

- **Purpose:** Choose from a known set (enums, reason codes, roles).
- **Inputs:** Options (value, label, description, disabled reason), single or multiple, required, maximum selections, option source (enum or remote), group labels.
- **States:** closed, open, selected, none selected, invalid, disabled (whole control, reason stated per G-5), option disabled (reason stated), options loading, options failed, read-only, view-as read-only (BR-27).
- **Accessibility:** Native `select` where the option set is short and single; otherwise WAI-ARIA listbox or combobox pattern; the selected value is part of the accessible name or value when closed; disabled options stay discoverable with their reason.
- **Keyboard support:** Arrow keys, type-ahead, Space toggles in multi-select, Escape closes, Enter selects in single-select, Home/End jump to the ends of the list.
- **ARIA:** `aria-multiselectable` for multiple; selected count announced; `aria-disabled` plus `aria-describedby` for disabled options; `aria-busy` while remote options load.
- **Interaction patterns:** Options come from `lib/enums/`; labels from constants; in multi-select, each selected value is removable by keyboard; a selection that is no longer offered (option retired) is shown with its label and flagged for change.
- **Validation rules:** Required selection; values must belong to the option set (an enum from `lib/enums/` derived from the contract), so unknown values are rejected; maximum selections where defined; the server re-validates membership (G-7).
- **Loading behavior:** Not applicable for enum-backed options, which are static; remote option sets use LS-1 with pending exposed and the current selection kept.
- **Error behavior:** E-VALIDATION per IC-02; remote options E-SERVER, E-TIMEOUT, E-UNAVAILABLE or E-OFFLINE: the current selection stays visible by label and IC-60 retry is offered in place.
- **Content rules:** Option labels plain-language (Phase 3 §7); group labels and descriptions from constants; labels tolerate 40% expansion and wrap; the selected-count text uses plural rules from constants.
- **Do:** Group long option sets by category.
- **Don't:** Mix actions into option lists.
- **Dependencies:** `lib/enums/`, IC-02.

### IC-08 — Date and time window picker

- **Purpose:** Capture a date, a date range, or an appointment window with time zone.
- **Inputs:** Mode (date, range, window), time zone (facility), min/max, step (15 min), default window duration, booking horizon.
- **States:** empty, partial, complete, invalid, disabled dates (reason stated), read-only, disabled (reason stated), view-as read-only (BR-27).
- **Accessibility:** Typed entry is always possible; any calendar follows the WAI-ARIA date picker dialog pattern; time zone stated in text; the expected typed format is in the hint; unavailable dates carry their reason in the accessible description.
- **Keyboard support:** Arrow keys move days; Page Up/Down months; Home/End week; Enter selects; Escape closes and returns focus to the element that opened the calendar.
- **ARIA:** Grid pattern for calendar; `aria-label` includes full date text; `aria-invalid` and `aria-describedby` per IC-01; `aria-disabled` on unavailable dates.
- **Interaction patterns:** Window end cannot precede start; default duration from constants; values stored in ISO with zone; changing an appointment on a booked load is an amendment (BR-25) and submits with the load version (SSB-8, IC-67).
- **Validation rules:** Parsed dates must be real calendar dates; minutes on the 15-minute step; not in the past for new loads, compared in the facility zone against server time; delivery after pickup; within the booking horizon from feature constants (the server value wins, SC-25.2); report ranges at most 366 days (IC-17); the server re-validates (G-7).
- **Loading behavior:** Not applicable — the picker parses and validates locally; the facility time zone arrives with the chosen location (IC-05) and never triggers a fetch here.
- **Error behavior:** E-VALIDATION: specific ("Delivery window must end after pickup starts"), entry kept; E-PRECONDITION on save of a booked load: IC-67 with the entered window kept.
- **Content rules:** Times with zone abbreviation; format from `DATE_VALUE_FORMAT` for values; displayed dates and times through `lib/utils/date-formatter.ts` in locale order, never assembled by concatenation; month and weekday names come from the formatter, never from literals.
- **Do:** Parse common typed formats via `lib/utils/date-parser.ts`.
- **Don't:** Rely on the browser's local zone for facility appointments.
- **Dependencies:** `date-fns`, `lib/utils/date-parser.ts`, `lib/utils/date-formatter.ts`, IC-05.

### IC-09 — Single choice group

- **Purpose:** Choose one of a few mutually exclusive options where each needs explanation.
- **Inputs:** Options with label and description, required, default value, disabled reasons.
- **States:** none selected, selected, invalid, disabled option (reason stated), whole group disabled (reason stated), read-only, view-as read-only (BR-27).
- **Accessibility:** Native radio group with a group label (`fieldset`/`legend`); each option's consequence is in its description; the group error is associated with the `fieldset`.
- **Keyboard support:** Arrow keys move and select; Tab enters and leaves the group (landing on the selected option, or the initial option when none is selected).
- **ARIA:** Native semantics; descriptions via `aria-describedby`; group error via `aria-describedby` on the `fieldset`.
- **Interaction patterns:** Choice can reveal dependent entries; hidden entries are removed from validation and their values are discarded on submit.
- **Validation rules:** Required when stated; the value must be one of the offered options; the server re-validates (G-7).
- **Loading behavior:** Not applicable — options are static or supplied by the owning section with its already-loaded data.
- **Error behavior:** E-VALIDATION per IC-02 at group level ("Choose how to offer this load").
- **Content rules:** Options state consequence ("Offer to preferred carriers first, then everyone"); labels and descriptions from constants and tolerant of 40% expansion.
- **Do:** Preselect only when one option is a safe default.
- **Don't:** Use for more than 5 options (use IC-07).
- **Dependencies:** IC-02.

### IC-10 — Check call request

- **Purpose:** Ask the carrier for a manual status and location update when tracking is stale.
- **Inputs:** Load ID, load state, position age, requester role, optional note, open request (if any) with its time.
- **States:** available, requested (with time), responded, unavailable (fresh data, reason stated), unavailable (load not in transit, reason stated), blocked (repeat within 30 minutes, time until available stated), pending (LS-5), view-as read-only (BR-27: unavailable with reason unless write consent exists).
- **Accessibility:** Result announced; requested time as text; the unavailable reason is the button's accessible description (G-5).
- **Keyboard support:** As IC-11: Enter and Space activate the request button; the optional note is an IC-01 field reached by Tab.
- **ARIA:** As IC-11: `aria-busy` while pending, `aria-describedby` for the unavailable or blocked reason; the requested state is text in a `role="status"` region.
- **Interaction patterns:** One open request per load; repeated request within 30 minutes is blocked with reason; the request notifies the dispatcher and the assigned driver; the carrier's response appends a position to the load timeline; the server records audit `load.check_call.requested` and analytics `load.check_call.requested`.
- **Validation rules:** Available only when position age exceeds the stale threshold (60 min, BR-10, Phase 4 §2.6) and the load is `InTransit`, `AtPickup` or `AtDelivery`; note at most 500 characters; the server rechecks staleness, state and the 30-minute window (G-7).
- **Loading behavior:** LS-5 per G-6 with the pending label "Requesting…"; the load's other actions stay usable.
- **Error behavior:** E-CONFLICT: a request is already open or position became fresh → the existing request time or new position age stated; E-RATE-LIMIT: the time until another request is allowed; E-FORBIDDEN: the role cannot request, with who can; E-OFFLINE: "Requesting a check call needs a connection"; E-SERVER, E-TIMEOUT: IC-60 retry with the note kept.
- **Content rules:** State who will be asked (dispatcher, driver); position age and requested time through `lib/utils/date-formatter.ts` as relative time with the absolute time available; copy from constants with named placeholders.
- **Do:** Record the request on the load timeline.
- **Don't:** Allow requests on loads not in transit.
- **Dependencies:** IC-11, SH-02, `useLoadActions`, `useLoadTimeline`.

---

## 3. Actions and Confirmation

### IC-11 — Action button

- **Purpose:** Perform one action: submit, navigate to a transaction, run a mutation.
- **Inputs:** Accessible name (verb-first), action handler or form, variant intent (standard, destructive), pending text, disabled reason, idempotency key where the mutation carries one.
- **States:** enabled, focused, pending (LS-5), disabled (with reason), success (transient, SU-1), view-as read-only (BR-27: mutation actions unavailable with the reason "Viewing as <member>. Changes need write consent on the ticket." unless write consent exists; navigation actions stay enabled).
- **Accessibility:** Native `button` for actions, `a` for navigation; name describes the effect; pending exposed; disabled buttons that must explain themselves stay focusable (`aria-disabled` rather than `disabled`) so the reason can be read (G-5); target size per G-2.
- **Keyboard support:** Enter and Space activate buttons; Enter activates links; activation while pending does nothing (G-6).
- **ARIA:** `aria-busy` while pending; `aria-describedby` for disabled reason (G-5); `aria-disabled="true"` for explained unavailability.
- **Interaction patterns:** Pending blocks re-activation (G-6); result announced via IC-14; mutations run through hooks or Server Actions, never direct client calls; irreversible actions go through IC-12 and payments through IC-43; focus stays on the button after the mutation unless it no longer exists (SSB-6); spend-limited members still see money-committing actions (Phase 3 §5.2).
- **Validation rules:** Not applicable — the button carries no value of its own; validation belongs to the form it submits (IC-02) and to the server (G-7).
- **Loading behavior:** LS-5: pending label from constants ("Booking…"); a mutation exceeding 30 s becomes E-TIMEOUT (LS-4).
- **Error behavior:** Errors are reported by the owning section, and focus stays on the button; the section maps E-VALIDATION to IC-02, E-CONFLICT and E-PRECONDITION to the new state or IC-67, E-FORBIDDEN to the reason and who can grant it, E-OFFLINE to "needs a connection" or the offline queue (PP-06), and E-SERVER, E-TIMEOUT, E-UNAVAILABLE to IC-60.
- **Content rules:** "Book load", "Accept bid", "Pay $2,140.00"; never "Submit", "OK" (Phase 3 §7); amounts in names come from `lib/utils/currency.ts` through a named placeholder; names tolerate 40% expansion by wrapping, never truncating the amount or object.
- **Do:** Extend the existing `components/ui/button.tsx` primitive.
- **Don't:** Use a link for a mutation or a button for navigation.
- **Dependencies:** `components/ui/button.tsx`, IC-14, IC-60.

### IC-12 — Irreversible action confirmation

- **Purpose:** Make sure the user intends an action that cannot be undone (PP-05, Phase 4 §2.8).
- **Inputs:** Action name, consequence statement, affected scope (count, amount), optional required reason, confirm and cancel labels, record version (SSB-8), idempotency key.
- **States:** closed, open, reason invalid, confirming (pending), failed (dialog stays open), stale (record changed since opening; consequence refreshed), succeeded (dialog closes, SU-1 or SU-2).
- **Accessibility:** Implemented with IC-41 dialog; focus moves to the dialog heading; focus returns to the invoking element on close (or to the result if the invoker no longer exists, SSB-6); the consequence is read as the dialog description.
- **Keyboard support:** Escape cancels (except while confirming); Enter does not confirm by default for destructive actions; Tab cycles within.
- **ARIA:** `role="alertdialog"`, `aria-labelledby`, `aria-describedby` pointing to the consequence; `aria-busy` on the confirm action while confirming.
- **Interaction patterns:** Consequence states money and parties affected ("The carrier will be owed a $250 TONU"); reason-required actions validate the reason; the confirm label repeats the action; scope and amounts come from a server preview, not client arithmetic; the confirmation submits the record version it showed (SSB-8); the server records the audit event with the reason (for example `load.cancelled`, SSB-9).
- **Validation rules:** Reason required for internal actions (Phase 1 §11) and wherever SSB-9 requires one: 1 to 1,000 characters after trimming, with a reason code from `lib/enums/` where the action defines codes; the server re-validates reason, permission and state (G-7).
- **Loading behavior:** Confirming blocks both choices (LS-5, G-6); the dialog cannot be dismissed while confirming; after 30 s it becomes E-TIMEOUT and retry reuses the same idempotency key.
- **Error behavior:** Failure is shown inside the dialog, which stays open for retry; E-CONFLICT: the state moved on (for example the load was already cancelled) → the new state is explained and confirm is withdrawn; E-PRECONDITION: the record changed → the refreshed consequence is shown with the reason kept, and the user confirms again (IC-67); E-FORBIDDEN: reason and who can act; E-OFFLINE: "This needs a connection" (irreversible actions never queue); E-SERVER, E-TIMEOUT, E-UNAVAILABLE: retry with the same idempotency key and the support reference.
- **Content rules:** Heading is a question ("Cancel load HL-7K2M9QXA?"); cancel label "Keep load"; the consequence is one whole sentence from constants with named placeholders for amounts, parties and counts, never assembled from fragments; amounts via `lib/utils/currency.ts`.
- **Do:** State exactly what happens next.
- **Don't:** Use for reversible actions; stack confirmations.
- **Dependencies:** IC-41, IC-11, IC-67.

### IC-13 — Re-authentication challenge

- **Purpose:** Require recent authentication for sensitive changes (XS-11, XS-08, Phase 4 §2.8).
- **Inputs:** Freshness window (10 minutes), methods (password, MFA, identity provider for SSO members), reason text, the interrupted action to resume.
- **States:** not required (authenticated within 10 minutes), required, verifying, verified, failed (attempts remaining), locked (cooldown stated), redirecting to the identity provider (SSO members, BR-24), unavailable in view-as (sensitive actions are excluded, Phase 3 §5.2).
- **Accessibility:** As IC-41: focus moves to the title and is contained, background inert, focus returns on close; the reason is stated in the description; entry fields follow IC-03 and IC-04.
- **Keyboard support:** As IC-41: Escape cancels and returns focus to the invoking element (the pending change is kept), Tab cycles within; entry keys per IC-03 and IC-04.
- **ARIA:** As IC-41: `aria-labelledby`, `aria-describedby` pointing to the reason, `aria-modal="true"`; `aria-busy` while verifying.
- **Interaction patterns:** Triggered by the server's "re-auth required" response; on success the original action resumes automatically; SSO members re-authenticate at their identity provider and return with the action resumed.
- **Validation rules:** As IC-03 (password length) and IC-04 (6-digit code or backup code); freshness is decided by the server (G-7).
- **Loading behavior:** LS-5 while verifying; the dialog cannot be dismissed while verifying.
- **Error behavior:** E-VALIDATION: wrong password or code with attempts remaining; E-RATE-LIMIT: failure count and lockout per XS-01 with the cooldown; E-AUTH: the session itself expired → drafts saved and PG-10 with the return path; E-OFFLINE, E-SERVER, E-TIMEOUT: retry without counting an attempt; the pending change is never discarded.
- **Content rules:** "Confirm it's you to change payout methods."; the protected action is inserted through a named placeholder, never concatenated.
- **Do:** Resume the interrupted action.
- **Don't:** Discard the user's pending change.
- **Dependencies:** IC-03, IC-04, IC-41, `useMfaChallenge`.

### IC-14 — Status announcement

- **Purpose:** Tell the user an action's outcome without moving focus (SSB-5).
- **Inputs:** Message, politeness (polite or assertive), optional action (undo, view), duration.
- **States:** queued, announced, dismissed, expired, persistent (carries an action; stays until dismissed or acted on).
- **Accessibility:** Uses a single persistent live region; assertive only for failures that block the user; an included action is focusable without moving focus automatically; announcements never obscure focused content (WCAG 2.4.11).
- **Keyboard support:** Any included action is reachable by keyboard; the announcement persists until dismissed when it carries an action; Escape dismisses a persistent announcement when focus is within it.
- **ARIA:** `role="status"` (polite) or `role="alert"` (assertive); the live region exists in the DOM before any message is inserted.
- **Interaction patterns:** At most one announcement at a time, with later ones queued; minimum duration 6 seconds, longer for longer text (WCAG 2.2.1); identical consecutive messages are merged rather than repeated.
- **Validation rules:** Not applicable — the announcer accepts messages from code, never user entry; messages are typed to come from constants.
- **Loading behavior:** Not applicable — the announcer never fetches data.
- **Error behavior:** Not applicable to the announcer itself, which cannot fail on a request; error announcements it carries include a next step, use copy from `errorCopy.<class>`, and are assertive only for blocking failures.
- **Content rules:** Past tense for success ("Bid accepted"); plain cause for failure; whole sentences from constants with named placeholders, never concatenated; amounts and times through the shared formatters.
- **Do:** Pair with a visible state change in the affected section.
- **Don't:** Use as the only record of an important outcome.
- **Dependencies:** `components/providers/` (announcer provider).

---

## 4. Navigation and Structure

### IC-15 — Step navigation

- **Purpose:** Move through a multi-step flow (SH-13).
- **Inputs:** Steps (id, title, completed, valid), current step (from `?step=`), draft ID and version.
- **States:** step current, completed, available, locked (reason stated), saving (LS-5), save failed, stale draft (E-PRECONDITION; IC-67), read-only (flow already submitted; steps viewable, not editable), view-as read-only (BR-27).
- **Accessibility:** Current step announced ("Step 2 of 5, Freight and equipment"); step indicator uses `aria-current="step"`; on step change focus moves to the step heading (SSB-6).
- **Keyboard support:** Continue and back as IC-11 (Enter and Space activate); completed steps navigable as links by Tab and Enter; locked steps are focusable and expose their reason.
- **ARIA:** `aria-current="step"`; locked steps `aria-disabled` with reason; the step list is an ordered list labelled "Progress".
- **Interaction patterns:** Continue validates; back never validates; browser back mirrors step back via the URL; each step change saves the draft with its version (SSB-8); an unknown or locked `step` value in the URL is replaced by the furthest available step.
- **Validation rules:** Per-step schema slice from the flow's schema in `lib/validations/`; the server re-validates the whole draft on final submit (G-7).
- **Loading behavior:** LS-5 on continue while the draft saves; the step's entries stay readable; a save exceeding 30 s becomes E-TIMEOUT.
- **Error behavior:** Save failure keeps the user on the step with retry; E-VALIDATION: IC-02 summary on the step; E-PRECONDITION: the draft changed in another session → IC-67 with the step's entries kept; E-OFFLINE: entries kept locally and "Saving needs a connection" stated; E-AUTH: draft saved locally, PG-10 with return to the same step; E-SERVER, E-TIMEOUT: IC-60 retry.
- **Content rules:** Step titles are nouns; "Step 2 of 5" is one constant with named placeholders, never concatenated; titles tolerate 40% expansion.
- **Do:** Persist the draft on every step change.
- **Don't:** Lose data on back.
- **Dependencies:** SH-13, IC-02, IC-67, `lib/utils/query-string.ts`.

### IC-16 — Tabs

- **Purpose:** Switch between peer views of the same subject.
- **Inputs:** Tabs (id, label, count), selected (URL parameter `tab`), per-tab activation mode (automatic or manual).
- **States:** selected, unselected, disabled (reason stated), tab content loading, tab content failed.
- **Accessibility:** WAI-ARIA tabs pattern; counts are part of the tab's accessible name ("Documents, 4"); the selected tab's content is labelled by its tab.
- **Keyboard support:** Arrow keys move between tabs, with automatic activation when the tab content is cheap and manual activation when it is expensive; Home/End; Enter or Space activates with manual activation; Tab moves from the tab list into the selected tab's content.
- **ARIA:** `role="tablist"`, `tab`, `tabpanel`, `aria-selected`, `aria-controls`, `aria-labelledby` on each `tabpanel`; disabled tabs `aria-disabled` with reason.
- **Interaction patterns:** Selected tab in the URL; tab content lazy-loads; an unknown `tab` value falls back to the default tab and the URL is corrected with `replace`.
- **Validation rules:** Not applicable — tabs accept no user entry; the only input is the `tab` URL parameter, handled as the interaction patterns state.
- **Loading behavior:** Tab content loading per SSB-1: LS-1 on first open with its own boundary, LS-2 on revisit with the previous content kept.
- **Error behavior:** Tab-content level: the failed tab states what failed with IC-60 retry (E-SERVER, E-TIMEOUT, E-UNAVAILABLE), shows "no longer available" for E-NOT-FOUND, and stays switchable; other tabs keep working.
- **Content rules:** Short nouns; counts as text formatted with locale grouping via `lib/utils/units.ts`; labels tolerate 40% expansion.
- **Do:** Keep state per tab when switching.
- **Don't:** Use tabs for sequential steps (use IC-15).
- **Dependencies:** `lib/utils/query-string.ts`.

### IC-17 — Period selector

- **Purpose:** Choose the time period for metrics (SH-08).
- **Inputs:** Presets (7, 30, 90 days, quarter), custom range via IC-08, organisation reporting time zone.
- **States:** preset selected, custom (range entered through IC-08), custom invalid.
- **Accessibility:** As IC-09 when presets are few (native radio group with `fieldset`/`legend`) or IC-07 when offered as a list; the applied period and its comparison period are stated in text.
- **Keyboard support:** As IC-09: arrow keys move and select a preset, Tab enters and leaves; custom range entry per IC-08.
- **ARIA:** As IC-09: native radio semantics with descriptions via `aria-describedby`; the custom range fields per IC-08.
- **Interaction patterns:** Period in the URL (`from`, `to` for custom); comparison period derived automatically (the equal-length period immediately preceding).
- **Validation rules:** Custom range ≤ 366 days; `from` not after `to`; end not after today in the reporting zone; unknown preset values in the URL fall back to "Last 30 days".
- **Loading behavior:** Metrics refetch per SSB-2 (LS-2): previous values stay with their period stated until new values arrive; dashboards are fresh for 60 s (Phase 4 §2.6).
- **Error behavior:** E-VALIDATION per IC-08 for custom ranges; metric fetch failures are owned by SH-08.
- **Content rules:** "Last 30 days"; custom ranges rendered through `lib/utils/date-formatter.ts` as one localised range, never concatenated dates.
- **Do:** Apply to all metrics in the section.
- **Don't:** Reset on navigation.
- **Dependencies:** IC-08, IC-09, `useMetrics`.

### IC-18 — Radius control

- **Purpose:** Set a search radius in miles.
- **Inputs:** Min, max, step, presets (load board: 10 to 500 miles, step 5, presets 25, 50, 100, 250, from feature constants).
- **States:** value set, default, clamped (out-of-range entry corrected with explanation), disabled (no origin chosen, reason stated).
- **Accessibility:** Native range input or WAI-ARIA slider with value text ("75 miles"), always paired with numeric entry (IC-01).
- **Keyboard support:** Arrow keys step; Page Up/Down by 5 steps; Home/End; numeric entry per IC-01.
- **ARIA:** `aria-valuetext` with unit; `aria-valuemin`, `aria-valuemax`, `aria-valuenow`.
- **Interaction patterns:** Changes apply after settling (debounced); the value writes to `originRadius` or `destinationRadius` in the URL (Phase 3 §10).
- **Validation rules:** Within min/max inclusive; whole miles on the step; the server clamps to the same bounds (G-7).
- **Loading behavior:** Results pending per SH-05 (LS-2 with previous results kept); the control itself never fetches.
- **Error behavior:** E-VALIDATION: clamp to range with explanation ("Radius set to 500 miles, the maximum").
- **Content rules:** Unit always stated; value text from a constant with a named placeholder formatted by `lib/utils/units.ts`.
- **Do:** Offer numeric entry.
- **Don't:** Require dragging (WCAG 2.5.7).
- **Dependencies:** IC-01, SH-05, `lib/utils/units.ts`.

---

## 5. Finding and Collections

### IC-19 — Search input

- **Purpose:** Search a collection or index by text.
- **Inputs:** Scope, scope hint, URL parameter `q`, minimum length.
- **States:** empty, typing, short of the minimum length, searching, results, no results (EM-2), error.
- **Accessibility:** `type="search"` inside a `role="search"` landmark; result count announced politely after results settle; the scope hint is the field's description.
- **Keyboard support:** Enter searches immediately; Escape clears (a second Escape leaves the field unchanged); standard text editing.
- **ARIA:** Labelled; `aria-describedby` for scope hint; `aria-busy` on the results region while searching.
- **Interaction patterns:** Debounced 300 ms via `use-debounced-search`; exact reference numbers resolve directly to the record (Phase 3 §9); clearing the query restores the unfiltered collection.
- **Validation rules:** Trim; minimum 2 characters except reference patterns (`HL-`, `INV-`, `STL-`, `CLM-`, `TKT-` followed by the reference characters); maximum 200 characters; the server applies the access filter regardless of query (Phase 3 §9).
- **Loading behavior:** LS-2: previous results kept while pending; LS-3 after 5 s states "Still searching".
- **Error behavior:** E-SERVER, E-TIMEOUT, E-UNAVAILABLE: IC-60 retry with the query kept; E-RATE-LIMIT: wait stated from `Retry-After`; E-OFFLINE: "Searching needs a connection", previous results kept with their age; E-VALIDATION (query rejected): the reason stated in the hint.
- **Content rules:** Hint names searchable keys ("Load, PO or BOL number"); result count via plural rules from constants with locale grouping; EM-2 copy states the query and offers to clear it.
- **Do:** Keep the query in the URL.
- **Don't:** Search on every keystroke without debounce; send query text to analytics (NFR-PRIV-3).
- **Dependencies:** `lib/hooks/use-debounced-search.ts`, `lib/utils/query-string.ts`.

### IC-20 — Filter group

- **Purpose:** Narrow a collection by criteria.
- **Inputs:** Filter definitions (parameter name from Phase 3 §10, control contract, options), current values from the URL, applied saved search (if any).
- **States:** none applied, some applied (count), staged (phone, not yet applied), pending, invalid combination.
- **Accessibility:** Grouped with a label; applied filter count and result count announced after change; each applied filter removable by keyboard; staged filters state that they are not yet applied.
- **Keyboard support:** Per constituent contract (IC-05, IC-07, IC-08, IC-18); "clear all" reachable by Tab; each applied filter's remove action activates with Enter or Space.
- **ARIA:** `fieldset`/`legend` or `role="group"` with `aria-labelledby`; result count in a `role="status"` region.
- **Interaction patterns:** On desktop (DV-DESK), changes apply after settling; on phone (DV-PHONE), filters may be staged and applied together. Either way the URL is the source of truth; precedence is access filter, saved search, URL parameters, defaults (Phase 3 §10); applying filters resets the cursor.
- **Validation rules:** Unknown URL values are ignored and dropped from the URL; `from` not after `to`; radius per IC-18; numeric floors (`minRate`, `minRpm`, `maxWeight`) are non-negative numbers within the IC-01 ranges; multi-value parameters are limited to their enum values.
- **Loading behavior:** Per SH-05: LS-2 with previous results kept and the result count announced when it changes.
- **Error behavior:** E-VALIDATION: invalid combinations explained at the filter ("Start date must be before end date") with other filters kept; result fetch failures are owned by SH-05.
- **Content rules:** Filter names match labeling conventions (Phase 3 §7); applied-filter summaries are whole sentences from constants with named placeholders; values formatted through the shared formatters.
- **Do:** Preserve filters across pagination and view switches.
- **Don't:** Reset filters when the user opens a record and returns.
- **Dependencies:** IC-05, IC-07, IC-08, IC-18, `lib/utils/query-string.ts`.

### IC-21 — Pagination

- **Purpose:** Move through large collections by cursor.
- **Inputs:** Cursor, page size (from constants: default 50, maximum 200), has-next, has-previous, total count when the server provides it.
- **States:** single page, first page, middle, last page, loading more, load-more failed.
- **Accessibility:** "Load more" announces how many were added and moves focus to the initial added item; numbered pagination is a `nav` landmark labelled "Pagination".
- **Keyboard support:** Standard link/button: Enter activates links, Enter and Space activate "load more"; Tab moves through page links in order.
- **ARIA:** `aria-current="page"` for numbered pagination; `aria-busy` on the collection while loading more.
- **Interaction patterns:** Cursor in the URL; infinite scroll is not used without an equivalent "load more" action; filter or sort changes reset the cursor.
- **Validation rules:** Invalid cursor → restart from the beginning with notice; page size outside 1 to 200 is clamped to the default by the server and client.
- **Loading behavior:** Existing items remain (LS-2); the "load more" action shows LS-5 pending.
- **Error behavior:** Retry at the point of failure (IC-60) for E-SERVER, E-TIMEOUT, E-UNAVAILABLE; E-VALIDATION on the cursor: restart with notice; E-OFFLINE: loaded items stay and "Loading more needs a connection" is stated.
- **Content rules:** "Showing 50 of 1,240" as one constant with named placeholders and locale number grouping via `lib/utils/units.ts`.
- **Do:** Use TanStack Query infinite queries for load-more.
- **Don't:** Fetch unbounded collections (Phase 1 §16).
- **Dependencies:** TanStack Query, `lib/utils/query-string.ts`.

### IC-22 — Sortable data table

- **Purpose:** Present records with comparable attributes for scanning and sorting.
- **Inputs:** Columns (key, label, sortable, unit), rows, sort from the URL, caption.
- **States:** loading (LS-1), refreshing (LS-2), populated, empty (EM-1 or EM-2 per the owning section), sorted ascending/descending, failed.
- **Accessibility:** Native `table` with caption; sortable column headings contain buttons; row actions reachable without entering a grid mode; column headings use `th` with `scope`.
- **Keyboard support:** Tab through interactive cells; no custom grid navigation unless the table is an editing grid; sort buttons activate with Enter or Space.
- **ARIA:** `aria-sort` on the sorted column heading; the sort change is announced politely ("Sorted by pickup date, ascending").
- **Interaction patterns:** Sort changes update the URL (`sort`) and reset the cursor; phone users receive an equivalent non-tabular form of the same records (decided at build).
- **Validation rules:** Not applicable — the table accepts no entry; an unknown `sort` value falls back to the collection default and is removed from the URL.
- **Loading behavior:** Per SH-05: LS-1 on first load, LS-2 with rows kept on refresh.
- **Error behavior:** Per SH-05: E-SERVER, E-TIMEOUT, E-UNAVAILABLE with IC-60 retry and rows kept where known; E-FORBIDDEN routes to PG-55.
- **Content rules:** Numeric columns include units in the heading; numbers, money and dates in cells through the shared formatters; headings tolerate 40% expansion by wrapping.
- **Do:** Make the record reference a link to the record.
- **Don't:** Put essential actions only on hover.
- **Dependencies:** SH-05, IC-21.

### IC-23 — Selection and bulk actions

- **Purpose:** Select records and act on them together.
- **Inputs:** Selectable records, permitted bulk actions, selection limit (from constants, default 500 in line with BR-28), record versions.
- **States:** none selected, some selected (count), all on page selected, all matching selected, limit reached (reason stated), running (per-record pending), running as background job (LS-7, more than 100 records), completed, partially failed, view-as read-only (BR-27: selection allowed for reading, bulk mutations unavailable with reason).
- **Accessibility:** Checkbox per record with the record's reference in its name; selection count announced; per-record outcomes are listed in text after the run.
- **Keyboard support:** Space toggles; Shift+Space range-select where supported; bulk actions are IC-11 buttons reached by Tab.
- **ARIA:** Select-all checkbox exposes partial selection as mixed (`indeterminate` on a native checkbox, `aria-checked="mixed"` only on a custom `role="checkbox"`); the selection count in a `role="status"` region.
- **Interaction patterns:** Bulk actions state scope before running ("Pay 12 invoices, $18,420.00"); irreversible bulk actions use IC-12; partial failures reported per record; more than 100 records the action runs as a background job (Phase 4 §2.8) with SU-3 and a notification on completion; each record submits its version (SSB-8).
- **Validation rules:** Actions available only if permitted for every selected record, otherwise the reason is given; selection at most the selection limit; the server re-validates each record (G-7, BR-28 all-rows-reported rule).
- **Loading behavior:** Per-record pending (LS-5) up to 100 records; LS-7 for more than 100 with progress when viewed.
- **Error behavior:** Per-record outcome: E-CONFLICT and E-PRECONDITION records are listed with their new state and kept unselected for review; E-FORBIDDEN records listed with the reason; E-SERVER, E-TIMEOUT records offered for retry together; succeeded records are never re-run.
- **Content rules:** Always state count and totals; counts and totals through plural rules and `lib/utils/currency.ts`; summaries are whole sentences from constants.
- **Do:** Keep selection when records remain after refetch.
- **Don't:** Select across pages silently.
- **Dependencies:** IC-12, IC-14, IC-67.

---

## 6. Files, Capture and Signature

### IC-24 — File upload

- **Purpose:** Upload documents and attachments.
- **Inputs:** Accepted types, max file size and count (constants: PDF, JPG or PNG, up to 20 MB per file, up to 10 files per selection unless the section is stricter), multiple, document type, scope.
- **States:** idle, dragging over, selected, uploading (progress), scanning, uploaded, rejected (type, size or count), failed, cancelled, disabled (reason stated), view-as read-only (BR-27: existing files viewable, upload unavailable with reason).
- **Accessibility:** Native file input is always available; drag-and-drop is an enhancement; progress exposed; outcome announced; each file's name and state are text.
- **Keyboard support:** Enter/Space opens the file chooser; cancel reachable during upload; retry and replace per file reachable by Tab.
- **ARIA:** `role="progressbar"` with `aria-valuenow` per file and `aria-valuetext` ("40 percent, invoice.pdf"); per-file outcomes in a `role="status"` region.
- **Interaction patterns:** Client checks type and size before upload; direct-to-storage via presigned URL; retry per file; the document is attached to its record only after the server's scan passes; uploaded files are recorded with audit `document.uploaded`.
- **Validation rules:** Type (by content signature on the server, not extension alone), size, count; server virus scan result (SEC-7); presigned URLs expire within 5 minutes and are refreshed on retry (SEC-7); file names at most 255 characters.
- **Loading behavior:** Per-file progress (LS-5 per file); the form stays usable while unrelated files upload.
- **Error behavior:** Specific reason per file; other files continue; E-VALIDATION: wrong type, over size or count, or scan failed, named per file; E-PRECONDITION: presigned URL expired → refreshed automatically once, then retry offered; E-OFFLINE: upload paused with "Uploading needs a connection" (POD uploads queue per IC-25); E-SERVER, E-TIMEOUT, E-UNAVAILABLE: retry per file; E-FORBIDDEN: the member cannot add documents to this record.
- **Content rules:** Limits stated before selection ("PDF, JPG or PNG, up to 20 MB"); sizes formatted with locale digits; file names wrap, never truncate the extension.
- **Do:** Allow replacing a rejected file in place.
- **Don't:** Block the form while unrelated uploads complete.
- **Dependencies:** `use-document-upload` (`useDocumentUpload` in `use-documents.ts`), SH-03.

### IC-25 — Camera capture

- **Purpose:** Capture document photos (POD, lumper receipts, damage) on phones.
- **Inputs:** Document type, pages allowed (1 to 10), quality checks.
- **States:** permission needed, ready, captured, checking, accepted, rejected, queued offline, uploading, synced, sync failed.
- **Accessibility:** Uses the platform camera through `<input type="file" accept="image/*" capture="environment">` so native accessibility applies; each page's status announced; page count stated in text ("2 pages ready").
- **Keyboard support:** As IC-24: Enter/Space opens the capture chooser; retake, remove and submit per page are reachable by Tab and activate with Enter or Space.
- **ARIA:** As IC-24: `role="progressbar"` per page during upload and per-page outcomes in a `role="status"` region; queue state in `role="status"`.
- **Interaction patterns:** Capture → check → retake or accept per page; submit all pages together; offline queue per PP-06 with a `nanoid` ID and device time; POD submission moves the load toward `PodVerified` review (BR-13).
- **Validation rules:** Resolution and blur threshold (feature constants); page count 1 to 10; image types JPG or PNG; the server re-checks legibility during POD review (G-7).
- **Loading behavior:** Check pending per page (LS-5); LS-6 while queued offline with the queue age stated; upload progress per IC-24.
- **Error behavior:** Rejections name the problem ("Too blurry to read the signature"); E-OFFLINE: pages queued and replayed on reconnect (IC-55); E-CONFLICT: POD already verified for the load → the driver is told no further POD is needed; E-SERVER, E-TIMEOUT: queued pages retried on the next replay, since the upload is de-duplicated by ID.
- **Content rules:** Tell the user what must be legible; copy short enough for DV-CAB (seconds of attention) and tolerant of 40% expansion.
- **Do:** Downscale before upload to protect data plans.
- **Don't:** Require a custom in-browser camera experience.
- **Dependencies:** IC-24, IC-55, `use-pod-upload` (`usePodUpload` in `use-documents.ts`), `lib/utils/offline-queue.ts`.

### IC-26 — E-signature acceptance

- **Purpose:** Record binding acceptance of a document (rate confirmation, amendment, carrier agreement) (BR-04, BR-25).
- **Inputs:** Document (rendered text and downloadable file), version, signer identity, attestation text, grace period (2 minutes, Phase 2 XF-02).
- **States:** unread, read, attested, signing, signed, failed, superseded (a newer version exists; attestation reset), expired (grace period passed), view-as read-only (BR-27: signing is never available in view-as; the document stays readable).
- **Accessibility:** Document available as accessible text; attestation is a checkbox (IC-38) plus typed full name; the signed outcome, time and version are announced and shown as text.
- **Keyboard support:** Tab moves through the document download, attestation checkbox (Space toggles), name field (standard editing) and sign button (Enter or Space); no key-driven scrolling is required.
- **ARIA:** Attestation and name associated with the document by `aria-describedby`; `aria-busy` on the sign action while signing.
- **Interaction patterns:** Signing records user, time, IP and version (BR-04); a copy is stored to SH-03; amendments show what changed through IC-66 before signing; the server records audit `rate_confirmation.accepted` (or `agreement.accepted`).
- **Validation rules:** Attestation checked; typed name matches the account name (case-insensitive, whitespace collapsed, at most 200 characters); the signed version must equal the current version (server rechecks, G-7).
- **Loading behavior:** LS-5 while signing; the document stays readable.
- **Error behavior:** Failure keeps attestation and name; retry within grace period; E-PRECONDITION: the document version changed → the new version is shown with its differences (IC-66), attestation is cleared and must be given again (IC-67); E-CONFLICT: already signed by another member or the booking was cancelled → the new state is stated; E-VALIDATION: name mismatch explained; E-OFFLINE: "Signing needs a connection"; E-SERVER, E-TIMEOUT: retry within the grace period, then the booking outcome is stated.
- **Content rules:** Attestation states the legal effect in plain words; version and time via `lib/utils/date-formatter.ts`; legal text is never shortened for length.
- **Do:** Offer download before and after signing.
- **Don't:** Require scrolling to the end as a condition (it is not evidence of reading and harms accessibility).
- **Dependencies:** IC-38, IC-66, IC-67, e-signature backend, `useSignAgreement`.

---

## 7. Freight Transactions

### IC-27 — Book load action

- **Purpose:** Commit to a load at its posted rate.
- **Inputs:** Load ID, carrier pay, idempotency key, eligibility result, load version.
- **States:** available, ineligible (reason), confirming, booking, booked, taken, view-as read-only (BR-27: unavailable with reason unless write consent exists).
- **Accessibility:** As IC-11 (native button, verb-first name with the amount, pending exposed) and IC-12 (confirmation with the consequence as description); outcome announced.
- **Keyboard support:** As IC-11: Enter and Space activate; activation while booking does nothing (G-6).
- **ARIA:** As IC-11: `aria-busy` while booking; `aria-disabled` plus `aria-describedby` for the ineligibility reason.
- **Interaction patterns:** Activates IC-12 stating pay and key terms, then IC-26; conflict → "This load was just booked by another carrier" with similar loads; the server records audit `load.booked` and analytics `load.booked`.
- **Validation rules:** Eligibility rechecked server-side (BR-03: compliance `Approved`, active authority, insurance minimums, equipment); the load must still be `Posted` and, if tendered, held by this carrier (BR-08).
- **Loading behavior:** LS-5: booking pending ("Booking…"); no other action on the load meanwhile.
- **Error behavior:** E-CONFLICT: taken by another carrier → similar loads offered; E-FORBIDDEN: ineligible → the reason and the fix route (PG-17, PG-49); E-TIMEOUT, E-UNAVAILABLE, E-SERVER: retry with the same idempotency key; E-OFFLINE: "Booking needs a connection".
- **Content rules:** Name includes amount ("Book for $2,380.00") formatted by `lib/utils/currency.ts`; carrier pay only (BR-05).
- **Do:** Generate one idempotency key per attempt with `nanoid`.
- **Don't:** Retry automatically after a conflict.
- **Dependencies:** IC-11, IC-12, IC-26, `use-book-load` (`useBookLoad` in `use-load-board.ts`).

### IC-28 — Bid entry and response

- **Purpose:** Submit, counter, accept, decline or withdraw bids (BR-02).
- **Inputs:** Bid state, round, permitted range, amount, expiry, note, bid version.
- **States:** composing, submitting, awaiting counter-party, countered, accepted, declined, withdrawn, expired, stale (counter arrived meanwhile; E-PRECONDITION), pending approval (BR-23, accept over the spend limit), view-as read-only (BR-27).
- **Accessibility:** Whose turn stated in text; amount input per IC-01 currency; expiry stated as text with IC-46 thresholds.
- **Keyboard support:** Tab moves through amount (IC-01), expiry (IC-08), note (IC-01) and the legal actions (IC-11, Enter or Space); accept opens IC-12 with its keyboard rules.
- **ARIA:** Status changes announced politely; `aria-busy` on the acting button; the round is text in the bid's accessible description.
- **Interaction patterns:** Only legal transitions are offered; accept uses IC-12; round count visible in text ("Counter 2 of 3"); bids refresh every 20 s (Phase 7 §13) and a state change from the other party is announced; every response submits the bid version (SSB-8).
- **Validation rules:** Amount within permitted range; amount greater than 0 with at most 2 decimals; expiry within pickup window; round ≤ 3; note at most 500 characters; the server re-validates (G-7).
- **Loading behavior:** LS-2 for the 20 s poll (fresh ≤ 30 s, stale label after 60 s, Phase 4 §2.6); LS-5 per action.
- **Error behavior:** E-CONFLICT: state moved on (accepted, expired, withdrawn) → explained with the new state; E-PRECONDITION: a counter arrived since the user started → IC-67 with the typed amount kept; E-VALIDATION: out-of-range amount explained; E-FORBIDDEN: spend authority routes to approval instead (BR-23); E-SERVER, E-TIMEOUT: retry with the entry kept.
- **Content rules:** Amounts from each party's perspective only (BR-05); amounts via `lib/utils/currency.ts`; "Counter 2 of 3" is one constant with named placeholders.
- **Do:** Show the difference from target price to the shipper side only.
- **Don't:** Reveal the other side's price to either party.
- **Dependencies:** IC-01, IC-12, IC-46, IC-67, `use-bid-actions` (`useBidActions` in `use-bids.ts`).

### IC-29 — Stop event action

- **Purpose:** Record the next stop event in the driver workflow.
- **Inputs:** Next legal event, stop, required extra data (seal, pieces), undo window.
- **States:** ready, recording (optimistic), recorded-queued (offline), recorded-synced, undo available, undone, conflict, unavailable (no legal next event, reason stated).
- **Accessibility:** Name states the event and stop ("Arrived at Acme DC, Dallas"); outcome announced; undo is a named action; queued and synced states are text.
- **Keyboard support:** As IC-11: Enter and Space activate; the undo action is reachable by Tab for its full window.
- **ARIA:** As IC-11 (`aria-busy` while recording); queue state in `role="status"`.
- **Interaction patterns:** Single activation records the event with device time and position; extra data is collected with the event when required; undo available for 5 minutes; events queue offline with a `nanoid` ID and replay in order (Phase 7 §13); audit `load.stop_event.recorded`.
- **Validation rules:** Only the next legal transition (Phase 2 §5); seal number at most 30 characters; pieces a whole number from 0 to 99,999; the server de-duplicates by ID and re-validates the transition (G-7).
- **Loading behavior:** Optimistic; sync state separate (SC-39.5); LS-6 while queued, with the queue age stated.
- **Error behavior:** Server conflict (geofence already recorded) → server wins, driver told (E-CONFLICT); E-OFFLINE: queued and replayed on reconnect (IC-55); E-VALIDATION on replay: the event is marked failed with the reason and the driver is asked to review; E-SERVER, E-TIMEOUT: retried on replay because the event carries an idempotent ID.
- **Content rules:** Past tense confirmation ("Arrival recorded 2:14 PM CDT"); times via `lib/utils/date-formatter.ts` in the facility zone; copy short enough for DV-CAB.
- **Do:** Meet G-2's driver-workflow target rule (44 × 44).
- **Don't:** Require typing for routine events.
- **Dependencies:** `use-stop-events` (`useStopEvents` in `use-trip.ts`), SC-39.2, IC-55, `lib/utils/offline-queue.ts`.

### IC-30 — Interactive map

- **Purpose:** Present positions, stops and lanes geographically as a supplement to text.
- **Inputs:** Features (vehicle position with age, stops, route, result origins), bounds, selection.
- **States:** loading, ready, updating, failed, no features (EM-2 for filtered results, EM-4 for loads not yet dispatched).
- **Accessibility:** Map region labelled; every feature also available in the text equivalent (SH-02); keyboard pan and zoom; selecting a feature by keyboard is possible; map is skippable (IC-52 pattern).
- **Keyboard support:** Arrow keys pan, +/- zoom, Tab cycles features, Enter selects, Escape exits the map.
- **ARIA:** `role="application"` is not used; the map is a labelled region with instructions available; each feature has an accessible name with its reference and position age.
- **Interaction patterns:** Updates never reset the user's zoom or pan; "recentre" action available; selecting a load navigates to PG-40; positions refresh every 60 s, paused when hidden (Phase 7 §13).
- **Validation rules:** Not applicable — the map accepts no entry; selection only navigates.
- **Loading behavior:** Tiles load progressively; text equivalent is available first (LS-1); position refresh is LS-2 with the age updated on arrival.
- **Error behavior:** Map failure → text equivalent only with notice (E-UNAVAILABLE for the map vendor, E-SERVER or E-TIMEOUT for positions, with IC-60 retry); E-OFFLINE: last known positions with their age.
- **Content rules:** Position age stated for every vehicle; distances via `lib/utils/units.ts`.
- **Do:** Lazy-load the map library.
- **Don't:** Make any task map-only (PP-08); show driver position finer than the viewer's permission allows (Restricted, NFR-PRIV-1).
- **Dependencies:** Map library (Phase 7 §15), SH-02, `useLoadPositions`.

### IC-31 — Navigation handoff

- **Purpose:** Hand an address to the device's navigation app.
- **Inputs:** Stop coordinates and address.
- **States:** available, unavailable (no coordinates; address copy offered instead).
- **Accessibility:** Link named "Directions to Acme DC in your maps app"; opens outside the product, stated in the name.
- **Keyboard support:** Standard link: Enter activates; Tab reaches it.
- **ARIA:** None beyond the name — native link semantics carry role and state.
- **Interaction patterns:** Uses platform map URLs; the address is also copyable (IC-44).
- **Validation rules:** Coordinates present and within valid latitude and longitude ranges.
- **Loading behavior:** Not applicable — the link is built from stop data already loaded with the trip, including from the offline cache.
- **Error behavior:** Missing coordinates → address copy only; no E-class applies because the link makes no request.
- **Content rules:** Name states the destination; facility names are inserted through a named placeholder.
- **Do:** Work offline with cached coordinates.
- **Don't:** Embed turn-by-turn navigation.
- **Dependencies:** SC-39.1, IC-44.

### IC-68 — Planning grid

- **Purpose:** Read and change a plan of resources over time (trucks by days on PG-65).
- **Inputs:** Rows (resources) with entries (start, end, label, status, conflicts), open windows, the time range and its unit, the focused cell, the plan version.
- **States:** idle, cell focused, entry focused, move mode (entry picked up), target valid, target invalid (overlap or equipment), saving, saved, stale (E-PRECONDITION), range loading (previous range kept), read-only (`internal.ops`, view-as without write consent, entries already in transit).
- **Accessibility:** Follows the WAI-ARIA grid pattern. Every action is possible without dragging (WCAG 2.5.7). Each entry's name states its resource, time window, label and status; conflicts and open windows are stated in text (G-3); each row also offers an ordered text account as its equivalent.
- **Keyboard support:** Arrow keys move between cells (rows are resources, columns are time units); Home and End go to the first and last cell in the row; Ctrl+Home and Ctrl+End go to the first and last cell of the grid; Page Up and Page Down change the range by one period. When a cell holds several entries, Enter enters it and Up and Down move between its entries; Escape returns to the cell. Enter on an entry opens its record. Space picks up a movable entry, Up and Down choose the target row, Space drops and Escape cancels, returning focus to the entry. Tab leaves the grid.
- **ARIA:** `role="grid"` with a `rowheader` per resource and a `columnheader` per time unit; `aria-rowcount` and `aria-colcount` when rows are virtualised; a roving tabindex gives the grid one tab stop. Move mode, the target's validity and the outcome are announced through IC-14 ("Picked up HL-48213. Choose a truck with Up and Down, then press Space.").
- **Interaction patterns:** Pointer drag is an enhancement that mirrors the keyboard move. A move is a proposal: both affected rows are previewed, then it is saved with the version (SSB-8). Only entries the role may change can move. Activating an open window routes to its search. Rows filter by URL parameter (Phase 3 §10).
- **Validation rules:** The target must accept the entry's equipment and must not overlap another entry; entries in transit or delivered cannot move; the server re-validates (G-7).
- **Loading behavior:** LS-1 for the first range; LS-2 on a range change, keeping the previous range readable; LS-5 while a move saves, with the moved entry marked pending.
- **Error behavior:** An invalid target is refused at drop with its reason (E-VALIDATION or E-CONFLICT) and the entry returns to its row; E-PRECONDITION → IC-67; E-SERVER, E-TIMEOUT → IC-60 retry, keeping the move as a proposal.
- **Content rules:** Times in each facility's time zone (IC-08); positions such as "Truck 12, Thursday" come from one constant with named placeholders; distances and durations are formatted through `lib/utils/units.ts`.
- **Do:** Keep one tab stop for the whole grid; announce each move's start, target and result; offer the text account for every row.
- **Don't:** Make drag the only way to move; convey conflicts or open windows by colour alone; move focus away from an entry after it saves.
- **Dependencies:** IC-06, IC-08, IC-14, IC-60, IC-67, SH-15.

---

## 8. Disclosure, Preferences and Social

### IC-32 — Disclosure

- **Purpose:** Reveal secondary detail on demand (derivations, evidence, explanations).
- **Inputs:** Summary label, content, initially open.
- **States:** collapsed, expanded, content loading (lazy), content failed.
- **Accessibility:** Native `details`/`summary` or WAI-ARIA disclosure button; focus stays on the summary when toggled.
- **Keyboard support:** Enter/Space toggles.
- **ARIA:** `aria-expanded`, `aria-controls`.
- **Interaction patterns:** State not persisted unless the section says so.
- **Validation rules:** Not applicable — the disclosure accepts no entry.
- **Loading behavior:** Content may lazy-load on first expand (LS-1 inside the disclosure; the summary stays usable).
- **Error behavior:** Retry in place (IC-60) for E-SERVER, E-TIMEOUT or E-UNAVAILABLE; E-OFFLINE states that the detail needs a connection.
- **Content rules:** Summary describes what is revealed; summary text tolerates 40% expansion.
- **Do:** Use for "How was this calculated?"
- **Don't:** Hide required information or errors inside.
- **Dependencies:** None — native element or a local disclosure state.

### IC-33 — Watch toggle

- **Purpose:** Watch or unwatch a load (XS-09).
- **Inputs:** Load ID, watched state, watch count and limit.
- **States:** unwatched, watched, pending, limit reached (reason stated), view-as read-only (BR-27: personal preferences are not changed in view-as).
- **Accessibility:** Toggle button with state; the name includes the load reference.
- **Keyboard support:** Enter/Space.
- **ARIA:** `aria-pressed`; `aria-busy` while pending.
- **Interaction patterns:** Optimistic with rollback on failure; the request sets an explicit state (watch or unwatch), so repeats are idempotent; analytics `load.watch.added` and `load.watch.removed`.
- **Validation rules:** Watch limit from constants (default 200 per user; the server value wins, SC-25.2); the server rechecks the limit and load visibility (G-7).
- **Loading behavior:** Optimistic (LS-5 with the new state shown immediately).
- **Error behavior:** Rollback with announcement; E-VALIDATION: limit reached → the limit stated with a route to watched loads; E-NOT-FOUND: the load is no longer visible; E-OFFLINE, E-SERVER, E-TIMEOUT: rolled back with "Couldn't update watch. Try again."
- **Content rules:** Name "Watch load HL-…"; the reference inserted by named placeholder.
- **Do:** Announce the new state.
- **Don't:** Rely on a non-text symbol alone (G-3).
- **Dependencies:** `use-watched-loads` (`useWatchedLoads` in `use-load-board.ts`), IC-14.

### IC-34 — Saved search and alert configuration

- **Purpose:** Save a search and set its alerts.
- **Inputs:** Criteria (URL parameters), name, channels, frequency (instant, hourly, daily), paused, version.
- **States:** new, saved, editing, paused, saving (LS-5), limit reached, stale (E-PRECONDITION; IC-67), view-as read-only (BR-27).
- **Accessibility:** Composed of IC-01, IC-09, IC-36.
- **Keyboard support:** As constituents: name per IC-01, frequency per IC-09 (arrow keys), channels and paused per IC-36 (Space); save per IC-11.
- **ARIA:** As constituents; the save outcome through IC-14.
- **Interaction patterns:** Default name generated from criteria; saving confirms via IC-14; edits submit the version (SSB-8); analytics `search.saved_search.created` and `search.alert.configured`.
- **Validation rules:** Name 1 to 80 characters, unique per user (case-insensitive); saved search limit from constants (default 25 per user; the server value wins); at least one channel when not paused; SMS requires a verified phone number; the server re-validates (G-7).
- **Loading behavior:** LS-5 while saving; the criteria summary stays readable.
- **Error behavior:** Limit reached → route to PG-36 (E-VALIDATION); duplicate name: E-VALIDATION at the name field; E-PRECONDITION: edited elsewhere → IC-67; E-SERVER, E-TIMEOUT: IC-60 retry with entries kept.
- **Content rules:** Frequency options state expected volume; generated names use formatted values (`lib/utils/units.ts`, `lib/utils/date-formatter.ts`) inside a constant template, not concatenation.
- **Do:** Suggest digest when matches are frequent.
- **Don't:** Enable SMS by default.
- **Dependencies:** `use-saved-searches` (`useSavedSearches`), IC-01, IC-09, IC-36, IC-67.

### IC-35 — Message composer

- **Purpose:** Write and send a message in a conversation.
- **Inputs:** Thread ID, draft, attachments, participants.
- **States:** empty, composing, sending, sent, failed, thread closed (reason stated), view-as read-only (BR-27).
- **Accessibility:** Labelled with the thread subject; send outcome announced; the recipient statement is the composer's description.
- **Keyboard support:** Enter inserts a new line; Ctrl/Cmd+Enter sends; the send action is also a button.
- **ARIA:** Multiline textbox (`aria-multiline="true"` when not a native `textarea`); `aria-describedby` for recipients and remaining characters.
- **Interaction patterns:** Draft persisted per thread; optimistic append; attachments via IC-24; the open thread refreshes every 10 s (Phase 7 §13); messages are append-only, so no version check applies; analytics `message.message.sent` without content.
- **Validation rules:** Non-empty or has attachment; length limit 4,000 characters after trimming; at most 10 attachments per message per IC-24 limits; the server re-validates participation (BR-19, G-7).
- **Loading behavior:** Sending state on the message (LS-5, optimistic); the composer is ready for the next message immediately.
- **Error behavior:** Failed message stays with retry and delete; E-FORBIDDEN: no longer a participant or thread closed → reason stated; E-OFFLINE: message kept as failed with retry; E-RATE-LIMIT: wait stated; E-SERVER, E-TIMEOUT: retry with the same client message ID.
- **Content rules:** State who will receive it ("Visible to Acme Shipping, FastHaul LLC and Haulr") using a locale list formatter, never manual comma joining.
- **Do:** Preserve the draft across navigation.
- **Don't:** Send on Enter alone; send message text to analytics (NFR-PRIV-3).
- **Dependencies:** SH-04, IC-24, `useSendMessage`, `useMessages`.

### IC-36 — Toggle switch

- **Purpose:** Turn a setting on or off with immediate effect.
- **Inputs:** Label, state, locked reason, setting version.
- **States:** on, off, pending, locked (reason stated), stale (E-PRECONDITION), view-as read-only (BR-27).
- **Accessibility:** WAI-ARIA switch or native checkbox; locked switches stay focusable with their reason.
- **Keyboard support:** Space toggles (Enter also toggles for the ARIA switch).
- **ARIA:** `role="switch"`, `aria-checked`; `aria-disabled` plus `aria-describedby` when locked; `aria-busy` while pending.
- **Interaction patterns:** Saves on change; reverts on failure with announcement; the request sets the explicit new value rather than flipping, so replays are idempotent; organisation settings carry the version (SSB-8) and are audited (`organisation.setting.changed`).
- **Validation rules:** Locked settings (critical notifications) cannot be turned off; reason given; the server rechecks lock and permission (G-7).
- **Loading behavior:** LS-5 pending per switch; other switches stay usable.
- **Error behavior:** Revert and announce; E-PRECONDITION: changed by another admin → the current value shown with who changed it (IC-67); E-FORBIDDEN: reason and who can change it; E-OFFLINE, E-SERVER, E-TIMEOUT: reverted with IC-60 retry.
- **Content rules:** Label states the setting, not the action; labels tolerate 40% expansion.
- **Do:** Use only for immediate-effect settings.
- **Don't:** Use inside forms that save on submit (use IC-38).
- **Dependencies:** IC-14, IC-67, `useNotificationPreferences`.

### IC-37 — Rating input

- **Purpose:** Rate a counter-party on a 1–5 scale (BR-22).
- **Inputs:** Scale, value, reason tags, optional comment.
- **States:** unrated, rated, submitting, submitted, already rated (read-only), not yet available (EM-4: before delivery), view-as read-only (BR-27).
- **Accessibility:** Radio group with each value named ("4 out of 5, Good"); reason tags are a checkbox group with a label.
- **Keyboard support:** Arrow keys move and select a value; Tab moves to tags (Space toggles) and submit (Enter or Space).
- **ARIA:** Native radio semantics; `fieldset`/`legend` for the value and tags.
- **Interaction patterns:** Reason tags offered after a value is chosen; tags depend on value; one rating per party per load; analytics `rating.counterparty.submitted` with value only.
- **Validation rules:** Value required, an integer 1 to 5; tags from `lib/enums/` for that value; comment at most 1,000 characters; the load must be delivered (server rechecks, G-7).
- **Loading behavior:** LS-5 while submitting.
- **Error behavior:** E-VALIDATION per IC-02; E-CONFLICT: already rated → the saved rating shown read-only; E-SERVER, E-TIMEOUT: IC-60 retry with the value kept.
- **Content rules:** Each value has a word label; "4 out of 5" is one constant with named placeholders.
- **Do:** Allow submission without a comment.
- **Don't:** Rely on symbols alone.
- **Dependencies:** SH-10, `useRateCounterparty`.

### IC-38 — Consent checkbox

- **Purpose:** Capture explicit agreement to a versioned document or practice.
- **Inputs:** Document link, version, required.
- **States:** unchecked, checked, invalid, superseded (a newer version is published; consent needed again).
- **Accessibility:** Native checkbox; label contains the link to the document.
- **Keyboard support:** Space toggles; Tab reaches the link inside the label separately, Enter opens it.
- **ARIA:** `aria-required`, `aria-invalid`.
- **Interaction patterns:** Never pre-checked; version recorded on submit; the server records audit `consent.given` with the version.
- **Validation rules:** Required when stated; the submitted version must equal the current version (server rechecks, G-7).
- **Loading behavior:** Not applicable — the checkbox never fetches; the version arrives with the page.
- **Error behavior:** E-VALIDATION per IC-02 ("Agree to the Carrier Agreement to continue"); E-PRECONDITION: version superseded → the new version is linked and the box is cleared for renewed consent.
- **Content rules:** "I agree to the Carrier Agreement (version 2026-09)"; the document name and version inserted by named placeholder.
- **Do:** Open documents without leaving the flow's data.
- **Don't:** Bundle unrelated consents in one checkbox.
- **Dependencies:** PG-09, IC-02.

### IC-39 — Invitation entry

- **Purpose:** Invite a member or driver.
- **Inputs:** Email or phone, role (from permitted roles), personal note.
- **States:** composing, sending, sent, failed, duplicate, expired (resend offered), view-as read-only (BR-27: membership changes are never made in view-as).
- **Accessibility:** Composed of IC-01 and IC-07; each invitation's result is text.
- **Keyboard support:** As constituents: IC-01 editing, IC-07 role selection; add-another and send per IC-11.
- **ARIA:** As constituents; per-invitation outcomes in a `role="status"` region.
- **Interaction patterns:** Multiple invitations can be entered before sending (up to 20 per send); each result reported; the server records audit `member.invited`.
- **Validation rules:** Valid email (at most 254 characters) or E.164 phone; role within inviter's permission; not already a member or invited; note at most 500 characters; the server re-validates (G-7).
- **Loading behavior:** Per invitation (LS-5 per row).
- **Error behavior:** Per invitation: E-VALIDATION (format), E-CONFLICT (already a member or invited, resend offered), E-FORBIDDEN (role higher than the inviter's), E-RATE-LIMIT (invitation limits, SEC-10) with the wait; E-SERVER, E-TIMEOUT: failed rows kept for retry.
- **Content rules:** State expiry (7 days) via `lib/utils/date-formatter.ts`.
- **Do:** Allow resend.
- **Don't:** Let a user invite to a role higher than their own.
- **Dependencies:** `use-invitations` (`useInvitations` in `use-members.ts`), IC-01, IC-07.

### IC-40 — Reorderable sequence

- **Purpose:** Set the order of items (tender waterfall, stops).
- **Inputs:** Items, order, min/max length, sequence version.
- **States:** idle, item grabbed (keyboard), moving, saving, saved, invalid order (reverted), stale (E-PRECONDITION), read-only (sequence locked, for example a tender already offered), view-as read-only (BR-27).
- **Accessibility:** Every reorder is possible without dragging (WCAG 2.5.7): move up/move down actions per item, plus keyboard grab mode.
- **Keyboard support:** Space grabs; arrows move; Space drops; Escape cancels.
- **ARIA:** Position announced ("Moved to position 2 of 5"); move actions named with the item ("Move FastHaul LLC up").
- **Interaction patterns:** Drag is an enhancement only; the order saves with the version (SSB-8); reordering stops on a booked load is an amendment (BR-25).
- **Validation rules:** Sequence constraints (for stops: pickups before their deliveries); length within min/max (tender waterfall 1 to 10 carriers); the server re-validates (G-7).
- **Loading behavior:** LS-5 while the order saves; items stay readable.
- **Error behavior:** Invalid order explained and reverted (E-VALIDATION); E-PRECONDITION: the sequence changed elsewhere → IC-67 with the user's order kept; E-SERVER, E-TIMEOUT: IC-60 retry.
- **Content rules:** Items named for announcement; "position 2 of 5" is one constant with named placeholders.
- **Do:** Announce every position change.
- **Don't:** Make drag the only method.
- **Dependencies:** IC-14, IC-67.

### IC-41 — Dialog

- **Purpose:** Hold a focused task or decision that interrupts the current context.
- **Inputs:** Title, description, content, close behaviour.
- **States:** closed, open, open with pending action (close blocked).
- **Accessibility:** Native `dialog` element with `showModal()` or equivalent semantics; focus moves to the title and is contained; background inert; focus returns on close.
- **Keyboard support:** Escape closes (unless a pending action blocks it); Tab cycles.
- **ARIA:** `aria-labelledby`, `aria-describedby`, `aria-modal="true"`.
- **Interaction patterns:** Opening a dialog never discards page state; dialogs are not nested.
- **Validation rules:** Not applicable to the dialog itself — it holds no values; its content applies its own contract (IC-02, IC-12).
- **Loading behavior:** Not applicable to the dialog itself — it opens at once; content that fetches applies LS-1 inside the dialog.
- **Error behavior:** Errors stay inside the dialog; the content's own contract maps them to E-classes.
- **Content rules:** Title names the task; tolerates 40% expansion.
- **Do:** Keep dialog tasks short.
- **Don't:** Use for content users need to compare with the page.
- **Dependencies:** None — the native `dialog` element.

---

## 9. Money

### IC-42 — Hosted payment method entry

- **Purpose:** Add a bank account or card through the payments processor without Haulr handling raw data (A6).
- **Inputs:** Method types allowed, organisation, mode (payment or payout).
- **States:** loading processor, ready, submitting, verifying (instant or micro-deposit), verified, failed, unavailable in view-as (payout methods are excluded, Phase 3 §5.2).
- **Accessibility:** The processor's embedded entry must meet WCAG 2.2 AA (vendor requirement); Haulr's surrounding flow labels and announces each state.
- **Keyboard support:** Per processor plus surrounding standard behaviour: Tab enters and leaves the processor frame, and Haulr's actions follow IC-11.
- **ARIA:** Frame titled when an iframe is used.
- **Interaction patterns:** Requires IC-13 before opening; on success, the method appears in SC-49.1 with verification state; organisation admins are notified and audit `payment_method.added` is recorded (Phase 4 §2.8).
- **Validation rules:** Performed by the processor; Haulr validates only method type and ownership name match.
- **Loading behavior:** Processor load pending announced (LS-1; LS-3 after 5 s).
- **Error behavior:** Processor errors mapped to plain messages from constants; E-UNAVAILABLE: processor down → "Adding payment methods is unavailable at the moment" with retry; E-VALIDATION: name mismatch explained; E-FORBIDDEN: re-authentication required → IC-13; E-OFFLINE: needs a connection.
- **Content rules:** State why verification is needed and how long micro-deposits take; durations via `lib/utils/date-formatter.ts`.
- **Do:** Resume pending verifications.
- **Don't:** Log or store raw payment data anywhere (Confidential and Restricted, NFR-PRIV-1).
- **Dependencies:** Payments processor SDK (Phase 7 §15), IC-13, `usePaymentMethods`.

### IC-43 — Payment confirmation

- **Purpose:** Commit a payment (invoice payment, quick pay) with full clarity (PP-01, PP-05).
- **Inputs:** Items, total, fees, net (quick pay), method, date, idempotency key, item versions.
- **States:** reviewing, confirming, processing, succeeded, partially succeeded, failed, stale (totals changed; E-PRECONDITION), pending approval (BR-23), accepted as background job (LS-7, more than 100 items), view-as read-only (BR-27: never available in view-as without write consent).
- **Accessibility:** Implemented through IC-12; amount, method and date are in the dialog description.
- **Keyboard support:** As IC-12: Escape cancels (not while processing), Enter does not confirm by default, Tab cycles within.
- **ARIA:** As IC-12: `role="alertdialog"`, `aria-labelledby`, `aria-describedby` pointing to the amount, method and date; `aria-busy` while processing.
- **Interaction patterns:** Confirm label repeats the amount ("Pay $4,280.00"); outcome gives a reference and remittance link; the server records audit `invoice.paid` or `settlement.quick_pay.requested` and analytics of the same names.
- **Validation rules:** Method verified; amount > 0; within credit or balance rules; disputed amounts excluded (BR-16); each item's version must be current (SSB-8).
- **Loading behavior:** Processing state; the dialog cannot be dismissed while processing; more than 100 items LS-7 with SU-3.
- **Error behavior:** Declines explained with alternatives; partial success itemised; E-CONFLICT: already paid → reference shown; E-PRECONDITION: an invoice changed or was disputed → refreshed totals, re-confirm (IC-67); E-TIMEOUT, E-UNAVAILABLE: retry with the same idempotency key; E-OFFLINE: needs a connection.
- **Content rules:** Money formatted with cents and currency via `lib/utils/currency.ts`; the fee and net sentence is one constant with named placeholders.
- **Do:** Use one idempotency key per confirmation.
- **Don't:** Pre-select a non-default method silently.
- **Dependencies:** IC-12, IC-67, `use-pay-invoices` (`usePayInvoices`), `use-quick-pay` (`useQuickPay`).

---

## 10. Sharing, Data and Time

### IC-44 — Share and copy

- **Purpose:** Copy or share a link or value (tracking link, reference number, address).
- **Inputs:** Value, share title, channels (copy, email, SMS, system share).
- **States:** idle, generating link, copied, shared, failed, revoked (tracking links), view-as read-only (BR-27: copy allowed; link generation and sending unavailable).
- **Accessibility:** Outcome announced ("Tracking link copied").
- **Keyboard support:** Standard button: Enter and Space activate; revoke per IC-12.
- **ARIA:** Status announcement via IC-14; `aria-busy` while a link is generated.
- **Interaction patterns:** Uses Web Share API where available, else the Clipboard API; generation of tracking links happens on first share; audit `tracking_link.created` and `tracking_link.revoked`.
- **Validation rules:** Email or phone valid when sending through Haulr (IC-01 limits); up to 10 recipients per send.
- **Loading behavior:** Link generation pending (LS-5).
- **Error behavior:** Clipboard denied → the value is selectable text for manual copy; E-RATE-LIMIT: tracking send limits (SEC-10) with the wait; E-FORBIDDEN: the role cannot create links; E-SERVER, E-TIMEOUT: IC-60 retry.
- **Content rules:** State link expiry for tracking links (BR-21) via `lib/utils/date-formatter.ts`.
- **Do:** Allow revoking tracking links.
- **Don't:** Share rates or documents through tracking links.
- **Dependencies:** IC-14, `use-tracking-links` (`useTrackingLinks` in `use-tracking.ts`).

### IC-45 — Chart with data equivalent

- **Purpose:** Present trends and distributions with an accessible equivalent.
- **Inputs:** Series, units, period, definitions.
- **States:** loading, ready, refreshing, empty (EM-1 when no data has ever existed, EM-2 when the period has none), error.
- **Accessibility:** Every chart has a data table equivalent and a text summary of the key finding; charts are not the only carrier of any value (G-3).
- **Keyboard support:** Data points reachable by keyboard when the chart is interactive; otherwise the table carries interaction.
- **ARIA:** The chart element is labelled with its summary; decorative SVG internals hidden.
- **Interaction patterns:** Hover and focus reveal values; drilling in navigates to the underlying collection.
- **Validation rules:** Not applicable — the chart accepts no entry.
- **Loading behavior:** Per SH-08: LS-1 initially, LS-2 on the 60 s dashboard refresh with values kept.
- **Error behavior:** Per SH-08: E-SERVER, E-TIMEOUT, E-UNAVAILABLE with IC-60 retry and the last values kept with their age.
- **Content rules:** Units and period in the title; numbers and dates via the shared formatters.
- **Do:** State the comparison in words.
- **Don't:** Encode meaning in any visual attribute alone (G-3).
- **Dependencies:** Chart library (Phase 7 §15), SH-08, `useMetrics`.

### IC-46 — Countdown

- **Purpose:** Communicate time remaining (quote validity, tender window, undo window).
- **Inputs:** Deadline, thresholds for announcement, expiry action.
- **States:** running, warning threshold, expired, not shown (deadline missing).
- **Accessibility:** Remaining time available as text; announced only at thresholds (5 min, 1 min), never every second (WCAG 2.2.1 guidance).
- **Keyboard support:** Not applicable — the countdown is not interactive; any extension action is a separate IC-11.
- **ARIA:** `role="timer"` with `aria-live="off"`; threshold announcements via IC-14.
- **Interaction patterns:** On expiry, the owning section changes state (for example quote → re-quote).
- **Validation rules:** Server deadline is authoritative; client clock skew corrected from server time.
- **Loading behavior:** Not applicable — the deadline arrives with the owning section's data; the countdown never fetches.
- **Error behavior:** Not applicable — the countdown makes no request; if the deadline is missing, the countdown is not shown and the owning section states the deadline as text.
- **Content rules:** "Price held for 12 more minutes"; durations through `lib/utils/date-formatter.ts` with locale plural rules.
- **Do:** Offer extension where the rule allows (re-quote).
- **Don't:** Use countdowns to pressure users where no real deadline exists.
- **Dependencies:** IC-14, `lib/utils/date-formatter.ts`.

---

## 11. Internal Operations

### IC-47 — Claim and ownership control

- **Purpose:** Claim, release or take the next item in a shared queue without collisions.
- **Inputs:** Item ID, version, current owner, next-item query.
- **States:** unclaimed, claimed by me, claimed by other, claiming, releasing, queue empty (EM-3 for "claim next").
- **Accessibility:** Owner stated in text; outcome announced.
- **Keyboard support:** Standard (Enter and Space activate); shortcut per IC-49.
- **ARIA:** As IC-11: `aria-busy` while claiming or releasing; `aria-keyshortcuts` when a shortcut exists.
- **Interaction patterns:** Optimistic lock with version; "claim next" takes the highest-risk unclaimed item (server decides); audit `exception.claimed` and `exception.released`.
- **Validation rules:** Role permitted for item type.
- **Loading behavior:** LS-5 while claiming; the queue refreshes every 15 s (Phase 7 §13).
- **Error behavior:** Claimed by other → owner named; item refreshed (E-CONFLICT); E-PRECONDITION: the item changed → refreshed with IC-67; E-FORBIDDEN: role not permitted; E-SERVER, E-TIMEOUT: IC-60 retry.
- **Content rules:** "Claimed by Jordan P. 3 min ago"; relative time via `lib/utils/date-formatter.ts`.
- **Do:** Release automatically after 30 minutes of inactivity (server rule).
- **Don't:** Allow two owners.
- **Dependencies:** `use-exception-actions` (`useExceptionActions` in `use-exceptions.ts`), IC-49, IC-67.

### IC-48 — Handoff and escalation

- **Purpose:** Pass an item to another team or agent with context.
- **Inputs:** Target (team or agent), note (required), severity change, item version.
- **States:** composing, sending, handed off, stale (E-PRECONDITION).
- **Accessibility:** Composed of IC-07 and IC-01.
- **Keyboard support:** As constituents: IC-07 for the target, IC-01 for the note; send per IC-11.
- **ARIA:** As constituents; outcome via IC-14.
- **Interaction patterns:** Handoff records in audit and notifies the target; the item's version is carried (SSB-8).
- **Validation rules:** Note required, 1 to 2,000 characters; the target must be permitted for the item type.
- **Loading behavior:** LS-5 while sending.
- **Error behavior:** Per IC-02; E-CONFLICT: item already resolved or reassigned → new state stated; E-PRECONDITION: IC-67 with the note kept.
- **Content rules:** Target stated in confirmation.
- **Do:** Carry all prior notes.
- **Don't:** Hand off without a note.
- **Dependencies:** IC-01, IC-07, IC-67, `useExceptionActions`.

### IC-49 — Keyboard shortcuts

- **Purpose:** Speed up repetitive internal work (PG-50, SC-23.1).
- **Inputs:** Shortcut map (constants), scope.
- **States:** enabled, disabled by user, suspended (focus in a text entry).
- **Accessibility:** WCAG 2.1.4: single-character shortcuts can be turned off or remapped, or are active only while focus is within their scope; a shortcut reference is available by `?`.
- **Keyboard support:** Defined per scope (for example J/K next/previous, C claim, R resolve).
- **ARIA:** `aria-keyshortcuts` on the corresponding actions.
- **Interaction patterns:** Shortcuts never trigger while typing in an input; every shortcut has an equivalent visible action; the on/off preference is stored locally per user.
- **Validation rules:** No conflicts with browser or assistive technology shortcuts; checked by a unit test over the shortcut map.
- **Loading behavior:** Not applicable — the shortcut map is a static constant.
- **Error behavior:** Not applicable — a shortcut runs the same action as its visible control, whose own contract reports errors.
- **Content rules:** Reference lists every shortcut with its effect.
- **Do:** Scope shortcuts to the queue region.
- **Don't:** Ship shortcuts in customer-facing pages without an off switch.
- **Dependencies:** `lib/constants.ts`, `lib/utils/local-storage.ts`.

---

## 12. Global Utilities

### IC-50 — Global quick find

- **Purpose:** Find any permitted record by reference or text from any workspace page (Phase 3 §9).
- **Inputs:** Query, scope (organisation for workspace users, internal for Haulr staff), recent searches (local).
- **States:** closed, open, typing, short of the minimum length, searching, results (grouped), no results (EM-2: the query is restated with a suggestion to check the reference format), error, offline (recent searches only).
- **Accessibility:** Combobox pattern (IC-05 behaviour) inside IC-41 or without a dialog; grouped results with group labels; the total result count is announced politely once results settle; each result's accessible name states entity type, reference and one disambiguating attribute.
- **Keyboard support:** Ctrl/Cmd+K opens (with `aria-keyshortcuts`); arrows move; Enter opens; Escape closes and returns focus to the element that opened it; Home/End move within the text; the shortcut does not fire while focus is in another text entry (IC-49).
- **ARIA:** As IC-05 (`role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`, `aria-autocomplete="list"`, options `role="option"`), with `role="group"` and `aria-labelledby` per entity type; `aria-busy` on the listbox while searching.
- **Interaction patterns:** Exact reference → direct navigation; otherwise grouped results; the query settles for 300 ms (`use-debounced-search`) before searching; responses for superseded queries are discarded; analytics `search.quick_find.used` with entity type and result count only.
- **Validation rules:** As IC-19: trimmed, minimum 2 characters except reference patterns (`HL-`, `INV-`, `STL-`, `CLM-`, `TKT-`), maximum 200 characters; the server applies the access filter for the scope (organisation membership or internal role, Phase 3 §9) regardless of query (G-7).
- **Loading behavior:** LS-2 for each new query with previous results kept while pending; LS-3 after 5 s states "Still searching"; nothing is announced for searches shorter than 1 s.
- **Error behavior:** E-SERVER, E-TIMEOUT, E-UNAVAILABLE: IC-60 retry in place with the query kept; E-RATE-LIMIT: the wait from `Retry-After` stated and searching resumes after it; E-OFFLINE: "Searching needs a connection" with recent searches still offered; E-AUTH: PG-10 with the return path; a result that returns E-NOT-FOUND when opened leads to PG-53.
- **Content rules:** Results name entity type and reference; group labels and counts come from constants with plural rules; dates and amounts in results through the shared formatters; result text wraps rather than truncating the reference.
- **Do:** Remember recent searches per user (local, convenience only), capped at 10 and purged on sign-out or account switch (SSB-10).
- **Don't:** Return records outside the user's access; send query text to analytics (NFR-PRIV-3).
- **Dependencies:** IC-05, IC-19, IC-41, `use-quick-find` (`useQuickFind`), `lib/hooks/use-debounced-search.ts`, `lib/utils/local-storage.ts`.

### IC-51 — Links and breadcrumbs

- **Purpose:** Navigate within the product.
- **Inputs:** Destination, accessible name, current flag, opens-externally flag.
- **States:** default, current (the page being viewed), external (leaves the product; stated in the name), unavailable destination (the link is not rendered and the reference is shown as text, for example a record outside the viewer's access).
- **Accessibility:** Descriptive names ("Load HL-7K2M9QXA", not "View"); breadcrumbs in a `nav` labelled "Breadcrumb" with `aria-current="page"` on the last item (Phase 3 §12); link purpose is clear from the name alone (WCAG 2.4.9, exceeding the AA requirement 2.4.4); after navigation focus moves to the destination's main heading (SSB-6).
- **Keyboard support:** Enter activates; Tab and Shift+Tab move between links in DOM order; the browser's open-in-new-tab keys are never suppressed.
- **ARIA:** `aria-current` (`page` for breadcrumbs and navigation, never set on more than one link in a set); no `role` override on native `a` elements.
- **Interaction patterns:** Next.js `Link` for internal routes with prefetch defaults; return paths validated by `lib/utils/internal-path.ts`; links back to a collection carry its filter and cursor parameters so the user's place is kept (IC-20).
- **Validation rules:** Internal links only through route helpers; no hand-written paths (host rule 1); return paths must be same-origin internal paths or are replaced by the role's home.
- **Loading behavior:** Route transitions show loading per SSB-1: LS-1 at the destination with its own boundaries; the current page stays interactive until the destination streams.
- **Error behavior:** Not applicable at the link — it makes no request of its own; destination failures belong to the destination page (E-NOT-FOUND → PG-53, E-FORBIDDEN → PG-55, E-AUTH → PG-10 with the return path).
- **Content rules:** Name states the destination; record names and references are inserted through named placeholders; breadcrumb labels come from the same label constants as page titles (SSB-7) and tolerate 40% expansion.
- **Do:** Build hrefs from route constants.
- **Don't:** Open new tabs without saying so.
- **Dependencies:** `next/link`, `lib/utils/internal-path.ts`, `appRoutes` in `lib/constants.ts`.

### IC-52 — Skip link

- **Purpose:** Bypass repeated blocks (WCAG 2.4.1).
- **Inputs:** Target ID.
- **States:** hidden until focused, focused, activated (focus now on the target).
- **Accessibility:** Present on every page as the initial focusable element; moves focus to the main landmark; also used to skip past maps; becomes perceivable when focused (G-1, WCAG 2.4.7).
- **Keyboard support:** Tab from the start of the page reaches it; Enter activates.
- **ARIA:** None beyond a clear name — native link semantics carry role and target; the target landmark (`main`) takes `tabindex="-1"` so it can receive focus.
- **Interaction patterns:** Target receives focus programmatically; activating it does not add history entries that break browser back.
- **Validation rules:** Target exists; a unit test asserts every page renders exactly one `main` landmark with the target ID.
- **Loading behavior:** Not applicable — the link is static markup rendered by `app/layout.tsx` and never fetches.
- **Error behavior:** Not applicable — the link makes no request; a missing target is prevented by the validation test.
- **Content rules:** "Skip to main content"; the map variant "Skip map" states what is skipped; both from constants.
- **Do:** Render from `app/layout.tsx` so every route has it.
- **Don't:** Omit on internal tools.
- **Dependencies:** `app/layout.tsx`, IC-30.

### IC-53 — Notification item and unread count

- **Purpose:** Convey a notification and the count of unread ones.
- **Inputs:** Notification (type, subject, time, read), unread count query.
- **States:** unread, read, count loading (count absent), count unavailable (count absent after failure), count capped ("99+" for more than 99), subject no longer available (the item stays readable and states the record is unavailable).
- **Accessibility:** Unread state in text; count exposed in the accessible name of the route to PG-42 ("Notifications, 3 unread"); each item's name states subject, change and relative time.
- **Keyboard support:** Standard link: Enter opens the subject; Tab moves between items; marking read or unread, where offered, is an IC-11 button.
- **ARIA:** Count changes announced politely at most once per minute; unread state is never conveyed through `aria-selected` or another non-text attribute alone.
- **Interaction patterns:** Opening marks read; count shared via one query key; the count refreshes every 60 s and pauses while the page is hidden (Phase 7 §13); marking read updates the count optimistically and rolls back on failure; analytics `notification.item.opened` with type only.
- **Validation rules:** Not applicable — no user entry; notification types come from `lib/enums/notification-event.ts` and unknown types render the generic label per IC-59.
- **Loading behavior:** Count may be absent while loading (LS-1); the 60 s refresh is LS-2 with the previous count kept (fresh ≤ 60 s, stale after 5 min, Phase 4 §2.6).
- **Error behavior:** Count omitted on failure for E-SERVER, E-TIMEOUT, E-UNAVAILABLE and E-OFFLINE, with the link still usable and the next poll retrying; E-AUTH: PG-10 per SSB-3; opening an item whose subject returns E-NOT-FOUND shows PG-53.
- **Content rules:** Notification text states subject and change ("New bid on HL-… $2,300.00"); every template is a whole sentence in the notification copy constants with named placeholders; amounts via `lib/utils/currency.ts`, times via `lib/utils/date-formatter.ts`; a carrier never sees shipper price and a shipper never sees carrier pay (BR-05).
- **Do:** Link to the subject.
- **Don't:** Announce every increment.
- **Dependencies:** `use-notifications` (`useNotifications`), IC-59.

### IC-54 — Session timeout warning

- **Purpose:** Prevent losing work when the session expires (WCAG 2.2.1).
- **Inputs:** Session expiry, warning lead time (2 minutes), idle timeout (30 minutes workspace, 15 minutes internal, or the organisation's stricter policy, SEC-3, BR-24), view-as session end (60 minutes, BR-27).
- **States:** active, warning, extending, extended, expired, not extendable (absolute lifetime `SESSION_MAX_AGE` or the 60-minute view-as limit reached; the warning states that sign-in or a new view-as session is needed).
- **Accessibility:** Warning uses IC-41 with a clear extend action; announced assertively; focus moves to the warning heading and returns to the prior element after extending; the remaining time is text updated at most once per minute until the final minute.
- **Keyboard support:** As IC-41: Tab cycles between extend and sign-out, Enter or Space activates, and Escape closes the warning and counts as activity that extends the session.
- **ARIA:** As IC-41 with `role="alertdialog"`, `aria-labelledby` and `aria-describedby` pointing to the time remaining; the countdown inside follows IC-46 (`role="timer"`, `aria-live="off"`).
- **Interaction patterns:** Extend refreshes the session; expiry preserves drafts (PP-06) and redirects to PG-10 with return path; activity in any open tab extends all tabs; the view-as limit cannot be extended (BR-27).
- **Validation rules:** Not applicable — the warning accepts no entry; expiry times are decided by the server (SEC-3) and the client corrects clock skew from server time (IC-46).
- **Loading behavior:** LS-5 while extending; the extend action shows "Extending…" and blocks repeats (G-6).
- **Error behavior:** Extension failure → save drafts and sign in (E-AUTH: redirect to PG-10 with the return path); E-OFFLINE: drafts saved locally and the user is told the session will be checked on reconnect; E-SERVER, E-TIMEOUT: one retry is offered before the session is treated as expiring.
- **Content rules:** Time remaining stated through `lib/utils/date-formatter.ts` with locale plural rules; copy from constants with a named placeholder for the time, never concatenated.
- **Do:** Preserve drafts before redirect.
- **Don't:** Expire silently.
- **Dependencies:** `SESSION_MAX_AGE`, IC-41, IC-46, `app/api/session`.

### IC-55 — Connectivity status

- **Purpose:** Tell users when they are offline and what that means (SSB-4).
- **Inputs:** Online state, queued mutation count, last sync time.
- **States:** online, offline (queue count stated), reconnecting, replaying (progress stated), synced, replay failed (per item).
- **Accessibility:** Changes announced politely once per transition; queued count and last sync time are text; replay failures are a list whose items link to the affected record.
- **Keyboard support:** Not interactive, except "retry now", an IC-11 button reached by Tab and activated with Enter or Space, and the links to failed items.
- **ARIA:** `role="status"`; `aria-busy` while replaying.
- **Interaction patterns:** On reconnect, queued work replays and the result is announced; replay runs in queue order and the server de-duplicates by `nanoid` ID (Phase 7 §13); signing out with unsent items follows the SSB-10 driver exception: replay is tried first, the driver is told how many items are pending, and the queue stays encrypted on the device and bound to that driver until it replays at their next sign-in (up to 7 days) or is discarded through IC-12 (SSB-10, NFR-AV-6, NFR-PRIV-4).
- **Validation rules:** Not applicable — no user entry; queued items are validated by the server on replay (G-7).
- **Loading behavior:** LS-5 while reconnecting and replaying; cached data stays readable as LS-6 with its age.
- **Error behavior:** Replay failures listed per item: E-CONFLICT and E-VALIDATION items state the reason and ask for review; E-SERVER and E-TIMEOUT items stay queued for the next retry; E-AUTH pauses replay until sign-in, keeping the queue for the same user.
- **Content rules:** "You're offline. Updates will send when you reconnect."; counts via plural rules from constants; the last sync time through `lib/utils/date-formatter.ts`.
- **Do:** Use `navigator.onLine` plus failed-request detection.
- **Don't:** Block reading cached data.
- **Dependencies:** SC-20.3, SC-39.5, `lib/utils/offline-queue.ts`.

### IC-56 — Term explanation

- **Purpose:** Explain industry terms in context (PP-07).
- **Inputs:** Term, definition (from glossary constants).
- **States:** closed, open.
- **Accessibility:** Toggletip pattern (button that reveals text), not a hover-only reveal; content announced; the button's name includes the term ("What is TONU?"); content stays until dismissed (WCAG 1.4.13).
- **Keyboard support:** Enter/Space toggles; Escape closes and keeps focus on the button.
- **ARIA:** Button with `aria-expanded`; content in a live region on open (`role="status"`).
- **Interaction patterns:** Definitions defined once in constants and reused; opening one explanation closes any other.
- **Validation rules:** Not applicable — the element accepts no entry; glossary keys are typed, so a missing definition fails type-checking.
- **Loading behavior:** Not applicable — definitions are static constants bundled with the page and never fetched.
- **Error behavior:** Not applicable — nothing is fetched and nothing is submitted.
- **Content rules:** One or two sentences; definitions are whole sentences in the glossary constants, ready for translation, and tolerate 40% expansion.
- **Do:** Use for TONU, detention, POD, OS&D, lumper, deadhead.
- **Don't:** Put essential instructions only in explanations.
- **Dependencies:** Glossary constants (feature constants, Phase 7 §10).

### IC-57 — Action menu

- **Purpose:** Offer several related actions from a single trigger.
- **Inputs:** Items (label, action, disabled reason, destructive flag).
- **States:** closed, open, item unavailable (reason stated per G-5), action pending (the trigger shows LS-5 while a chosen action runs), view-as read-only (BR-27: mutation items unavailable with reason unless write consent exists; navigation items stay available).
- **Accessibility:** WAI-ARIA menu button pattern; unavailable items stay in the menu with their reason; focus returns to the trigger after an item runs or the menu closes.
- **Keyboard support:** Enter/Space/Down opens; arrows move; Home/End jump to the ends; type-ahead moves to the matching item; Enter activates; Escape closes and returns focus.
- **ARIA:** `aria-haspopup="menu"`, `aria-expanded`, `role="menu"`, `menuitem`; `aria-disabled` plus `aria-describedby` for unavailable items; `aria-busy` on the trigger while an action is pending.
- **Interaction patterns:** Destructive items trigger IC-12; navigation items are links and mutation items run through hooks (IC-11 rules).
- **Validation rules:** Only legal actions listed (SC-40.2 mapping); the server rechecks legality and permission for the chosen action (G-7).
- **Loading behavior:** Not applicable to the menu itself — items derive from the already-loaded record state and never fetch; a chosen action follows LS-5.
- **Error behavior:** Per action: the owning section reports E-CONFLICT (state moved on; the menu reflects the new legal actions after refetch), E-FORBIDDEN (reason and who can grant it), E-PRECONDITION (IC-67), and E-SERVER or E-TIMEOUT (IC-60), with focus on the trigger.
- **Content rules:** Verb-first labels; labels from constants and tolerant of 40% expansion.
- **Do:** Name the trigger with its subject ("Actions for HL-…").
- **Don't:** Hide the only way to perform a frequent action.
- **Dependencies:** IC-11, IC-12, IC-67.

### IC-58 — Document preview

- **Purpose:** Let a user inspect a document without downloading.
- **Inputs:** Document URL (signed), type, title, pages, version, upload time.
- **States:** loading, ready, unsupported type (download offered), failed, URL expired (refreshing), scan pending (preview withheld until the virus scan passes, SEC-7), not found (the document was removed or access ended).
- **Accessibility:** Title and metadata as text; download alternative always offered; PDF previews rely on the browser's accessible viewer; image previews carry a text alternative naming the document type and page ("POD, page 1 of 2").
- **Keyboard support:** Standard; close via Escape when in IC-41; page navigation and zoom actions for images are IC-11 buttons (Enter or Space), with + and - as zoom keys while focus is in the preview.
- **ARIA:** Frame titled when embedded; the current page in a `role="status"` region when it changes.
- **Interaction patterns:** Images: zoom and page navigation; PDFs: native viewer; opening a preview records analytics `document.preview.opened` with document type only.
- **Validation rules:** Signed URL not expired (refresh if so; URLs expire within 5 minutes, SEC-7); type must be PDF, JPG or PNG to preview.
- **Loading behavior:** LS-1 while the document loads, with the title, metadata and download action usable immediately; LS-3 after 5 s.
- **Error behavior:** Fall back to download; E-PRECONDITION (signed URL expired): refreshed once through `useDocuments`, then IC-60 retry; E-NOT-FOUND: "This document is no longer available"; E-FORBIDDEN on the record: treated as not found (Phase 3 §5.2); E-SERVER, E-TIMEOUT, E-OFFLINE: download offered with IC-60 retry.
- **Content rules:** State document type, version and upload time; the upload time through `lib/utils/date-formatter.ts`; document titles wrap rather than truncate.
- **Do:** Use Next.js Image for image previews.
- **Don't:** Render untrusted HTML documents.
- **Dependencies:** SH-03, IC-41, `useDocuments`.

### IC-59 — Status label

- **Purpose:** Convey the state of a load, bid, invoice, settlement, claim or exception consistently.
- **Inputs:** Entity type, state, optional qualifier (late, stale).
- **States:** One per enumerated state in `lib/enums/` (for loads, BR-01 including its side states; for bids, BR-02), each with and without a qualifier, plus the generic label for an unknown state.
- **Accessibility:** State always in text (G-3); qualifiers are words ("In transit, running late").
- **Keyboard support:** Not applicable — the label is not interactive and never takes focus.
- **ARIA:** None required; not a live region unless within one.
- **Interaction patterns:** Labels from the single status-label constant map (Phase 3 §7); qualifiers are derived from data (late from ETA against the window, stale from the Phase 4 §2.6 thresholds), never set by hand.
- **Validation rules:** Unknown state → generic label and a reported contract mismatch (service-level logging).
- **Loading behavior:** Not applicable — the label renders a value it receives and never fetches.
- **Error behavior:** Not applicable — the label makes no request; an unknown state is handled as the validation rules state, reported as E-CONTRACT telemetry at the service level.
- **Content rules:** Plain words, sentence case; labels and qualifier combinations are whole phrases in constants, not concatenated, and tolerate 40% expansion.
- **Do:** Use the same label everywhere for the same state.
- **Don't:** Invent synonyms per page.
- **Dependencies:** `lib/enums/`, status constants.

### IC-60 — Retry control

- **Purpose:** Recover from a failed fetch or mutation in place.
- **Inputs:** Retry handler, failure message, attempt count, E-class, correlation ID.
- **States:** failed, retrying, recovered, failing repeatedly (after 3 attempts), waiting (E-RATE-LIMIT until `Retry-After` passes, time stated).
- **Accessibility:** Failure message and retry action associated; outcome announced; the support reference is selectable text.
- **Keyboard support:** Standard button: Enter and Space activate; the support route after repeated failure is a link reached by Tab.
- **ARIA:** As IC-11: `aria-busy` while retrying; `aria-describedby` pointing to the failure message; `aria-disabled` with the wait stated while rate-limited.
- **Interaction patterns:** TanStack Query `refetch` or mutation `reset` + re-run; after 3 failed attempts, route to support with context (correlation ID, E-class, page); mutations re-run with the same idempotency key when they carry one.
- **Validation rules:** Not applicable — the control accepts no entry.
- **Loading behavior:** LS-5 while retrying; the failed section's last known data stays visible with its age (SSB-2).
- **Error behavior:** Repeated failure → support route (PG-08); E-RATE-LIMIT: retry re-enabled after `Retry-After`; E-SERVER and E-CONTRACT: the correlation ID shown as the support reference; E-OFFLINE: retry waits for reconnection (IC-55).
- **Content rules:** "Couldn't load documents. Try again."; the context phrase and the `errorCopy.<class>` sentence are separate whole sentences from constants, never joined fragments.
- **Do:** Keep other sections working.
- **Don't:** Retry mutations automatically unless idempotent.
- **Dependencies:** IC-11, IC-55, TanStack Query, `lib/utils/action-result.ts`.

## 12a. Enterprise Contracts

Added in version 1.1.0 for the enterprise flows XF-14 … XF-16 and XS-13 … XS-17.

### IC-61 — Bulk file import

- **Purpose:** Accept a structured file, map it and report an outcome for every row (BR-28).
- **Inputs:** Accepted types (CSV, XLSX), limits (5 MB, 500 rows), template URL, column dictionary, saved mappings, target schema.
- **States:** idle, file selected, uploading (progress), parsing, mapping, validating, validated (counts per outcome), pricing, ready to confirm, confirming, completed, failed; each row: valid, warning, invalid, excluded, posted, pending approval, draft, rejected.
- **Accessibility:** File selection per IC-24. Mapping is a labelled list of column-to-field pairs. Row outcomes use IC-22 table semantics with a row header (row number and reference) and cell errors associated by `aria-describedby`. Counts are announced after each validation pass.
- **Keyboard support:** As IC-24 for selection. Row correction cells follow their entry contracts (IC-01, IC-05, IC-08). Filter by outcome per IC-20. No grid-mode navigation is required.
- **ARIA:** `role="progressbar"` for upload and processing, with `aria-valuetext` ("Validated 320 of 500 rows"); IC-22 table roles.
- **Interaction patterns:** Upload → map → validate → correct or exclude → price → confirm (IC-12, stating count and total). Nothing is created before confirmation. The user may leave during LS-7 and resume from batch history.
- **Validation rules:** Client checks type and size only. The server validates every row against the load schema (composed over the contract), facility existence, date windows, duplicates (reference and pickup date) and spend limit. Row-level outcomes never fail the whole batch.
- **Loading behavior:** LS-5 while uploading; LS-7 for parse, validate and price, with progress polled every 5 s.
- **Error behavior:**
  - E-VALIDATION at file level (named cause; nothing created).
  - E-UNAVAILABLE for pricing (affected rows become drafts).
  - E-CONFLICT for rows whose quotes expired before confirmation (re-price).
  - E-TIMEOUT recovers by re-reading batch status.
- **Content rules:** Row errors state field, value and fix ("Pickup window ends before it starts: 2026-11-03 14:00 → 09:00"). Outcome names come from the import-row-outcome enum. Counts are formatted with locale grouping.
- **Do:** Offer a downloadable results file with every row and outcome.
- **Don't:** Post anything automatically, or silently drop rows.
- **Dependencies:** IC-12, IC-20, IC-22, IC-24, SC-56.1, SC-56.2, SC-56.3, `use-bulk-import.ts`.

### IC-62 — Approval decision

- **Purpose:** Approve or reject a spend request with accountability (BR-23).
- **Inputs:** Request (type, amount, limit, subject, deadline, version), whether the viewer is the requester, reason.
- **States:** pending, approving, rejecting, approved, rejected, expired, decided-by-other, not permitted (own request), read-only (view-as).
- **Accessibility:** Amount, limit and deadline are stated in the accessible description of both actions. The rejection reason field is required and labelled. The outcome is announced (IC-14).
- **Keyboard support:** Tab to approve or reject; Enter or Space activates; the reject flow opens IC-41 with focus on the reason field; Escape cancels.
- **ARIA:** Actions have `aria-describedby` pointing to the amount and deadline text; `aria-busy` while deciding.
- **Interaction patterns:** Approve is a single activation with no extra confirmation, because the approver's role exists to decide and the consequence is stated. Reject requires a reason. Request changes returns the request to the requester with a note. Decisions carry the request version (SSB-8).
- **Validation rules:** Reason 10–500 characters for reject and request changes. The server refuses decisions on own requests, expired subjects and stale versions.
- **Loading behavior:** LS-5; the resulting action (post, accept) completes server-side and is reported with the decision.
- **Error behavior:**
  - E-CONFLICT: decided by another approver or expired; the page names who and when, or the expiry.
  - E-FORBIDDEN: own request.
  - E-UNAVAILABLE: the downstream action failed; the approval stands and the requester is told to retry.
- **Content rules:** Labels are "Approve $4,280.00" and "Reject"; the comparison with the lane median is in words; amounts use the shared currency formatter.
- **Do:** Show time remaining against the quote or bid expiry (IC-46).
- **Don't:** Allow approval of one's own request, even with an admin role.
- **Dependencies:** IC-12, IC-14, IC-41, IC-46, SC-58.3, SC-40.17.

### IC-63 — Secret reveal-once

- **Purpose:** Hand a newly created secret (API key, webhook signing secret, SCIM token) to the user exactly once (BR-29, SEC-8).
- **Inputs:** Secret value (held only in memory), secret type, name, expiry.
- **States:** hidden, revealed, copied, acknowledged, dismissed (secret discarded from memory).
- **Accessibility:** The secret is not read aloud automatically; a "reveal" toggle exposes it as selectable text, and copying announces "Copied". An acknowledgement checkbox confirms the secret has been stored safely before dismissal.
- **Keyboard support:** Reveal via Space or Enter; copy via the copy action (IC-44); the acknowledgement checkbox via Space; dismissal via the done action. Escape is disabled until acknowledged, so the secret is not lost accidentally.
- **ARIA:** Reveal toggle uses `aria-pressed`; the secret region is labelled with the secret's name; copy status is announced via `role="status"`.
- **Interaction patterns:** Presented within IC-41 immediately after creation. The secret is never persisted in client storage, query cache, URL, logs or analytics. On dismissal the value is cleared from memory; afterwards only the prefix and metadata are shown.
- **Validation rules:** Dismissal requires acknowledgement.
- **Loading behavior:** Not applicable — the secret arrives with the creation response; there is nothing further to fetch.
- **Error behavior:** E-OFFLINE or clipboard denied → the value stays selectable for manual copy. If the dialog closes unexpectedly (crash, navigation), the secret is unrecoverable and the user is told to rotate.
- **Content rules:** State plainly: "This is the only time you'll see this secret." Show expiry in the organisation's time zone.
- **Do:** Show the key prefix afterwards for identification.
- **Don't:** Offer "show again".
- **Dependencies:** IC-41, IC-44, IC-13, SC-60.3, SC-61.1, SC-61.2.

### IC-64 — View-as session indicator

- **Purpose:** Make a view-as session unmistakable to the agent and bound its lifetime (BR-27).
- **Inputs:** Viewed member and organisation, origin agent, ticket, mode (read-only or write consent), expiry.
- **States:** active read-only, active with write consent, expiring (≤ 5 min), ended.
- **Accessibility:** On every page load during view-as, a polite announcement states "Viewing as <member>, <organisation>, read-only, 42 minutes remaining". The indicator is a named landmark region (`aria-label="View-as session"`) reachable by skip link (IC-52). The end action is always reachable by keyboard.
- **Keyboard support:** Tab to "End session"; Enter or Space ends the session, returning to the ticket.
- **ARIA:** `role="region"` with label; remaining time as a timer (`aria-live="off"`) with threshold announcements via IC-14.
- **Interaction patterns:** Present on every workspace page for the session's duration. Blocked actions explain that they are unavailable in view-as and why. Ending the session purges caches (SSB-10).
- **Validation rules:** Not applicable — the indicator takes no input beyond ending the session.
- **Loading behavior:** LS-5 while ending.
- **Error behavior:** E-AUTH on expiry → session ended and returned to PG-24. E-CONFLICT when the ticket closes → session ended with explanation.
- **Content rules:** Always names the viewed member, the organisation, the mode and the remaining time.
- **Do:** Treat the session as a separate identity for caching and drafts.
- **Don't:** Allow the indicator to be dismissed or hidden.
- **Dependencies:** IC-14, IC-46, IC-52, SC-24.4, SC-52.4.

### IC-65 — Export request

- **Purpose:** Request, track and download a data export (reports, audit, organisation data).
- **Inputs:** Dataset(s), filters or range, format (CSV, JSON, XLSX where offered), maximum range, re-authentication requirement.
- **States:** configuring, requesting, queued, running (progress), ready (expiry), downloaded, expired, failed.
- **Accessibility:** Configuration uses IC-07, IC-08 and IC-09. Job status changes are announced politely while the page is open. The download link names dataset, range and size.
- **Keyboard support:** Per constituent contracts; download is a standard link activated with Enter.
- **ARIA:** Progress per `role="progressbar"`; status via `role="status"`.
- **Interaction patterns:** Sensitive datasets (organisation data, audit) require IC-13 first. The job runs as LS-7 and the user may leave; the user is notified on completion (XS-03). Download requires an authenticated session; links expire after 24 h.
- **Validation rules:** Range within the dataset maximum (reports 36 months, organisation data 24 months per export, audit within retention); at least one dataset; format allowed for the dataset.
- **Loading behavior:** LS-7; status polled every 10 s while viewed.
- **Error behavior:**
  - E-VALIDATION: range, with splitting suggested.
  - E-RATE-LIMIT: more than 3 concurrent exports per organisation.
  - E-NOT-FOUND: expired link, with re-issue offered.
  - E-SERVER: job failed, with a correlation ID.
- **Content rules:** State what the export will contain, the expected size, and that the export itself is audited.
- **Do:** Include a manifest with row counts and checksums.
- **Don't:** Email Confidential data as attachments.
- **Dependencies:** IC-07, IC-08, IC-09, IC-13, SC-59.3, SC-62.1, SC-63.2.

### IC-66 — Amendment comparison

- **Purpose:** Present old and proposed terms so that every difference is unambiguous (BR-25).
- **Inputs:** Governing terms, proposed terms, field metadata (label, unit, time zone), viewer side (BR-05).
- **States:** unchanged field (collapsible), changed, added, removed; the whole comparison is stale if the amendment version changes.
- **Accessibility:** Presented as a table with column headers "Current" and "Proposed" and row headers per field. Each changed row has a text summary of the change. Added and removed are stated in words. Unchanged fields can be collapsed with IC-32, while the count of unchanged fields is still stated.
- **Keyboard support:** Standard table reading; disclosure via IC-32.
- **ARIA:** Native table semantics; `aria-describedby` from each changed row to its summary.
- **Interaction patterns:** Changed fields are identified and counted ("4 fields changed") so that none can be missed; how the comparison is arranged is decided at build time. If the version changes while open, the comparison reloads and the change is announced.
- **Validation rules:** Not applicable — read-only presentation; validation belongs to the proposer (SC-40.16).
- **Loading behavior:** LS-1 with its parent.
- **Error behavior:** E-PRECONDITION → reload with announcement.
- **Content rules:**
  - Times in facility time zones with abbreviation.
  - Money only for the viewer's side.
  - Units always shown.
  - Summaries are full sentences built from templates in constants, never concatenated fragments.
- **Do:** State materiality and the response deadline.
- **Don't:** Rely on marking alone to show change (G-3).
- **Dependencies:** IC-32, SH-14, SC-40.16, SC-64.1.

### IC-67 — Stale-edit conflict resolution

- **Purpose:** Resolve an edit that was refused because the record changed meanwhile (SSB-8, E-PRECONDITION).
- **Inputs:** The user's pending changes, the server's current version, the list of fields changed by others, and the actor and time of that change.
- **States:** detected, reviewing, reapplying, resolved, abandoned.
- **Accessibility:** Presented with IC-41. Focus moves to the heading "This <record> was changed by <actor> at <time>". Changed fields are listed with the other person's value and the user's value, as text.
- **Keyboard support:** As IC-41; actions "Reapply my changes", "Discard my changes" and "Review" are reachable by Tab.
- **ARIA:** `role="alertdialog"`, with the description listing the conflicting fields.
- **Interaction patterns:**
  - "Reapply my changes" reloads the latest version and re-applies the user's edits to fields nobody else changed.
  - For fields both people changed, the user chooses per field.
  - "Discard" reloads the latest version.
  - Nothing is saved without an explicit save after resolution.
- **Validation rules:** The re-applied result is validated as a normal edit (IC-02).
- **Loading behavior:** LS-5 while reloading the latest version.
- **Error behavior:** A second conflict during resolution restarts the contract with the newer version. E-NOT-FOUND if the record was deleted → the user's input is offered as a copy to paste.
- **Content rules:** Name the other actor (or "Haulr support" for view-as, "API key <name>" for integrations) and the time.
- **Do:** Preserve the user's input in every path.
- **Don't:** Silently overwrite (last-write-wins).
- **Dependencies:** IC-02, IC-41, SSB-8.

---

## 13. Contract Usage Index

| Contract | Used by (Phase 5) |
| --- | --- |
| IC-01 | SC-10.1, SC-10.3, SC-11.2, SC-12.1, SC-16.2, SC-17.2, SC-24.4, SC-27.3, SC-29.2, SC-32.2, SC-36.2, SC-40.3, SC-40.9, SC-46.1, SC-46.2, SC-48.1, SC-48.4, SC-51.4, SC-56.2, SC-57.3, SC-59.1, SC-60.1, SC-60.2, SC-60.3, SC-61.1, SC-61.2, SC-61.3, SC-66.3 |
| IC-02 | Every form; SH-13 |
| IC-03 | SC-10.1, SC-11.2, SC-13.1, SC-15.1, SC-47.1 |
| IC-04 | SC-14.2, SC-47.1 |
| IC-05 | SC-01.2, SC-05.1, SC-16.2, SC-17.3, SC-27.2, SC-32.2, SC-33.1, SC-56.2 |
| IC-06 | SH-07, SH-15, SC-65.3 |
| IC-07 | SC-01.2, SC-05.1, SC-16.2, SC-17.3, SC-24.4, SC-27.3, SC-32.2, SC-33.1, SC-48.2, SC-50.3, SC-51.4, SC-56.1, SC-57.3, SC-58.4, SC-59.3, SC-60.3, SC-61.1, SC-61.2, SC-61.3, SC-65.4 |
| IC-08 | SC-05.1, SC-27.2, SC-33.1, SC-39.4, SC-47.3, SC-56.2, SC-57.3, SC-58.4, SC-59.3, SC-61.1, SC-65.4 |
| IC-09 | SC-07.2, SC-11.1, SC-16.3, SC-27.5, SC-29.2, SC-39.4, SC-51.4, SC-56.3, SC-57.3, SC-59.3, SC-60.2, SC-62.2, SC-66.3 |
| IC-10 | SH-02, SC-40.6 |
| IC-11 | All actions |
| IC-12 | SH-05 bulk, SH-07, SC-03.3, SC-21.2, SC-23.1, SC-23.4, SC-25.1, SC-25.2, SC-27.6, SC-28.3, SC-28.4, SC-29.1, SC-29.2, SC-34.3, SC-36.2, SC-37.2, SC-40.2, SC-40.9, SC-40.15, SC-40.16, SC-40.17, SC-45.4, SC-47.2, SC-48.2, SC-48.3, SC-48.4, SC-49.1, SC-50.3, SC-51.4, SC-52.2, SC-56.3, SC-57.1, SC-57.3, SC-59.3, SC-60.1, SC-60.4, SC-61.1, SC-61.2, SC-62.2, SC-64.3, SC-27.7, SC-66.3 |
| IC-13 | SC-17.5, SC-25.2, SC-46.2, SC-47.1, SC-48.2, SC-48.4, SC-49.1, SC-49.2, SC-51.4, SC-52.2, SC-60.1, SC-60.2, SC-60.3, SC-60.4, SC-61.1, SC-62.1, SC-62.2 |
| IC-14 | SSB-5 everywhere |
| IC-15 | SH-13, SC-27.2, SC-27.3 |
| IC-16 | Build-time choice for multi-view pages |
| IC-17 | SH-08, SC-18.3, SC-59.1 |
| IC-18 | SC-33.1 |
| IC-19 | SH-05, SC-06.1, SC-24.3, SC-53.1 |
| IC-20 | SH-01, SH-03, SH-05, SH-11, SC-33.1, SC-56.2, SC-59.1, SC-61.2, SC-61.3, SC-66.1 |
| IC-21 | SH-05, SH-01, SH-04, SH-11, SC-66.1 |
| IC-22 | SH-05 (desktop), SC-28.2, SC-31.1, SC-56.2, SC-66.1, SC-66.2 |
| IC-23 | SH-05, SC-21.2, SC-26.3, SC-30.3, SC-56.2, SC-56.3, SC-61.2 |
| IC-24 | SH-03, SC-08.1, SC-39.3, SC-40.9, SC-43.2, SC-46.1, SC-60.2 |
| IC-25 | SH-03, SH-04, SC-17.4, SC-39.3 |
| IC-26 | SC-17.4, SC-34.3, SC-64.3 |
| IC-27 | SC-19.3, SC-34.3 |
| IC-28 | SH-07, SC-18.1, SC-19.1, SC-28.3, SC-40.4 |
| IC-29 | SC-39.2 |
| IC-30 | SH-02, SC-32.2 |
| IC-31 | SC-39.1 |
| IC-32 | SH-01, SH-11, SH-14, SC-05.2 |
| IC-33 | SC-19.3, SC-33.2, SC-36.1 |
| IC-34 | SC-33.4, SC-36.2 |
| IC-35 | SH-04 |
| IC-36 | SC-47.3, IC-34 |
| IC-37 | SH-10 |
| IC-38 | SC-11.2, SC-15.1, SC-15.2, IC-26 |
| IC-39 | SH-15, SC-16.4, SC-37.2, SC-48.3, IC-06 |
| IC-40 | SC-27.2, SC-29.2, SC-60.3 |
| IC-41 | SC-49.2; IC-12, IC-13, IC-50, IC-54, IC-58, IC-62, IC-63, IC-67 |
| IC-42 | SC-16.3, SC-17.5, SC-49.2 |
| IC-43 | SC-30.3, SC-31.3, SC-38.3 |
| IC-44 | SC-26.3, SC-40.1, SC-40.15, SC-54.1, SC-60.1 |
| IC-45 | SH-08, SC-05.3, SC-59.2 |
| IC-46 | SH-07, SH-15, SC-10.1, SC-14.1, SC-19.1, SC-19.2, SC-22.1, SC-24.1, SC-24.4, SC-27.4, SC-28.2, SC-28.4, SC-40.4, SC-40.17, SC-56.3, SC-64.3, SC-27.7, SC-66.1 |
| IC-47 | SC-21.1, SC-21.2, SC-24.1, SC-40.12, SC-50.1, SC-50.4, SC-66.1 |
| IC-48 | SC-24.2, SC-50.4 |
| IC-49 | SC-50.3, SC-23.1, SC-66.1 |
| IC-50 | Workspace layouts (Phase 7 §4) |
| IC-51 | Everywhere |
| IC-52 | Root layout |
| IC-53 | SC-42.1, SC-42.2, workspace layouts |
| IC-54 | Workspace layouts |
| IC-55 | SC-20.3, workspace and driver layouts |
| IC-56 | SH-08, SH-09, SH-14, SC-07.1, SC-27.3, SC-34.1 |
| IC-57 | SC-40.2, SH-05 row actions |
| IC-58 | SH-01, SH-03, SC-23.1, SC-39.6 |
| IC-59 | Every status |
| IC-60 | SSB-3 everywhere |
| IC-61 | SC-56.1, SC-56.2, SC-56.3 |
| IC-62 | SC-25.1, SC-40.17, SC-58.3 |
| IC-63 | SC-60.3, SC-61.1, SC-61.2 |
| IC-64 | SC-24.2, SC-24.3, SC-24.4, SC-52.4, workspace layouts during view-as |
| IC-65 | SH-05, SH-11, SC-25.3, SC-26.3, SC-59.3, SC-62.1, SC-63.2 |
| IC-66 | SC-40.16, SC-64.1 |
| IC-67 | SSB-8 everywhere a persisted record is edited; SC-48.4, SC-57.2 |
| IC-68 | SC-65.1, SC-65.3 |

**Total: 68 interaction contracts.**

---

Previous: [Phase 5 — Section Blueprints](./phase-5-section-blueprints.md) · Next: [Phase 7 — Frontend Architecture](./phase-7-frontend-architecture.md)
