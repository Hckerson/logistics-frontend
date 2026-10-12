import { describe, expect, it } from "vitest";
import { ANNOUNCEMENT_TIMING } from "@/lib/announcer/constants";
import type { Announcement } from "@/lib/types";
import { advance, EMPTY_QUEUE, enqueue, shownFor } from "./announcement-queue";

const note = (id: string, message: string, extra: Partial<Announcement> = {}): Announcement => ({ id, message, tone: "polite", ...extra });

describe("announcement queue", () => {
    it("shows one announcement at a time and queues the rest", () => {
        const queue = enqueue(enqueue(EMPTY_QUEUE, note("a", "Ticket opened.")), note("b", "Feedback sent."));

        expect(queue.current?.id).toBe("a");
        expect(queue.waiting.map((entry) => entry.id)).toEqual(["b"]);
        expect(advance(queue).current?.id).toBe("b");
    });

    it("merges a message identical to one already showing or waiting", () => {
        const queue = enqueue(enqueue(EMPTY_QUEUE, note("a", "Signed out.")), note("b", "Signed out."));

        expect(queue.waiting).toHaveLength(0);
    });

    it("keeps a message for at least six seconds, longer for longer text", () => {
        expect(shownFor(note("a", "Done."))).toBe(ANNOUNCEMENT_TIMING.minimumMs);
        expect(shownFor(note("b", "x".repeat(200)))).toBe(200 * ANNOUNCEMENT_TIMING.perCharacterMs);
    });

    it("keeps a message that carries an action until it is dismissed", () => {
        expect(shownFor(note("a", "Bid accepted.", { action: { label: "View", href: "/loads/1" } }))).toBeNull();
    });
});
