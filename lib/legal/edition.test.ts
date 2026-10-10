import { describe, expect, it } from "vitest";
import { LEGAL_LIBRARY, LEGAL_VERSIONS } from "@/lib/data/legal/library";
import { findEdition, legalDate, legalParams } from "@/lib/legal/edition";

describe("legal editions", () => {
    it("serves the current version when none is named", () => {
        const found = findEdition("terms");
        expect(found?.edition.version).toBe(LEGAL_VERSIONS.terms);
        expect(found?.replacedBy).toBeNull();
    });

    it("keeps a superseded version retrievable and names what replaced it", () => {
        const [current, earlier] = LEGAL_LIBRARY.terms.versions;
        const found = findEdition("terms", [earlier.version]);
        expect(found?.edition.version).toBe(earlier.version);
        expect(found?.replacedBy?.version).toBe(current.version);
    });

    it("refuses unknown documents, unknown versions and extra path segments", () => {
        expect(findEdition("cookies")).toBeNull();
        expect(findEdition("terms", ["9.9"])).toBeNull();
        expect(findEdition("terms", ["1.0", "extra"])).toBeNull();
    });

    it("prerenders every document and every earlier version", () => {
        const versions = Object.values(LEGAL_LIBRARY).reduce((total, document) => total + document.versions.length, 0);
        expect(legalParams()).toHaveLength(versions);
    });

    it("formats effective dates without shifting the day", () => {
        expect(legalDate("2026-10-01")).toBe("October 1, 2026");
    });
});
