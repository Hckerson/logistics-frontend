# Phase 1 — Product Vision

`Haulr Design OS` · `Version 1.2.0` · `2026-10-09` · Next: [Phase 2 — Experience Maps](./phase-2-experience-maps.md) · Index: [DESIGN-OS-COMPLETE](./DESIGN-OS-COMPLETE.md)

This document is the single source of truth for what Haulr is, who it serves and which rules it obeys. Every later phase cites the IDs defined here (`A` assumptions, `BG-` goals, `PR-` personas, `JTBD-` jobs, `BR-` business rules, `KPI-` metrics, `PP-` product principles, and the `NFR-`, `CMP-`, `SEC-` and `OPS-` requirements).

This design OS defines what the product does. How anything looks is decided when each page is built, with the owner.

## Table of Contents

1. [Assumptions](#1-assumptions)
2. [Business Vision](#2-business-vision)
3. [Product Purpose](#3-product-purpose)
4. [Business Goals](#4-business-goals)
5. [Value Proposition](#5-value-proposition)
6. [Competitive Positioning](#6-competitive-positioning)
7. [Personas](#7-personas)
8. [Jobs To Be Done](#8-jobs-to-be-done)
9. [Business Rules](#9-business-rules)
10. [Success Metrics, KPIs and North Star](#10-success-metrics-kpis-and-north-star)
11. [Governance](#11-governance)
12. [Platform Constraints](#12-platform-constraints)
13. [Product Principles](#13-product-principles)
14. [Implementation Philosophy](#14-implementation-philosophy)
15. [Non-goals](#15-non-goals)
16. [Future Scalability Considerations](#16-future-scalability-considerations)
17. [Glossary](#17-glossary)
18. [Non-Functional Requirements](#18-non-functional-requirements)
19. [Compliance and Regulatory Obligations](#19-compliance-and-regulatory-obligations)
20. [Identity, Access and Security Requirements](#20-identity-access-and-security-requirements)
21. [Privacy and Data Governance](#21-privacy-and-data-governance)
22. [Operational Readiness and Support Model](#22-operational-readiness-and-support-model)

---

## 1. Assumptions

The master prompt's placeholders were resolved as follows. The maintainer chose the product model (freight marketplace) and the name (Haulr). Every other value is an assumption, recorded here so it can be challenged in one place.

| Placeholder | Resolved value | Basis |
| --- | --- | --- |
| `{{PRODUCT_NAME}}` | Haulr | Maintainer choice |
| `{{DOMAIN}}` | Road freight marketplace (full truckload, with partial and less-than-truckload as a later expansion) | Maintainer choice; `docs/economy-coverage-map.md` lists Logistics & Freight as the next sector |
| `{{REFERENCE_PRODUCTS}}` | Uber Freight, Convoy (historical), Loadsmart, Transfix, DAT One, project44, Flexport | Category benchmarks for features and flows only |
| `{{PERSONAS}}` | PR-01 … PR-13 (Section 7) | Derived from marketplace roles, plus the enterprise security and integration owner |
| `{{CORE_ENTITY}}` / `{{CORE_ENTITY_PLURAL}}` | Load / Loads | Industry term for one shipment moved by one carrier |
| `{{PRIMARY_FLOWS}}` | XF-01 … XF-17 ([Phase 2](./phase-2-experience-maps.md)) | Load lifecycle end to end |
| `{{SUPPORTING_FLOWS}}` | XS-01 … XS-18 ([Phase 2](./phase-2-experience-maps.md)) | Cross-cutting needs of a two-sided marketplace |
| `{{ROLE_DASHBOARDS}}` | XD-01 … XD-08 ([Phase 2](./phase-2-experience-maps.md)) | One per operating role |
| `{{DOMAIN_TOOL}}` | Lane Rate Estimator | Price discovery is the most common reason shippers visit |
| `{{DOMAIN_TRANSACTION}}` | Load booking (rate confirmation) | The moment a carrier commits to move a load |
| `{{DOMAIN_SPECIFIC_LIBS}}` | Map rendering: deck.gl (installed, reused); a map base layer is proposed, pending approval ([Phase 7 §15](./phase-7-frontend-architecture.md#15-shared-libraries)) | Tracking requires an interactive map |
| `{{SCALE_TARGET}}` | 5 million loads per year, 250,000 carriers, 40,000 shipper organisations, 1.5 million location updates per hour at peak | Mid-size national marketplace at year three |
| `{{COMPONENT_COUNT}}` | 68 interaction contracts | [Phase 6](./phase-6-interaction-contracts.md) |
| `{{SECTION_COUNT}}` | 238 sections (15 shared, 223 page) | [Phase 5](./phase-5-section-blueprints.md) |
| `{{PAGE_COUNT}}` | 66 pages | [Phase 4](./phase-4-page-blueprints.md) |
| `{{TIMELINE_WEEKS}}` | 16 weeks (8 two-week sprints) | [Phase 8](./phase-8-implementation-roadmap.md) |
| `{{QA_ITEM_COUNT}}` | 270 QA items | [Phase 9](./phase-9-qa-checklist.md) |
| `{{OUTPUT_DIR}}` | `design-os/generated/` | Host repo convention |

Domain assumptions:

- **A1 — Market.** United States domestic road freight at launch. Currency USD, units imperial, language US English. Localisation is designed for, not shipped (see Section 16).
- **A2 — Broker of record.** Haulr acts as the licensed freight broker of record. Shippers contract with Haulr; carriers contract with Haulr. Haulr sets the shipper price and the carrier pay separately, and keeps the margin.
- **A3 — Equipment at launch.** Dry van, refrigerated (reefer) and flatbed full-truckload. Partial and LTL are Section 16 expansions.
- **A4 — Carrier authority.** Carriers must hold active operating authority (USDOT number and MC number) and meet insurance minimums. Authority and insurance data come from a public registry and an insurance verification provider through the backend.
- **A5 — Tracking sources.** Location comes from, in order of preference, an electronic logging device (ELD) integration, the driver's mobile browser, or manual check calls logged by the carrier or Haulr operations.
- **A6 — Payments.** Money moves through a regulated payments processor chosen by the backend team. The frontend never handles raw bank or card numbers; it hosts the processor's tokenised entry.
- **A7 — Backend.** The paired NestJS backend currently ships `auth`, `users`, `stats` and `health` only. Every Haulr domain endpoint in this design OS is backend work to be done. Its DTOs become the frontend contract (`lib/contract/`) once published.
- **A8 — Driver access.** Drivers use the product in a mobile browser. A native app is a Section 16 expansion; the web experience must work alone.
- **A9 — Enterprise buyers.** Shipper organisations with more than 50 users are a launch segment. They require SSO, automated provisioning, spend approvals, integrations and audit export before signing, so these are launch scope (Sections 18–22), not later expansions.
- **A10 — Hosting.** Frontend and backend run in US regions only, on infrastructure whose provider holds SOC 2 Type II and ISO 27001 reports. Haulr itself targets SOC 2 Type II within 12 months of launch.

## 2. Business Vision

Road freight moves most of the goods in the US, and booking it still relies on phone calls, email and spreadsheets. A shipper phones several brokers for a quote, a carrier finds loads on a board full of stale posts, and nobody knows where the truck is until someone calls the driver. Haulr's vision is a **freight network where posting, pricing, booking, tracking and paying for a load is a single, transparent, self-serve transaction** that takes minutes. Where people are still needed, it is for exceptions.

## 3. Product Purpose

Haulr connects shippers who need freight moved with vetted carriers who have capacity. It carries each load through its whole life: quote, post, book, dispatch, track, deliver, prove, invoice, settle. Everyone on the load works from the same record.

## 4. Business Goals

| ID | Goal | Measure |
| --- | --- | --- |
| BG-01 | Make self-serve booking the default | 70% of loads booked without a Haulr operations touch by month 12 |
| BG-02 | Win shipper trust through visibility | 95% of in-transit loads have a location update less than 60 minutes old |
| BG-03 | Pay carriers faster than the industry | Median carrier payment 3 days after verified POD; quick pay same day |
| BG-04 | Keep the network safe | Zero loads tendered to a carrier with lapsed authority or insurance |
| BG-05 | Grow margin sustainably | Gross margin per load of 12–16% while keeping win rate on quotes above 30% |
| BG-06 | Reduce cost to serve | Operations touches per load fall 50% year over year |

## 5. Value Proposition

- **For shippers (PR-01, PR-04, PR-05):** an instant, reliable price; capacity within minutes; live visibility without phone calls; one invoice with the documents attached.
- **For carriers (PR-02, PR-06):** real, bookable loads with the rate shown up front; no haggling unless they choose to bid; fast, predictable payment; fewer empty miles.
- **For drivers (PR-03):** clear stop instructions, a single place to report arrival, loading, delay and delivery, and a camera-based POD that ends paperwork.
- **For consignees (PR-07):** a shareable tracking link with a reliable ETA and no account to create.

## 6. Competitive Positioning

Benchmarks are used for features and flows only.

| Capability | Benchmark behaviour | Haulr position |
| --- | --- | --- |
| Instant pricing | Uber Freight, Loadsmart quote in seconds | Match: instant quote with a confidence range (XF-01) |
| Bookable loads | Uber Freight, Transfix: book at posted rate | Match, plus an opt-in bid and counter path (XF-03) |
| Load board search | DAT One: large volume, low trust | Differentiate: every load is real, priced and bookable; no phantom posts (BR-07) |
| Visibility | project44: multi-source tracking | Match for road freight: ELD, then driver browser, then check call, with source always disclosed (PP-03) |
| Carrier pay | Industry net-30; quick pay for a fee | Differentiate: standard pay 3 days after POD verification (BG-03) |
| Private tendering | Shipper TMS tools (routing guides) | Include: preferred-carrier tender waterfall before the open market (XF-04) |

## 7. Personas

### 7.1 Primary personas

| ID | Persona | Organisation side | Context | Key needs |
| --- | --- | --- | --- | --- |
| PR-01 | **Shipper Coordinator** | Shipper | Books 5–80 loads a week for a manufacturer or distributor; works at a desk with many tabs open | Fast quote, fast coverage, knowing what is late before the customer calls |
| PR-02 | **Carrier Dispatcher** | Carrier | Keeps 3–60 trucks loaded; includes owner-operators who dispatch themselves, often from a phone | Good-paying loads on the right lanes, fewer empty miles, quick payment |
| PR-03 | **Driver** | Carrier | On the road, phone in cab, gloves on at docks, patchy signal | Where to go, when, what to do next, proof it was done |

### 7.2 Secondary personas

| ID | Persona | Organisation side | Context | Key needs |
| --- | --- | --- | --- | --- |
| PR-04 | **Shipper Logistics Manager** | Shipper | Owns freight spend and carrier performance for the organisation; approves spend above coordinators' limits | Spend and service reports, preferred carrier rules, team control, fast approvals |
| PR-13 | **Organisation Security and Integration Admin** | Shipper or carrier | Enterprise IT owner of identity, security policy, API keys and EDI connections; rarely books freight | SSO and SCIM that work without tickets, enforceable policy, integration health, audit evidence for their own auditors |
| PR-05 | **Shipper Accounts Payable** | Shipper | Pays invoices in weekly runs | Accurate invoices with POD attached, easy dispute, remittance records |
| PR-06 | **Carrier Owner / Fleet Admin** | Carrier | Owns the authority, the insurance and the bank account | Onboarding done once, payouts visible, compliance standing clear |
| PR-07 | **Consignee / Receiver** | External | Receiving dock or the shipper's customer; no Haulr account | A reliable ETA and delivery confirmation |

### 7.3 Internal and operational personas

| ID | Persona | Context | Key needs |
| --- | --- | --- | --- |
| PR-08 | **Operations Agent** | Watches in-flight loads, rescues uncovered or late loads, prices custom quote requests | A queue of exceptions ordered by risk and of quote requests ordered by deadline, acting on any load quickly |
| PR-09 | **Compliance Analyst** | Vets carriers, monitors authority and insurance changes, investigates fraud signals | Evidence for each decision, automatic flags, an audit trail |
| PR-10 | **Finance Operations** | Runs invoicing, collections, carrier settlement and quick pay | Clean reconciliation, dispute resolution, payout exceptions |
| PR-11 | **Support Agent** | Answers tickets from all sides | Full context on the requester and their loads |
| PR-12 | **Platform Admin** | Manages accounts, roles, platform configuration | Safe, audited, reversible administrative change |

### 7.4 Permission roles

Personas map to the permission roles used from [Phase 3](./phase-3-information-architecture.md#5-permissions) onward.

| Role key | Personas | Scope |
| --- | --- | --- |
| `shipper.member` | PR-01 | Own organisation's loads |
| `shipper.admin` | PR-04 | Organisation, team, preferences, reports |
| `shipper.finance` | PR-05 | Organisation invoices and payment methods |
| `carrier.dispatcher` | PR-02 | Own carrier's loads, fleet and bids |
| `carrier.admin` | PR-06 | Carrier organisation, compliance documents, payouts |
| `carrier.driver` | PR-03 | Loads assigned to them only |
| `public.tracking` | PR-07 | One load, through a signed tracking token |
| `internal.ops` | PR-08 | All loads (read and act) |
| `internal.compliance` | PR-09 | All carriers (vetting decisions) |
| `internal.finance` | PR-10 | All invoices, settlements and payouts |
| `internal.support` | PR-11 | Read all, act through tickets |
| `internal.admin` | PR-12 | Accounts, roles, configuration |
| `shipper.approver` | PR-04, or a delegated manager | Approves loads, bids and accessorials above a member's spend limit (BR-23) |
| `org.security` | PR-13 | Organisation security policy, SSO, SCIM, API keys, webhooks, EDI and the organisation audit log; no freight or money capabilities |

A user holds exactly one organisation membership and one or more roles within it. Internal roles belong to the Haulr organisation.

## 8. Jobs To Be Done

| ID | When… | I want to… | So I can… | Persona |
| --- | --- | --- | --- | --- |
| JTBD-01 | I have freight ready to ship | get a trustworthy price and a truck committed | promise a ship date to my customer | PR-01 |
| JTBD-02 | a load is in transit | know where it is and whether it will be late | warn my customer before they ask | PR-01, PR-07 |
| JTBD-03 | a truck is about to be empty | find a paying load near it going where I want | avoid unpaid miles | PR-02 |
| JTBD-04 | a posted rate is too low | propose my price without a phone call | win freight on my terms | PR-02 |
| JTBD-05 | I arrive at a stop | record arrival, loading and departure quickly | get paid detention and avoid disputes | PR-03 |
| JTBD-06 | a delivery is complete | prove it instantly | trigger payment | PR-03, PR-02 |
| JTBD-07 | invoices arrive | check each against the agreed rate and the POD | pay only what is owed | PR-05 |
| JTBD-08 | I plan next quarter's freight | see spend, service and carrier performance per lane | negotiate and choose carriers well | PR-04 |
| JTBD-09 | I join Haulr as a carrier | get approved once, with no repeat paperwork | start booking this week | PR-06 |
| JTBD-10 | a load is at risk | see it before it fails and act | protect the shipper's service | PR-08 |
| JTBD-11 | a carrier's standing changes | stop risky tenders automatically | keep freight safe | PR-09 |
| JTBD-12 | a payout fails or is disputed | resolve it with complete evidence | keep carriers paid and trusting us | PR-10 |
| JTBD-13 | I ship dozens of recurring loads a week | create them in bulk or from templates | stop re-keying the same lanes | PR-01 |
| JTBD-14 | our company adopts Haulr | connect it to our identity provider and our TMS or ERP | control access centrally and avoid double entry | PR-13 |
| JTBD-15 | a coordinator books above their authority | route the spend to the right approver quickly | keep control without slowing coverage | PR-04 |
| JTBD-16 | terms change after booking | amend the load and get the carrier to accept the change | keep one binding agreement without phone calls | PR-01, PR-02 |
| JTBD-17 | our auditors or a regulator ask | export who did what and when, and our data | pass audits and honour privacy requests | PR-13, PR-04 |

## 9. Business Rules

| ID | Rule |
| --- | --- |
| BR-01 | **Load lifecycle.** A load moves through `Draft → Posted → Booked → Dispatched → AtPickup → InTransit → AtDelivery → Delivered → PodVerified → Invoiced → Paid → Closed`. Side states: `PendingApproval` (BR-23), `Cancelled`, `Expired`, `OnHold`, `Disputed`. Only the transitions in [Phase 2 §5](./phase-2-experience-maps.md#5-load-state-machine) are legal. |
| BR-02 | **Bid lifecycle.** `Submitted → Countered ↔ Submitted → Accepted | Declined | Withdrawn | Expired`. Accepting a bid books the load and expires every other open bid on it. |
| BR-03 | **Booking eligibility.** A carrier can book or bid only when its compliance status is `Approved`, its authority is active, its insurance meets the load's minimums and it has the equipment type the load requires. |
| BR-04 | **Rate confirmation.** A booking is binding only after the carrier accepts the rate confirmation. Acceptance records user, time, IP and document version. |
| BR-05 | **Price separation.** Shipper price and carrier pay are separate values. A shipper never sees carrier pay; a carrier never sees shipper price or margin. |
| BR-06 | **Quote validity.** An instant quote is honoured for 30 minutes, for the lane, equipment and dates it was issued for. |
| BR-07 | **No phantom loads.** A load is visible on the load board only while `Posted`, and it expires automatically when its pickup window closes unbooked. |
| BR-08 | **Tender waterfall.** A shipper may tender a load to preferred carriers in sequence. Each gets an exclusive acceptance window (default 15 minutes) before the next, then the load goes to the open market. |
| BR-09 | **Driver assignment.** A booked load must have a driver and truck assigned by 2 hours before the pickup window opens, or it becomes an operations exception. |
| BR-10 | **Tracking cadence.** In-transit loads expect a location update at least every 60 minutes. A gap of 90 minutes raises a tracking exception. |
| BR-11 | **Accessorials.** Detention accrues after 2 free hours at a stop, measured from recorded arrival (geofence or driver check-in). Layover, lumper, TONU (truck ordered, not used) and additional stops are the other accessorials. Each needs evidence and shipper approval above a configured threshold. |
| BR-12 | **Cancellation.** A shipper cancelling within 24 hours of pickup after dispatch owes a TONU. A carrier cancelling after booking receives a reliability penalty on its scorecard. |
| BR-13 | **POD.** Delivery is `PodVerified` once a signed POD image is captured and passes review (automatic or finance review). Invoicing waits for POD verification. |
| BR-14 | **Invoicing.** One shipper invoice per load, issued automatically on POD verification, with the POD and rate agreement attached. Terms are set per shipper organisation (default net 30). |
| BR-15 | **Carrier settlement.** Standard pay is issued 3 business days after POD verification. Quick pay pays the same day for a published percentage fee. |
| BR-16 | **Disputes.** An invoice or settlement in dispute stops collection or payout for the disputed amount only, never for the whole account. |
| BR-17 | **Claims.** Overage, shortage and damage (OS&D) claims must be filed within 9 months of delivery with evidence. |
| BR-18 | **Compliance monitoring.** A change in authority or insurance status suspends booking eligibility at once. It does not remove the carrier from loads already booked; those become operations exceptions. |
| BR-19 | **Messaging scope.** Messages belong to a load or a support ticket. There is no free-form direct messaging between shippers and carriers outside a load. |
| BR-20 | **Data retention.** Load records, rate confirmations and POD documents are kept for 7 years. Location history finer than one point per 5 minutes is kept for 90 days. |
| BR-21 | **Public tracking.** A tracking link exposes status, ETA and approximate location only. It never exposes rates, parties' contact details or documents, and it expires 7 days after delivery. |
| BR-22 | **Ratings.** Shippers rate carriers and carriers rate shippers after each delivered load. Scorecards combine ratings with measured on-time, tracking and acceptance data. Carrier cancellations after booking (BR-12) count against tender-acceptance reliability for 90 days, weighted equally with declined tenders; each scorecard states its sample size, period and the count of cancellations included. |
| BR-23 | **Spend authority.** An admin may set a per-load spend limit on any shipper member. Posting a load, accepting a bid or approving an accessorial above the member's limit moves the item to `PendingApproval` and routes it to members with `shipper.approver`. Approval must happen while the quote is valid (BR-06); rejection returns the load to `Draft` with the reason. Approvers cannot approve their own requests. |
| BR-24 | **Identity policy.** An organisation may require SSO for all members. When required, password sign-in is disabled for its members except one designated break-glass admin, SCIM deprovisioning revokes sessions within 5 minutes, and MFA is enforced by the identity provider. Organisations may also set an idle timeout (15–120 minutes) and an IP allow-list for internal-facing roles. |
| BR-25 | **Amendments.** After booking, any change to rate, stops, schedule, equipment or accessorial terms creates a rate confirmation amendment. It binds only when the carrier accepts it with the same evidence as BR-04. Until then the previous confirmation governs. A carrier that declines a material amendment (as defined in configuration) may cancel without a reliability penalty. |
| BR-26 | **Audit immutability.** Audit events are append-only, retained for 7 years, and cannot be edited or deleted by any role, including `internal.admin`. Organisations can read and export their own events. |
| BR-27 | **Support access.** Haulr staff may view an organisation's workspace as one of its members ("view as") only with a linked ticket, for at most 60 minutes per session. Access is read-only unless the organisation grants write consent on that ticket. Every action is audited and visible to the organisation, with the staff member's identity. |
| BR-28 | **Bulk operations.** Bulk import accepts up to 500 loads per file. Every row is validated and priced before any load is created; failed rows never block valid ones; nothing posts until the user confirms the priced batch. Batch operations on existing records follow the same all-rows-reported rule. |
| BR-29 | **Integrations.** API keys are scoped (read or write, per resource), shown once, rotatable with an overlap window of up to 7 days, and revocable immediately. Webhooks are signed (HMAC-SHA256) and retried with exponential back-off for 24 hours. EDI 204, 990, 214 and 210 map to the same backend operations as the UI, so rules apply identically. |
| BR-30 | **Data subject rights.** Personal data export and deletion requests are acknowledged within 7 days and fulfilled within 45 days (CCPA/CPRA). Deletion never removes records Haulr must retain (BR-20, BR-26); those are de-identified where law allows. |
| BR-31 | **Custom quotes.** When the instant quote is unavailable, low-confidence or the lane is unserviceable, a shipper may request a custom quote (XS-18). Haulr operations answer within 2 business hours with a priced quote or a declined reason. A priced custom quote carries its own shipper price and carrier pay (BR-05), at or above the margin floor in platform configuration, and is honoured for the validity the pricing agent sets, within a default and a cap in platform configuration (default 4 hours, cap 24 hours), for the lane, equipment and dates it was priced for (in place of BR-06). Accepting it follows spend authority (BR-23). A request not answered in time is escalated as an exception (XF-08) and the shipper is told. |

## 10. Success Metrics, KPIs and North Star

**North Star metric — Loads delivered on time, end to end, with zero operations touch.** It counts the value delivered to both sides (on time), the network's reliability (delivered) and the business's efficiency (zero touch) in one number.

| ID | KPI | Target (month 12) | Source |
| --- | --- | --- | --- |
| KPI-01 | Quote-to-post conversion | ≥ 35% | Quote and load events |
| KPI-02 | Time to coverage (post to booked), median | ≤ 45 minutes | Load state history |
| KPI-03 | Self-serve booking rate | ≥ 70% | Bookings without an operations actor |
| KPI-04 | On-time pickup / on-time delivery | ≥ 95% / ≥ 93% | Stop arrival versus appointment |
| KPI-05 | Tracking compliance | ≥ 95% of in-transit hours with a fresh location | Location stream |
| KPI-06 | POD to verified, median | ≤ 2 hours | Document events |
| KPI-07 | Days to carrier pay, median | ≤ 3 | Settlement events |
| KPI-08 | Carrier repeat booking rate (30 day) | ≥ 60% | Bookings |
| KPI-09 | Shipper net revenue retention | ≥ 115% | Finance |
| KPI-10 | Operations touches per load | ≤ 0.4 | Operations action log |
| KPI-11 | Disputed invoice rate | ≤ 2% | Invoices |
| KPI-12 | Task success rate for core flows (usability studies) | ≥ 90% | Research |

Success metrics per persona: PR-01 time from quote to coverage; PR-02 revenue per truck per week; PR-03 time to complete a stop workflow; PR-05 invoices paid without dispute; PR-08 exceptions resolved before failure.

## 11. Governance

- **Owner of this design OS.** The product lead owns Phases 1–3; engineering leads own Phases 6–7; the whole team owns Phase 8 status. Changes land as pull requests against `design-os/generated/`.
- **Change control.** A change to a business rule (BR-) or permission (Phase 3) requires product and compliance sign-off. A change to a page's purpose requires product sign-off.
- **Scope preservation.** No specified feature is removed because it is unbuilt. Status lives in [Phase 8](./phase-8-implementation-roadmap.md#9-per-feature-build-status); removal needs an explicit maintainer instruction naming the feature.
- **Decision records.** Any decision that deviates from this document is recorded with its reason in the phase it changes.
- **Reason-required actions.** These actions cannot be submitted without a written reason (1–1,000 characters), which is stored in the audit event (SSB-9, BR-26):
  - every mutation by an internal role
  - load cancellation, rejection of a bid, approval or amendment, and dispute or claim filing
  - reduction of a member's role, removal of a member, and change of a spend limit
  - changes to security policy, SSO, SCIM or IP allow-lists
  - API key revocation
  - starting view-as
  - platform configuration changes
  - compliance decisions
- **Regulatory review.** Broker licensing, payments and data privacy changes are reviewed by compliance before they ship.
- **Visual decisions.** Visual decisions are not governed here. They are made per page at build time with the owner.

## 12. Platform Constraints

- **Stack.** Next.js App Router, React, TypeScript, Tailwind and the host token system, per the host `.claude/CLAUDE.md`. See [Phase 7](./phase-7-frontend-architecture.md).
- **Contract-bound data.** All server data arrives through the generated contract in `lib/contract/`. The frontend never invents response shapes.
- **Authentication.** RS256 session tokens verified at the edge (`proxy.ts`) and in the session route; the backend is the only issuer.
- **Connectivity.** Drivers work on intermittent mobile networks; the driver workflow must tolerate going offline and replay in order.
- **Location privacy.** Driver location is collected only while a load is active and assigned to that driver, with explicit consent.
- **Accessibility.** WCAG 2.2 AA for every surface, including the driver workflow and the map (with a non-map equivalent).
- **Performance budgets.** Page-experience budgets at the 75th percentile on a mid-range phone over 4G are set once, in NFR-PERF-1 (§18.2).
- **Browser support.** Current and previous major versions of Chrome, Edge, Firefox and Safari, plus Safari on iOS 16+ and Chrome on Android 10+.

## 13. Product Principles

How Haulr behaves and treats its users. None of these is a visual decision.

| ID | Principle | Meaning in behaviour |
| --- | --- | --- |
| PP-01 | **Money is never a surprise** | Every price, fee and deduction is stated before the user commits, with how it was derived. |
| PP-02 | **One record, many views** | Shipper, carrier, driver and operations act on the same load. Each sees what their role permits (BR-05) and nothing is copied. |
| PP-03 | **Say how fresh the data is** | Every location, ETA and status carries its source and its age. Stale data is labelled, never passed off as live. |
| PP-04 | **Exceptions find people** | The system detects problems and routes them to the person who can act. It does not wait for someone to look. |
| PP-05 | **Irreversible means confirmed** | Booking, cancelling, paying and deleting ask for explicit confirmation and state the consequence. |
| PP-06 | **Work survives the network** | Drafts, driver events and uploads persist locally and replay when the connection returns. |
| PP-07 | **Plain freight language** | Industry terms (TONU, detention, POD) are used where users expect them and explained once, in context. |
| PP-08 | **Accessible is default** | Every task can be done by keyboard, with a screen reader and without the map. |
| PP-09 | **Evidence over assertion** | Accessorials, claims and disputes carry timestamps, locations and documents gathered automatically where possible. |

## 14. Implementation Philosophy

- **Contract first.** The backend DTO is the origin of every shape. Frontend validation composes over generated schemas.
- **Server state in the query cache.** Loads, bids and locations are server state held by TanStack Query. Local component state holds only what the user is editing.
- **URL is state.** Filters, views, sort and pagination live in URL parameters so any view can be shared and restored.
- **Behaviour before build.** Each page is built from its Phase 4–6 specification. Its look is decided at build time with the owner.
- **Thin pages.** Route files compose sections; data lives in hooks and `lib/data/`.
- **Measure what matters.** Every KPI in Section 10 has an event defined before its feature ships.

## 15. Non-goals

- A general-purpose TMS for shippers managing their own contracted carriers outside Haulr.
- Ocean, air, rail or intermodal freight.
- Parcel or last-mile delivery.
- Fleet maintenance, fuel card or payroll management for carriers.
- Free-form social or direct messaging between organisations (BR-19).
- A native mobile app at launch (A8).
- Factoring beyond Haulr's own quick pay.

## 16. Future Scalability Considerations

- **Partial and LTL.** The load model allows multiple shipments per load and multiple loads per shipment later, without changing the lifecycle states.
- **Multi-stop and drop-trailer.** Stops are an ordered list from the start; drop-and-hook is an attribute of a stop.
- **Cross-border (Canada, Mexico).** Currency, units, customs documents and locale are kept separate from the model so they can be added without migrations to the UI contract.
- **Native driver app.** The driver workflow's offline event queue uses the same backend endpoints a native app would.
- **API and EDI for enterprise shippers.** Load creation and status are backend-first operations, so EDI 204/990/214/210 and the API reuse them. Both are launch scope (A9, BR-29); this consideration keeps later channels and partners on the same operations.
- **Scale.** List views paginate by cursor and never load unbounded collections. Location streams subscribe per visible load. Search is backed by a search index, not a database scan.
- **Internationalisation.** All user-facing copy is externalised in constants so a translation layer can wrap it.

## 17. Glossary

| Term | Meaning |
| --- | --- |
| Load | One shipment moved by one carrier from one or more pickups to one or more deliveries |
| Lane | An origin region and a destination region, used for pricing and search |
| Tender | Offering a load to a specific carrier to accept |
| Rate confirmation | The binding agreement of pay and terms between Haulr and the carrier |
| Accessorial | A charge beyond the linehaul rate (detention, layover, lumper, TONU) |
| POD | Proof of delivery: signed delivery receipt |
| TONU | Truck ordered, not used |
| OS&D | Overage, shortage and damage |
| ELD | Electronic logging device; a location and hours source |
| Check call | A manual status and location report |
| Quick pay | Same-day carrier payment for a fee |
| Amendment | A change to booked terms that the carrier must accept (BR-25) |
| SSO / SCIM | Single sign-on through the customer's identity provider / automated user provisioning and deprovisioning |
| RPO / RTO | Recovery point objective (maximum data loss) / recovery time objective (maximum downtime) |
| SLO | Service level objective: an internal reliability target measured continuously |

---

## 18. Non-Functional Requirements

Every NFR is measurable and verified in [Phase 9](./phase-9-qa-checklist.md). Targets apply to production.

### 18.1 Availability and reliability

| ID | Requirement | Target |
| --- | --- | --- |
| NFR-AV-1 | Workspace availability (sign-in, load, book, track, pay) | 99.9% monthly (≤ 43 min downtime) |
| NFR-AV-2 | Public tracking (PG-02) and driver workflow (PG-39) availability | 99.95% monthly |
| NFR-AV-3 | Planned maintenance | Announced 72 h ahead; ≤ 4 h per month; never during 06:00–20:00 in any US time zone on weekdays |
| NFR-AV-4 | Graceful degradation | When a dependency fails (pricing, maps, registry, processor) only its capability degrades; every other task continues (E-UNAVAILABLE) |
| NFR-AV-5 | Recovery | RPO ≤ 5 min, RTO ≤ 1 h for load, money and audit data; RPO ≤ 1 h for location history |
| NFR-AV-6 | Data durability | No loss of accepted stop events, POD images, rate confirmations or payment records, including events queued offline and replayed within 7 days |

### 18.2 Performance and capacity

| ID | Requirement | Target |
| --- | --- | --- |
| NFR-PERF-1 | Page experience (p75, mid-range phone, 4G) | LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 ([Phase 7 §18](./phase-7-frontend-architecture.md#18-performance-strategy)) |
| NFR-PERF-2 | Server Action and Route Handler latency (p95, excluding backend) | ≤ 100 ms overhead |
| NFR-PERF-3 | End-to-end read latency (p95) | Record ≤ 500 ms; collection page ≤ 800 ms; load board search ≤ 1.2 s |
| NFR-PERF-4 | Instant quote (p95) | ≤ 3 s |
| NFR-PERF-5 | Position update to visible (p95) | ≤ 90 s from device to shipper view |
| NFR-CAP-1 | Concurrent users at peak | 25,000 workspace sessions; 100,000 public tracking views per hour |
| NFR-CAP-2 | Collection sizes | Correct behaviour with 1 million loads per organisation over its history; any collection view returns its first page within NFR-PERF-3 |
| NFR-CAP-3 | Bulk | 500-row import priced within 60 s (BR-28) |

### 18.3 Accessibility, compatibility, localisation

| ID | Requirement | Target |
| --- | --- | --- |
| NFR-A11Y-1 | Conformance | WCAG 2.2 AA on every surface; a published VPAT (Accessibility Conformance Report) at launch, updated each release |
| NFR-COMP-1 | Browsers | Phase 1 §12 matrix |
| NFR-I18N-1 | Localisation readiness | All copy in constants; dates, numbers, currency and units through formatters; no string concatenation of sentences; layouts must tolerate 40% text expansion (checked at build time) |

### 18.4 Observability

| ID | Requirement | Target |
| --- | --- | --- |
| NFR-OBS-1 | Correlation | Every request traceable end to end by `x-request-id` (Phase 4 §2.7) |
| NFR-OBS-2 | Error reporting | 100% of E-SERVER and E-CONTRACT errors reported with release, route and correlation ID, without PII |
| NFR-OBS-3 | Real-user monitoring | Web Vitals for every route, segmented by role and device context |
| NFR-OBS-4 | SLO alerting | Burn-rate alerts on NFR-AV-1, NFR-AV-2 and NFR-PERF-3 |

## 19. Compliance and Regulatory Obligations

| ID | Obligation | Scope in the product | Owner |
| --- | --- | --- | --- |
| CMP-1 | **FMCSA broker authority and BMC-84 surety bond ($75,000)** | Haulr's broker MC number is shown on rate confirmations, invoices and PG-09 | Compliance |
| CMP-2 | **Carrier vetting duty of care** | BR-03, BR-18, XF-12; vetting evidence retained 7 years | Compliance |
| CMP-3 | **49 CFR 371.3 broker records** | Each load's shipper, carrier, bill of lading, compensation and rate confirmation retained 3 years minimum (BR-20 exceeds it) | Compliance, engineering |
| CMP-4 | **E-SIGN Act and UETA** | Rate confirmations, amendments and agreements: consent to electronic records, signer intent, record integrity and retrievable copy (IC-26) | Legal |
| CMP-5 | **PCI DSS (SAQ-A scope)** | Card and bank data only in the processor's hosted fields (A6); no cardholder data in Haulr systems | Security |
| CMP-6 | **NACHA rules** | ACH debit authorisations captured and retained 2 years after revocation | Finance |
| CMP-7 | **CCPA/CPRA and state privacy laws** | Notice at collection, data subject rights (BR-30), no sale of personal data, driver location as sensitive data | Legal, privacy |
| CMP-8 | **SOC 2 Type II** | Controls for access, change management, availability, confidentiality; evidence from audit logs and CI (A10) | Security |
| CMP-9 | **ADA / Section 508 expectations** | NFR-A11Y-1 and VPAT | Product |
| CMP-10 | **Tax forms** | W-9 collection for carriers; 1099-NEC/1099-K data retained for finance | Finance |
| CMP-11 | **OFAC sanctions screening** | Organisations and payees screened at onboarding and on payout-method change | Compliance |

## 20. Identity, Access and Security Requirements

| ID | Requirement |
| --- | --- |
| SEC-1 | **Authentication.** Passwords follow NIST SP 800-63B (minimum 8 characters from `PASSWORD_MIN_LENGTH`, breached-password check, no composition rules, no forced rotation). MFA via TOTP or WebAuthn passkeys; required for `*.admin`, `*.finance`, `shipper.approver`, `org.security` and all internal roles. |
| SEC-2 | **Enterprise SSO.** SAML 2.0 and OIDC, with just-in-time provisioning and SCIM 2.0 user and group provisioning. Groups map to role keys (BR-24). |
| SEC-3 | **Sessions.** httpOnly, Secure, SameSite=Lax cookie; rotation on sign-in and privilege change; idle timeout 30 min for workspace and 15 min for internal roles unless organisation policy is stricter; absolute lifetime ≤ `SESSION_MAX_AGE`; revocation effective within 5 min. |
| SEC-4 | **Authorisation.** Deny by default. Every Server Action, Route Handler and backend endpoint checks role, organisation and record membership (Phase 3 §5). No authorisation decision depends on client state. |
| SEC-5 | **Tenant isolation.** Every backend query is scoped by organisation; cross-tenant access is covered by automated tests on every resource; client caches are purged per SSB-10. |
| SEC-6 | **Privileged access.** Internal roles use SSO with hardware-backed MFA; view-as follows BR-27; production data access by engineers is break-glass only and audited. |
| SEC-7 | **Application security.** OWASP ASVS Level 2 as the verification standard; CSP with nonces; CSRF protection via Server Action origin checks and SameSite cookies; input validated by contract schemas at every boundary; uploads scanned; signed URLs expire within 5 min. |
| SEC-8 | **Secrets and keys.** No secrets in the repository; environment secrets via the host platform; API keys (BR-29) stored hashed and displayed once. |
| SEC-9 | **Vulnerability management.** Dependency scanning on every PR; critical vulnerabilities patched within 7 days, high within 30; annual third-party penetration test plus one before launch. |
| SEC-10 | **Rate limiting and abuse.** Per-IP and per-account limits on authentication, anonymous estimator, tracking, support and invitation endpoints; bot protection on registration. |

## 21. Privacy and Data Governance

| ID | Requirement |
| --- | --- |
| NFR-PRIV-1 | **Data classification.** Every field in the contract is classified: Public, Internal, Confidential (rates, margins, bank details), Restricted (credentials, precise driver location, tax IDs). Classification drives logging, analytics and export rules. |
| NFR-PRIV-2 | **Minimisation.** Collect only what a Phase 4 blueprint lists as required data. Driver location only per Phase 1 §12. |
| NFR-PRIV-3 | **Telemetry hygiene.** Analytics and error reports carry IDs, enums and counts only; never names, emails, phone numbers, free text, document contents or coordinates finer than city. |
| NFR-PRIV-4 | **Retention.** BR-20 and BR-26 schedules enforced by automated jobs; drafts in browser storage expire after 30 days; driver offline queues are kept, device-bound, only until replayed or explicitly discarded, for at most 7 days (SSB-10, NFR-AV-6). |
| NFR-PRIV-5 | **Data subject requests.** BR-30 through XS-15 and PG-62; identity verified before fulfilment. |
| NFR-PRIV-6 | **Organisation data export.** Organisation admins can export their loads, documents, invoices, settlements and audit events in CSV and JSON at any time (XS-15). |
| NFR-PRIV-7 | **Sub-processors.** Maps, payments, e-signature, SMS, email, error reporting and analytics vendors listed publicly (PG-09) with data categories shared. |

## 22. Operational Readiness and Support Model

| ID | Requirement |
| --- | --- |
| OPS-1 | **Support tiers and hours.** Operations and driver support 24/7; shipper and carrier support 06:00–22:00 Central, 7 days; enterprise accounts get a named contact. |
| OPS-2 | **Support response targets.** Urgent (load at risk, cannot sign in, payment failed) first response ≤ 15 min; high ≤ 2 h; normal ≤ 1 business day. Targets drive SLA timers in PG-24. |
| OPS-3 | **Incident communication.** Customer-facing status page and in-product notice for NFR-AV breaches; post-incident report within 5 business days for severity 1. |
| OPS-4 | **Runbooks.** Every E-UNAVAILABLE dependency (pricing, maps, registry, processor, e-signature, SMS) has a runbook covering detection, degradation behaviour and recovery. |
| OPS-5 | **Enterprise contractual terms.** Uptime commitment derived from NFR-AV-1 with service credits; data processing agreement; security questionnaire answered from SOC 2 evidence. |

---

Next: [Phase 2 — Experience Maps](./phase-2-experience-maps.md)
