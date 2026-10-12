import { describe, expect, it } from "vitest";
import { TREND } from "@/lib/quotes/constants";
import { nearestIndex, trendDirection, trendShape } from "@/lib/quotes/trend";

const points = (rates: number[]) => rates.map((perMile, index) => ({ date: `2026-10-${String(index + 1).padStart(2, "0")}`, perMile, samples: 5 }));

describe("lane trend", () => {
    it("states the direction and size of the change from the first day to the last", () => {
        expect(trendDirection(points([2, 2.1, 2.2]))).toEqual({ direction: "up", change: expect.closeTo(0.1) });
        expect(trendDirection(points([2.2, 2.1, 2]))).toMatchObject({ direction: "down" });
        expect(trendDirection(points([2, 2.01]))).toMatchObject({ direction: "flat" });
    });

    it("plots the lowest rate at the bottom and the highest at the top", () => {
        const { plotted } = trendShape(points([2, 3]));
        expect(plotted[0].y).toBe(TREND.height - TREND.pad);
        expect(plotted[1].y).toBe(TREND.pad);
    });

    it("snaps a pointer position to the nearest day", () => {
        const { step } = trendShape(points([2, 2.1, 2.2, 2.3]));
        expect(nearestIndex(TREND.pad + step * 1.4, step, 4)).toBe(1);
        expect(nearestIndex(TREND.width * 2, step, 4)).toBe(3);
    });
});
