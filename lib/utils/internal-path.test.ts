import { describe, expect, it } from "vitest";
import { HOME_ROUTE } from "@/lib/constants";
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
});
