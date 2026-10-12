import { nanoid } from "nanoid";
import { HTTP_STATUS } from "@/lib/constants";
import { reasonDtoSchema } from "@/lib/contract/schemas";
import { MOCK_FACILITIES } from "@/lib/data/mocks/facilities";
import { MOCK_TRACKING_SCENARIOS } from "@/lib/data/mocks/freight";
import { MOCK_ORGANISATIONS } from "@/lib/data/mocks/team";
import { TRACKED_STATUSES, TRACKING, TRACKING_SHARE } from "@/lib/loads/constants";
import { deliveredAt, linkExpiry, roundTo } from "@/lib/loads/tracking";
import { etaOf, latestPosition } from "@/lib/mocks/fleet";
import { FREIGHT_MESSAGES, loadMissing, reasonMissing, recordEvent, visibleLoad, withCaller, type MockCaller } from "@/lib/mocks/freight-access";
import { freightStore } from "@/lib/mocks/freight-store";
import { fail, ok, playScenario } from "@/lib/mocks/http";
import type { MockHandler, MockLoad, MockTrackingLink } from "@/lib/types";
import { trackingSendSchema } from "@/lib/validations/tracking";

const LINK_MISSING = "Tracking link not found";
const LINK_CLOSED = "Tracking links close 7 days after delivery";

const closed = (expiresAt: string | null, now: number) => expiresAt !== null && Date.parse(expiresAt) <= now;

const toLink = (link: MockTrackingLink, expiresAt: string | null, now: number) => ({
    id: link.id,
    token: link.token,
    active: !link.revokedAt && !closed(expiresAt, now),
    createdByName: link.createdByName,
    createdAt: link.createdAt,
    revokedAt: link.revokedAt,
    expiresAt,
});

const shareable = (load: MockLoad, caller: MockCaller, reason: string | undefined, path: string) => {
    const missing = reasonMissing(caller, reason, path);
    if (missing) return { failure: missing };

    const now = Date.now();
    const expiresAt = linkExpiry(deliveredAt(load.stops));
    if (closed(expiresAt, now)) return { failure: fail(HTTP_STATUS.conflict, LINK_CLOSED, path) };

    const store = freightStore();
    const active = [...store.links.values()].find((link) => link.loadId === load.id && !link.revokedAt);
    if (active) return { link: toLink(active, expiresAt, now) };

    const link = { id: nanoid(), token: `${TRACKING_SHARE.tokenPrefix}${nanoid(TRACKING_SHARE.tokenLength)}`, loadId: load.id, createdByName: caller.user.name, createdAt: new Date(now).toISOString(), revokedAt: null };
    store.links.set(link.token, link);
    recordEvent(load.id, caller, { type: "trackingLinkCreated", category: "tracking", reason: reason ?? null });
    return { link: toLink(link, expiresAt, now) };
};

export const publicTracking: MockHandler = ({ path }, { token }) => {
    const scenario = playScenario(MOCK_TRACKING_SCENARIOS[token], path);
    if (scenario) return scenario;

    const { links, loads } = freightStore();
    const link = links.get(token);
    const load = link && !link.revokedAt ? loads.get(link.loadId) : undefined;
    if (!load) return fail(HTTP_STATUS.notFound, LINK_MISSING, path);

    const now = Date.now();
    const delivered = deliveredAt(load.stops);
    const expiresAt = linkExpiry(delivered);
    const expired = closed(expiresAt, now);
    const position = expired || !TRACKED_STATUSES.includes(load.status) ? null : latestPosition(load, now);

    return ok(HTTP_STATUS.ok, {
        reference: load.id,
        status: load.status,
        sharedBy: MOCK_ORGANISATIONS[load.shipper].name,
        stops: load.stops.map(({ type, facility, windowStart, windowEnd, arrivedAt, departedAt }) => {
            const { city, region, timeZone, latitude, longitude } = MOCK_FACILITIES[facility];
            const [lat, lon] = [latitude, longitude].map((value) => roundTo(value, TRACKING.publicDecimals));
            return { type, city, region, timeZone, latitude: lat, longitude: lon, windowStart, windowEnd, arrivedAt, departedAt };
        }),
        eta: expired ? null : etaOf(load, now),
        position: position && {
            latitude: roundTo(position.latitude, TRACKING.publicDecimals),
            longitude: roundTo(position.longitude, TRACKING.publicDecimals),
            city: position.city,
            source: position.source,
            recordedAt: position.recordedAt,
        },
        deliveredAt: delivered,
        expiresAt,
        expired,
    });
};

export const listLinks = withCaller(({ path }, { loadId }, caller) => {
    const load = visibleLoad(caller, loadId, "shareTrackingLink");
    if (!load) return loadMissing(path);

    const now = Date.now();
    const expiresAt = linkExpiry(deliveredAt(load.stops));
    const links = [...freightStore().links.values()]
        .filter((link) => link.loadId === load.id)
        .sort((first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt));
    return ok(HTTP_STATUS.ok, links.map((link) => toLink(link, expiresAt, now)));
});

export const createLink = withCaller(({ path, body }, { loadId }, caller) => {
    const load = visibleLoad(caller, loadId, "shareTrackingLink");
    if (!load) return loadMissing(path);
    const input = reasonDtoSchema.safeParse(body ?? {});
    if (!input.success) return fail(HTTP_STATUS.badRequest, FREIGHT_MESSAGES.invalid, path);

    const shared = shareable(load, caller, input.data.reason, path);
    return "failure" in shared ? shared.failure : ok(HTTP_STATUS.ok, shared.link);
});

export const sendLink = withCaller(({ path, body }, { loadId }, caller) => {
    const load = visibleLoad(caller, loadId, "shareTrackingLink");
    if (!load) return loadMissing(path);
    const input = trackingSendSchema.safeParse(body);
    if (!input.success) return fail(HTTP_STATUS.badRequest, FREIGHT_MESSAGES.invalid, path);

    const shared = shareable(load, caller, undefined, path);
    return "failure" in shared ? shared.failure : ok(HTTP_STATUS.ok, { link: shared.link, sent: input.data.recipients.length });
});

export const revokeLink = withCaller(({ path, body }, { linkId }, caller) => {
    const store = freightStore();
    const link = [...store.links.values()].find((candidate) => candidate.id === linkId && !candidate.revokedAt);
    const load = link ? visibleLoad(caller, link.loadId, "shareTrackingLink") : null;
    if (!link || !load) return fail(HTTP_STATUS.notFound, LINK_MISSING, path);

    const input = reasonDtoSchema.safeParse(body ?? {});
    if (!input.success) return fail(HTTP_STATUS.badRequest, FREIGHT_MESSAGES.invalid, path);
    const missing = reasonMissing(caller, input.data.reason, path);
    if (missing) return missing;

    const now = Date.now();
    link.revokedAt = new Date(now).toISOString();
    recordEvent(load.id, caller, { type: "trackingLinkRevoked", category: "tracking", reason: input.data.reason ?? null });
    return ok(HTTP_STATUS.ok, toLink(link, linkExpiry(deliveredAt(load.stops)), now));
});
