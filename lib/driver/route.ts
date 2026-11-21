import type { DriverTripDto } from "@/lib/contract/schemas";
import { currentIndex } from "@/lib/driver/trip";
import { shareAt } from "@/lib/maps/route";
import type { LonLat, MapRoute, MapStop, RouteLine } from "@/lib/types";

type Stop = DriverTripDto["stops"][number];

const placeOf = ({ facility }: Stop): LonLat => [facility.longitude, facility.latitude];

export const tripStops = ({ stops }: DriverTripDto): MapStop[] => stops.map((stop) => ({ position: placeOf(stop), type: stop.type, done: Boolean(stop.departedAt) }));

export const tripRoute = (trip: DriverTripDto, line: RouteLine | null, here: LonLat | null): MapRoute | null => {
    if (!line) return null;
    if (currentIndex(trip.stops) === -1) return { ...line, travelled: 1, live: false };
    const reached = trip.stops.filter((stop) => stop.arrivedAt).at(-1);
    const travelled = here && trip.active ? shareAt(line, here) : reached ? shareAt(line, placeOf(reached)) : 0;
    return { ...line, travelled, live: Boolean(here) && trip.status === "InTransit" };
};

export const milesToNext = (trip: DriverTripDto, route: MapRoute | null) => {
    const index = currentIndex(trip.stops);
    if (!route || !trip.route || index < 1) return null;
    return Math.max(0, Math.round(trip.route.miles * (shareAt(route, placeOf(trip.stops[index])) - route.travelled)));
};

export const laneProgress = (stops: readonly Pick<Stop, "departedAt">[]) => stops.filter((stop) => stop.departedAt).length / Math.max(stops.length, 1);
