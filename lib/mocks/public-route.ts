import { MOCK_FACILITIES } from "@/lib/data/mocks/facilities";
import { TRACKING } from "@/lib/loads/constants";
import { roundTo } from "@/lib/loads/tracking";
import { encodePolyline } from "@/lib/maps/polyline";
import { roadRoute } from "@/lib/mocks/road-route";
import type { PublicRouteDto } from "@/lib/contract/schemas";
import type { LonLat, MockLoad } from "@/lib/types";
import { cumulativeMiles, milesApart } from "@/lib/utils/geo";

export const PUBLIC_ROUTE_CLEARANCE_MILES = 8;

const routes = new Map<string, PublicRouteDto>();

const placeOf = (facility: string): LonLat => [MOCK_FACILITIES[facility].longitude, MOCK_FACILITIES[facility].latitude];

const rounded = ([lon, lat]: LonLat): LonLat => [roundTo(lon, TRACKING.publicDecimals), roundTo(lat, TRACKING.publicDecimals)];

const clear = (from: LonLat, to: LonLat) => (point: LonLat) =>
    milesApart(point, from) > PUBLIC_ROUTE_CLEARANCE_MILES && milesApart(point, to) > PUBLIC_ROUTE_CLEARANCE_MILES;

export const publicRoute = (load: MockLoad): PublicRouteDto | null => {
    const known = routes.get(load.id);
    if (known) return known;

    const places = load.stops.map((stop) => placeOf(stop.facility));
    if (places.length < 2) return null;

    const legs = places.slice(1).map((to, index) => ({ from: places[index], to, road: roadRoute(places[index], to) }));
    const path = legs.flatMap(({ from, to, road }, index) => {
        const leg = [rounded(from), ...road.filter(clear(from, to)), rounded(to)];
        return index === 0 ? leg : leg.slice(1);
    });
    const miles = legs.reduce((total, { road }) => total + (cumulativeMiles(road).at(-1) ?? 0), 0);
    const route = { polyline: encodePolyline(path), miles: Math.round(miles) };
    routes.set(load.id, route);
    return route;
};
