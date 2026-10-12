import { describe, expect, it } from "vitest";
import { stopFits } from "./stops";

const done = "2026-10-12T08:00:00.000Z";
const twoStops = (pickupDeparted: string | null) => [
    { type: "pickup" as const, departedAt: pickupDeparted },
    { type: "delivery" as const, departedAt: null },
];

describe("stop fit for a forward move", () => {
    it("allows arriving at a pickup only when the next stop is one", () => {
        expect(stopFits("AtPickup", twoStops(null))).toBe(true);
        expect(stopFits("AtPickup", twoStops(done))).toBe(false);
    });

    it("treats leaving the last stop as delivery, not transit", () => {
        expect(stopFits("InTransit", twoStops(done))).toBe(false);
        expect(stopFits("Delivered", twoStops(done))).toBe(true);
    });

    it("lets a multi-stop load leave a middle delivery in transit", () => {
        const stops = [...twoStops(done), { type: "delivery" as const, departedAt: null }];
        expect(stopFits("InTransit", stops)).toBe(true);
    });

    it("never blocks moves that do not touch a stop", () => {
        expect(stopFits("OnHold", twoStops(null))).toBe(true);
    });
});
