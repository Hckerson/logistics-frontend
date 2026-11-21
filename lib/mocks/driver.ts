import { HTTP_STATUS, TIME_MS } from "@/lib/constants";
import { MOCK_DISPATCH_CONTACTS } from "@/lib/data/mocks/drivers";
import { MOCK_FACILITIES } from "@/lib/data/mocks/facilities";
import { STOP_EVENT_UNDO_MINUTES } from "@/lib/loads/constants";
import { stopFits } from "@/lib/loads/stops";
import { canMove } from "@/lib/loads/transitions";
import { driverStore } from "@/lib/mocks/driver-store";
import { assignedLoad, toSummary, toTrip, tripsOf } from "@/lib/mocks/driver-trips";
import { FREIGHT_MESSAGES, recordEvent, withCaller, type MockCaller } from "@/lib/mocks/freight-access";
import { fail, ok } from "@/lib/mocks/http";
import { applyStopTimes } from "@/lib/mocks/stop-times";
import type { LoadStatus, MockLoad } from "@/lib/types";
import { stopEventSchema, undoRequestSchema } from "@/lib/validations/driver";

export const DRIVER_MESSAGES = {
    missing: "This trip is not assigned to you",
    inactive: "This trip is not active yet",
    moved: "This stop was already updated",
    departure: "Seal number and piece count are required to leave a pickup",
    undoClosed: "Undo is only open for 5 minutes after the event",
    podClosed: "Proof of delivery opens once you arrive at the final delivery",
    podDone: "Proof of delivery is already verified for this load",
    uploading: "Some pages have not finished uploading",
} as const;

const UNDO_MS = STOP_EVENT_UNDO_MINUTES * TIME_MS.minute;
const RECORDED: readonly LoadStatus[] = ["Dispatched", "AtPickup", "InTransit", "AtDelivery"];

export const missing = (path: string) => fail(HTTP_STATUS.notFound, DRIVER_MESSAGES.missing, path);

export const conflict = (path: string, message: string) => fail(HTTP_STATUS.conflict, message, path);

export const tripReply = (caller: MockCaller, load: MockLoad) => ok(HTTP_STATUS.ok, toTrip(caller, load, new Date().getTime()));

const bump = (load: MockLoad, status: LoadStatus, at: number, caller: MockCaller) =>
    Object.assign(load, { status, version: load.version + 1, updatedAt: new Date(at).toISOString(), updatedBy: caller.user.name });

export const listTrips = withCaller((_request, _params, caller) =>
    ok(HTTP_STATUS.ok, {
        trips: tripsOf(caller).map((load) => toSummary(caller, load)),
        dispatch: caller.organisation ? (MOCK_DISPATCH_CONTACTS[caller.organisation] ?? null) : null,
    }),
);

export const getTrip = withCaller(({ path }, { loadId }, caller) => {
    const load = assignedLoad(caller, loadId);
    return load ? tripReply(caller, load) : missing(path);
});

const targetOf = (load: MockLoad, type: "arrive" | "depart", stopIndex: number): LoadStatus => {
    const stop = load.stops[stopIndex];
    if (type === "arrive") return stop.type === "pickup" ? "AtPickup" : "AtDelivery";
    return stopIndex === load.stops.length - 1 ? "Delivered" : "InTransit";
};

export const recordStopEvent = withCaller(({ path, body }, { loadId }, caller) => {
    const load = assignedLoad(caller, loadId);
    if (!load) return missing(path);
    const input = stopEventSchema.safeParse(body);
    if (!input.success) return fail(HTTP_STATUS.badRequest, FREIGHT_MESSAGES.invalid, path);

    const store = driverStore();
    if (store.events.has(input.data.id)) return tripReply(caller, load);
    if (!RECORDED.includes(load.status) || !toSummary(caller, load).active) return conflict(path, DRIVER_MESSAGES.inactive);

    const index = load.stops.findIndex((stop) => !stop.departedAt);
    const stop = load.stops[index];
    const { type, seal, pieces } = input.data;
    if (!stop || stop.id !== input.data.stopId || (type === "arrive") === (stop.arrivedAt !== null)) return conflict(path, DRIVER_MESSAGES.moved);
    if (type === "depart" && stop.type === "pickup" && (seal === undefined || pieces === undefined)) {
        return fail(HTTP_STATUS.unprocessable, DRIVER_MESSAGES.departure, path);
    }

    const to = targetOf(load, type, index);
    if (!canMove(load.status, to, "Driver") || !stopFits(to, load.stops)) return conflict(path, DRIVER_MESSAGES.moved);

    const now = new Date().getTime();
    const at = Math.min(Date.parse(input.data.recordedAt) || now, now);
    const from = load.status;
    applyStopTimes(load.stops, from, to, false, new Date(at).toISOString());
    if (seal !== undefined && pieces !== undefined) store.details.set(stop.id, { seal, pieces });
    bump(load, to, now, caller);
    recordEvent(load.id, caller, {
        type: "statusChanged",
        category: "status",
        fromStatus: from,
        toStatus: to,
        city: MOCK_FACILITIES[stop.facility].city,
        source: "driver",
        occurredAt: new Date(at).toISOString(),
    });
    store.events.set(input.data.id, { id: input.data.id, loadId: load.id, driverId: caller.user.id, type, stopId: stop.id, from, to, at: now, undone: false });
    return tripReply(caller, load);
});

export const undoStopEvent = withCaller(({ path, body }, { loadId, eventId }, caller) => {
    const load = assignedLoad(caller, loadId);
    if (!load) return missing(path);
    const input = undoRequestSchema.safeParse(body);
    if (!input.success) return fail(HTTP_STATUS.badRequest, FREIGHT_MESSAGES.invalid, path);

    const store = driverStore();
    if (store.undos.has(input.data.id)) return tripReply(caller, load);
    const event = store.events.get(eventId);
    const now = new Date().getTime();
    if (!event || event.loadId !== load.id || event.undone || event.to !== load.status || now - event.at > UNDO_MS) {
        return conflict(path, DRIVER_MESSAGES.undoClosed);
    }

    applyStopTimes(load.stops, event.to, event.from, true, new Date(now).toISOString());
    if (event.type === "depart") store.details.delete(event.stopId);
    bump(load, event.from, now, caller);
    recordEvent(load.id, caller, { type: "statusChanged", category: "status", fromStatus: event.to, toStatus: event.from, source: "driver" });
    event.undone = true;
    store.undos.add(input.data.id);
    return tripReply(caller, load);
});
