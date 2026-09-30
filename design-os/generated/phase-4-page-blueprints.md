# Phase 4 — Page Blueprints

`Haulr Design OS` · `Version 1.0.0` · `2026-09-30` · Previous: [Phase 3 — Information Architecture](./phase-3-information-architecture.md) · Next: [Phase 5 — Section Blueprints](./phase-5-section-blueprints.md)

A functional blueprint for each of the 55 pages in the [Phase 3 sitemap](./phase-3-information-architecture.md#3-sitemap). Each blueprint says what the page is for, what users come to get done, what data and permissions it needs, and what happens in every state. It never says what the page contains or how it looks; that is decided when the page is built, with the owner.

States describe what happens and what the user is told, never where it appears.

## Table of Contents

1. [Blueprint Format](#1-blueprint-format)
2. [Shared State Behaviour](#2-shared-state-behaviour)
3. [Public Pages](#3-public-pages) — PG-01 … PG-09
4. [Access Pages](#4-access-pages) — PG-10 … PG-15
5. [Onboarding](#5-onboarding) — PG-16, PG-17
6. [Role Dashboards](#6-role-dashboards) — PG-18 … PG-25
7. [Shipper Workspace](#7-shipper-workspace) — PG-26 … PG-32
8. [Carrier Workspace](#8-carrier-workspace) — PG-33 … PG-38
9. [Driver](#9-driver) — PG-39
10. [Shared Records and Utilities](#10-shared-records-and-utilities) — PG-40 … PG-49, PG-04
11. [Internal Tools](#11-internal-tools) — PG-50 … PG-52
12. [System Pages](#12-system-pages) — PG-53 … PG-55
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

---

## 3. Public Pages

### PG-01 — Home

`/` · Serves XS-10, XS-01 · Sections: [SC-01.x](./phase-5-section-blueprints.md#pg-01--home)

- **Purpose:** Explain what Haulr does for shippers and carriers and move each visitor into the right journey.
- **Business objective:** Acquisition; qualified registrations on both sides of the marketplace (BG-01, BG-05).
- **User objective:** Understand quickly whether Haulr fits their situation and how to start.
- **Primary tasks:** "Get a price for my lane." "Find out whether I can haul for Haulr." "Sign in to my account."
- **Required data:** Marketing copy (constants); network statistics (cached, public aggregate); help category index.
- **Permissions:** Everyone. Signed-in users are offered their role root.
- **Device needs:** Phone: understand the offer and start either journey with one hand. Desktop: the same, with room to compare shipper and carrier value.
- **Loading states:** Static; network statistics load separately and are omitted, not replaced by a spinner, if they fail.
- **Empty states:** None.
- **Error states:** Statistics unavailable → the statement that uses them is withheld.
- **Success states:** Visitor reaches PG-05, PG-11 with a declared intent, or PG-10.
- **Dependencies:** PG-05, PG-11, PG-10, public stats endpoint (backend `stats` module extension).
- **Implementation notes:** Statically rendered with revalidation; no client data fetching on load; structured data per Phase 3 §11; performance budget is strictest here (LCP ≤ 2.0 s).

### PG-02 — Public Tracking

`/track/[token]` · Serves XF-07 · Sections: [SC-02.x](./phase-5-section-blueprints.md#pg-02--public-tracking)

- **Purpose:** Let a consignee or other outside party follow one load without an account.
- **Business objective:** Remove "where is my truck" calls (BG-02) and expose Haulr to receivers who are also shippers.
- **User objective:** Know the load's status, ETA and approximate progress, and whether it is running late.
- **Primary tasks:** "When will it arrive?" "Is it on time?" "Has it been delivered?"
- **Required data:** Tracking view for the token: status, stops (city level), appointment windows, ETA with confidence, approximate current position with source and age, delivery confirmation time (BR-21).
- **Permissions:** Signed tracking token; no session. Token scope is one load, read-only.
- **Device needs:** Phone: check status in seconds from a text message link. Desktop: the same, possibly left open on a dock computer, refreshing itself.
- **Loading states:** Server-rendered status; position and ETA refresh at a fixed interval (default 2 minutes) without losing what is shown.
- **Empty states:** No position yet (not yet picked up) → say that tracking starts at pickup, and when pickup is scheduled.
- **Error states:** Invalid token → a not-found message without revealing whether a load exists. Expired token → state that tracking ended and when the load was delivered. Position stale → show the last known position and its age (PP-03).
- **Success states:** Delivered → delivery time confirmed.
- **Dependencies:** Tracking token service, ETA service, map library (pending approval, Phase 7 §15).
- **Implementation notes:** `noindex, nofollow`; no rates, contacts or documents in the payload (BR-21); polling through TanStack Query `refetchInterval`, paused when the tab is hidden; a text equivalent of the map is always present (PP-08).

### PG-03 — Carrier Public Profile

`/carriers/[carrierId]` · Serves XF-04, XS-05 · Sections: [SC-03.x](./phase-5-section-blueprints.md#pg-03--carrier-public-profile)

- **Purpose:** Show a carrier's verified standing and track record.
- **Business objective:** Build trust in the network; SEO for carrier names; feed the preferred-carrier list (XF-04).
- **User objective:** Shipper: "Is this carrier safe and reliable?" Carrier: "What do shippers see about me?"
- **Primary tasks:** "Check this carrier is legitimate." "See how reliable they have been." "Add them to my preferred carriers."
- **Required data:** Carrier identity, authority status, years operating, equipment types, operating regions, scorecard (on-time, tracking, acceptance, rating), approval date. Signed-in shippers additionally get loads shared with this carrier and their own ratings.
- **Permissions:** Public view for approved carriers only; extended view for `shipper.*` and internal roles.
- **Device needs:** Phone and desktop: check the facts quickly. Desktop: compare with another carrier in another tab.
- **Loading states:** ISR; the extended signed-in part loads separately.
- **Empty states:** New carrier with no completed loads → say that the scorecard begins after the first delivered load.
- **Error states:** Carrier not approved or unknown → PG-53.
- **Success states:** Carrier added to preferred list (SSB-5).
- **Dependencies:** PG-29, XS-05, compliance status.
- **Implementation notes:** `generateStaticParams` not used (unbounded set); revalidate hourly and on compliance status change by tag; AggregateRating structured data only when rating count ≥ 5.

### PG-05 — Lane Rate Estimator

`/tools/rate-estimator` · Serves XS-10, XF-01 · Sections: [SC-05.x](./phase-5-section-blueprints.md#pg-05--lane-rate-estimator)

- **Purpose:** Give a market rate estimate for a lane.
- **Business objective:** Lead generation and quote conversion (KPI-01).
- **User objective:** Know what a lane should cost now, and why.
- **Primary tasks:** "What does Chicago to Dallas dry van cost next Tuesday?" "Is this quote I got fair?" "Turn this into a real booking."
- **Required data:** Lane (origin, destination), equipment, date; estimate (point, range, confidence, per-mile), 30-day lane trend, basis of estimate.
- **Permissions:** Everyone; anonymous usage is rate-limited; signed-in users can save estimates.
- **Device needs:** Phone: a quick check in a meeting. Desktop: several lanes in a row, comparing results.
- **Loading states:** Estimate pending is announced; previous result stays until the new one arrives.
- **Empty states:** No estimate yet → explain what inputs are needed.
- **Error states:** Unknown location → suggest matches. Insufficient data → state low confidence and offer a custom quote request. Rate limit → explain and offer sign-up.
- **Success states:** Estimate delivered; "continue to post" carries the lane to PG-27 (through sign-in when needed).
- **Dependencies:** Pricing service, geocoding, PG-27.
- **Implementation notes:** Lane parameters in the URL so estimates are shareable; the estimate is fetched client-side through a hook; debounced location suggestions (`use-debounced-search`).

### PG-06 — Help Center

`/help` · Serves XS-07 · Sections: [SC-06.x](./phase-5-section-blueprints.md#pg-06--help-center)

- **Purpose:** Self-service answers.
- **Business objective:** Deflect support tickets; SEO.
- **User objective:** Find an answer without contacting anyone.
- **Primary tasks:** "How do I…?" "Why was I charged…?" "I need to talk to someone."
- **Required data:** Help categories and articles (static content source), popular articles by role (signed-in only).
- **Permissions:** Everyone.
- **Device needs:** Phone: search and read. Desktop: the same.
- **Loading states:** Static.
- **Empty states:** Search with no results → suggest related categories and PG-08.
- **Error states:** Search index unavailable → fall back to category browsing.
- **Success states:** User reaches an article or PG-08.
- **Dependencies:** Help content source, PG-07, PG-08.
- **Implementation notes:** Content source is decided in Phase 7 (markdown in-repo by default); search runs over a build-time index.

### PG-07 — Help Article

`/help/[slug]` · Serves XS-07 · Sections: [SC-07.x](./phase-5-section-blueprints.md#pg-07--help-article)

- **Purpose:** Answer one question completely.
- **Business objective:** Ticket deflection; SEO.
- **User objective:** Solve the problem and get back to work.
- **Primary tasks:** "Tell me how to do this." "Did that answer my question?"
- **Required data:** Article body, category, related articles, last updated date.
- **Permissions:** Everyone.
- **Device needs:** Phone and desktop: read comfortably and follow steps while doing the task.
- **Loading states:** Static.
- **Empty states:** None.
- **Error states:** Unknown slug → PG-53 with help search.
- **Success states:** Helpfulness feedback recorded.
- **Dependencies:** PG-06, PG-08.
- **Implementation notes:** `generateStaticParams`; Article and BreadcrumbList structured data.

### PG-08 — Contact Support

`/support` · Serves XS-07 · Sections: [SC-08.x](./phase-5-section-blueprints.md#pg-08--contact-support)

- **Purpose:** Open a ticket and follow existing ones.
- **Business objective:** Resolve blockers; capture context to cut handling time.
- **User objective:** Reach a person with the right context once.
- **Primary tasks:** "Report a problem with this load." "Check on my request."
- **Required data:** Ticket categories, context from the originating page (load reference, page), the user's tickets and their status.
- **Permissions:** Everyone can open a ticket; history requires sign-in.
- **Device needs:** Phone: report a problem from the road, with a photo. Desktop: detailed tickets with attachments.
- **Loading states:** Ticket history loads separately.
- **Empty states:** No tickets → nothing to follow yet.
- **Error states:** Submission failure → draft preserved locally, retry offered.
- **Success states:** Ticket reference returned and the expected response time stated.
- **Dependencies:** Support system, XS-07.
- **Implementation notes:** Ticket creation through a Server Action; draft persistence via `useSyncExternalStore` + `localStorage`; anonymous submissions protected by rate limiting on the backend.

### PG-09 — Legal

`/legal/[document]` · Serves XS-01 · Sections: [SC-09.x](./phase-5-section-blueprints.md#pg-09--legal)

- **Purpose:** Publish terms of service, privacy policy, carrier agreement and shipper terms.
- **Business objective:** Legal compliance; referenced by consent in XS-01 and XF-12.
- **User objective:** Read the terms they are agreeing to.
- **Primary tasks:** "What am I agreeing to?" "What changed?"
- **Required data:** Document text, version, effective date, change summary.
- **Permissions:** Everyone.
- **Device needs:** Readable on every device; printable.
- **Loading states:** Static.
- **Empty states:** None.
- **Error states:** Unknown document → PG-53.
- **Success states:** None.
- **Dependencies:** Legal content source.
- **Implementation notes:** Version recorded with every consent (BR-04).

---

## 4. Access Pages

### PG-10 — Sign In

`/auth/login` (exists) · Serves XS-01 · Sections: [SC-10.x](./phase-5-section-blueprints.md#pg-10--sign-in)

- **Purpose:** Authenticate returning users.
- **Business objective:** Secure, low-friction access.
- **User objective:** Get back to work where they left off.
- **Primary tasks:** "Sign in." "I forgot my password."
- **Required data:** Credentials; validated return path.
- **Permissions:** Signed-out users; signed-in users are redirected to their role root.
- **Device needs:** Phone: sign in with password manager autofill. Desktop: same.
- **Loading states:** Pending submission is announced; the submitting action is disabled against double submission.
- **Empty states:** None.
- **Error states:** Wrong credentials → generic message (`INVALID_CREDENTIALS`). Locked account → cooldown explained. Network failure → retry.
- **Success states:** Redirect to return path or role root; MFA challenge to PG-14 when enrolled.
- **Dependencies:** `app/api/session`, `lib/hooks/use-login.ts`, `proxy.ts`.
- **Implementation notes:** Already built in the starter (`components/common/login-form.tsx`); extend with MFA hand-off and role resolution. Status in [Phase 8](./phase-8-implementation-roadmap.md#9-per-feature-build-status).

### PG-11 — Register

`/auth/register` · Serves XS-01, XF-12, XF-13 · Sections: [SC-11.x](./phase-5-section-blueprints.md#pg-11--register)

- **Purpose:** Create an account on the shipper or carrier side.
- **Business objective:** Acquisition on both sides.
- **User objective:** Start quickly on the right side.
- **Primary tasks:** "I ship freight." "I haul freight." "Create my account."
- **Required data:** Side (shipper or carrier), name, work email, password, consent to terms (version).
- **Permissions:** Signed-out.
- **Device needs:** Carriers often register on phones; the whole flow must work one-handed. Shippers mostly desktop.
- **Loading states:** Pending submission announced.
- **Empty states:** None.
- **Error states:** Email already used → offer sign-in and reset. Password below policy (`PASSWORD_MIN_LENGTH`) → explain the rule. Session creation fails after account creation → `SESSION_UNAVAILABLE` and route to sign-in.
- **Success states:** Verification email sent; user continues to PG-14.
- **Dependencies:** `app/api/register` (exists), `lib/hooks/use-register.ts`, PG-14, PG-09.
- **Implementation notes:** Side preselected by `?side=` from PG-01 or PG-02; schema composes over the generated register DTO.

### PG-12 — Forgot Password

`/auth/forgot-password` · Serves XS-01 · Sections: [SC-12.x](./phase-5-section-blueprints.md#pg-12--forgot-password)

- **Purpose:** Start a password reset.
- **Business objective:** Recover accounts without support.
- **User objective:** Get back into the account.
- **Primary tasks:** "Send me a reset link."
- **Required data:** Email.
- **Permissions:** Signed-out.
- **Device needs:** Any device.
- **Loading states:** Pending announced.
- **Empty states:** None.
- **Error states:** Rate limit → explain the wait.
- **Success states:** The same confirmation whether or not the email exists (no enumeration).
- **Dependencies:** Backend auth reset endpoint.
- **Implementation notes:** Reset link expires in 30 minutes.

### PG-13 — Reset Password

`/auth/reset-password` · Serves XS-01 · Sections: [SC-13.x](./phase-5-section-blueprints.md#pg-13--reset-password)

- **Purpose:** Set a new password from a reset link.
- **Business objective:** Account recovery.
- **User objective:** Set a new password and sign in.
- **Primary tasks:** "Choose a new password."
- **Required data:** Reset token (URL), new password.
- **Permissions:** Valid reset token.
- **Device needs:** Any device, often a phone from email.
- **Loading states:** Token validated on the server before rendering.
- **Empty states:** None.
- **Error states:** Token invalid or expired → say so and link to PG-12.
- **Success states:** Password changed; all other sessions revoked; user signed in or sent to PG-10.
- **Dependencies:** Backend auth.
- **Implementation notes:** Token never stored client-side beyond the request.

### PG-14 — Verify

`/auth/verify` · Serves XS-01 · Sections: [SC-14.x](./phase-5-section-blueprints.md#pg-14--verify)

- **Purpose:** Complete email verification and multi-factor challenges.
- **Business objective:** Account security; required MFA for sensitive roles.
- **User objective:** Prove it's them and continue.
- **Primary tasks:** "Confirm my email." "Enter my code." "I can't access my code."
- **Required data:** Verification state, MFA method, pending return path.
- **Permissions:** Partially authenticated session.
- **Device needs:** Phone: paste or autofill one-time codes.
- **Loading states:** Pending verification announced.
- **Empty states:** None.
- **Error states:** Wrong code (attempts remaining stated); expired link → resend; too many attempts → cooldown.
- **Success states:** Full session; continue to onboarding or role root.
- **Dependencies:** Backend auth, PG-16, PG-17.
- **Implementation notes:** Supports `autocomplete="one-time-code"`; backup codes accepted.

### PG-15 — Accept Invitation

`/auth/invite/[token]` · Serves XS-02 · Sections: [SC-15.x](./phase-5-section-blueprints.md#pg-15--accept-invitation)

- **Purpose:** Join an organisation from an invitation.
- **Business objective:** Team growth; driver activation (XF-05).
- **User objective:** Join the team with the least effort.
- **Primary tasks:** "Join my company on Haulr." "Set my password."
- **Required data:** Invitation (organisation name, inviter, role), account existence for the email.
- **Permissions:** Valid invitation token.
- **Device needs:** Drivers accept on phones from SMS; the flow must finish in under a minute.
- **Loading states:** Token validated server-side.
- **Empty states:** None.
- **Error states:** Expired or revoked → say so and who to ask. Email already in another organisation → explain the one-organisation rule.
- **Success states:** Membership active; drivers continue to location consent and PG-20.
- **Dependencies:** XS-02, PG-20.
- **Implementation notes:** Existing users sign in to accept; new users set a password inline.

---

## 5. Onboarding

### PG-16 — Shipper Onboarding

`/onboarding/shipper` · Serves XF-13 · Sections: [SC-16.x](./phase-5-section-blueprints.md#pg-16--shipper-onboarding)

- **Purpose:** Activate a shipper organisation for posting.
- **Business objective:** Time to first posted load; credit risk control.
- **User objective:** Get the company ready to ship without a sales call.
- **Primary tasks:** "Tell Haulr about our company." "Set up how we'll pay." "Bring my team."
- **Required data:** Organisation profile, shipping profile, billing contacts, credit application or prepay method, invitations, facilities.
- **Permissions:** `shipper.admin`.
- **Device needs:** Desktop mostly; must be resumable on any device.
- **Loading states:** Progress restored from the server on load.
- **Empty states:** Not applicable.
- **Error states:** Credit declined → offer prepay without losing progress. Validation errors per step.
- **Success states:** Organisation active; user reaches PG-18 with a suggested next task.
- **Dependencies:** XS-02, XS-08, PG-32, credit provider.
- **Implementation notes:** Step state in the URL (`?step=`); each step saved on completion through a Server Action; the user can quote (XF-01) before finishing but not post.

### PG-17 — Carrier Onboarding

`/onboarding/carrier` · Serves XF-12 · Sections: [SC-17.x](./phase-5-section-blueprints.md#pg-17--carrier-onboarding)

- **Purpose:** Collect everything compliance needs to approve a carrier.
- **Business objective:** Safe network growth (BG-04); fast activation.
- **User objective:** Get approved once and start booking.
- **Primary tasks:** "Look up my authority." "Upload my insurance." "Sign the agreement." "Tell me where I stand."
- **Required data:** USDOT and MC numbers, registry record, company profile, equipment, lanes, insurance certificate, W-9, agreement acceptance, payout method, compliance status with reasons.
- **Permissions:** `carrier.admin`.
- **Device needs:** Phone: photograph documents and complete every step. Desktop: upload scans.
- **Loading states:** Registry lookup pending announced; documents show upload progress.
- **Empty states:** Not applicable.
- **Error states:** Authority inactive → explain why booking is not possible. Document rejected → reason and re-upload. Lookup service unavailable → allow manual entry for review.
- **Success states:** Submitted for review with an expected decision time; or approved automatically and routed to PG-19.
- **Dependencies:** XF-12, XS-08, registry and insurance providers, e-signature.
- **Implementation notes:** Resumable; uploads persist before submission; status updates arrive by notification (XS-03).

---

## 6. Role Dashboards

All dashboards follow XD rules in [Phase 2 §3](./phase-2-experience-maps.md#3-role-dashboards). Each part of a dashboard loads, fails and retries independently (SSB-1, SSB-3).

### PG-18 — Shipper Dashboard

`/shipper` · Serves XD-01 · Sections: [SC-18.x](./phase-5-section-blueprints.md#pg-18--shipper-dashboard)

- **Purpose:** Triage and overview for a shipper organisation.
- **Business objective:** Self-serve management (KPI-03); repeat posting.
- **User objective:** Know what needs attention today and act on it.
- **Primary tasks:** "What needs me right now?" "Is anything late?" "Start a new load." "How are we doing this week?" (finance role: "What's due?")
- **Required data:** Attention items (bids awaiting decision, uncovered near pickup, late ETAs, open exceptions, PODs pending, invoices due), active load counts by state, weekly service and spend metrics, onboarding completion.
- **Permissions:** `shipper.*`; finance sees invoice-related items only; admin sees all.
- **Device needs:** Desktop: triage many loads. Phone: check exceptions and approve a bid while away from the desk.
- **Loading states:** SSB-1 per part.
- **Empty states:** New organisation → guided next steps (quote, invite, add facility).
- **Error states:** SSB-3 per part.
- **Success states:** Acting on an item updates the attention set without a reload.
- **Dependencies:** XF-01, XF-03, XF-07, XF-08, XF-10.
- **Implementation notes:** Attention items computed by one backend endpoint; refresh on window focus and every 60 seconds.

### PG-19 — Carrier Dashboard

`/carrier` · Serves XD-02 · Sections: [SC-19.x](./phase-5-section-blueprints.md#pg-19--carrier-dashboard)

- **Purpose:** Daily operations view for a carrier.
- **Business objective:** Utilisation, repeat booking (KPI-08), assignment compliance (BR-09).
- **User objective:** Keep every truck loaded and every load assigned, and know when money arrives.
- **Primary tasks:** "Which loads still need a driver?" "Find the next load for this truck." "When am I getting paid?" "Is my account in good standing?"
- **Required data:** Loads needing assignment, active loads with status and exceptions, recommended loads by truck availability, pending settlements with expected dates, compliance standing and expiring documents.
- **Permissions:** `carrier.admin`, `carrier.dispatcher`; settlements amounts visible to admin, dates visible to dispatcher.
- **Device needs:** Phone: owner-operators run their business from here. Desktop: dispatchers with many trucks.
- **Loading states:** SSB-1.
- **Empty states:** No active loads → go to the load board; not yet approved → onboarding status and what is missing.
- **Error states:** SSB-3.
- **Success states:** Assignments and bookings reflect immediately.
- **Dependencies:** XF-02, XF-05, XF-11, XF-12.
- **Implementation notes:** Recommendations endpoint keyed by carrier; compliance standing from one endpoint shared with PG-17.

### PG-20 — Driver Home

`/driver` · Serves XD-03 · Sections: [SC-20.x](./phase-5-section-blueprints.md#pg-20--driver-home)

- **Purpose:** Take the driver to the current trip immediately.
- **Business objective:** Tracking compliance (KPI-05), stop-event completeness.
- **User objective:** "What do I do now?"
- **Primary tasks:** "Open my current trip." "What's next after this?" "Did my updates go through?"
- **Required data:** Current trip, upcoming trips, location consent state, offline queue state.
- **Permissions:** `carrier.driver`.
- **Device needs:** Phone only in practice: glanceable, operable with gloves, readable in sunlight.
- **Loading states:** Cached trip shown instantly while refreshing (SSB-2).
- **Empty states:** No trip → how to reach dispatch.
- **Error states:** Location permission off → how to turn it on and why; offline → queued events count.
- **Success states:** Queue drained confirmation.
- **Dependencies:** XF-06, PG-39.
- **Implementation notes:** Active trip cached for offline; if exactly one active trip exists, the page offers to go straight to it.

### PG-21 — Operations Dashboard

`/ops` · Serves XD-04 · Sections: [SC-21.x](./phase-5-section-blueprints.md#pg-21--operations-dashboard)

- **Purpose:** Network health and exception flow for operations.
- **Business objective:** Protect service (KPI-04), reduce touches (KPI-10).
- **User objective:** See where the network is at risk and take the next exception.
- **Primary tasks:** "How many exceptions and how severe?" "Which loads might not get covered?" "Give me the next one."
- **Required data:** Exception counts by type and severity, coverage risk for loads picking up within 24 hours, tracking compliance now, agent's claimed and resolved counts.
- **Permissions:** `internal.ops`, `internal.admin` (read).
- **Device needs:** Desktop, often left open all shift on a shared operations screen.
- **Loading states:** SSB-1; last refresh time always stated.
- **Empty states:** No exceptions → state it with last refresh time.
- **Error states:** Feed delayed → age stated (PP-03).
- **Success states:** Claiming an exception goes to PG-50 focused on it.
- **Dependencies:** XF-08, PG-50.
- **Implementation notes:** Refresh every 30 seconds; pauses when hidden.

### PG-22 — Compliance Dashboard

`/compliance` · Serves XD-05 · Sections: [SC-22.x](./phase-5-section-blueprints.md#pg-22--compliance-dashboard)

- **Purpose:** Vetting queue and monitoring changes.
- **Business objective:** Network safety (BG-04).
- **User objective:** Decide pending carriers within SLA and act on changes.
- **Primary tasks:** "Who is waiting for a decision?" "Whose insurance or authority changed?" "Which loads does that affect?"
- **Required data:** Vetting queue with age and SLA, monitoring events, affected booked loads.
- **Permissions:** `internal.compliance`.
- **Device needs:** Desktop.
- **Loading states:** SSB-1.
- **Empty states:** Queue clear.
- **Error states:** Registry source unavailable → last successful fetch time.
- **Success states:** Decision recorded; queue updates.
- **Dependencies:** XF-12, PG-51, BR-18.
- **Implementation notes:** Queue paginated by cursor; SLA computed server-side.

### PG-23 — Finance Operations Dashboard

`/finance` · Serves XD-06 · Sections: [SC-23.x](./phase-5-section-blueprints.md#pg-23--finance-operations-dashboard)

- **Purpose:** Cash-flow health and stuck items.
- **Business objective:** Days to pay (KPI-07), dispute rate (KPI-11).
- **User objective:** Clear every item past its SLA.
- **Primary tasks:** "Which PODs need verifying?" "What's disputed?" "What's overdue?" "Which payouts failed?"
- **Required data:** POD verification queue, disputes, receivables ageing, payout failures, quick pay volume and fees.
- **Permissions:** `internal.finance`.
- **Device needs:** Desktop.
- **Loading states:** SSB-1.
- **Empty states:** Each queue states when it is clear.
- **Error states:** Processor data delayed → "awaiting processor" with age.
- **Success states:** Verification or resolution updates the queues.
- **Dependencies:** XF-09, XF-10, XF-11, XS-06.
- **Implementation notes:** Totals come from the ledger endpoint, never summed client-side.

### PG-24 — Support Console

`/support-console` · Serves XD-07, XS-07 · Sections: [SC-24.x](./phase-5-section-blueprints.md#pg-24--support-console)

- **Purpose:** Work support tickets with full account context.
- **Business objective:** Resolution time; satisfaction.
- **User objective:** Understand the requester's situation without switching tools.
- **Primary tasks:** "Take the next ticket." "What's going on with this person's account and loads?" "Reply or hand this off."
- **Required data:** Ticket queue with SLA, ticket thread, requester's organisation, role, recent loads and exceptions.
- **Permissions:** `internal.support`.
- **Device needs:** Desktop.
- **Loading states:** SSB-1.
- **Empty states:** Queue clear.
- **Error states:** Requester not matched → lookup by email or load reference.
- **Success states:** Reply sent; ticket status updated.
- **Dependencies:** XS-07, XS-04, PG-40.
- **Implementation notes:** Selected ticket in the URL (`?ticket=`).

### PG-25 — Admin Dashboard

`/admin` · Serves XD-08 · Sections: [SC-25.x](./phase-5-section-blueprints.md#pg-25--admin-dashboard)

- **Purpose:** Platform administration.
- **Business objective:** Safe, audited control (Phase 1 §11).
- **User objective:** Handle access requests and configuration safely.
- **Primary tasks:** "Who is waiting for access?" "Change a platform setting safely." "What changed recently?"
- **Required data:** Pending approvals, configuration values with history, audit log.
- **Permissions:** `internal.admin`.
- **Device needs:** Desktop.
- **Loading states:** SSB-1.
- **Empty states:** Nothing pending.
- **Error states:** Change conflicts with active loads → impact preview explains it.
- **Success states:** Change applied and audited.
- **Dependencies:** PG-52, XS-02.
- **Implementation notes:** Every mutation requires a reason; re-authentication within 10 minutes.

---

## 7. Shipper Workspace

### PG-26 — Shipments

`/shipper/loads` · Serves XF-01, XF-07, XD-01 · Sections: [SC-26.x](./phase-5-section-blueprints.md#pg-26--shipments)

- **Purpose:** Find, follow and act on the organisation's loads, as a list or on a map.
- **Business objective:** Visibility (BG-02); fewer support contacts.
- **User objective:** Locate any load and know its state and freshness.
- **Primary tasks:** "Find load HL-… or PO …" "Show me everything in transit." "Which ones are late?" "Where are all my trucks right now?"
- **Required data:** Paginated loads with status, lane, schedule, carrier, ETA versus appointment, last position age, exception flag; positions for in-transit loads in view.
- **Permissions:** `shipper.member`, `shipper.admin`; organisation loads only.
- **Device needs:** Desktop: scan and filter hundreds of loads, switch between list and map. Phone: search one load and check it.
- **Loading states:** SSB-1; changing filters keeps the previous results until new ones arrive.
- **Empty states:** No loads → start a quote. Filters match nothing → clear or change filters.
- **Error states:** SSB-3; map failure → list remains fully usable (PP-08).
- **Success states:** Bulk actions (export, share tracking) confirmed (SSB-5).
- **Dependencies:** PG-40, PG-27, XF-07, map library (pending approval).
- **Implementation notes:** Filters, view and cursor in the URL (Phase 3 §10); positions subscribed only for loads in view; export generated server-side.

### PG-27 — Post a Load

`/shipper/loads/new` · Serves XF-01, XF-04 · Sections: [SC-27.x](./phase-5-section-blueprints.md#pg-27--post-a-load)

- **Purpose:** Quote and post a load (the core entity submission).
- **Business objective:** Quote-to-post conversion (KPI-01); time to coverage (KPI-02).
- **User objective:** Get a firm price and a live load in minutes.
- **Primary tasks:** "Price this shipment." "Post it to the network." "Offer it to my usual carriers." "Reuse last week's load."
- **Required data:** Facilities (PG-32), equipment and commodity enumerations, instant quote with validity, preferred carrier lists for the lane, organisation posting eligibility, draft.
- **Permissions:** `shipper.member`, `shipper.admin`; posting requires an active organisation (XF-13).
- **Device needs:** Desktop: fast keyboard entry, many loads in a row. Phone: post a simple single-stop load.
- **Loading states:** Quote pending is announced; quote validity counts down (BR-06).
- **Empty states:** Not applicable; prefilled from `?from=<loadId>` (duplicate) or `?lane=` (estimator).
- **Error states:** Per-field validation; quote expired → re-quote keeping all entries; unserviceable lane → custom quote request; posting blocked → onboarding link.
- **Success states:** Load posted; user lands on PG-40 with tender progress.
- **Dependencies:** XF-01, XF-04, XF-13, PG-32, PG-29.
- **Implementation notes:** Multi-step state in `useReducer` with draft persisted locally (PP-06) and to the server after the lane step; schema composed over the generated load DTO; posting through a Server Action with an idempotency key.

### PG-28 — Compare Bids

`/shipper/loads/[loadId]/bids` · Serves XF-03 · Sections: [SC-28.x](./phase-5-section-blueprints.md#pg-28--compare-bids)

- **Purpose:** Decide between carrier bids on one load.
- **Business objective:** Coverage at healthy margin (BG-05).
- **User objective:** Pick the best carrier at a fair price, quickly.
- **Primary tasks:** "Which bid is best value?" "Is this carrier reliable?" "Accept, decline or counter."
- **Required data:** Load lane and schedule, bids with amount, expiry, round, carrier scorecard and equipment, negotiation history.
- **Permissions:** `shipper.member`, `shipper.admin` of the load's organisation.
- **Device needs:** Desktop: compare several bids at once. Phone: accept one bid from a notification.
- **Loading states:** SSB-1; new bids arrive without losing the user's place and are announced politely.
- **Empty states:** No bids yet → how long the load has been posted and the tender progress.
- **Error states:** Bid expired or withdrawn between view and action → explained, other bids remain; load already booked → go to PG-40.
- **Success states:** Accepted → load moves to rate confirmation; all other bids closed (BR-02).
- **Dependencies:** XF-03, PG-03, PG-40.
- **Implementation notes:** Refetch bids every 20 seconds while open; accept uses an idempotent Server Action.

### PG-29 — Preferred Carriers

`/shipper/carriers` · Serves XF-04 · Sections: [SC-29.x](./phase-5-section-blueprints.md#pg-29--preferred-carriers)

- **Purpose:** Maintain the organisation's preferred carriers and per-lane tender order (the Favorites page for shippers).
- **Business objective:** Loyalty and repeat volume; controlled tendering.
- **User objective:** Make sure trusted carriers get the earliest offer on their lanes.
- **Primary tasks:** "Add a carrier I trust." "Set who gets offered this lane, in what order." "Remove a carrier."
- **Required data:** Preferred carriers with scorecard and eligibility, lane rules with ordered carriers and acceptance window.
- **Permissions:** Read `shipper.member`; edit `shipper.admin`.
- **Device needs:** Desktop.
- **Loading states:** SSB-1.
- **Empty states:** None added → how to add from PG-03 or from a delivered load.
- **Error states:** Carrier becomes ineligible → flagged and skipped in tendering (BR-18).
- **Success states:** Rule saved (SSB-5).
- **Dependencies:** PG-03, XF-04.
- **Implementation notes:** Reordering must be operable by keyboard (IC-40).

### PG-30 — Invoices

`/shipper/invoices` · Serves XF-10 · Sections: [SC-30.x](./phase-5-section-blueprints.md#pg-30--invoices)

- **Purpose:** Manage the organisation's payables to Haulr.
- **Business objective:** Collection speed; low dispute rate (KPI-11).
- **User objective:** Pay what's due, on time, with evidence.
- **Primary tasks:** "What's due this week?" "Pay these invoices together." "Find the invoice for load HL-…" "Download statements."
- **Required data:** Invoices with status, amount, due date, load reference; outstanding and overdue totals; payment methods.
- **Permissions:** `shipper.finance`, `shipper.admin`.
- **Device needs:** Desktop.
- **Loading states:** SSB-1.
- **Empty states:** None yet → when invoices are issued (BR-14).
- **Error states:** Payment failures per invoice explained; partial success in a batch payment is reported per invoice.
- **Success states:** Paid invoices update; remittance available.
- **Dependencies:** PG-31, XF-10, XS-08.
- **Implementation notes:** Batch pay through one idempotent Server Action returning per-invoice outcomes; totals from the server.

### PG-31 — Invoice Detail and Pay

`/shipper/invoices/[invoiceId]` · Serves XF-10, XS-06 · Sections: [SC-31.x](./phase-5-section-blueprints.md#pg-31--invoice-detail-and-pay)

- **Purpose:** Review one invoice with its evidence and pay or dispute it (the Payment page).
- **Business objective:** Accurate collection.
- **User objective:** Confirm the charges match the agreement and settle them.
- **Primary tasks:** "Do these charges match what we agreed?" "Show me the POD." "Pay it." "Dispute this line."
- **Required data:** Invoice lines (linehaul, accessorials with evidence), agreed rate, POD, terms, payments applied, dispute state, payment methods.
- **Permissions:** `shipper.finance`, `shipper.admin`.
- **Device needs:** Desktop mostly; phone to approve a single payment.
- **Loading states:** SSB-1.
- **Empty states:** Not applicable.
- **Error states:** Payment declined → reason and alternatives; method needs verification → resume XS-08.
- **Success states:** Payment confirmed with reference and remittance; dispute filed with a claim reference.
- **Dependencies:** XS-08, XS-06, PG-43.
- **Implementation notes:** Payment through the processor's tokenised flow (A6); confirmation step states the amount, method and date (PP-01, PP-05).

### PG-32 — Locations

`/shipper/locations` · Serves XF-01, XS-11 · Sections: [SC-32.x](./phase-5-section-blueprints.md#pg-32--locations)

- **Purpose:** Maintain the organisation's pickup and delivery facilities.
- **Business objective:** Faster, more accurate posting; better driver instructions.
- **User objective:** Enter a facility once and reuse it.
- **Primary tasks:** "Add our warehouse." "Update receiving hours." "Fix the dock instructions drivers keep missing."
- **Required data:** Facilities with address, geocode, hours, appointment rules, instructions, contacts.
- **Permissions:** `shipper.member`, `shipper.admin`.
- **Device needs:** Desktop.
- **Loading states:** SSB-1.
- **Empty states:** None → why to add facilities.
- **Error states:** Address not verifiable → allow a pin adjustment with confirmation.
- **Success states:** Saved (SSB-5).
- **Dependencies:** Geocoding; PG-27.
- **Implementation notes:** Geocode verified server-side.

---

## 8. Carrier Workspace

### PG-33 — Load Board

`/carrier/load-board` · Serves XF-02, XF-03, XS-09 · Sections: [SC-33.x](./phase-5-section-blueprints.md#pg-33--load-board)

- **Purpose:** Search bookable loads (the Search page and the carrier's List/Map view).
- **Business objective:** Coverage speed (KPI-02); self-serve booking (KPI-03).
- **User objective:** Find the right paying load for a specific truck fast.
- **Primary tasks:** "Loads within 50 miles of Joliet going to Texas tomorrow." "Which pays best per mile after deadhead?" "Book it." "Tell me when more like this appear."
- **Required data:** Posted loads matching the search with lane, schedule, equipment, weight, carrier pay, rate per mile, deadhead, shipper score, instant-book or bid mode; eligibility state.
- **Permissions:** `carrier.dispatcher`, `carrier.admin`; ineligible carriers can search but not book (BR-03).
- **Device needs:** Phone: owner-operators search from the cab while parked. Desktop: dispatchers search for many trucks.
- **Loading states:** Keep previous results while a new search runs; announce the result count.
- **Empty states:** No matches → widen radius or dates, or save as an alert.
- **Error states:** Search unavailable → retry; a load in the results is booked by someone else → marked as gone when opened.
- **Success states:** Search saved; load booked (via PG-34).
- **Dependencies:** Search index, PG-34, PG-36, PG-40.
- **Implementation notes:** Search parameters in the URL; results refresh every 30 seconds while visible; list and map views share one query.

### PG-34 — Book Load

`/carrier/load-board/[loadId]/book` · Serves XF-02 · Sections: [SC-34.x](./phase-5-section-blueprints.md#pg-34--book-load)

- **Purpose:** Commit to a load and accept its rate confirmation (the Domain Transaction page).
- **Business objective:** Binding bookings (BR-04).
- **User objective:** Lock in the load and know exactly what was agreed.
- **Primary tasks:** "Book this load at this rate." "Check the terms before I commit." "Sign the rate confirmation."
- **Required data:** Load terms (stops, schedule, requirements, accessorial terms), carrier pay, rate confirmation document and version, eligibility check result.
- **Permissions:** `carrier.dispatcher`, `carrier.admin` of an eligible carrier.
- **Device needs:** Phone and desktop: complete booking and signing in one sitting.
- **Loading states:** Eligibility and availability checked server-side before rendering.
- **Empty states:** Not applicable.
- **Error states:** Load no longer available → offer similar loads. Ineligible → exact reason and fix link. Signature fails → retry within the grace period (XF-02).
- **Success states:** Booked; rate confirmation stored; user continues to driver assignment (XF-05).
- **Dependencies:** XF-02, XF-05, e-signature.
- **Implementation notes:** Booking through a Server Action with a `nanoid` idempotency key; conflict response (409) handled as "load taken".

### PG-35 — My Loads (carrier)

`/carrier/loads` · Serves XF-05, XF-06, XF-07 · Sections: [SC-35.x](./phase-5-section-blueprints.md#pg-35--my-loads-carrier)

- **Purpose:** Manage the carrier's booked, active and past loads.
- **Business objective:** Assignment compliance (BR-09); tracking compliance.
- **User objective:** Keep every load assigned, tracked and moving.
- **Primary tasks:** "Which loads still need a driver?" "Where is each of my trucks?" "Find last month's load for this shipper."
- **Required data:** Loads with status, assignment, next stop, tracking source and freshness, exceptions, pay.
- **Permissions:** `carrier.dispatcher`, `carrier.admin`.
- **Device needs:** Desktop: many loads. Phone: the owner-operator's few loads.
- **Loading states:** SSB-1.
- **Empty states:** No loads → load board.
- **Error states:** SSB-3.
- **Success states:** Assignment confirmed.
- **Dependencies:** PG-40, XF-05, PG-37.
- **Implementation notes:** Same collection pattern and URL parameters as PG-26.

### PG-36 — Saved Loads and Searches

`/carrier/saved` · Serves XS-09 · Sections: [SC-36.x](./phase-5-section-blueprints.md#pg-36--saved-loads-and-searches)

- **Purpose:** Manage watched loads and saved searches with alerts (the Saved Loads page).
- **Business objective:** Engagement and repeat booking (KPI-08).
- **User objective:** Stop searching the same lanes by hand.
- **Primary tasks:** "Show me loads I was watching." "Change how often I'm alerted." "Pause alerts while I'm on vacation."
- **Required data:** Watched loads with current status, saved searches with alert settings and new-match counts.
- **Permissions:** `carrier.dispatcher`, `carrier.admin`; searches are personal.
- **Device needs:** Phone and desktop.
- **Loading states:** SSB-1.
- **Empty states:** Nothing saved → how to save from PG-33.
- **Error states:** Watched load no longer available → marked as gone.
- **Success states:** Alert settings saved.
- **Dependencies:** PG-33, XS-03.
- **Implementation notes:** Opening a saved search navigates to PG-33 with its parameters.

### PG-37 — Fleet

`/carrier/fleet` · Serves XF-05, XS-02 · Sections: [SC-37.x](./phase-5-section-blueprints.md#pg-37--fleet)

- **Purpose:** Manage trucks, trailers and drivers.
- **Business objective:** Correct assignment and eligibility.
- **User objective:** Keep the fleet record accurate so assignment is fast.
- **Primary tasks:** "Add a truck." "Invite a new driver." "Who is available tomorrow?"
- **Required data:** Vehicles (type, equipment, identifiers, ELD link), drivers (status, contact, invitation state, current assignment).
- **Permissions:** Read `carrier.dispatcher`; edit `carrier.admin`, and dispatchers for drivers (Phase 3 §5).
- **Device needs:** Desktop mostly; phone for owner-operators.
- **Loading states:** SSB-1.
- **Empty states:** No vehicles or drivers → why they are needed for dispatch.
- **Error states:** Invitation failed → resend.
- **Success states:** Saved; invitation sent.
- **Dependencies:** XS-02, XF-05.
- **Implementation notes:** ELD connection handled by a backend integration; the page reports its state only.

### PG-38 — Settlements

`/carrier/settlements` · Serves XF-11 · Sections: [SC-38.x](./phase-5-section-blueprints.md#pg-38--settlements)

- **Purpose:** Track carrier pay and request quick pay (the carrier Payment page).
- **Business objective:** Carrier trust (BG-03); quick pay revenue.
- **User objective:** Know what's coming, when, and get it sooner if needed.
- **Primary tasks:** "What am I owed and when?" "Get paid today on this load." "Why was this deducted?" "Download remittances."
- **Required data:** Settlements with gross, accessorials, deductions, net, expected date, status, quick pay eligibility and fee.
- **Permissions:** Amounts `carrier.admin`; dates `carrier.dispatcher`.
- **Device needs:** Phone and desktop.
- **Loading states:** SSB-1.
- **Empty states:** None yet → when settlements appear.
- **Error states:** Payout failed → reason and route to PG-49.
- **Success states:** Quick pay requested with net amount and arrival time stated.
- **Dependencies:** XF-11, XS-08, XS-06.
- **Implementation notes:** Quick pay confirmation must state fee and net before commitment (PP-01).

---

## 9. Driver

### PG-39 — Driver Trip

`/driver/trips/[loadId]` · Serves XF-06, XF-09 · Sections: [SC-39.x](./phase-5-section-blueprints.md#pg-39--driver-trip)

- **Purpose:** Run the stop workflow for one trip.
- **Business objective:** Accurate timestamps (detention, KPI-04), POD speed (KPI-06), tracking (KPI-05).
- **User objective:** Know the next stop and report each step with minimal effort.
- **Primary tasks:** "Where am I going and when?" "I've arrived." "I'm loaded, leaving." "Here's the signed POD." "I'm delayed." "Call dispatch."
- **Required data:** Stops with address, appointment, references, instructions, contacts; current step; allowed next events; offline queue; location consent.
- **Permissions:** `carrier.driver` assigned to the load.
- **Device needs:** Phone only: single-handed, gloves, glare, intermittent signal, short attention.
- **Loading states:** Cached trip available immediately; refresh is silent.
- **Empty states:** Not applicable.
- **Error states:** Offline → events queued with count; upload failed → retried automatically; permission revoked → re-grant guidance; wrong event → undo within 5 minutes.
- **Success states:** Each event acknowledged immediately (optimistic) and confirmed once synced.
- **Dependencies:** XF-06, XF-09, geolocation, camera.
- **Implementation notes:** Offline event queue persisted in IndexedDB through browser-native APIs (no new dependency unless approved); events carry device time and a `nanoid` event ID for de-duplication; location collected through the browser only while the page is open (A8).

---

## 10. Shared Records and Utilities

### PG-40 — Load Details

`/loads/[loadId]` · Serves XF-01 … XF-11, XS-04, XS-05, XS-06 · Sections: [SC-40.x](./phase-5-section-blueprints.md#pg-40--load-details)

- **Purpose:** The single record of a load for every party (the Core Entity Details page; IA-P1).
- **Business objective:** One source of truth; fewer calls.
- **User objective:** Understand the load's state and do the next thing their role allows.
- **Primary tasks:** Shipper: "Is it covered, where is it, is it late? Share tracking. Cancel." Carrier: "Assign a driver, update status, upload documents, check pay." Operations: "Fix what's wrong." Everyone: "Talk about this load."
- **Required data:** Load (lane, stops, schedule, equipment, commodity, references), status and timeline, role-shaped money (BR-05), tender or bid state, assignment, positions and ETA, exceptions, documents, accessorials, thread, invoice or settlement link, claims, ratings.
- **Permissions:** Parties and internal roles (Phase 3 §5.2); every action gated by role and state (Phase 2 §5).
- **Device needs:** Desktop: full management. Phone: check status, share tracking, approve an accessorial, message.
- **Loading states:** SSB-1 per part; live parts refresh on their own interval.
- **Empty states:** Each part states its own emptiness (no documents yet, no position yet).
- **Error states:** Not a party → PG-53. Action no longer legal (state moved) → explain the new state and refresh.
- **Success states:** Each state transition confirmed and reflected in the timeline.
- **Dependencies:** Nearly every flow; see Phase 2 §8.
- **Implementation notes:** Server component fetches the role-shaped load; offered actions derive from one function mapping (role, state) to legal transitions, shared with PG-35 and PG-26; the `load` query key is invalidated by all load mutations.

### PG-41 — Messages

`/messages` · Serves XS-04 · Sections: [SC-41.x](./phase-5-section-blueprints.md#pg-41--messages)

- **Purpose:** All load and ticket conversations in one place.
- **Business objective:** Keep communication on the record (BR-19).
- **User objective:** Reply fast and know what's unread.
- **Primary tasks:** "What's new?" "Reply to the carrier on HL-…" "Find what the shipper said about the dock."
- **Required data:** Threads with load or ticket reference, participants, unread counts, messages, attachments, read receipts.
- **Permissions:** Participants only; internal roles may join load threads.
- **Device needs:** Phone and desktop equally.
- **Loading states:** SSB-1; new messages arrive live.
- **Empty states:** No conversations → they start on loads.
- **Error states:** Failed send kept with retry (XS-04).
- **Success states:** Sent and delivered states.
- **Dependencies:** XS-04, PG-40.
- **Implementation notes:** Selected thread in `?thread=`; polling or server-sent events chosen in Phase 7 §13.

### PG-42 — Notifications

`/notifications` · Serves XS-03 · Sections: [SC-42.x](./phase-5-section-blueprints.md#pg-42--notifications)

- **Purpose:** The complete history of what the user was told.
- **Business objective:** Timely action on events.
- **User objective:** Catch up and jump to what matters.
- **Primary tasks:** "What happened while I was away?" "Mark all read." "Change what I get notified about."
- **Required data:** Notifications with type, subject reference, time, read state.
- **Permissions:** Own notifications.
- **Device needs:** Phone and desktop.
- **Loading states:** SSB-1.
- **Empty states:** None → what will arrive here.
- **Error states:** SSB-3.
- **Success states:** Read state updated.
- **Dependencies:** XS-03, PG-47.
- **Implementation notes:** Unread count shared through one query key used everywhere.

### PG-43 — Documents

`/documents` · Serves XS-12, XF-09 · Sections: [SC-43.x](./phase-5-section-blueprints.md#pg-43--documents)

- **Purpose:** The organisation's document vault.
- **Business objective:** Audit readiness; dispute evidence.
- **User objective:** Find, preview and share any document.
- **Primary tasks:** "Find the POD for HL-…" "Download last month's rate confirmations." "Replace our insurance certificate."
- **Required data:** Documents with type, load, party, version, upload time, expiry.
- **Permissions:** Organisation members except drivers; per-document access checked server-side.
- **Device needs:** Desktop mostly; phone to find a single document.
- **Loading states:** SSB-1.
- **Empty states:** None → when documents arrive.
- **Error states:** Download failure → retry.
- **Success states:** Upload or replacement confirmed with version.
- **Dependencies:** XS-12, PG-40.
- **Implementation notes:** Downloads through short-lived signed URLs from the backend.

### PG-44 — Claims

`/claims` · Serves XS-06 · Sections: [SC-44.x](./phase-5-section-blueprints.md#pg-44--claims)

- **Purpose:** Track claims and disputes.
- **Business objective:** Fair, fast resolution; financial accuracy.
- **User objective:** Know the status of every claim and what's needed.
- **Primary tasks:** "What's the status of my damage claim?" "Which claims need my response?" "File a new claim."
- **Required data:** Claims with type, load, amount, status, whose turn, deadline.
- **Permissions:** Per Phase 3 §3.3.
- **Device needs:** Desktop mostly.
- **Loading states:** SSB-1.
- **Empty states:** None → how to file from a load.
- **Error states:** SSB-3.
- **Success states:** Filed claim appears with reference.
- **Dependencies:** PG-45, XS-06.
- **Implementation notes:** Same collection pattern as PG-26.

### PG-45 — Claim Detail

`/claims/new`, `/claims/[claimId]` · Serves XS-06 · Sections: [SC-45.x](./phase-5-section-blueprints.md#pg-45--claim-detail)

- **Purpose:** File a claim and carry it to resolution.
- **Business objective:** Evidence-based resolution (PP-09).
- **User objective:** Make the case once, completely, and see progress.
- **Primary tasks:** "File a shortage claim on HL-…" "Respond with our evidence." "Accept the settlement."
- **Required data:** Claim type, load, amount, description, evidence documents, responses, status history, proposed resolution.
- **Permissions:** Parties to the load and internal finance.
- **Device needs:** Desktop mostly; phone to add photos.
- **Loading states:** SSB-1.
- **Empty states:** Not applicable.
- **Error states:** Outside the filing window → explained (BR-17). Missing evidence → exact statement of what is required.
- **Success states:** Filed with reference; resolution accepted and applied.
- **Dependencies:** XS-06, PG-40, PG-31, PG-38.
- **Implementation notes:** `/claims/new?load=` prefills the load; draft persisted (PP-06).

### PG-46 — Profile

`/profile` · Serves XS-11 · Sections: [SC-46.x](./phase-5-section-blueprints.md#pg-46--profile)

- **Purpose:** The user's personal details.
- **Business objective:** Accurate contact data.
- **User objective:** Keep personal details correct.
- **Primary tasks:** "Update my phone number." "Change my photo."
- **Required data:** Name, email, phone, avatar, role, organisation (read-only).
- **Permissions:** Own profile.
- **Device needs:** Any.
- **Loading states:** SSB-1.
- **Empty states:** Not applicable.
- **Error states:** Validation per field.
- **Success states:** Saved (SSB-5).
- **Dependencies:** Backend `users` module (`GET /users/me` exists).
- **Implementation notes:** Email change requires verification.

### PG-47 — Settings

`/settings` · Serves XS-03, XS-11 · Sections: [SC-47.x](./phase-5-section-blueprints.md#pg-47--settings)

- **Purpose:** Security and notification preferences.
- **Business objective:** Account security; relevant notifications.
- **User objective:** Control access and noise.
- **Primary tasks:** "Change my password." "Turn on two-factor." "Sign out my other devices." "Stop texting me about bids."
- **Required data:** MFA state, sessions, notification preferences by event and channel, quiet hours.
- **Permissions:** Own settings.
- **Device needs:** Any.
- **Loading states:** SSB-1.
- **Empty states:** Not applicable.
- **Error states:** Re-authentication required for sensitive changes (XS-11).
- **Success states:** Saved; security notification sent for sensitive changes.
- **Dependencies:** XS-03, XS-11.
- **Implementation notes:** Critical notification events cannot be fully disabled (XS-03).

### PG-48 — Organization and Team

`/settings/organization` · Serves XS-02 · Sections: [SC-48.x](./phase-5-section-blueprints.md#pg-48--organization-and-team)

- **Purpose:** Organisation profile and membership.
- **Business objective:** Correct access (Phase 3 §5).
- **User objective:** Give the right people the right access.
- **Primary tasks:** "Invite a colleague." "Change their role." "Remove someone who left." "Update company details."
- **Required data:** Organisation details, members with roles and status, pending invitations.
- **Permissions:** Edit by admins; read by members.
- **Device needs:** Desktop mostly.
- **Loading states:** SSB-1.
- **Empty states:** Only the admin → invite guidance.
- **Error states:** Last admin removal blocked (XS-02).
- **Success states:** Invitation sent; role changed.
- **Dependencies:** XS-02, PG-15.
- **Implementation notes:** Role changes through Server Actions; audited.

### PG-49 — Payment and Payout Methods

`/settings/billing` · Serves XS-08 · Sections: [SC-49.x](./phase-5-section-blueprints.md#pg-49--payment-and-payout-methods)

- **Purpose:** Manage how the organisation pays or is paid.
- **Business objective:** Successful money movement.
- **User objective:** Set up a verified default method securely.
- **Primary tasks:** "Add our bank account." "Finish verifying the micro-deposits." "Make this the default." "Remove the old card."
- **Required data:** Methods with type, masked identifier, verification state, default flag; terms and credit limit (shipper).
- **Permissions:** `shipper.admin`, `shipper.finance`, `carrier.admin`; re-authentication for changes.
- **Device needs:** Desktop mostly.
- **Loading states:** SSB-1; processor entry loads separately.
- **Empty states:** None → why a method is required.
- **Error states:** Verification failed → retry or other method.
- **Success states:** Method verified and default set; all admins notified (XS-08).
- **Dependencies:** Payments processor, XS-08.
- **Implementation notes:** Raw account data never touches Haulr servers (A6).

### PG-04 — Shipper Public Profile

`/shippers/[shipperId]` · Serves XS-05, XF-02 · Sections: [SC-04.x](./phase-5-section-blueprints.md#pg-04--shipper-public-profile)

- **Purpose:** Show carriers a shipper's reputation.
- **Business objective:** Trust on the carrier side.
- **User objective:** "Is this shipper good to work with?"
- **Primary tasks:** "How long do they keep trucks at the dock?" "Do they pay accessorials fairly?"
- **Required data:** Shipper name, years on Haulr, facility dwell times, carrier ratings, volume band.
- **Permissions:** `carrier.dispatcher`, `carrier.admin`, internal roles.
- **Device needs:** Phone and desktop.
- **Loading states:** SSB-1.
- **Empty states:** Not enough data → say so.
- **Error states:** Unknown → PG-53.
- **Success states:** None.
- **Dependencies:** XS-05.
- **Implementation notes:** Aggregates only; no shipper pricing (BR-05).

---

## 11. Internal Tools

### PG-50 — Exception Queue

`/ops/exceptions` · Serves XF-08 · Sections: [SC-50.x](./phase-5-section-blueprints.md#pg-50--exception-queue)

- **Purpose:** Work exceptions to resolution.
- **Business objective:** Service protection; KPI-10.
- **User objective:** Resolve the riskiest exceptions quickly without colliding with colleagues.
- **Primary tasks:** "Give me the next riskiest exception." "What happened on this load?" "Re-tender it." "Resolve and note why."
- **Required data:** Exceptions with type, severity, risk score, load, owner, age; selected exception's evidence and load context; resolution reason codes.
- **Permissions:** `internal.ops` (all types); compliance and finance for their own types.
- **Device needs:** Desktop; keyboard-driven for speed.
- **Loading states:** SSB-1; queue refresh every 15 seconds.
- **Empty states:** Queue clear with last refresh time.
- **Error states:** Already claimed by someone else → owner named; action failed → exception stays claimed.
- **Success states:** Resolved with reason; next exception offered.
- **Dependencies:** XF-08, PG-40.
- **Implementation notes:** Claim uses optimistic locking with a version field; selected exception in `?exception=`.

### PG-51 — Carrier Vetting Review

`/compliance/carriers/[carrierId]` · Serves XF-12 · Sections: [SC-51.x](./phase-5-section-blueprints.md#pg-51--carrier-vetting-review)

- **Purpose:** Decide on a carrier with all evidence in one place.
- **Business objective:** Safety and fraud prevention (BG-04).
- **User objective:** Make a defensible decision quickly.
- **Primary tasks:** "Is this authority genuine and active?" "Is the insurance valid?" "Any fraud signals?" "Approve, ask for more, or reject."
- **Required data:** Registry record, insurance verification, documents, identity checks, fraud signals, history of decisions, booked loads.
- **Permissions:** `internal.compliance`.
- **Device needs:** Desktop.
- **Loading states:** SSB-1.
- **Empty states:** Not applicable.
- **Error states:** Source unavailable → decision can be deferred with reason.
- **Success states:** Decision recorded with reasons; carrier notified.
- **Dependencies:** XF-12, BR-18.
- **Implementation notes:** Decisions require a reason code and note; audited.

### PG-52 — Accounts

`/admin/accounts` · Serves XD-08, XS-02 · Sections: [SC-52.x](./phase-5-section-blueprints.md#pg-52--accounts)

- **Purpose:** Administer organisations and users.
- **Business objective:** Controlled access.
- **User objective:** Find any account and change its access safely.
- **Primary tasks:** "Find this user." "Suspend this organisation." "Reset MFA for a locked-out admin."
- **Required data:** Organisations and users with status, roles, last activity.
- **Permissions:** `internal.admin`.
- **Device needs:** Desktop.
- **Loading states:** SSB-1.
- **Empty states:** No search results.
- **Error states:** Change conflicts with active loads → impact explained.
- **Success states:** Change applied and audited.
- **Dependencies:** Backend `users` module (CRUD exists), extended with organisations.
- **Implementation notes:** Reason required; re-authentication.

---

## 12. System Pages

### PG-53 — Not Found

Mechanism in [Phase 3 §3.5](./phase-3-information-architecture.md#35-system-pages) · Sections: [SC-53.x](./phase-5-section-blueprints.md#pg-53--not-found)

- **Purpose:** Recover from a missing or inaccessible page or record.
- **Business objective:** Keep users in the product.
- **User objective:** Get to where they meant to go.
- **Primary tasks:** "Take me somewhere useful." "Search for the load."
- **Required data:** Whether the user is signed in; their role root.
- **Permissions:** Everyone.
- **Device needs:** Any.
- **Loading states:** None.
- **Empty states:** Not applicable.
- **Error states:** Not applicable.
- **Success states:** User navigates on.
- **Dependencies:** Phase 3 §14.
- **Implementation notes:** Returns HTTP 404; never reveals whether a record exists.

### PG-54 — Server Error

Mechanism in Phase 3 §3.5 · Sections: [SC-54.x](./phase-5-section-blueprints.md#pg-54--server-error)

- **Purpose:** Recover from an unexpected failure.
- **Business objective:** Trust; diagnosability.
- **User objective:** Try again or get help.
- **Primary tasks:** "Try again." "Tell support what happened."
- **Required data:** Error digest (reference for support).
- **Permissions:** Everyone.
- **Device needs:** Any.
- **Loading states:** None.
- **Empty states:** Not applicable.
- **Error states:** Not applicable.
- **Success states:** Retry succeeds.
- **Dependencies:** PG-08.
- **Implementation notes:** Segment `error.tsx` offers `reset()`; `global-error.tsx` for root failures; the digest is passed to PG-08 as context; no stack traces; logging belongs in services, not components (host rule 6).

### PG-55 — Access Denied

Mechanism in Phase 3 §3.5 · Sections: [SC-55.x](./phase-5-section-blueprints.md#pg-55--access-denied)

- **Purpose:** Explain that the route is outside the user's role.
- **Business objective:** Clear permissions; fewer tickets.
- **User objective:** Understand why and where to go.
- **Primary tasks:** "Why can't I see this?" "Who can give me access?"
- **Required data:** User's role and role root; organisation admins' names.
- **Permissions:** Authenticated.
- **Device needs:** Any.
- **Loading states:** None.
- **Empty states:** Not applicable.
- **Error states:** Not applicable.
- **Success states:** User returns to their role root.
- **Dependencies:** Phase 3 §5.
- **Implementation notes:** HTTP 403 via `forbidden()` (requires the `authInterrupts` flag; confirm availability in Next.js 16 during Sprint 1).

---

## 13. Page-to-Experience Traceability

| Page | Experiences | Page | Experiences |
| --- | --- | --- | --- |
| PG-01 | XS-10, XS-01 | PG-29 | XF-04 |
| PG-02 | XF-07 | PG-30 | XF-10 |
| PG-03 | XF-04, XS-05 | PG-31 | XF-10, XS-06 |
| PG-04 | XS-05, XF-02 | PG-32 | XF-01, XS-11 |
| PG-05 | XS-10, XF-01 | PG-33 | XF-02, XF-03, XS-09 |
| PG-06, PG-07, PG-08 | XS-07 | PG-34 | XF-02 |
| PG-09 | XS-01 | PG-35 | XF-05, XF-06, XF-07 |
| PG-10 … PG-14 | XS-01 | PG-36 | XS-09 |
| PG-15 | XS-02 | PG-37 | XF-05, XS-02 |
| PG-16 | XF-13 | PG-38 | XF-11 |
| PG-17 | XF-12 | PG-39 | XF-06, XF-09 |
| PG-18 | XD-01 | PG-40 | XF-01 … XF-11, XS-04 … XS-06 |
| PG-19 | XD-02 | PG-41 | XS-04 |
| PG-20 | XD-03 | PG-42 | XS-03 |
| PG-21 | XD-04 | PG-43 | XS-12, XF-09 |
| PG-22 | XD-05 | PG-44, PG-45 | XS-06 |
| PG-23 | XD-06 | PG-46 | XS-11 |
| PG-24 | XD-07, XS-07 | PG-47 | XS-03, XS-11 |
| PG-25 | XD-08 | PG-48 | XS-02 |
| PG-26 | XF-01, XF-07, XD-01 | PG-49 | XS-08 |
| PG-27 | XF-01, XF-04 | PG-50 | XF-08 |
| PG-28 | XF-03 | PG-51 | XF-12 |
| PG-52 | XD-08, XS-02 | PG-53 … PG-55 | Phase 3 §14 |

**Template page mapping** (master prompt examples → Haulr pages): Home → PG-01 · Search → PG-33 · Core Entity Details → PG-40 · List/Map View → PG-26, PG-33 · Saved → PG-36 · Favorites → PG-29 · Compare → PG-28 · Role Profile → PG-03, PG-04 · Role Dashboards → PG-18 … PG-25 · Messages → PG-41 · Notifications → PG-42 · Settings → PG-47 … PG-49 · Profile → PG-46 · Domain Tool → PG-05 · Core Entity Submission → PG-27 · Authentication → PG-10 … PG-15 · Domain Transaction → PG-34 · Payment → PG-31, PG-38 · Help Center → PG-06 … PG-08 · 404 → PG-53 · 500 → PG-54.

---

Previous: [Phase 3 — Information Architecture](./phase-3-information-architecture.md) · Next: [Phase 5 — Section Blueprints](./phase-5-section-blueprints.md)
