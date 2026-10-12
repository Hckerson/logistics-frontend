import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { todayValue } from "@/lib/utils/date-formatter";
import { saveEstimate } from "./save-estimate";

const session = vi.hoisted((): { current: { email: string } | null } => ({ current: null }));

vi.mock("next/headers", () => ({
    cookies: () => Promise.resolve({ get: () => undefined }),
}));

vi.mock("@/lib/utils/session", () => ({ getSession: () => Promise.resolve(session.current) }));

const lane = { origin: "Chicago, IL", destination: "Dallas, TX", equipment: "dry-van", date: todayValue() } as const;

beforeEach(() => {
    session.current = { email: "dispatch@northline.example" };
    vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(
            new Response(JSON.stringify({ statusCode: 201, message: "Success", data: { id: "est_1" }, timestamp: "2026-10-10T00:00:00Z" }), {
                status: 201,
                headers: { "Content-Type": "application/json" },
            }),
        ),
    );
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("saving an estimate", () => {
    it("saves for the signed-in account", async () => {
        expect(await saveEstimate(lane, 2140)).toEqual({ ok: true, data: "est_1" });
    });

    it("needs a session before reaching the backend", async () => {
        session.current = null;
        expect(await saveEstimate(lane, 2140)).toMatchObject({ ok: false, status: 401 });
        expect(fetch).not.toHaveBeenCalled();
    });
});
