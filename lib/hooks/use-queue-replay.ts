import { useCallback, useRef } from "react";
import { onlineManager } from "@tanstack/react-query";
import { useAnnounce } from "@/components/providers/announcer-provider";
import { recordStopEvent } from "@/lib/actions/record-stop-event";
import { requestPodPage } from "@/lib/actions/request-pod-page";
import { submitPod } from "@/lib/actions/submit-pod";
import { undoStopEvent } from "@/lib/actions/undo-stop-event";
import { storage } from "@/lib/api-client";
import type { DriverTripDto } from "@/lib/contract/schemas";
import { DRIVER_COPY } from "@/lib/data/driver/copy";
import { useTripSaver } from "@/lib/hooks/use-driver-trips";
import type { ActionFailure, ActionResult, QueueEntry } from "@/lib/types";
import { errorMessage } from "@/lib/utils/action-result";
import { fillTemplate } from "@/lib/utils/fill-template";
import { decodeJson, offlineQueue } from "@/lib/utils/offline-queue";
import { pluralize } from "@/lib/utils/plural";
import { podSubmitSchema, stopEventSchema, undoPayloadSchema } from "@/lib/validations/driver";

type Outcome =
    | { kind: "sent"; trip: DriverTripDto | null }
    | { kind: "drop"; notice: string | null }
    | { kind: "fail"; reason: string }
    | { kind: "stop"; reason: string };

const { sync: copy, action } = DRIVER_COPY;

const judge = (failure: ActionFailure, entry: QueueEntry): Outcome => {
    if (failure.errorClass === "conflict") {
        const notice = entry.event
            ? fillTemplate(copy.conflict, { event: action.events[entry.event.type] })
            : fillTemplate(copy.rejected, { reference: entry.loadId, reason: errorMessage(failure) });
        return { kind: "drop", notice };
    }
    if (failure.errorClass === "not-found") return { kind: "drop", notice: fillTemplate(copy.unassigned, { reference: entry.loadId }) };
    if (failure.errorClass === "validation") return { kind: "fail", reason: errorMessage(failure) };
    return { kind: "stop", reason: failure.errorClass === "auth" ? copy.auth : copy.failed };
};

const settled = (result: ActionResult<DriverTripDto>, entry: QueueEntry): Outcome =>
    result.ok ? { kind: "sent", trip: result.data } : judge(result, entry);

const send = async (entry: QueueEntry, bytes: Uint8Array): Promise<Outcome> => {
    if (entry.kind === "podPage") {
        if (!entry.page) return { kind: "drop", notice: null };
        const ticket = await requestPodPage(entry.loadId, { id: entry.id, ...entry.page });
        if (!ticket.ok) return judge(ticket, entry);
        await storage.put(ticket.data.uploadUrl, new Blob([new Uint8Array(bytes)], { type: entry.page.contentType }));
        return { kind: "sent", trip: null };
    }

    const body = decodeJson(bytes);
    if (entry.kind === "event") {
        const event = stopEventSchema.safeParse(body);
        return event.success ? settled(await recordStopEvent(entry.loadId, event.data), entry) : { kind: "drop", notice: null };
    }
    if (entry.kind === "undo") {
        const undo = undoPayloadSchema.safeParse(body);
        return undo.success ? settled(await undoStopEvent(entry.loadId, undo.data.eventId, { id: undo.data.id }), entry) : { kind: "drop", notice: null };
    }
    const pod = podSubmitSchema.safeParse(body);
    return pod.success ? settled(await submitPod(entry.loadId, pod.data), entry) : { kind: "drop", notice: null };
};

const attempt = async (entry: QueueEntry): Promise<Outcome> => {
    try {
        const bytes = await offlineQueue.payload(entry);
        return bytes ? await send(entry, bytes) : { kind: "drop", notice: null };
    } catch {
        return { kind: "stop", reason: copy.offline };
    }
};

export function useQueueReplay(owner: string) {
    const announce = useAnnounce();
    const save = useTripSaver(owner);
    const running = useRef(false);

    return useCallback(async () => {
        if (running.current || !onlineManager.isOnline()) return;
        running.current = true;
        offlineQueue.status({ syncing: true, failure: null });
        let sent = 0;
        let failure: string | null = null;

        try {
            for (const entry of offlineQueue.snapshot().entries.filter((queued) => queued.owner === owner && !queued.failure)) {
                const outcome = await attempt(entry);
                if (outcome.kind === "stop") {
                    failure = outcome.reason;
                    break;
                }
                if (outcome.kind === "fail") {
                    await offlineQueue.fail(entry, outcome.reason);
                    continue;
                }
                await offlineQueue.remove(entry.id);
                if (outcome.kind === "drop" && outcome.notice) offlineQueue.notice(outcome.notice);
                if (outcome.kind === "sent") {
                    sent += 1;
                    if (outcome.trip) save(outcome.trip);
                }
            }
        } catch {
            failure = copy.failed;
        } finally {
            running.current = false;
            offlineQueue.status({ syncing: false, failure, ...(sent > 0 ? { lastSyncAt: new Date().getTime() } : {}) });
        }

        if (sent > 0 && offlineQueue.snapshot().entries.every((entry) => entry.owner !== owner || entry.failure)) {
            announce({ message: pluralize(sent, copy.drained) });
        }
    }, [announce, owner, save]);
}
