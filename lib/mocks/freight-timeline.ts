import { nanoid } from "nanoid";
import { TIME_MS } from "@/lib/constants";
import { MOCK_DOCUMENTS, MOCK_TRACKING_LINKS } from "@/lib/data/mocks/freight";
import { TRACKING } from "@/lib/loads/constants";
import type { LoadEventDto } from "@/lib/contract/schemas";
import type { LoadStatus, MockLoad, MockLoadEvent } from "@/lib/types";

type Actor = Pick<LoadEventDto, "actorType" | "actorName" | "source">;

const STEP_HOURS = { posted: 0.5, booked: 2, dispatched: 3, verified: 2, invoiced: 8 } as const;
const CANCEL_REASON = "Customer moved the order to next week";
const CHECK_CALL_LOAD = "HL-3RW8TNPE";
const CHECK_CALL_MINUTES_AGO = 6;

const SHIPPER: Actor = { actorType: "member", actorName: "Dana Okafor", source: "web" };
const SYSTEM: Actor = { actorType: "system", actorName: null, source: "system" };
const OPS: Actor = { actorType: "staff", actorName: "Theo Banks", source: "operations" };
const RIDGEWAY = "ridgeway";

const carrierActor = (load: MockLoad): Actor => ({ actorType: "member", actorName: load.carrier === RIDGEWAY ? "Ray Okoro" : null, source: "web" });

const driverActor = (load: MockLoad, source: Actor["source"]): Actor => ({ actorType: "member", actorName: load.carrier === RIDGEWAY ? "Ana Ruiz" : null, source });

const event = (load: MockLoad, at: number, actor: Actor, fields: Partial<LoadEventDto> & Pick<LoadEventDto, "type" | "category">): MockLoadEvent => ({
    id: nanoid(),
    loadId: load.id,
    fromStatus: null,
    toStatus: null,
    reason: null,
    note: null,
    city: null,
    occurredAt: new Date(at).toISOString(),
    ...actor,
    ...fields,
});

const statusEvents = (load: MockLoad): MockLoadEvent[] => {
    const created = Date.parse(load.createdAt);
    const events: MockLoadEvent[] = [];
    let current: LoadStatus = "Draft";
    const step = (to: LoadStatus, at: number, actor: Actor, reason: string | null = null) => {
        events.push(event(load, at, actor, { type: "statusChanged", category: "status", fromStatus: current, toStatus: to, reason }));
        current = to;
    };
    const after = (hours: number) => created + hours * TIME_MS.hour;

    if (load.status === "PendingApproval") step("PendingApproval", after(STEP_HOURS.posted), SHIPPER);
    if (load.status === "Draft" || load.status === "PendingApproval") return events;

    step("Posted", after(STEP_HOURS.posted), SHIPPER);
    if (load.status === "Cancelled") step("Cancelled", after(STEP_HOURS.booked), SHIPPER, CANCEL_REASON);
    if (load.status === "Cancelled" || load.status === "Posted") return events;

    step("Booked", after(STEP_HOURS.booked), carrierActor(load));
    if (load.status === "Booked") return events;
    step("Dispatched", after(STEP_HOURS.dispatched), carrierActor(load));

    load.stops.forEach((stop, index) => {
        if (stop.arrivedAt) step(stop.type === "pickup" ? "AtPickup" : "AtDelivery", Date.parse(stop.arrivedAt), driverActor(load, "geofence"));
        if (stop.departedAt) step(index === load.stops.length - 1 ? "Delivered" : "InTransit", Date.parse(stop.departedAt), driverActor(load, "driver"));
    });

    const delivered = load.stops[load.stops.length - 1].departedAt;
    if (load.status === "Invoiced" && delivered) {
        step("PodVerified", Date.parse(delivered) + STEP_HOURS.verified * TIME_MS.hour, SYSTEM);
        step("Invoiced", Date.parse(delivered) + STEP_HOURS.invoiced * TIME_MS.hour, SYSTEM);
    }
    return events;
};

const sideEvents = (load: MockLoad, now: number): MockLoadEvent[] => [
    ...MOCK_TRACKING_LINKS.filter((link) => link.load === load.id).flatMap((link) => [
        event(load, now - link.ageHours * TIME_MS.hour, SHIPPER, { type: "trackingLinkCreated", category: "tracking" }),
        ...(link.revokedHoursAgo ? [event(load, now - link.revokedHoursAgo * TIME_MS.hour, SHIPPER, { type: "trackingLinkRevoked", category: "tracking" })] : []),
    ]),
    ...MOCK_DOCUMENTS.filter((document) => document.load === load.id && document.scanStatus !== "rejected").map((document) =>
        event(load, now - document.ageHours * TIME_MS.hour, { actorType: "member", actorName: document.by, source: "web" }, { type: "documentUploaded", category: "document" }),
    ),
    ...((load.track?.silentMinutes ?? 0) >= TRACKING.exceptionMinutes
        ? [event(load, now - ((load.track?.silentMinutes ?? 0) - TRACKING.exceptionMinutes) * TIME_MS.minute, SYSTEM, { type: "trackingStale", category: "tracking" })]
        : []),
    ...(load.id === CHECK_CALL_LOAD
        ? [event(load, now - CHECK_CALL_MINUTES_AGO * TIME_MS.minute, OPS, { type: "checkCallRequested", category: "tracking", note: "Driver app quiet since Indio" })]
        : []),
];

export const timelineOf = (load: MockLoad, now: number) => [...statusEvents(load), ...sideEvents(load, now)];
