import { AxiosError, AxiosHeaders, type AxiosResponse } from "axios";
import { describe, expect, it } from "vitest";
import { estimateFailure } from "@/lib/quotes/failure";
import { UNRESOLVED_LOCATION } from "@/lib/quotes/constants";

const answered = (status: number, data: unknown = null, headers: Record<string, string> = {}) => {
    const response: AxiosResponse = { status, statusText: "", data, headers, config: { headers: new AxiosHeaders() } };
    return new AxiosError("failed", undefined, undefined, undefined, response);
};

describe("estimate failures", () => {
    it("carries the wait from a rate limit", () => {
        expect(estimateFailure(answered(429, null, { "retry-after": "60" }))).toEqual({ kind: "rate-limited", wait: 60 });
    });

    it("points an unresolved location at its field", () => {
        expect(estimateFailure(answered(422, { message: UNRESOLVED_LOCATION.destination }))).toEqual({
            kind: "unresolved",
            field: "destination",
        });
    });

    it("tells an outage, a timeout and anything else apart", () => {
        expect(estimateFailure(answered(503))).toEqual({ kind: "unavailable" });
        expect(estimateFailure(new AxiosError("slow", "ECONNABORTED"))).toEqual({ kind: "timeout" });
        expect(estimateFailure(new Error("parse"))).toEqual({ kind: "server" });
    });
});
