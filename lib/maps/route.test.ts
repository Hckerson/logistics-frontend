import { describe, expect, it } from "vitest";
import { encodePolyline } from "@/lib/maps/polyline";
import { pointAtShare, routeLine, shareAt } from "@/lib/maps/route";
import type { LonLat } from "@/lib/types";

const PATH: LonLat[] = [
    [-90, 40],
    [-89, 40],
    [-88, 40],
];

describe("route line", () => {
    it("decodes a polyline into a path with shares of the route by distance", () => {
        const line = routeLine(encodePolyline(PATH));
        expect(line?.path).toEqual(PATH);
        expect(line?.timestamps[0]).toBe(0);
        expect(line?.timestamps[1]).toBeCloseTo(0.5, 5);
        expect(line?.timestamps[2]).toBe(1);
    });

    it("refuses a route with fewer than two points", () => {
        expect(routeLine(encodePolyline([[-90, 40]]))).toBeNull();
    });

    it("projects a point beside the route onto the nearest share", () => {
        const line = routeLine(encodePolyline(PATH));
        if (!line) throw new Error("route expected");
        expect(shareAt(line, [-89.5, 40.2])).toBeCloseTo(0.25, 2);
        expect(shareAt(line, [-95, 40])).toBe(0);
        expect(shareAt(line, [-80, 40])).toBe(1);
    });

    it("places a share back on the route", () => {
        const line = routeLine(encodePolyline(PATH));
        if (!line) throw new Error("route expected");
        const [lon, lat] = pointAtShare(line, 0.75);
        expect(lon).toBeCloseTo(-88.5, 2);
        expect(lat).toBeCloseTo(40, 5);
    });
});
