# Phase 1 — Product Vision

`Haulr Design OS` · `Version 1.0.0` · `2026-09-30` · Next: [Phase 2 — Experience Maps](./phase-2-experience-maps.md) · Index: [DESIGN-OS-COMPLETE](./DESIGN-OS-COMPLETE.md)

This document is the single source of truth for what Haulr is, who it serves and which rules it obeys. Every later phase cites the IDs defined here (`PR-` personas, `BR-` business rules, `PP-` product principles, `KPI-` metrics).

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

---

## 1. Assumptions

The master prompt's placeholders were resolved as follows. The maintainer chose the product model (freight marketplace) and the name (Haulr). Every other value is an assumption, recorded here so it can be challenged in one place.

| Placeholder | Resolved value | Basis |
| --- | --- | --- |
| `{{PRODUCT_NAME}}` | Haulr | Maintainer choice |
| `{{DOMAIN}}` | Road freight marketplace (full truckload, with partial and less-than-truckload as a later expansion) | Maintainer choice; `docs/economy-coverage-map.md` lists Logistics & Freight as the next sector |
| `{{REFERENCE_PRODUCTS}}` | Uber Freight, Convoy (historical), Loadsmart, Transfix, DAT One, project44, Flexport | Category benchmarks for features and flows only |
| `{{PERSONAS}}` | PR-01 … PR-12 (Section 7) | Derived from marketplace roles |
| `{{CORE_ENTITY}}` / `{{CORE_ENTITY_PLURAL}}` | Load / Loads | Industry term for one shipment moved by one carrier |
| `{{PRIMARY_FLOWS}}` | XF-01 … XF-13 ([Phase 2](./phase-2-experience-maps.md)) | Load lifecycle end to end |
| `{{SUPPORTING_FLOWS}}` | XS-01 … XS-12 ([Phase 2](./phase-2-experience-maps.md)) | Cross-cutting needs of a two-sided marketplace |
| `{{ROLE_DASHBOARDS}}` | XD-01 … XD-08 ([Phase 2](./phase-2-experience-maps.md)) | One per operating role |
| `{{DOMAIN_TOOL}}` | Lane Rate Estimator | Price discovery is the most common reason shippers visit |
| `{{DOMAIN_TRANSACTION}}` | Load booking (rate confirmation) | The moment a carrier commits to move a load |
| `{{DOMAIN_SPECIFIC_LIBS}}` | Map rendering library (proposed, pending approval) | Tracking requires an interactive map |
| `{{SCALE_TARGET}}` | 5 million loads per year, 250,000 carriers, 40,000 shipper organisations, 1.5 million location updates per hour at peak | Mid-size national marketplace at year three |
| `{{COMPONENT_COUNT}}` | 60 interaction contracts | [Phase 6](./phase-6-interaction-contracts.md) |
| `{{SECTION_COUNT}}` | 194 sections (15 shared, 179 page) | [Phase 5](./phase-5-section-blueprints.md) |
| `{{PAGE_COUNT}}` | 55 pages | [Phase 4](./phase-4-page-blueprints.md) |
| `{{TIMELINE_WEEKS}}` | 16 weeks (8 two-week sprints) | [Phase 8](./phase-8-implementation-roadmap.md) |
| `{{QA_ITEM_COUNT}}` | 216 QA items | [Phase 9](./phase-9-qa-checklist.md) |
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
| PR-04 | **Shipper Logistics Manager** | Shipper | Owns freight spend and carrier performance for the organisation | Spend and service reports, preferred carrier rules, team control |
| PR-05 | **Shipper Accounts Payable** | Shipper | Pays invoices in weekly runs | Accurate invoices with POD attached, easy dispute, remittance records |
| PR-06 | **Carrier Owner / Fleet Admin** | Carrier | Owns the authority, the insurance and the bank account | Onboarding done once, payouts visible, compliance standing clear |
| PR-07 | **Consignee / Receiver** | External | Receiving dock or the shipper's customer; no Haulr account | A reliable ETA and delivery confirmation |

### 7.3 Internal and operational personas

| ID | Persona | Context | Key needs |
| --- | --- | --- | --- |
| PR-08 | **Operations Agent** | Watches in-flight loads, rescues uncovered or late loads | A queue of exceptions ordered by risk, acting on any load quickly |
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

## 9. Business Rules

| ID | Rule |
| --- | --- |
| BR-01 | **Load lifecycle.** A load moves through `Draft → Posted → Booked → Dispatched → AtPickup → InTransit → AtDelivery → Delivered → PodVerified → Invoiced → Paid → Closed`. Side states: `Cancelled`, `Expired`, `OnHold`, `Disputed`. Only the transitions in [Phase 2 §5](./phase-2-experience-maps.md#5-load-state-machine) are legal. |
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
| BR-22 | **Ratings.** Shippers rate carriers and carriers rate shippers after each delivered load. Scorecards combine ratings with measured on-time, tracking and acceptance data. |

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
- **Regulatory review.** Broker licensing, payments and data privacy changes are reviewed by compliance before they ship.
- **Visual decisions.** Visual decisions are not governed here. They are made per page at build time with the owner.

## 12. Platform Constraints

- **Stack.** Next.js App Router, React, TypeScript, Tailwind and the host token system, per the host `.claude/CLAUDE.md`. See [Phase 7](./phase-7-frontend-architecture.md).
- **Contract-bound data.** All server data arrives through the generated contract in `lib/contract/`. The frontend never invents response shapes.
- **Authentication.** RS256 session tokens verified at the edge (`proxy.ts`) and in the session route; the backend is the only issuer.
- **Connectivity.** Drivers work on intermittent mobile networks; the driver workflow must tolerate going offline and replay in order.
- **Location privacy.** Driver location is collected only while a load is active and assigned to that driver, with explicit consent.
- **Accessibility.** WCAG 2.2 AA for every surface, including the driver workflow and the map (with a non-map equivalent).
- **Performance budgets.** Largest Contentful Paint ≤ 2.5 s and Interaction to Next Paint ≤ 200 ms at the 75th percentile on a mid-range phone over 4G.
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
- **API and EDI for enterprise shippers.** Load creation and status are backend-first operations, so EDI 204/214/210 and a public API reuse them.
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

---

Next: [Phase 2 — Experience Maps](./phase-2-experience-maps.md)
