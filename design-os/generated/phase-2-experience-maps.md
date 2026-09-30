# Phase 2 — Experience Maps

`Haulr Design OS` · `Version 1.0.0` · `2026-09-30` · Previous: [Phase 1 — Product Vision](./phase-1-product-vision.md) · Next: [Phase 3 — Information Architecture](./phase-3-information-architecture.md)

Experiences come before pages. Each map below describes one journey end to end: what the user wants, what the system does, how the journey fails and how it recovers. Pages in [Phase 4](./phase-4-page-blueprints.md) exist to serve these journeys, and every page cites the experiences it serves.

Experience IDs: `XF-` primary flows, `XD-` role dashboards, `XS-` supporting flows. Personas (`PR-`), business rules (`BR-`) and principles (`PP-`) come from [Phase 1](./phase-1-product-vision.md).

## Table of Contents

1. [How to Read a Map](#1-how-to-read-a-map)
2. [Primary Flows](#2-primary-flows)
3. [Role Dashboards](#3-role-dashboards)
4. [Supporting Flows](#4-supporting-flows)
5. [Load State Machine](#5-load-state-machine)
6. [Bid State Machine](#6-bid-state-machine)
7. [Cross-Experience Rules](#7-cross-experience-rules)
8. [Traceability](#8-traceability)

---

## 1. How to Read a Map

Every map has the same twelve fields: **User intent**, **Trigger**, **Entry points**, **Journey**, **Decision points**, **Emotional state**, **Failure paths**, **Recovery paths**, **System behavior**, **Completion criteria** and **Dependencies**. Entry points name pages by their Phase 4 ID (`PG-`). Journeys are numbered steps in the user's own terms.

---

## 2. Primary Flows

### XF-01 — Get a quote and post a load

- **Personas:** PR-01, PR-04
- **User intent:** "I need this freight moved on these dates, for a price I can trust."
- **Trigger:** An order is ready to ship, or a planner is checking a price for a future shipment.
- **Entry points:** PG-18 Shipper Dashboard, PG-26 Shipments, PG-05 Lane Rate Estimator (carries the lane over), PG-01 Home (after sign-in), duplicating an earlier load from PG-40.
- **Journey:**
  1. The shipper states origin, destination, pickup and delivery windows, equipment, and commodity with weight.
  2. Haulr returns an instant quote with a confidence range and states how long it is valid (BR-06).
  3. The shipper adds references, stop instructions, accessorial expectations and the tender strategy (open market, preferred carriers, or both; BR-08).
  4. The shipper reviews the full terms and posts.
  5. Haulr confirms the load is live and shows its tender progress.
- **Decision points:** accept the instant quote or request a custom quote from operations; open market or preferred-carrier waterfall; single or multiple stops; save as a template.
- **Emotional state:** Pressured by a customer deadline, uncertain about price; relief once the quote is firm and the load is live.
- **Failure paths:** address not resolvable; pickup window already past; lane not serviceable; quote expires before posting; payment terms not yet approved for the organisation; the connection drops mid-entry.
- **Recovery paths:** suggest matching known locations (PG-32); propose the next feasible window; offer a custom quote request; re-quote in one step while keeping every entry; route to shipper onboarding (XF-13); restore the draft from local persistence (PP-06).
- **System behavior:** validates each step against the load schema; prices through the quoting service; holds the quote for 30 minutes; persists the draft locally and to the server; on post, starts the tender waterfall or open-market listing and emits `load.posted`.
- **Completion criteria:** load in `Posted` state with a valid quote, tender strategy recorded and confirmation shown.
- **Dependencies:** quoting service, geocoding, shipper credit approval (XF-13), locations (XS-11), BR-01, BR-06, BR-08.

### XF-02 — Find and book a load

- **Personas:** PR-02, PR-06
- **User intent:** "Find a load near my truck, going my way, that pays enough, and lock it in."
- **Trigger:** A truck will soon be empty; a lane alert fires (XS-09); a tender arrives.
- **Entry points:** PG-19 Carrier Dashboard, PG-33 Load Board, PG-36 Saved Loads & Searches, a notification (PG-42), a lane alert link.
- **Journey:**
  1. The dispatcher searches by origin radius, destination, dates and equipment.
  2. The dispatcher compares the matching loads by pay, rate per mile, deadhead distance and shipper score.
  3. The dispatcher opens a load and checks the stops, requirements and shipper reputation.
  4. The dispatcher books at the posted rate, or places a bid (XF-03).
  5. The dispatcher reviews and accepts the rate confirmation (BR-04).
  6. Haulr confirms the booking and asks for driver and truck assignment (XF-05).
- **Decision points:** book now or bid; which truck; whether deadhead is acceptable; whether accessorial terms are acceptable.
- **Emotional state:** Time-pressed and competitive; anxious that the load will be gone; satisfied when the rate confirmation arrives.
- **Failure paths:** the load is booked by someone else mid-review; the carrier is ineligible (BR-03); equipment mismatch; rate confirmation fails to sign; session expires.
- **Recovery paths:** state that the load is gone and offer similar loads; explain ineligibility and link to the fix (PG-17, PG-49); re-attempt signature while keeping the reservation for a grace period of 2 minutes; restore the search after sign-in.
- **System behavior:** search reads from the index with live availability; opening a load reserves nothing; the booking request is idempotent (the client generates an idempotency key with `nanoid`); winning a race returns the rate confirmation, losing returns a conflict; emits `load.booked`.
- **Completion criteria:** load `Booked` to this carrier with an accepted rate confirmation.
- **Dependencies:** search index, eligibility service, e-signature, BR-03, BR-04, BR-07.

### XF-03 — Bid and counter-offer

- **Personas:** PR-02, PR-01, PR-08
- **User intent:** Carrier: "I'll take it at my price." Shipper: "I want the best carrier at a fair price."
- **Trigger:** The posted rate is below what the carrier will accept, or the shipper has chosen bid mode.
- **Entry points:** PG-40 Load Details (carrier view), PG-33 Load Board, PG-28 Compare Bids (shipper), notification.
- **Journey:**
  1. The carrier submits a bid amount with an optional note and expiry.
  2. The shipper, or operations acting for Haulr, sees the new bid with the carrier's scorecard.
  3. The shipper accepts, declines or counters.
  4. The carrier accepts the counter, counters again (up to 3 rounds) or withdraws.
  5. Acceptance books the load and moves to rate confirmation (XF-02 step 5).
- **Decision points:** amount; expiry; accept, counter or decline; which of several bids to accept.
- **Emotional state:** Tactical; frustrated by silence; the flow must always show who is expected to respond next.
- **Failure paths:** bid expires; the load is booked through another path; the counter limit is reached; the bid falls outside the permitted range.
- **Recovery paths:** state the outcome with the final amount; suggest similar loads; explain the permitted range before submission.
- **System behavior:** enforces BR-02 transitions; notifies the counter-party at each step (XS-03); expires open bids when the load books; records the full negotiation history on the load.
- **Completion criteria:** bid reaches a terminal state and both parties are notified.
- **Dependencies:** XS-03, XF-02, BR-02, BR-05.

### XF-04 — Tender to preferred carriers

- **Personas:** PR-01, PR-04, PR-02
- **User intent:** "Give my trusted carriers the chance at this load before anyone else."
- **Trigger:** A load is posted with a preferred-carrier strategy.
- **Entry points:** PG-27 Post a Load, PG-29 Preferred Carriers, PG-40 Load Details.
- **Journey:**
  1. The shipper maintains an ordered list of preferred carriers per lane (PG-29).
  2. On posting, Haulr offers the load to each carrier in sequence with an exclusive acceptance window (BR-08).
  3. Each carrier accepts or declines within the window.
  4. If all decline or time out, the load goes to the open market (unless the shipper chose "preferred only").
  5. The shipper follows each step as it happens.
- **Decision points:** order of carriers; acceptance window length; fall back to the open market or not.
- **Emotional state:** Loyal but impatient; wants proof the waterfall is moving.
- **Failure paths:** a preferred carrier becomes ineligible (BR-18); no carrier accepts; the pickup window gets too close.
- **Recovery paths:** skip ineligible carriers and record why; fall back automatically; raise an operations exception when coverage risk rises (XF-08).
- **System behavior:** schedules each tender server-side; carriers receive the tender through notifications with a countdown; every step is logged on the load timeline.
- **Completion criteria:** load booked by a preferred carrier, or handed to the open market with the history retained.
- **Dependencies:** XS-03, BR-08, BR-18.

### XF-05 — Dispatch: assign driver and truck

- **Personas:** PR-02, PR-03
- **User intent:** "Put the right driver and truck on this load and give them everything they need."
- **Trigger:** A load is booked.
- **Entry points:** PG-19 Carrier Dashboard (loads needing assignment), PG-35 My Loads, PG-40 Load Details, notification.
- **Journey:**
  1. The dispatcher chooses a driver and truck (and trailer, where relevant) from their fleet.
  2. Haulr checks the equipment against the load's requirements.
  3. The dispatcher confirms. The driver receives the trip with the stops, instructions and a tracking consent request.
  4. The driver accepts the trip and grants location consent (or the carrier confirms ELD tracking).
- **Decision points:** which driver; ELD or phone tracking; share load documents with the driver.
- **Emotional state:** Routine but error-prone; wants a fast, correct assignment.
- **Failure paths:** no eligible truck; the driver is not yet registered; the driver declines consent; the assignment deadline passes (BR-09).
- **Recovery paths:** invite a driver in the same flow (XS-02); offer a manual check-call tracking fallback with an operations note; raise an exception at the deadline.
- **System behavior:** moves the load to `Dispatched`; sends the driver an invitation or a trip notification; starts tracking readiness checks.
- **Completion criteria:** load `Dispatched` with driver, truck and a confirmed tracking source.
- **Dependencies:** PG-37 Fleet, XS-02, BR-09, BR-10.

### XF-06 — Execute a load (driver stop workflow)

- **Personas:** PR-03
- **User intent:** "Tell me where to go, let me report each step quickly, and don't lose my updates."
- **Trigger:** The trip is dispatched and the pickup window approaches.
- **Entry points:** PG-20 Driver Home, PG-39 Driver Trip, SMS or push link.
- **Journey:**
  1. The driver reviews the next stop: address, appointment, reference numbers and instructions.
  2. The driver hands off to their preferred navigation app.
  3. Arrival is recorded automatically by geofence or by the driver's check-in.
  4. The driver records loading or unloading start and finish, seal and piece count, and any issue.
  5. The driver departs; the next stop becomes current.
  6. At the final stop the driver captures the signed POD (XF-09).
- **Decision points:** report a delay or issue; record lumper or other accessorial evidence; mark a stop as refused or partial.
- **Emotional state:** Tired, time-poor, often in bad conditions; needs forgiving, low-effort steps with no ambiguity.
- **Failure paths:** no signal; location permission revoked; wrong stop confirmed; the phone dies.
- **Recovery paths:** queue events offline with device timestamps and replay in order (PP-06); explain how to re-grant permission; allow undo of a stop event within 5 minutes; the dispatcher can record events for the driver.
- **System behavior:** transitions `Dispatched → AtPickup → InTransit → AtDelivery → Delivered`; starts detention timers per BR-11; streams location while active; stops collecting location when the trip ends (Phase 1 §12).
- **Completion criteria:** every stop has arrival and departure recorded, and the load is `Delivered`.
- **Dependencies:** XF-07, XF-09, BR-10, BR-11.

### XF-07 — Live tracking and ETA

- **Personas:** PR-01, PR-07, PR-08, PR-02
- **User intent:** "Where is it, when will it get there, and should I worry?"
- **Trigger:** A load is in transit; a customer asks; an ETA-change alert fires.
- **Entry points:** PG-26 Shipments (map view), PG-40 Load Details, PG-02 Public Tracking, notification.
- **Journey:**
  1. The user opens the load or the shipments map.
  2. The user sees the current position, its source and age (PP-03), and the ETA against the appointment.
  3. The user shares a tracking link with a consignee (PG-02).
  4. The user subscribes to alerts for ETA changes or arrival.
- **Decision points:** share the link or not; escalate to operations; message the carrier.
- **Emotional state:** Anxious when late; calm when the data is fresh and consistent.
- **Failure paths:** no recent location; the ETA is unavailable; the tracking link has expired (BR-21); the map fails to load.
- **Recovery paths:** show the last known position with its age and request a check call; give an equivalent text description of position and progress; say that the link has expired and who to contact.
- **System behavior:** subscribes to location updates for the loads in view only; recomputes ETA on each update; emits `eta.changed` when the ETA moves by more than 30 minutes; raises a tracking exception at 90 minutes of silence (BR-10).
- **Completion criteria:** the user knows position, freshness and ETA, or knows why they cannot.
- **Dependencies:** XF-06, XS-03, XF-08, map library (pending approval).

### XF-08 — Exception management

- **Personas:** PR-08, PR-01, PR-02
- **User intent:** Operations: "Catch loads going wrong and fix them before the shipper notices." Parties: "Tell me what's wrong and what happens next."
- **Trigger:** A system rule fires: uncovered near pickup, unassigned by BR-09, late ETA, tracking gap, detention started, cancellation, compliance change (BR-18).
- **Entry points:** PG-21 Ops Dashboard, PG-50 Exception Queue, PG-40 Load Details, notification.
- **Journey:**
  1. Haulr raises an exception with a type, severity, the load and the rule that fired.
  2. Operations claims it, reviews the evidence and acts: contact a party, re-tender, re-assign, approve an accessorial, or cancel.
  3. The affected parties are told the outcome and what it changes for them.
  4. The exception resolves with a reason code.
- **Decision points:** severity; re-tender or wait; charge TONU or not (BR-12); approve detention.
- **Emotional state:** Operations: under load, context-switching. Parties: stressed and wanting certainty.
- **Failure paths:** two agents act on the same exception; the fix creates a new conflict; parties cannot be reached.
- **Recovery paths:** a claimed exception is locked to one agent, with visible ownership and a handoff; every action records an audit event; an escalation timer raises severity.
- **System behavior:** deduplicates exceptions per load and type; computes a risk score; drives an ordered queue; records the resolution for KPI-10.
- **Completion criteria:** exception resolved with a reason, and parties notified.
- **Dependencies:** rules engine, XS-03, XS-04, BR-09 … BR-12, BR-18.

### XF-09 — Proof of delivery and documents

- **Personas:** PR-03, PR-02, PR-10, PR-05
- **User intent:** "Prove delivery once so everyone gets paid."
- **Trigger:** Delivery complete (XF-06).
- **Entry points:** PG-39 Driver Trip, PG-40 Load Details, PG-43 Documents.
- **Journey:**
  1. The driver captures the signed delivery receipt with the camera (multiple pages allowed), plus the receiver's name and any exceptions noted.
  2. Haulr checks legibility and required elements automatically.
  3. If the check passes, the load becomes `PodVerified`. If not, finance reviews it or asks for a recapture.
  4. The POD attaches to the load, the invoice (XF-10) and the settlement (XF-11).
- **Decision points:** note OS&D at delivery (starts XS-06); recapture or upload a scan.
- **Emotional state:** Wants to be finished; frustrated by rejection without reason.
- **Failure paths:** blurry image; upload fails offline; wrong document type; POD missing after 24 hours.
- **Recovery paths:** say exactly why the image was rejected and allow an immediate recapture; queue the upload offline; allow dispatcher upload from a scan; a reminder chain escalates to operations.
- **System behavior:** stores documents with type, version, uploader and hash; runs automated checks; emits `pod.verified`.
- **Completion criteria:** load `PodVerified` with a POD document on file.
- **Dependencies:** document storage, BR-13, XS-12.

### XF-10 — Invoice and pay (shipper)

- **Personas:** PR-05, PR-04, PR-10
- **User intent:** "Pay exactly what we agreed, with proof, in our payment run."
- **Trigger:** An invoice is issued on POD verification (BR-14); the payment run date arrives.
- **Entry points:** PG-18 Shipper Dashboard (finance view), PG-30 Invoices, PG-31 Invoice Detail & Pay, email notification.
- **Journey:**
  1. AP reviews open invoices by due date, filtered by status.
  2. AP opens an invoice and checks the linehaul, accessorials, POD and agreed terms.
  3. AP pays one or several invoices with a saved payment method, or disputes a line (BR-16).
  4. Haulr confirms payment and makes remittance records available.
- **Decision points:** pay now or schedule; pay in full or dispute a line; which payment method.
- **Emotional state:** Methodical, audit-minded; distrusts unexplained charges.
- **Failure paths:** payment method declined; the invoice is disputed; the payment method needs verification; a duplicate payment attempt.
- **Recovery paths:** explain the decline and offer another method; pay undisputed lines; resume verification (XS-08); idempotent payment requests block duplicates.
- **System behavior:** status moves `Issued → PartiallyPaid → Paid` or `Disputed`; reminders at due date minus 3 days, on the due date and when overdue; payment through the processor's tokenised flow.
- **Completion criteria:** invoice `Paid`, or the undisputed part paid with a dispute open.
- **Dependencies:** payments processor, XS-08, BR-14, BR-16.

### XF-11 — Carrier settlement and quick pay

- **Personas:** PR-06, PR-02, PR-10
- **User intent:** "Know when I'll be paid and how much, and get it faster if I need to."
- **Trigger:** POD verified.
- **Entry points:** PG-19 Carrier Dashboard, PG-38 Settlements, PG-40 Load Details, notification.
- **Journey:**
  1. The carrier sees a pending settlement with pay, accessorials, deductions and the expected pay date (BR-15).
  2. The carrier chooses quick pay after seeing the fee and net amount (PP-01).
  3. Haulr issues the payout and confirms with a remittance record.
- **Decision points:** standard or quick pay; dispute an amount.
- **Emotional state:** Cash-flow sensitive; trust depends on predictability.
- **Failure paths:** payout account not verified; the payout bounces; the amount is disputed.
- **Recovery paths:** route to payout method setup (XS-08); retry after the account is corrected; pay the undisputed amount (BR-16).
- **System behavior:** builds settlements from rate confirmations plus approved accessorials; schedules payouts; reconciles processor callbacks.
- **Completion criteria:** settlement `Paid` with remittance available.
- **Dependencies:** payments processor, XS-08, BR-15, BR-16.

### XF-12 — Carrier onboarding and compliance vetting

- **Personas:** PR-06, PR-09
- **User intent:** Carrier: "Get approved once, quickly." Compliance: "Approve only safe, legitimate carriers."
- **Trigger:** A carrier registers (XS-01).
- **Entry points:** PG-11 Register, PG-17 Carrier Onboarding, PG-22 Compliance Dashboard, PG-51 Carrier Vetting Review.
- **Journey:**
  1. The carrier enters its USDOT and MC numbers; Haulr fetches the authority and safety record.
  2. The carrier confirms company details, equipment types, operating lanes and contacts.
  3. The carrier uploads or links its insurance certificate and W-9, and signs the carrier agreement.
  4. The carrier adds a payout method (XS-08).
  5. Automatic checks run; clear cases are approved automatically, the rest go to compliance review.
  6. Compliance approves, requests more information or rejects, and records its reasons.
- **Decision points:** automatic or manual review; request more information or reject.
- **Emotional state:** Carrier: impatient, wary of fraud-prevention friction. Compliance: sceptical, evidence-driven.
- **Failure paths:** authority not active; insurance below minimum; identity mismatch (a fraud signal); abandonment partway through.
- **Recovery paths:** explain exactly what is missing; let the carrier resume where they stopped; identity verification escalates to a call-back process.
- **System behavior:** compliance status `NotStarted → InProgress → PendingReview → Approved | Rejected | InfoRequested`; continuous monitoring afterwards (BR-18).
- **Completion criteria:** carrier `Approved` and able to book, or rejected with a reason recorded.
- **Dependencies:** authority registry, insurance verification, e-signature, BR-03, BR-18.

### XF-13 — Shipper onboarding

- **Personas:** PR-04, PR-05, PR-10
- **User intent:** "Set up our company so the team can post loads and pay on terms."
- **Trigger:** A shipper registers (XS-01).
- **Entry points:** PG-11 Register, PG-16 Shipper Onboarding.
- **Journey:**
  1. The admin confirms company details and shipping profile (typical lanes, volume, equipment).
  2. The admin adds billing contacts and requests payment terms.
  3. Haulr runs a credit check; terms and a credit limit are granted, or the organisation pays by card before pickup.
  4. The admin invites teammates (XS-02) and adds facilities (PG-32).
- **Decision points:** request terms or prepay; who to invite.
- **Emotional state:** Evaluating Haulr; any friction risks losing them.
- **Failure paths:** credit declined; partial completion.
- **Recovery paths:** offer prepay so posting is not blocked; persist progress and remind the admin.
- **System behavior:** the organisation can post quotes immediately; posting requires terms or a prepay method.
- **Completion criteria:** organisation active with terms or prepay, and at least one user.
- **Dependencies:** credit provider, XS-02, XS-08.

---

## 3. Role Dashboards

Each dashboard is a starting point for a working session. The shared question is "what needs me now, and how are things going?"

### XD-01 — Shipper dashboard

- **Personas:** PR-01, PR-04, PR-05 (each sees the parts their role permits)
- **User intent:** "What needs my attention on my freight today?"
- **Trigger:** Start of shift; returning from a notification.
- **Entry points:** sign-in redirect, `/dashboard` redirect, PG-18.
- **Journey:** review loads needing action (uncovered, bids waiting, late, exceptions) → act or open the load → check this week's service and spend → start a new quote.
- **Decision points:** which item to act on; whether to escalate.
- **Emotional state:** Busy; wants triage in seconds.
- **Failure paths:** data fails to load; no loads yet.
- **Recovery paths:** each part fails independently and can be retried; a new organisation is guided to its next step (quote, invite, add facility).
- **System behavior:** attention items are computed server-side from load and exception state and refresh at a fixed interval and on focus.
- **Completion criteria:** no unacknowledged attention items, or the user has moved into a flow.
- **Dependencies:** XF-01, XF-03, XF-07, XF-08, XF-10.

### XD-02 — Carrier dashboard

- **Personas:** PR-02, PR-06
- **User intent:** "Which trucks need loads, which loads need drivers, and when am I getting paid?"
- **Trigger:** Start of day; truck about to be empty.
- **Entry points:** sign-in redirect, PG-19.
- **Journey:** check loads needing assignment → review active loads and exceptions → open recommended loads for trucks becoming empty → check pending settlements and compliance standing.
- **Decision points:** book a recommended load; assign a driver.
- **Emotional state:** Juggling phone calls; wants a clear list of what needs doing.
- **Failure paths:** compliance hold blocks booking; payout method missing.
- **Recovery paths:** the account-standing notice links to the exact fix (PG-17, PG-49).
- **System behavior:** recommendations use the truck's expected empty location and time, and the carrier's preferred lanes.
- **Completion criteria:** every booked load assigned; trucks becoming empty have a next load or a saved search.
- **Dependencies:** XF-02, XF-05, XF-11, XF-12.

### XD-03 — Driver home

- **Personas:** PR-03
- **User intent:** "What's my current trip and what do I do next?"
- **Trigger:** Opening the product from a link or bookmark.
- **Entry points:** PG-20.
- **Journey:** see the current or next trip → continue the stop workflow (XF-06) → see upcoming trips → see offline queue state.
- **Decision points:** start a trip; contact dispatch.
- **Emotional state:** Wants zero thinking.
- **Failure paths:** no trips assigned; offline.
- **Recovery paths:** say that no trip is assigned and how to reach dispatch; show cached trip details when offline.
- **System behavior:** caches the active trip for offline use; replays queued events.
- **Completion criteria:** the driver reaches the right trip in one step.
- **Dependencies:** XF-06.

### XD-04 — Operations dashboard

- **Personas:** PR-08
- **User intent:** "How healthy is the network right now, and where am I needed?"
- **Trigger:** Shift start; severity escalation.
- **Entry points:** PG-21.
- **Journey:** review exception volume by type and severity → claim the next exception (PG-50) → watch coverage risk for loads picking up within 24 hours → review own resolved count.
- **Decision points:** which exception; whether to bulk re-tender.
- **Emotional state:** Vigilant; needs trustworthy, current numbers.
- **Failure paths:** live data delayed.
- **Recovery paths:** show the time of the last refresh and allow a manual refresh.
- **System behavior:** near-real-time counts; queue ordered by risk score.
- **Completion criteria:** the agent is working a claimed exception.
- **Dependencies:** XF-08.

### XD-05 — Compliance dashboard

- **Personas:** PR-09
- **User intent:** "Which carriers need a decision, and what changed overnight?"
- **Trigger:** Daily review; monitoring alert.
- **Entry points:** PG-22.
- **Journey:** review the vetting queue by age → review monitoring changes (authority or insurance lapses) and their affected loads → open a carrier (PG-51) → decide.
- **Decision points:** approve, request information, reject, suspend.
- **Emotional state:** Careful; wants evidence consolidated.
- **Failure paths:** registry source unavailable.
- **Recovery paths:** show the last successful fetch time and allow the decision to be deferred with a reason.
- **System behavior:** monitoring feed; SLA timers on the review queue.
- **Completion criteria:** the queue is within SLA.
- **Dependencies:** XF-12, BR-18.

### XD-06 — Finance operations dashboard

- **Personas:** PR-10
- **User intent:** "Is cash flowing both ways, and what's stuck?"
- **Trigger:** Daily close; payout run.
- **Entry points:** PG-23.
- **Journey:** review PODs awaiting verification → disputes → overdue receivables → failed payouts → quick pay volume → act.
- **Decision points:** verify or reject a POD; resolve a dispute; retry a payout.
- **Emotional state:** Precise; needs totals that reconcile.
- **Failure paths:** processor callback delayed.
- **Recovery paths:** mark items "awaiting processor" with their age.
- **System behavior:** aggregates from the invoice and settlement ledgers.
- **Completion criteria:** no item past its SLA.
- **Dependencies:** XF-09, XF-10, XF-11.

### XD-07 — Support console

- **Personas:** PR-11
- **User intent:** "Resolve this person's problem with full context."
- **Trigger:** A new ticket; an escalation.
- **Entry points:** PG-24.
- **Journey:** pick a ticket → see the requester's organisation, role, recent loads and open exceptions → reply, or hand off to operations, compliance or finance → resolve.
- **Decision points:** handle or hand off.
- **Emotional state:** Empathetic but time-bound.
- **Failure paths:** the requester cannot be matched to an account.
- **Recovery paths:** look up by email or load reference.
- **System behavior:** ticket state `Open → Pending → Resolved | Escalated`; SLA timers.
- **Completion criteria:** ticket resolved or escalated with a note.
- **Dependencies:** XS-07.

### XD-08 — Admin dashboard

- **Personas:** PR-12
- **User intent:** "Keep accounts, roles and configuration correct and safe."
- **Trigger:** An access request; a configuration change.
- **Entry points:** PG-25.
- **Journey:** review pending organisation approvals and access requests → manage accounts (PG-52) → change configuration (quote validity, tender window, detention free time) with an audit reason.
- **Decision points:** grant or revoke; suspend an organisation.
- **Emotional state:** Cautious.
- **Failure paths:** a change conflicts with active loads.
- **Recovery paths:** preview the impact before saving; reversible changes with history.
- **System behavior:** every change is audited with actor, reason and before/after values.
- **Completion criteria:** change applied and audited.
- **Dependencies:** XS-02, Phase 1 §11 Governance.

---

## 4. Supporting Flows

### XS-01 — Register and sign in

- **Personas:** all authenticated personas
- **User intent:** "Get in securely without friction."
- **Trigger:** New visitor; expired session; invitation link.
- **Entry points:** PG-01, PG-10, PG-11, PG-12, PG-13, PG-14, PG-15, any protected route (redirect with return path).
- **Journey:** choose shipper or carrier → give name, work email and password → verify email → set up MFA (required for admin, finance and internal roles; offered to everyone else) → land in onboarding (XF-12 / XF-13) or the role dashboard. Returning users sign in → MFA if enrolled → return to the requested path (validated by `lib/utils/internal-path.ts`).
- **Decision points:** shipper or carrier; enable MFA.
- **Emotional state:** Neutral to impatient.
- **Failure paths:** wrong credentials; locked account; email already used; verification link expired; MFA code wrong.
- **Recovery paths:** a generic credentials error (no account enumeration); unlock by email after a cooldown; offer sign-in or reset for an existing email; resend verification; allow a backup code.
- **System behavior:** session cookie set through `app/api/session`; the edge proxy guards protected prefixes; rate-limits attempts.
- **Completion criteria:** authenticated session and the user on their intended page.
- **Dependencies:** backend `auth` module, `proxy.ts`.

### XS-02 — Invite and manage team

- **Personas:** PR-04, PR-06, PR-02 (inviting drivers), PR-12
- **User intent:** "Give colleagues and drivers the right access."
- **Trigger:** New hire; new driver; offboarding.
- **Entry points:** PG-48 Organization & Team, PG-37 Fleet (drivers), PG-16 / PG-17 onboarding.
- **Journey:** invite by email or phone with a role → the invitee accepts (PG-15) → the admin changes roles or removes members.
- **Decision points:** role; resend or revoke the invitation.
- **Emotional state:** Administrative.
- **Failure paths:** the invitee already belongs to another organisation; the invitation expires; the last admin tries to remove themselves.
- **Recovery paths:** explain the one-organisation rule (Phase 1 §7.4); resend; block removal of the last admin.
- **System behavior:** invitations expire after 7 days; role changes take effect at the member's next request.
- **Completion criteria:** member active with the intended role.
- **Dependencies:** XS-01.

### XS-03 — Notifications and alert preferences

- **Personas:** all
- **User intent:** "Tell me what matters, through the channel I'll see, and nothing else."
- **Trigger:** A domain event (load posted, bid received, ETA changed, POD verified, invoice due, compliance change).
- **Entry points:** PG-42 Notifications, PG-47 Settings, email, SMS, browser push.
- **Journey:** receive a notification → open its subject → mark it read; separately, adjust the preferences for each event type and channel.
- **Decision points:** channel per event; quiet hours.
- **Emotional state:** Easily annoyed by noise.
- **Failure paths:** push permission denied; email bounces.
- **Recovery paths:** fall back to in-app and email; flag a bounced address in settings.
- **System behavior:** a catalogue of event types, each with default channels by role; critical safety and payment events cannot be fully disabled.
- **Completion criteria:** the notification reaches the user and leads to its subject.
- **Dependencies:** notification service.

### XS-04 — Load messaging

- **Personas:** PR-01, PR-02, PR-03, PR-08, PR-11
- **User intent:** "Talk about this load with the people on it."
- **Trigger:** A question, an issue, or an update.
- **Entry points:** PG-40 Load Details, PG-41 Messages, notification.
- **Journey:** open the load's conversation → write a message or attach a photo → the other parties are notified → the thread stays on the load record.
- **Decision points:** include operations; attach a file.
- **Emotional state:** Needs speed and certainty the message was seen.
- **Failure paths:** send fails; attachment too large.
- **Recovery paths:** keep the failed message with a retry; state the size limit before upload.
- **System behavior:** threads scoped by load (BR-19); read receipts per participant; operations can join any thread.
- **Completion criteria:** message delivered and visible to all participants.
- **Dependencies:** XS-03.

### XS-05 — Ratings and scorecards

- **Personas:** PR-01, PR-02, PR-04
- **User intent:** "Reward good partners and warn the network about bad ones."
- **Trigger:** A load is delivered (BR-22).
- **Entry points:** notification, PG-40, PG-03, PG-04.
- **Journey:** rate the counter-party on a fixed scale with optional reason tags and comment → scorecards update.
- **Decision points:** give a rating now or later.
- **Emotional state:** Quick; honest if anonymous to the counter-party.
- **Failure paths:** rating window closed (30 days).
- **Recovery paths:** explain that the window has closed.
- **System behavior:** scorecards blend ratings with measured KPIs (KPI-04, KPI-05, acceptance).
- **Completion criteria:** rating recorded.
- **Dependencies:** XF-06.

### XS-06 — Claims and disputes (OS&D)

- **Personas:** PR-01, PR-05, PR-02, PR-10
- **User intent:** "Get compensated fairly for damaged, short or wrong freight or charges."
- **Trigger:** An exception noted at delivery; an invoice line is disputed; damage discovered later.
- **Entry points:** PG-40, PG-31, PG-44 Claims, PG-45 Claim Detail.
- **Journey:** file a claim with type, amount and evidence → the counter-party responds with their evidence → finance mediates → decision and settlement adjustment.
- **Decision points:** claim amount; accept a proposed settlement.
- **Emotional state:** Frustrated; wants fairness and progress visibility.
- **Failure paths:** filing window closed (BR-17); evidence missing.
- **Recovery paths:** explain the window; list the evidence required.
- **System behavior:** claim status `Filed → UnderReview → AwaitingResponse → Resolved | Denied`; linked to the invoice or settlement (BR-16).
- **Completion criteria:** claim resolved with the outcome applied to money movement.
- **Dependencies:** XF-09, XF-10, XF-11.

### XS-07 — Help and support ticket

- **Personas:** all
- **User intent:** "Answer my question myself, or reach a person."
- **Trigger:** Confusion; a blocker.
- **Entry points:** PG-06 Help Center, PG-07 Help Article, PG-08 Contact Support, contextual help links from any page.
- **Journey:** search help → read the article → if unresolved, open a ticket pre-filled with context (page, load reference) → follow its status.
- **Decision points:** self-serve or ticket; urgency.
- **Emotional state:** Blocked; wants a fast answer.
- **Failure paths:** no results; ticket submission fails.
- **Recovery paths:** suggest related articles and contact options; keep the ticket draft locally.
- **System behavior:** help content is statically generated for SEO; tickets are linked to the account when signed in.
- **Completion criteria:** question answered or ticket created.
- **Dependencies:** help content source, support system.

### XS-08 — Payment and payout method setup

- **Personas:** PR-05, PR-04, PR-06
- **User intent:** "Set up how we pay or get paid, securely."
- **Trigger:** Onboarding; a declined payment; a bounced payout.
- **Entry points:** PG-49 Payment & Payout Methods, PG-16, PG-17, PG-31, PG-38.
- **Journey:** add a bank account (instant verification or micro-deposit) or card → set the default → remove old methods.
- **Decision points:** verification method; default.
- **Emotional state:** Security-conscious.
- **Failure paths:** verification fails; micro-deposits not yet arrived.
- **Recovery paths:** retry or switch method; resume verification later.
- **System behavior:** hosts the processor's tokenised entry (A6); changes to payout methods require re-authentication and notify all carrier admins.
- **Completion criteria:** a verified default method.
- **Dependencies:** payments processor.

### XS-09 — Saved searches and lane alerts

- **Personas:** PR-02
- **User intent:** "Tell me when loads appear on my lanes."
- **Trigger:** A recurring search.
- **Entry points:** PG-33 Load Board, PG-36 Saved Loads & Searches.
- **Journey:** save the current search with a name → choose alert channel and frequency → receive alerts → open the matching loads; separately, watch individual loads.
- **Decision points:** instant or digest alerts.
- **Emotional state:** Opportunistic.
- **Failure paths:** too many alerts.
- **Recovery paths:** suggest a digest; pause an alert.
- **System behavior:** matching runs on `load.posted`; watched loads notify on change or on booking by someone else.
- **Completion criteria:** alert active, or load watched.
- **Dependencies:** XS-03, XF-02.

### XS-10 — Lane rate estimate

- **Personas:** PR-01, PR-04, prospective shippers, PR-02
- **User intent:** "What does this lane cost right now?"
- **Trigger:** Budgeting; comparing against another quote.
- **Entry points:** PG-05 Lane Rate Estimator, PG-01 Home, search engines.
- **Journey:** enter lane, equipment and date → see the estimate with range, trend and the basis of the calculation → continue to post a load (XF-01) with the lane carried over, or sign up.
- **Decision points:** convert to a real quote.
- **Emotional state:** Exploratory.
- **Failure paths:** insufficient market data for the lane.
- **Recovery paths:** state that the confidence is low and offer a custom quote request.
- **System behavior:** anonymous estimates are rate-limited; signed-in users can save estimates.
- **Completion criteria:** estimate shown, or a reason given.
- **Dependencies:** pricing service.

### XS-11 — Profile, settings and facilities

- **Personas:** all
- **User intent:** "Keep my details, security and facility information current."
- **Trigger:** A change of details; a security concern.
- **Entry points:** PG-46 Profile, PG-47 Settings, PG-32 Locations.
- **Journey:** edit personal details → change password or MFA → review active sessions → manage facilities with hours and instructions.
- **Decision points:** revoke other sessions.
- **Emotional state:** Routine.
- **Failure paths:** validation errors; re-authentication required.
- **Recovery paths:** explain each field-level error; prompt re-authentication for sensitive changes.
- **System behavior:** sensitive changes require a recent sign-in (within 10 minutes) and send a security notification.
- **Completion criteria:** change saved and confirmed.
- **Dependencies:** XS-01.

### XS-12 — Document vault management

- **Personas:** PR-02, PR-06, PR-05, PR-10
- **User intent:** "Find any load document or company document quickly."
- **Trigger:** An audit, a dispute, an insurance renewal.
- **Entry points:** PG-43 Documents, PG-40.
- **Journey:** filter documents by type, load, date or party → preview → download or share with a load party → replace an expiring company document (insurance).
- **Decision points:** replace or add a version.
- **Emotional state:** Searching under time pressure.
- **Failure paths:** document not found; download fails.
- **Recovery paths:** search by load reference; retry the download.
- **System behavior:** documents versioned; access checked per role and per load party; expiring company documents trigger reminders at 30, 14 and 3 days.
- **Completion criteria:** document retrieved or replaced.
- **Dependencies:** document storage, XF-09, XF-12.

---

## 5. Load State Machine

Legal transitions (BR-01). Any transition not listed is rejected by the backend, and the frontend never offers it.

| From | To | Actor | Guard |
| --- | --- | --- | --- |
| Draft | Posted | Shipper | Valid quote (BR-06), organisation can post (XF-13) |
| Draft | Cancelled | Shipper | None |
| Posted | Booked | Carrier, Operations | Eligibility (BR-03), rate confirmation accepted (BR-04) |
| Posted | Expired | System | Pickup window closed (BR-07) |
| Posted | Cancelled | Shipper, Operations | None |
| Booked | Dispatched | Carrier | Driver and truck assigned (BR-09) |
| Booked | Posted | Operations | Carrier fell off; re-tender |
| Booked, Dispatched | Cancelled | Shipper, Carrier, Operations | TONU and penalty rules (BR-12) |
| Dispatched | AtPickup | Driver, System (geofence), Operations | None |
| AtPickup | InTransit | Driver, Operations | Loaded departure recorded |
| InTransit | AtPickup | Driver | Multi-stop: next pickup |
| InTransit | AtDelivery | Driver, System, Operations | None |
| AtDelivery | InTransit | Driver | Multi-stop: next stop |
| AtDelivery | Delivered | Driver, Operations | Final stop departure recorded |
| Delivered | PodVerified | System, Finance | POD passes review (BR-13) |
| PodVerified | Invoiced | System | Invoice issued (BR-14) |
| Invoiced | Paid | System | Shipper payment settled |
| Paid | Closed | System | Carrier settled (BR-15) and no open claim |
| Any active | OnHold | Operations, Compliance | Reason required |
| OnHold | Previous state | Operations | Reason required |
| Invoiced, Paid | Disputed | Shipper, Carrier | Within window (BR-16, BR-17) |
| Disputed | Previous state | Finance | Resolution recorded |

## 6. Bid State Machine

| From | To | Actor | Guard |
| --- | --- | --- | --- |
| — | Submitted | Carrier | Eligible (BR-03), load `Posted`, amount in permitted range |
| Submitted | Countered | Shipper, Operations | Counter round < 3 |
| Countered | Submitted | Carrier | Counter round < 3 |
| Submitted, Countered | Accepted | Counter-party | Load still `Posted` |
| Submitted, Countered | Declined | Counter-party | None |
| Submitted, Countered | Withdrawn | Carrier | None |
| Submitted, Countered | Expired | System | Expiry reached, or load booked elsewhere |

## 7. Cross-Experience Rules

- **Who acts next.** In any multi-party flow (XF-03, XF-04, XF-08, XS-06) the user is always told whose turn it is and by when.
- **Notification parity.** Every state change that affects another party emits an event defined in the XS-03 catalogue.
- **Consistent confirmations.** Every irreversible step (book, cancel, pay, reject, delete) follows the same confirmation behaviour, defined once in [Phase 6](./phase-6-interaction-contracts.md) (IC-12).
- **Freshness everywhere.** Any live value (position, ETA, bid count, queue size) states its age (PP-03).
- **Draft safety.** Every multi-step entry flow (XF-01, XF-12, XF-13, XS-06, XS-07) persists drafts (PP-06).

## 8. Traceability

| Experience | Personas | Jobs (Phase 1) | Rules | Pages (Phase 4) |
| --- | --- | --- | --- | --- |
| XF-01 | PR-01, PR-04 | JTBD-01 | BR-01, BR-06, BR-08 | PG-27, PG-05, PG-26, PG-18 |
| XF-02 | PR-02, PR-06 | JTBD-03 | BR-03, BR-04, BR-07 | PG-33, PG-34, PG-40, PG-36 |
| XF-03 | PR-02, PR-01, PR-08 | JTBD-04 | BR-02, BR-05 | PG-28, PG-40, PG-33 |
| XF-04 | PR-01, PR-04, PR-02 | JTBD-01 | BR-08, BR-18 | PG-29, PG-27, PG-40 |
| XF-05 | PR-02, PR-03 | JTBD-03 | BR-09 | PG-35, PG-37, PG-40 |
| XF-06 | PR-03 | JTBD-05 | BR-10, BR-11 | PG-20, PG-39 |
| XF-07 | PR-01, PR-07, PR-08 | JTBD-02 | BR-10, BR-21 | PG-26, PG-40, PG-02 |
| XF-08 | PR-08, PR-01, PR-02 | JTBD-10 | BR-09 … BR-12, BR-18 | PG-21, PG-50, PG-40 |
| XF-09 | PR-03, PR-02, PR-10 | JTBD-06 | BR-13 | PG-39, PG-40, PG-43 |
| XF-10 | PR-05, PR-04, PR-10 | JTBD-07 | BR-14, BR-16 | PG-30, PG-31 |
| XF-11 | PR-06, PR-02, PR-10 | JTBD-06 | BR-15, BR-16 | PG-38 |
| XF-12 | PR-06, PR-09 | JTBD-09, JTBD-11 | BR-03, BR-18 | PG-17, PG-22, PG-51 |
| XF-13 | PR-04, PR-05 | JTBD-01 | — | PG-16 |
| XD-01 … XD-08 | per dashboard | JTBD-08, JTBD-10, JTBD-12 | — | PG-18 … PG-25 |
| XS-01 | all | — | — | PG-10 … PG-15 |
| XS-02 | PR-04, PR-06 | — | — | PG-48, PG-15, PG-37, PG-52 |
| XS-03 | all | — | — | PG-42, PG-47 |
| XS-04 | parties to a load | — | BR-19 | PG-41, PG-40 |
| XS-05 | PR-01, PR-02 | — | BR-22 | PG-40, PG-03, PG-04 |
| XS-06 | PR-01, PR-05, PR-02 | — | BR-16, BR-17 | PG-44, PG-45 |
| XS-07 | all | — | — | PG-06, PG-07, PG-08, PG-24 |
| XS-08 | PR-05, PR-06 | — | — | PG-49 |
| XS-09 | PR-02 | JTBD-03 | — | PG-36, PG-33 |
| XS-10 | PR-01, prospects | JTBD-01 | BR-06 | PG-05 |
| XS-11 | all | — | — | PG-46, PG-47, PG-32 |
| XS-12 | PR-02, PR-06, PR-05 | — | BR-20 | PG-43 |

---

Previous: [Phase 1 — Product Vision](./phase-1-product-vision.md) · Next: [Phase 3 — Information Architecture](./phase-3-information-architecture.md)
