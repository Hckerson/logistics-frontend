import { describe, expect, it } from "vitest";
import { canMove, canReturn, nextStatuses } from "./transitions";

describe("load status moves", () => {
    it("lets a shipper post a draft but not a carrier", () => {
        expect(canMove("Draft", "Posted", "Shipper")).toBe(true);
        expect(canMove("Draft", "Posted", "Carrier")).toBe(false);
    });

    it("offers a shipper every legal move from a draft", () => {
        expect(nextStatuses("Draft", "Shipper").sort()).toEqual(["Cancelled", "PendingApproval", "Posted"]);
    });

    it("sends approvals through an approver, never the requester alone", () => {
        expect(canMove("PendingApproval", "Posted", "Approver")).toBe(true);
        expect(canMove("PendingApproval", "Posted", "Shipper")).toBe(false);
    });

    it("lets operations and compliance hold any active load, but not a closed one", () => {
        expect(canMove("InTransit", "OnHold", "Compliance")).toBe(true);
        expect(canMove("Paid", "OnHold", "Operations")).toBe(true);
        expect(canMove("Closed", "OnHold", "Operations")).toBe(false);
        expect(canMove("Draft", "OnHold", "Operations")).toBe(false);
    });

    it("never offers a move the table doesn't list", () => {
        expect(canMove("Posted", "Delivered", "Operations")).toBe(false);
        expect(nextStatuses("Closed", "Operations")).toEqual([]);
    });

    it("lets only the system close a paid load", () => {
        expect(canMove("Paid", "Closed", "System")).toBe(true);
        expect(canMove("Paid", "Closed", "Finance")).toBe(false);
    });
});

describe("returning to the previous status", () => {
    it("lets the crew undo a stop event", () => {
        expect(canReturn("Delivered", "Driver")).toBe(true);
        expect(canReturn("Delivered", "Shipper")).toBe(false);
    });

    it("releases a hold through operations and a dispute through finance", () => {
        expect(canReturn("OnHold", "Operations")).toBe(true);
        expect(canReturn("OnHold", "Compliance")).toBe(false);
        expect(canReturn("Disputed", "Finance")).toBe(true);
    });
});
