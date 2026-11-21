import { nanoid } from "nanoid";
import { useAnnounce } from "@/components/providers/announcer-provider";
import { useReplay } from "@/components/providers/offline-queue-provider";
import { TIME_MS } from "@/lib/constants";
import type { DriverStopEventDto, DriverTripDto } from "@/lib/contract/schemas";
import { DRIVER_COPY } from "@/lib/data/driver/copy";
import { overlayTrip } from "@/lib/driver/trip";
import { useNow } from "@/lib/hooks/use-now";
import { useOfflineQueue } from "@/lib/hooks/use-offline-queue";
import { STOP_EVENT_UNDO_MINUTES } from "@/lib/loads/constants";
import { clockTime } from "@/lib/tracking/view";
import type { QueueEntry, StopAction } from "@/lib/types";
import { fillTemplate } from "@/lib/utils/fill-template";
import { encodeJson, offlineQueue } from "@/lib/utils/offline-queue";

type Extra = Pick<DriverStopEventDto, "seal" | "pieces" | "latitude" | "longitude">;

const UNDO_MS = STOP_EVENT_UNDO_MINUTES * TIME_MS.minute;
const { action: copy } = DRIVER_COPY;

const entryOf = (owner: string, loadId: string, fields: Pick<QueueEntry, "id" | "kind" | "event" | "target">): QueueEntry => ({
    owner,
    loadId,
    createdAt: new Date().getTime(),
    failure: null,
    page: null,
    ...fields,
});

export function useStopEvents(owner: string, trip: DriverTripDto) {
    const queue = useOfflineQueue();
    const replay = useReplay();
    const announce = useAnnounce();
    const now = useNow();
    const queued = queue.entries.filter((entry) => entry.loadId === trip.loadId && (entry.kind === "event" || entry.kind === "undo"));
    const shown = overlayTrip(trip, queued);
    const lastQueued = queued.filter((entry) => entry.kind === "event" && !entry.failure).at(-1);
    const serverUndo = trip.undo && !queued.some((entry) => entry.target === trip.undo?.eventId) ? trip.undo : null;
    const until = lastQueued?.event ? Date.parse(lastQueued.event.recordedAt) + UNDO_MS : serverUndo ? Date.parse(serverUndo.until) : null;
    const undoable = until !== null && now !== null && now < until ? { type: lastQueued?.event?.type ?? serverUndo?.type ?? "arrive", until } : null;

    const record = async ({ type, stop }: StopAction, extra: Extra) => {
        const id = nanoid();
        const recordedAt = new Date().toISOString();
        await offlineQueue.add(entryOf(owner, trip.loadId, { id, kind: "event", event: { type, stopId: stop.id, recordedAt }, target: null }), encodeJson({ id, type, stopId: stop.id, recordedAt, ...extra }));
        announce({ message: fillTemplate(copy.recorded[type], { time: clockTime(recordedAt, stop.facility.timeZone) }) });
        void replay();
    };

    const undo = async () => {
        if (lastQueued) await offlineQueue.remove(lastQueued.id);
        else if (serverUndo) {
            const id = nanoid();
            await offlineQueue.add(entryOf(owner, trip.loadId, { id, kind: "undo", event: null, target: serverUndo.eventId }), encodeJson({ id, eventId: serverUndo.eventId }));
            void replay();
        }
        announce({ message: copy.undone });
    };

    return { trip: shown, queued: queued.filter((entry) => !entry.failure).length, undoable, record, undo };
}
