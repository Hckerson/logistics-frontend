import { nanoid } from "nanoid";
import { TIME_MS } from "@/lib/constants";
import { MOCK_DOCUMENTS, MOCK_NOTIFICATIONS, MOCK_TRACKING_LINKS } from "@/lib/data/mocks/freight";
import { MOCK_FREIGHT, MOCK_LOADS } from "@/lib/data/mocks/loads";
import { timelineOf } from "@/lib/mocks/freight-timeline";
import type {
    MockCharge,
    MockDocument,
    MockLoad,
    MockLoadEvent,
    MockLoadSpec,
    MockNotification,
    MockTrackingLink,
} from "@/lib/types";

interface FreightStore {
    loads: Map<string, MockLoad>;
    events: MockLoadEvent[];
    links: Map<string, MockTrackingLink>;
    documents: Map<string, MockDocument>;
    notifications: Map<string, MockNotification>;
    blobs: Map<string, Uint8Array<ArrayBuffer>>;
    scans: Map<string, number>;
}

const holder = globalThis as typeof globalThis & { haulrFreightStore?: FreightStore };

const at = (now: number, hours: number) => new Date(now + hours * TIME_MS.hour).toISOString();

const chargesOf = ({ priceCents, payCents, pendingCents }: MockLoadSpec): MockCharge[] => [
    { party: "shipper", kind: "linehaul", amountCents: priceCents, status: "agreed" },
    { party: "shipper", kind: "fuel", amountCents: Math.round(priceCents * MOCK_FREIGHT.fuelShare), status: "agreed" },
    ...(pendingCents ? [{ party: "shipper", kind: "accessorial", amountCents: pendingCents, status: "pendingApproval" } satisfies MockCharge] : []),
    ...(payCents > 0
        ? [
              { party: "carrier", kind: "linehaul", amountCents: payCents, status: "agreed" } satisfies MockCharge,
              { party: "carrier", kind: "fuel", amountCents: Math.round(payCents * MOCK_FREIGHT.fuelShare), status: "agreed" } satisfies MockCharge,
          ]
        : []),
];

const loadFrom = (spec: MockLoadSpec, now: number): MockLoad => ({
    id: spec.id,
    status: spec.status,
    version: 1,
    shipper: spec.shipper,
    carrier: spec.carrier ?? null,
    driver: spec.driver ?? null,
    equipment: spec.equipment,
    commodity: spec.commodity,
    weightLb: spec.weightLb,
    pallets: spec.pallets ?? null,
    tempMinF: spec.tempF?.[0] ?? null,
    tempMaxF: spec.tempF?.[1] ?? null,
    hazmat: spec.hazmat ?? false,
    poNumber: spec.poNumber ?? null,
    bolNumber: spec.bolNumber ?? null,
    stops: spec.stops.map((stop, index) => ({
        id: `${spec.id}-${index + 1}`,
        sequence: index + 1,
        type: stop.type,
        facility: stop.facility,
        windowStart: at(now, stop.opensIn),
        windowEnd: at(now, stop.opensIn + MOCK_FREIGHT.windowHours),
        reference: null,
        instructions: null,
        arrivedAt: stop.arrived === undefined ? null : at(now, -stop.arrived),
        departedAt: stop.departed === undefined ? null : at(now, -stop.departed),
    })),
    charges: chargesOf(spec),
    track: spec.track ?? null,
    seededAt: now,
    createdAt: at(now, -spec.ageHours),
    updatedAt: at(now, 0),
});

const seedFreight = (): FreightStore => {
    const now = Date.now();
    const loads = MOCK_LOADS.map((spec) => loadFrom(spec, now));
    const events = loads.flatMap((load) => timelineOf(load, now));

    return {
        loads: new Map(loads.map((load) => [load.id, { ...load, version: 1 + events.filter((event) => event.loadId === load.id && event.type === "statusChanged").length }])),
        events,
        links: new Map(
            MOCK_TRACKING_LINKS.map((link) => [
                link.token,
                { id: nanoid(), token: link.token, loadId: link.load, createdByName: link.by, createdAt: at(now, -link.ageHours), revokedAt: link.revokedHoursAgo ? at(now, -link.revokedHoursAgo) : null },
            ]),
        ),
        documents: new Map(
            MOCK_DOCUMENTS.map((document, index) => {
                const id = `doc_${index + 1}`;
                const contentType = document.fileName.endsWith(".pdf") ? "application/pdf" : document.fileName.endsWith(".png") ? "image/png" : "image/jpeg";
                return [id, { id, loadId: document.load, type: document.type, fileName: document.fileName, contentType, sizeBytes: document.sizeBytes, scanStatus: document.scanStatus, version: 1, uploadedByName: document.by, createdAt: at(now, -document.ageHours) }];
            }),
        ),
        notifications: new Map(
            MOCK_NOTIFICATIONS.map((notification) => {
                const id = nanoid();
                const createdAt = at(now, -notification.ageHours);
                return [id, { id, userId: notification.user, event: notification.event, loadId: notification.load, createdAt, readAt: notification.read ? createdAt : null }];
            }),
        ),
        blobs: new Map(),
        scans: new Map(),
    };
};

export const freightStore = (): FreightStore => (holder.haulrFreightStore ??= seedFreight());
