import { describe, expect, it } from "vitest";
import { unpublishedRoutes } from "@/lib/api-routes";
import { mockRequest } from "@/lib/mocks/router";
import { TREND, UNRESOLVED_LOCATION } from "@/lib/quotes/constants";
import type { LaneQuery } from "@/lib/types";
import { todayValue } from "@/lib/utils/date-formatter";
import { estimateEnvelopeSchema, placesEnvelopeSchema, trendEnvelopeSchema } from "@/lib/validations/lane";

const lane = (origin: string, destination: string): LaneQuery => ({ origin, destination, equipment: "dry-van", date: todayValue() });
const get = (path: string) => mockRequest({ method: "GET", path, body: null }, 0);

describe("mock pricing", () => {
    it("prices a lane between two major hubs with high confidence and a range around the rate", async () => {
        const response = await get(unpublishedRoutes.pricingEstimate(lane("Chicago, IL", "Dallas, TX")));
        const { data } = estimateEnvelopeSchema.parse(response.body);
        expect(data.confidence).toBe("high");
        expect(data.low).toBeLessThan(data.rate);
        expect(data.high).toBeGreaterThan(data.rate);
        expect(data.origin.code).toBe("CHI");
    });

    it("answers a thin lane with low confidence and too little trend history", async () => {
        const estimate = estimateEnvelopeSchema.parse((await get(unpublishedRoutes.pricingEstimate(lane("Boise, ID", "Billings, MT")))).body);
        const trend = trendEnvelopeSchema.parse((await get(unpublishedRoutes.pricingTrend(lane("Boise, ID", "Billings, MT")))).body);
        expect(estimate.data.confidence).toBe("low");
        expect(trend.data.length).toBeLessThan(TREND.minimumDays);
    });

    it("refuses an unresolvable origin by naming the field", async () => {
        const response = await get(unpublishedRoutes.pricingEstimate(lane("Atlantis", "Dallas, TX")));
        expect(response.status).toBe(422);
        expect(response.body).toMatchObject({ message: UNRESOLVED_LOCATION.origin });
    });

    it("plays the rate-limit and outage scenarios", async () => {
        const busy = await get(unpublishedRoutes.pricingEstimate(lane("busy", "Dallas, TX")));
        const down = await get(unpublishedRoutes.pricingEstimate(lane("down", "Dallas, TX")));
        expect(busy.status).toBe(429);
        expect(busy.headers).toMatchObject({ "Retry-After": "60" });
        expect(down.status).toBe(503);
    });

    it("suggests hubs that match the typed text", async () => {
        const { data } = placesEnvelopeSchema.parse((await get(unpublishedRoutes.places("dal"))).body);
        expect(data.map((place) => place.code)).toContain("DAL");
    });
});
