import { describe, expect, it } from "vitest";
import { routes } from "@/lib/contract/routes";
import { MOCK_USERS } from "@/lib/data/mocks/users";
import { freightStore } from "@/lib/mocks/freight-store";
import { mockRequest } from "@/lib/mocks/router";
import { signMockToken } from "@/lib/mocks/session-token";
import { loadEnvelopeSchema, loadPageEnvelopeSchema, uploadTicketEnvelopeSchema } from "@/lib/validations/freight";
import { trackingEnvelopeSchema } from "@/lib/validations/tracking";

const tokenFor = async (email: string) => {
    const user = MOCK_USERS.find((candidate) => candidate.email === email);
    return user ? signMockToken(user) : undefined;
};

const send = async (email: string | null, method: string, path: string, body: unknown = null) =>
    mockRequest({ method, path, body, token: email ? await tokenFor(email) : undefined }, 0);

const SHIPPER = "dispatch@northline.example";
const CARRIER = "ray@ridgeway.example";
const OPS = "ops@haulr.test";

describe("freight mock scoping", () => {
    it("shows a shipper its own loads and a carrier only what it carries", async () => {
        const shipper = loadPageEnvelopeSchema.parse((await send(SHIPPER, "GET", routes.loadsFindAll())).body).data.items;
        const carrier = loadPageEnvelopeSchema.parse((await send(CARRIER, "GET", routes.loadsFindAll())).body).data.items;
        expect(shipper.every((load) => load.shipper.id === "northline")).toBe(true);
        expect(carrier.every((load) => load.carrier?.id === "ridgeway")).toBe(true);
    });

    it("answers 404, not 403, for a load outside the caller's scope and 401 when signed out", async () => {
        expect((await send(CARRIER, "GET", routes.loadsFindOne("HL-9DQ4ZB2M"))).status).toBe(404);
        expect((await send(null, "GET", routes.loadsFindOne("HL-7K2M9QXA"))).status).toBe(401);
    });

    it("shows shippers the price and carriers the pay, never the other side", async () => {
        const shipper = loadEnvelopeSchema.parse((await send(SHIPPER, "GET", routes.loadsFindOne("HL-7K2M9QXA"))).body).data;
        const carrier = loadEnvelopeSchema.parse((await send(CARRIER, "GET", routes.loadsFindOne("HL-7K2M9QXA"))).body).data;
        expect([shipper.shipperPrice !== null, shipper.carrierPay]).toEqual([true, null]);
        expect([carrier.shipperPrice, carrier.carrierPay !== null]).toEqual([null, true]);
    });
});

describe("public tracking tokens", () => {
    it("serves city-level coordinates and closes revoked or unknown links as not found", async () => {
        const live = trackingEnvelopeSchema.parse((await send(null, "GET", routes.publicTrackingFind("trk_7K2M9QXA"))).body).data;
        expect(live.position?.latitude.toString()).toMatch(/^-?\d+(\.\d)?$/);
        expect((await send(null, "GET", routes.publicTrackingFind("trk_3RW8REVK"))).status).toBe(404);
        expect((await send(null, "GET", routes.publicTrackingFind("nope"))).status).toBe(404);
    });

    it("keeps an expired link answering, without a position", async () => {
        const expired = trackingEnvelopeSchema.parse((await send(null, "GET", routes.publicTrackingFind("trk_5RT8VK3M"))).body).data;
        expect([expired.expired, expired.position]).toEqual([true, null]);
    });
});

describe("load moves", () => {
    it("reads leaving a pickup and stepping back within five minutes as an undo", async () => {
        const read = async () => loadEnvelopeSchema.parse((await send(CARRIER, "GET", routes.loadsFindOne("HL-5HJ2KX8C"))).body).data;
        const departed = await send(CARRIER, "POST", routes.loadsTransition("HL-5HJ2KX8C"), { to: "InTransit", version: (await read()).version });
        expect(departed.status).toBe(200);
        await send(CARRIER, "POST", routes.loadsTransition("HL-5HJ2KX8C"), { to: "AtPickup", version: (await read()).version });
        const after = await read();
        expect([after.status, after.stops[0].departedAt, after.stops[1].arrivedAt]).toEqual(["AtPickup", null, null]);
    });

    it("refuses a stale version and asks staff for a reason", async () => {
        expect((await send(SHIPPER, "POST", routes.loadsTransition("HL-3ZK8PE5D"), { to: "Posted", version: 99 })).status).toBe(412);
        expect((await send(OPS, "POST", routes.trackingLinksCreate("HL-6NX2HV9T"), {})).status).toBe(422);
    });

    it("opens a check call only once tracking has gone quiet", async () => {
        expect((await send(CARRIER, "POST", routes.positionsCheckCall("HL-7K2M9QXA"), {})).status).toBe(409);
        expect((await send(OPS, "POST", routes.positionsCheckCall("HL-9DQ4ZB2M"), {})).status).toBe(201);
        expect((await send(OPS, "POST", routes.positionsCheckCall("HL-9DQ4ZB2M"), {})).status).toBe(409);
    });
});

describe("document uploads", () => {
    it("waits for the file to reach storage, then queues the scan", async () => {
        const request = { type: "pod", fileName: "pod.pdf", contentType: "application/pdf", sizeBytes: 4 };
        const ticket = uploadTicketEnvelopeSchema.parse((await send(SHIPPER, "POST", routes.documentsRequestUpload("HL-7K2M9QXA"), request)).body).data;
        expect((await send(SHIPPER, "POST", routes.documentsComplete(ticket.document.id))).status).toBe(409);
        freightStore().blobs.set(ticket.document.id, new Uint8Array([0x25, 0x50, 0x44, 0x46]));
        expect((await send(SHIPPER, "POST", routes.documentsComplete(ticket.document.id))).body).toMatchObject({ data: { scanStatus: "pending" } });
    });
});
