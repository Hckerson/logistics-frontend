import { describe, expect, it } from "vitest";
import { resolveRoute } from "./match-route";
import type { MockHandler } from "@/lib/types";

const handler: MockHandler = () => ({ status: 200, body: null });
const other: MockHandler = () => ({ status: 204, body: null });

const HANDLERS: Record<string, MockHandler> = {
    "GET /api/loads/counts": other,
    "GET /api/loads/:loadId": handler,
    "POST /api/loads/:loadId/transitions": handler,
};

describe("mock route matching", () => {
    it("prefers an exact route over a pattern that would also match", () => {
        expect(resolveRoute(HANDLERS, "GET", "/api/loads/counts")?.handler).toBe(other);
    });

    it("captures and decodes path parameters", () => {
        expect(resolveRoute(HANDLERS, "GET", "/api/loads/HL-7K2M%209QXA")?.params).toEqual({ loadId: "HL-7K2M 9QXA" });
    });

    it("requires the method and the segment count to agree", () => {
        expect(resolveRoute(HANDLERS, "POST", "/api/loads/HL-1")).toBeNull();
        expect(resolveRoute(HANDLERS, "GET", "/api/loads/HL-1/extra")).toBeNull();
    });
});
