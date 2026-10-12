import { describe, expect, it } from "vitest";
import { deliveredAt, healthOf, linkExpiry, trackingSettled } from "./tracking";

const NOW = Date.parse("2026-10-12T12:00:00.000Z");
const minutesAgo = (minutes: number) => new Date(NOW - minutes * 60_000).toISOString();

describe("tracking health", () => {
    it("stays fresh under an hour, turns stale at sixty minutes and raises an exception at ninety", () => {
        expect(healthOf(minutesAgo(59), NOW)).toBe("fresh");
        expect(healthOf(minutesAgo(60), NOW)).toBe("stale");
        expect(healthOf(minutesAgo(90), NOW)).toBe("exception");
    });
});

describe("tracking link lifetime", () => {
    it("has no delivery time until every stop is departed", () => {
        expect(deliveredAt([{ departedAt: minutesAgo(10) }, { departedAt: null }])).toBeNull();
        expect(deliveredAt([{ departedAt: minutesAgo(90) }, { departedAt: minutesAgo(10) }])).toBe(minutesAgo(10));
    });

    it("closes links seven days after delivery", () => {
        expect(linkExpiry("2026-10-01T00:00:00.000Z")).toBe("2026-10-08T00:00:00.000Z");
        expect(linkExpiry(null)).toBeNull();
    });

    it("stops polling once a load is delivered, cancelled or expired", () => {
        expect(trackingSettled({ expired: false, deliveredAt: null, status: "InTransit" })).toBe(false);
        expect(trackingSettled({ expired: false, deliveredAt: minutesAgo(5), status: "Delivered" })).toBe(true);
        expect(trackingSettled({ expired: false, deliveredAt: null, status: "Cancelled" })).toBe(true);
    });
});
