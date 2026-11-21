import type { DriverTripDto } from "@/lib/contract/schemas";
import type { LoadStatus, QueueEntry, QueueEvent, StopAction } from "@/lib/types";

type Stops = DriverTripDto["stops"];

export const currentIndex = (stops: Stops) => stops.findIndex((stop) => !stop.departedAt);

const statusOf = (stops: Stops, fallback: LoadStatus): LoadStatus => {
    const index = currentIndex(stops);
    if (index === -1) return "Delivered";
    const stop = stops[index];
    if (stop.arrivedAt) return stop.type === "pickup" ? "AtPickup" : "AtDelivery";
    return stops.some((candidate) => candidate.departedAt) ? "InTransit" : fallback;
};

const withStops = (trip: DriverTripDto, stops: Stops): DriverTripDto => ({ ...trip, stops, status: statusOf(stops, trip.status) });

export const applyEvent = (trip: DriverTripDto, { type, stopId, recordedAt }: QueueEvent): DriverTripDto => {
    const index = currentIndex(trip.stops);
    if (index === -1 || trip.stops[index].id !== stopId) return trip;
    const stops = trip.stops.map((stop, position) =>
        position !== index ? stop : type === "arrive" ? { ...stop, arrivedAt: recordedAt } : { ...stop, departedAt: recordedAt },
    );
    return withStops(trip, stops);
};

export const revertEvent = (trip: DriverTripDto, { type, stopId }: Pick<QueueEvent, "type" | "stopId">): DriverTripDto =>
    withStops(
        trip,
        trip.stops.map((stop) => (stop.id !== stopId ? stop : type === "arrive" ? { ...stop, arrivedAt: null } : { ...stop, departedAt: null })),
    );

export const overlayTrip = (trip: DriverTripDto, entries: readonly QueueEntry[]) =>
    entries.reduce((shown, entry) => {
        if (entry.failure) return shown;
        if (entry.kind === "event" && entry.event) return applyEvent(shown, entry.event);
        if (entry.kind === "undo" && trip.undo && entry.target === trip.undo.eventId) return revertEvent(shown, trip.undo);
        return shown;
    }, trip);

export const nextAction = (trip: DriverTripDto): StopAction | null => {
    const index = currentIndex(trip.stops);
    if (!trip.active || index === -1) return null;
    const stop = trip.stops[index];
    return { type: stop.arrivedAt ? "depart" : "arrive", stop };
};

export const podOpen = ({ stops }: DriverTripDto) => stops[stops.length - 1].arrivedAt !== null;
