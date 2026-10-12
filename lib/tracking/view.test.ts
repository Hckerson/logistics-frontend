import { describe, expect, it } from "vitest";
import type { PublicTrackingDto } from "@/lib/contract/schemas";
import { trackingLead } from "@/lib/tracking/lead";
import { ageOf, laneOf, mapStops, nextStop, phaseOf } from "@/lib/tracking/view";

const stop = (type: "pickup" | "delivery", departedAt: string | null): PublicTrackingDto["stops"][number] => ({
    type,
    city: type === "pickup" ? "Chicago" : "Dallas",
    region: type === "pickup" ? "IL" : "TX",
    timeZone: "America/Chicago",
    latitude: type === "pickup" ? 41.9 : 32.8,
    longitude: type === "pickup" ? -87.6 : -96.8,
    windowStart: "2026-10-14T13:00:00Z",
    windowEnd: "2026-10-14T15:30:00Z",
    arrivedAt: departedAt,
    departedAt,
});

const eta = { at: "2026-10-14T19:30:00Z", confidence: "high", late: false, milesRemaining: 410 } as const;

const tracking: PublicTrackingDto = {
    reference: "HL-7K2M9QXA",
    status: "InTransit",
    sharedBy: "Northline Freight",
    stops: [stop("pickup", "2026-10-13T14:00:00Z"), stop("delivery", null)],
    eta,
    position: null,
    deliveredAt: null,
    expiresAt: null,
    expired: false,
};

describe("public tracking view", () => {
    it("maps load statuses onto the phases a consignee understands", () => {
        expect(phaseOf(tracking)).toBe("transit");
        expect(phaseOf({ ...tracking, status: "Booked" })).toBe("scheduled");
        expect(phaseOf({ ...tracking, deliveredAt: "2026-10-14T20:00:00Z" })).toBe("delivered");
    });

    it("finds the next stop and places stops on the map with lon/lat order", () => {
        expect(nextStop(tracking.stops)).toBe(1);
        expect(mapStops(tracking.stops)[0]).toEqual({ position: [-87.6, 41.9], type: "pickup", done: true });
        expect(laneOf(tracking.stops)).toEqual([[-87.6, 41.9], [-96.8, 32.8]]);
    });

    it("states the arrival in the delivery stop's time zone, and says when it is late", () => {
        expect(trackingLead(tracking)).toBe("Arriving Wed, Oct 14 around 2:30 PM.");
        expect(trackingLead({ ...tracking, eta: { ...eta, late: true } })).toMatch(/^Running late/);
        expect(trackingLead({ ...tracking, eta: null })).toMatch(/unavailable/);
    });

    it("speaks of minutes for recent positions and hours after that", () => {
        expect(ageOf(4)).toMatch(/4 min/);
        expect(ageOf(185)).toMatch(/3 hr/);
    });
});
