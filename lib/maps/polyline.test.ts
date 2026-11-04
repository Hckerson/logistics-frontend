import { describe, expect, it } from "vitest";
import type { LonLat } from "@/lib/types";
import { decodePolyline, encodePolyline } from "./polyline";

const REFERENCE: LonLat[] = [
    [-120.2, 38.5],
    [-120.95, 40.7],
    [-126.453, 43.252],
];

const ENCODED = "_p~iF~ps|U_ulLnnqC_mqNvxq`@";

describe("polyline", () => {
    it("encodes the published reference route", () => {
        expect(encodePolyline(REFERENCE)).toBe(ENCODED);
    });

    it("decodes the published reference route", () => {
        expect(decodePolyline(ENCODED)).toEqual(REFERENCE);
    });

    it("round-trips a route at five decimal places", () => {
        const route: LonLat[] = [
            [-87.62979, 41.87811],
            [-96.79699, 32.77666],
        ];
        expect(decodePolyline(encodePolyline(route))).toEqual(route);
    });

    it("decodes an empty polyline to an empty route", () => {
        expect(decodePolyline("")).toEqual([]);
    });
});
