import { describe, expect, it } from "vitest";
import { hasAnyRole, ROLE_GROUPS } from "./roles";

describe("role checks", () => {
    it("lets a holder of any allowed role through", () => {
        expect(hasAnyRole(["shipper.member", "org.security"], ROLE_GROUPS.shipper)).toBe(true);
    });

    it("keeps customers out of internal areas", () => {
        expect(hasAnyRole(["shipper.admin", "carrier.admin"], ROLE_GROUPS.internal)).toBe(false);
    });

    it("treats a session without roles as holding none", () => {
        expect(hasAnyRole([], ROLE_GROUPS.driver)).toBe(false);
    });

    it("keeps drivers out of the dispatch workspace", () => {
        expect(hasAnyRole(["carrier.driver"], ROLE_GROUPS.carrier)).toBe(false);
    });
});
