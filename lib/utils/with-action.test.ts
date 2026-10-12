import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CORRELATION_HEADER } from "@/lib/errors/constants";
import type { SessionPayload } from "@/lib/utils/verify-session-token";
import { failureOf } from "@/lib/utils/action-result";
import { getSession } from "@/lib/utils/session";
import { withAction, withHandler, withSessionAction, withSessionHandler } from "./with-action";

vi.mock("@/lib/utils/session", () => ({ getSession: vi.fn() }));

const SIGNED_IN: SessionPayload = { sub: "usr_1", email: "dana@northline.example", role: "USER", iat: 0, exp: 1 };
const request = () => new NextRequest(new URL("https://app.test/api/thing"));

beforeEach(() => {
    vi.mocked(getSession).mockResolvedValue(null);
});

describe("wrapping server actions", () => {
    it("passes the signed-in user and a correlation ID to the action", async () => {
        vi.mocked(getSession).mockResolvedValue(SIGNED_IN);
        const action = withAction(async ({ user, correlationId }) => ({ ok: true, data: { email: user?.email, correlationId } }));

        const result = await action();

        expect(result).toMatchObject({ ok: true, data: { email: SIGNED_IN.email } });
        expect(result.ok && result.data.correlationId).toBeTruthy();
    });

    it("stamps every failure with the correlation ID", async () => {
        const action = withAction(async () => failureOf(409, { message: "taken" }));

        expect(await action()).toMatchObject({ ok: false, status: 409, correlationId: expect.any(String) });
    });

    it("turns an unexpected throw into a server error instead of leaking it", async () => {
        const action = withAction(async (): Promise<{ ok: true; data: null }> => {
            throw new Error("boom");
        });

        expect(await action()).toMatchObject({ ok: false, status: 500, errorClass: "server" });
    });

    it("refuses a session-only action without a session", async () => {
        const run = vi.fn();
        const action = withSessionAction(run);

        expect(await action()).toMatchObject({ ok: false, status: 401, errorClass: "auth" });
        expect(run).not.toHaveBeenCalled();
    });

    it("refuses a role-restricted action to other roles", async () => {
        vi.mocked(getSession).mockResolvedValue(SIGNED_IN);
        const action = withSessionAction(async () => ({ ok: true, data: null }), ["internal.admin"]);

        expect(await action()).toMatchObject({ ok: false, status: 403, errorClass: "forbidden" });
    });
});

describe("wrapping route handlers", () => {
    it("tags every response with the correlation ID", async () => {
        const handler = withHandler(async () => NextResponse.json({ ok: true }));

        expect((await handler(request())).headers.get(CORRELATION_HEADER)).toBeTruthy();
    });

    it("answers 500 with a reference when the handler throws", async () => {
        const handler = withHandler(async () => {
            throw new Error("boom");
        });
        const response = await handler(request());

        expect(response.status).toBe(500);
        expect((await response.json()).correlationId).toBe(response.headers.get(CORRELATION_HEADER));
    });

    it("refuses a session-only handler without a session", async () => {
        const handler = withSessionHandler(async () => NextResponse.json({ ok: true }));

        expect((await handler(request())).status).toBe(401);
    });
});
