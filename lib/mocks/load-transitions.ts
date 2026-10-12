import { actorsOf } from "@/lib/auth/capabilities";
import { HTTP_STATUS, TIME_MS } from "@/lib/constants";
import { loadTransitionDtoSchema } from "@/lib/contract/schemas";
import { MOCK_ORGANISATIONS } from "@/lib/data/mocks/team";
import { STOP_EVENT_UNDO_MINUTES, UNDOABLE_LOAD_STATUSES } from "@/lib/loads/constants";
import { LOAD_MOVES, LOAD_RETURNS } from "@/lib/loads/transitions";
import { FREIGHT_MESSAGES, loadMissing, recordEvent, visibleLoad, withCaller, type MockCaller } from "@/lib/mocks/freight-access";
import { freightStore } from "@/lib/mocks/freight-store";
import { fail, ok } from "@/lib/mocks/http";
import { toLoadDetail } from "@/lib/mocks/load-views";
import { stopFits } from "@/lib/loads/stops";
import { applyStopTimes } from "@/lib/mocks/stop-times";
import type { LoadActor, LoadStatus, MockLoad } from "@/lib/types";

const TRANSITION_MESSAGES = {
    stale: "The load changed since you opened it",
    illegal: "That move is not open for this load right now",
    carrier: "Choose the carrier to book this load for",
} as const;

const allows = (rule: { from: readonly LoadStatus[]; actors: readonly LoadActor[] }, from: LoadStatus, actors: readonly LoadActor[]) =>
    rule.from.includes(from) && rule.actors.some((actor) => actors.includes(actor));

const isReturn = (load: MockLoad, to: LoadStatus, actors: readonly LoadActor[], now: number) => {
    if (!LOAD_RETURNS.some((rule) => allows(rule, load.status, actors))) return false;
    const previous = freightStore()
        .events.filter((event) => event.loadId === load.id && event.type === "statusChanged" && event.toStatus === load.status)
        .sort((first, second) => Date.parse(second.occurredAt) - Date.parse(first.occurredAt))[0];
    if (previous?.fromStatus !== to) return false;
    return !UNDOABLE_LOAD_STATUSES.includes(load.status) || now - Date.parse(previous.occurredAt) <= STOP_EVENT_UNDO_MINUTES * TIME_MS.minute;
};

const carrierFor = (caller: MockCaller, actors: readonly LoadActor[], requested: string | undefined) => {
    const carrier = actors.includes("Carrier") ? caller.organisation : requested;
    return carrier && MOCK_ORGANISATIONS[carrier]?.side === "carrier" ? carrier : null;
};

export const transitionLoad = withCaller(({ path, body }, { loadId }, caller) => {
    const load = visibleLoad(caller, loadId);
    if (!load) return loadMissing(path);
    const input = loadTransitionDtoSchema.safeParse(body);
    if (!input.success) return fail(HTTP_STATUS.badRequest, FREIGHT_MESSAGES.invalid, path);

    const { to, version, reason, carrierId } = input.data;
    if (version !== load.version) return fail(HTTP_STATUS.preconditionFailed, TRANSITION_MESSAGES.stale, path);

    const now = Date.now();
    const actors = actorsOf(caller.user.roles);
    const isMove = stopFits(to, load.stops) && LOAD_MOVES.some((move) => move.to === to && allows(move, load.status, actors));
    const undo = !isMove && isReturn(load, to, actors, now);
    if (!isMove && !undo) return fail(HTTP_STATUS.conflict, TRANSITION_MESSAGES.illegal, path);
    if (!reason && (caller.staff || to === "OnHold" || load.status === "OnHold")) {
        return fail(HTTP_STATUS.unprocessable, FREIGHT_MESSAGES.reasonRequired, path);
    }

    const booking = to === "Booked" ? carrierFor(caller, actors, carrierId) : undefined;
    if (booking === null) return fail(HTTP_STATUS.unprocessable, TRANSITION_MESSAGES.carrier, path);

    const from = load.status;
    const at = new Date(now).toISOString();
    applyStopTimes(load.stops, from, to, undo, at);
    if (booking) load.carrier = booking;
    if (to === "Posted" && from !== "Draft") Object.assign(load, { carrier: null, driver: null });
    Object.assign(load, { status: to, version: load.version + 1, updatedAt: at });
    recordEvent(load.id, caller, { type: "statusChanged", category: "status", fromStatus: from, toStatus: to, reason: reason ?? null });

    return ok(HTTP_STATUS.ok, toLoadDetail(load, caller, now));
});
