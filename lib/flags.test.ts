import { afterEach, describe, expect, it, vi } from "vitest";
import { FLAG_KEYS, FLAGS, flagVariable, readFlags } from "@/lib/flags";

afterEach(() => {
    vi.unstubAllEnvs();
});

describe("feature flags", () => {
    it.each(FLAG_KEYS)("retires %s before its removal date", (key) => {
        expect(Date.parse(FLAGS[key].removeBy)).toBeGreaterThan(new Date().getTime());
    });

    it("names each flag's environment override in screaming snake case", () => {
        expect(flagVariable("driverServiceWorker")).toBe("FLAG_DRIVER_SERVICE_WORKER");
    });

    it("falls back to each flag's default", () => {
        expect(readFlags().bulkImport).toBe(FLAGS.bulkImport.default);
    });

    it("lets the environment switch a flag", () => {
        vi.stubEnv(flagVariable("viewAs"), "on");
        expect(readFlags().viewAs).toBe(true);
    });

    it("refuses a malformed override", () => {
        vi.stubEnv(flagVariable("sso"), "yes");
        expect(() => readFlags()).toThrow(/FLAG_SSO/);
    });
});
