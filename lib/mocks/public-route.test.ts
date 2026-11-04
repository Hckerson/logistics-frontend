import { describe, expect, it } from "vitest";
import { MOCK_FACILITIES } from "@/lib/data/mocks/facilities";
import { TRACKING } from "@/lib/loads/constants";
import { roundTo } from "@/lib/loads/tracking";
import { decodePolyline } from "@/lib/maps/polyline";
import { freightStore } from "@/lib/mocks/freight-store";
import { PUBLIC_ROUTE_CLEARANCE_MILES, publicRoute } from "@/lib/mocks/public-route";
import type { LonLat } from "@/lib/types";
import { milesApart } from "@/lib/utils/geo";

const LIVE_LOAD = "HL-7K2M9QXA";

const loadFor = (id: string) => {
    const load = freightStore().loads.get(id);
    if (!load) throw new Error(`seed load ${id} missing`);
    return load;
};

const facilitiesOf = (id: string): LonLat[] =>
    loadFor(id).stops.map(({ facility }) => [MOCK_FACILITIES[facility].longitude, MOCK_FACILITIES[facility].latitude]);

const cityLevel = ([lon, lat]: LonLat): LonLat => [roundTo(lon, TRACKING.publicDecimals), roundTo(lat, TRACKING.publicDecimals)];

describe("public route", () => {
    it("follows the road instead of joining the stops with a straight line", () => {
        const route = publicRoute(loadFor(LIVE_LOAD));
        const path = decodePolyline(route?.polyline ?? "");
        expect(path.length).toBeGreaterThan(facilitiesOf(LIVE_LOAD).length * 5);
        expect(route?.miles).toBeGreaterThan(milesApart(path[0], path[path.length - 1]));
    });

    it("starts and ends at the city-level stop points", () => {
        const path = decodePolyline(publicRoute(loadFor(LIVE_LOAD))?.polyline ?? "");
        const facilities = facilitiesOf(LIVE_LOAD);
        expect(path[0]).toEqual(cityLevel(facilities[0]));
        expect(path[path.length - 1]).toEqual(cityLevel(facilities[facilities.length - 1]));
    });

    it("comes no closer to a facility than city level except at the rounded stop point", () => {
        const stops = facilitiesOf(LIVE_LOAD);
        const path = decodePolyline(publicRoute(loadFor(LIVE_LOAD))?.polyline ?? "");
        const near = path.filter((point) => stops.some((stop) => milesApart(point, stop) <= PUBLIC_ROUTE_CLEARANCE_MILES));
        expect(near.every((point) => stops.some((stop) => cityLevel(stop).every((value, axis) => value === point[axis])))).toBe(true);
    });
});
