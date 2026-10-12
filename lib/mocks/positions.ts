import { can } from "@/lib/auth/capabilities";
import { HTTP_STATUS, TIME_MS } from "@/lib/constants";
import { checkCallDtoSchema } from "@/lib/contract/schemas";
import { TRACE_STATUSES, TRACKED_STATUSES, TRACKING } from "@/lib/loads/constants";
import { healthOf, minutesSince } from "@/lib/loads/tracking";
import { etaOf, latestPosition, trackOf } from "@/lib/mocks/fleet";
import { FREIGHT_MESSAGES, loadMissing, recordEvent, sees, visibleLoad, withCaller } from "@/lib/mocks/freight-access";
import { freightStore } from "@/lib/mocks/freight-store";
import { fail, ok } from "@/lib/mocks/http";

const CHECK_CALL_MESSAGES = {
    closed: "A check call opens once the last position is an hour old",
    recent: "A check call was requested in the last 30 minutes",
} as const;

export const loadPositions = withCaller(({ path }, { loadId }, caller) => {
    const load = visibleLoad(caller, loadId, "viewLiveLocation");
    if (!load) return loadMissing(path);

    const now = Date.now();
    const latest = TRACE_STATUSES.includes(load.status) ? latestPosition(load, now) : null;
    return ok(HTTP_STATUS.ok, {
        latest,
        track: trackOf(load, now),
        eta: etaOf(load, now),
        health: latest && TRACKED_STATUSES.includes(load.status) ? healthOf(latest.recordedAt, now) : null,
    });
});

export const mapPositions = withCaller((_request, _params, caller) => {
    if (!can(caller.user.roles, "viewLiveLocation")) return ok(HTTP_STATUS.ok, []);

    const now = Date.now();
    const positions = [...freightStore().loads.values()]
        .filter(sees(caller))
        .filter((load) => TRACKED_STATUSES.includes(load.status))
        .slice(0, TRACKING.mapLoadLimit)
        .flatMap((load) => {
            const latest = latestPosition(load, now);
            return latest ? [{ ...latest, loadId: load.id, status: load.status }] : [];
        });
    return ok(HTTP_STATUS.ok, positions);
});

export const requestCheckCall = withCaller(({ path, body }, { loadId }, caller) => {
    const load = visibleLoad(caller, loadId, "requestCheckCall");
    if (!load) return loadMissing(path);
    const input = checkCallDtoSchema.safeParse(body ?? {});
    if (!input.success) return fail(HTTP_STATUS.badRequest, FREIGHT_MESSAGES.invalid, path);

    const now = Date.now();
    const latest = latestPosition(load, now);
    const quiet = !latest || minutesSince(latest.recordedAt, now) >= TRACKING.staleMinutes;
    if (!TRACKED_STATUSES.includes(load.status) || !quiet) return fail(HTTP_STATUS.conflict, CHECK_CALL_MESSAGES.closed, path);

    const recent = freightStore().events.some(
        (event) =>
            event.loadId === load.id &&
            event.type === "checkCallRequested" &&
            now - Date.parse(event.occurredAt) < TRACKING.checkCallRepeatMinutes * TIME_MS.minute,
    );
    if (recent) return fail(HTTP_STATUS.conflict, CHECK_CALL_MESSAGES.recent, path);

    const event = recordEvent(load.id, caller, { type: "checkCallRequested", category: "tracking", note: input.data.note ?? null });
    return ok(HTTP_STATUS.created, { requestedAt: event.occurredAt });
});
