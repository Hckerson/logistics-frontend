import { AxiosError, AxiosHeaders } from "axios";
import { describe, expect, it } from "vitest";
import { ERROR_COPY } from "@/lib/errors/constants";
import { ActionError, errorClassOf, errorMessage, failureOf, readRetryDelays, unwrap } from "./action-result";

const axiosFailure = (status: number, headers: Record<string, string> = {}) =>
    new AxiosError("failed", "ERR_BAD_RESPONSE", undefined, undefined, {
        status,
        statusText: "",
        data: null,
        headers,
        config: { headers: new AxiosHeaders() },
    });

describe("classifying failures", () => {
    it("maps each status to its error class", () => {
        expect(errorClassOf(400)).toBe("validation");
        expect(errorClassOf(401)).toBe("auth");
        expect(errorClassOf(409)).toBe("conflict");
        expect(errorClassOf(429)).toBe("rate-limit");
        expect(errorClassOf(503)).toBe("unavailable");
        expect(errorClassOf(504)).toBe("timeout");
    });

    it("treats any status it doesn't know as a server error", () => {
        expect(errorClassOf(500)).toBe("server");
        expect(errorClassOf(418)).toBe("server");
    });

    it("states the wait when a rate limit carries one", () => {
        expect(errorMessage(failureOf(429, { retryAfter: 120 }))).toBe("Too many attempts. Try again in 2 min.");
        expect(errorMessage(failureOf(429))).toBe(ERROR_COPY["rate-limit"]);
    });
});

describe("retrying reads", () => {
    it("retries server errors twice with the stated delays", () => {
        expect(readRetryDelays(new ActionError(failureOf(500)))).toEqual([1000, 3000]);
        expect(readRetryDelays(axiosFailure(503))).toEqual([2000, 6000]);
    });

    it("waits out a rate limit once, and only when the wait is known", () => {
        expect(readRetryDelays(axiosFailure(429, { "retry-after": "30" }))).toEqual([30000]);
        expect(readRetryDelays(axiosFailure(429))).toEqual([]);
    });

    it("never retries validation, auth or unknown errors", () => {
        expect(readRetryDelays(new ActionError(failureOf(400)))).toEqual([]);
        expect(readRetryDelays(new ActionError(failureOf(401)))).toEqual([]);
        expect(readRetryDelays(new Error("network"))).toEqual([]);
    });
});

describe("unwrapping results", () => {
    it("returns the data of a success and throws the failure otherwise", () => {
        expect(unwrap({ ok: true, data: 7 })).toBe(7);
        expect(() => unwrap(failureOf(404))).toThrow(ActionError);
    });
});
