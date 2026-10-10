import { describe, expect, it } from "vitest";
import { DASHBOARD_ROUTE, HOME_ROUTE } from "@/lib/constants";
import { internalPath } from "./internal-path";

describe("post-login redirect targets", () => {
    it("keeps a path within the app", () => {
        expect(internalPath("/dashboard/settings")).toBe("/dashboard/settings");
    });

    it("refuses an absolute url pointing off-site", () => {
        expect(internalPath("https://evil.test/steal")).toBe(HOME_ROUTE);
    });

    it("refuses a protocol-relative url, which also leaves the site", () => {
        expect(internalPath("//evil.test/steal")).toBe(HOME_ROUTE);
    });

    it("falls back home when nothing was requested", () => {
        expect(internalPath(undefined)).toBe(HOME_ROUTE);
    });

    it("falls back to the caller's destination when one is given", () => {
        expect(internalPath("https://evil.test/steal", DASHBOARD_ROUTE)).toBe(DASHBOARD_ROUTE);
    });
});
