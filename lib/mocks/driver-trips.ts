import { hasAnyRole, ROLE_GROUPS } from "@/lib/auth/roles";
import { TIME_MS } from "@/lib/constants";
import { documentDtoSchema, type DriverTripDto, type DriverTripSummaryDto } from "@/lib/contract/schemas";
import { MOCK_DISPATCH_CONTACTS, MOCK_FACILITY_CONTACTS } from "@/lib/data/mocks/drivers";
import { MOCK_FACILITIES } from "@/lib/data/mocks/facilities";
import { MOCK_ORGANISATIONS } from "@/lib/data/mocks/team";
import { DRIVER_MOVING_STATUSES, DRIVER_TRIP_STATUSES } from "@/lib/driver/constants";
import { STOP_EVENT_UNDO_MINUTES } from "@/lib/loads/constants";
import { driverStore } from "@/lib/mocks/driver-store";
import { recordEvent, type MockCaller } from "@/lib/mocks/freight-access";
import { freightStore } from "@/lib/mocks/freight-store";
import { routeOf } from "@/lib/mocks/fleet";
import { placeOf } from "@/lib/mocks/load-views";
import type { MockLoad } from "@/lib/types";

const UNDO_MS = STOP_EVENT_UNDO_MINUTES * TIME_MS.minute;
export const HIDDEN_DOCUMENTS = new Set(["rateConfirmation"]);

export const assignedLoad = ({ user }: MockCaller, loadId: string) => {
    const load = freightStore().loads.get(loadId);
    return load && hasAnyRole(user.roles, ROLE_GROUPS.driver) && load.driver === user.id ? load : null;
};

const settlePod = (load: MockLoad, caller: MockCaller, now: number) => {
    const pod = driverStore().pods.get(load.id);
    if (!pod) return null;
    if (!pod.settled && now >= pod.verifyAt) {
        const { documents } = freightStore();
        pod.pageIds.forEach((id) => {
            const page = documents.get(id);
            if (page) page.scanStatus = "clean";
        });
        pod.settled = true;
    }
    if (pod.settled && load.status === "Delivered") {
        Object.assign(load, { status: "PodVerified", version: load.version + 1, updatedAt: new Date(now).toISOString() });
        recordEvent(load.id, caller, {
            type: "statusChanged",
            category: "status",
            fromStatus: "Delivered",
            toStatus: "PodVerified",
            actorType: "system",
            actorName: null,
            source: "system",
        });
    }
    return pod;
};

const hasPod = (load: MockLoad) =>
    driverStore().pods.has(load.id) ||
    [...freightStore().documents.values()].some((document) => document.loadId === load.id && document.type === "pod" && document.scanStatus !== "rejected");

const finalArrived = ({ stops }: MockLoad) => stops[stops.length - 1].arrivedAt !== null;

const needsPod = (load: MockLoad) => finalArrived(load) && !hasPod(load);

const rank = (load: MockLoad) => {
    if (DRIVER_MOVING_STATUSES.includes(load.status) && load.status !== "Delivered") return 0;
    if (load.status === "Delivered") return 1;
    return load.status === "Dispatched" ? 2 : 3;
};

const onTrip = (load: MockLoad) => DRIVER_TRIP_STATUSES.includes(load.status) && (load.status !== "Delivered" || needsPod(load));

export const tripsOf = ({ user }: MockCaller) =>
    [...freightStore().loads.values()]
        .filter((load) => load.driver === user.id && onTrip(load))
        .sort((first, second) => rank(first) - rank(second) || Date.parse(first.stops[0].windowStart) - Date.parse(second.stops[0].windowStart));

const isActive = (caller: MockCaller, load: MockLoad) => {
    const current = tripsOf(caller)[0];
    return current?.id === load.id && current.status !== "Booked";
};

const nextStopOf = ({ stops }: MockLoad) => {
    const stop = stops.find((candidate) => !candidate.departedAt);
    if (!stop) return null;
    const { name, city, region, timeZone } = MOCK_FACILITIES[stop.facility];
    return { type: stop.type, name, city, region, windowStart: stop.windowStart, windowEnd: stop.windowEnd, timeZone };
};

const cityOf = (facility: string) => ({ city: MOCK_FACILITIES[facility].city, region: MOCK_FACILITIES[facility].region });

export const toSummary = (caller: MockCaller, load: MockLoad): DriverTripSummaryDto => ({
    loadId: load.id,
    status: load.status,
    active: isActive(caller, load),
    stopCount: load.stops.length,
    stopsDone: load.stops.filter((stop) => stop.departedAt).length,
    needsPod: needsPod(load),
    nextStop: nextStopOf(load),
    origin: cityOf(load.stops[0].facility),
    destination: cityOf(load.stops[load.stops.length - 1].facility),
});

const undoOf = (caller: MockCaller, load: MockLoad, now: number) => {
    const last = [...driverStore().events.values()]
        .filter((event) => event.loadId === load.id && event.driverId === caller.user.id)
        .sort((first, second) => second.at - first.at)[0];
    if (!last || last.undone || last.to !== load.status || now - last.at > UNDO_MS) return null;
    return { eventId: last.id, type: last.type, stopId: last.stopId, until: new Date(last.at + UNDO_MS).toISOString() };
};

export const toTrip = (caller: MockCaller, load: MockLoad, now: number): DriverTripDto => {
    const pod = settlePod(load, caller, now);
    const { details } = driverStore();
    return {
        loadId: load.id,
        status: load.status,
        active: isActive(caller, load),
        equipment: load.equipment,
        commodity: load.commodity,
        weightLb: load.weightLb,
        pallets: load.pallets,
        tempMinF: load.tempMinF,
        tempMaxF: load.tempMaxF,
        hazmat: load.hazmat,
        poNumber: load.poNumber,
        bolNumber: load.bolNumber,
        shipperName: MOCK_ORGANISATIONS[load.shipper].name,
        stops: load.stops.map(({ facility, ...stop }) => ({
            ...stop,
            facility: placeOf(facility),
            contact: MOCK_FACILITY_CONTACTS[facility] ?? null,
            seal: details.get(stop.id)?.seal ?? null,
            pieces: details.get(stop.id)?.pieces ?? null,
        })),
        dispatch: load.carrier ? (MOCK_DISPATCH_CONTACTS[load.carrier] ?? null) : null,
        documents: [...freightStore().documents.values()]
            .filter((document) => document.loadId === load.id && !HIDDEN_DOCUMENTS.has(document.type) && document.scanStatus !== "awaitingUpload")
            .map((document) => documentDtoSchema.parse(document)),
        pod: pod && {
            id: pod.id,
            status: pod.settled ? "verified" : "checking",
            pages: pod.pageIds.length,
            submittedAt: new Date(pod.submittedAt).toISOString(),
        },
        undo: undoOf(caller, load, now),
        route: routeOf(load),
    };
};
