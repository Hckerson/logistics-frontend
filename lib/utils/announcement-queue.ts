import { ANNOUNCEMENT_TIMING } from "@/lib/announcer/constants";
import type { Announcement, AnnouncementQueue } from "@/lib/types";

export const EMPTY_QUEUE: AnnouncementQueue = { current: null, waiting: [] };

export const enqueue = (queue: AnnouncementQueue, next: Announcement): AnnouncementQueue => {
    const repeated = [queue.current, ...queue.waiting].some((entry) => entry?.message === next.message);
    if (repeated) return queue;
    return queue.current ? { ...queue, waiting: [...queue.waiting, next] } : { current: next, waiting: queue.waiting };
};

export const advance = (queue: AnnouncementQueue): AnnouncementQueue => ({
    current: queue.waiting[0] ?? null,
    waiting: queue.waiting.slice(1),
});

export const shownFor = (announcement: Announcement): number | null =>
    announcement.action
        ? null
        : Math.max(ANNOUNCEMENT_TIMING.minimumMs, announcement.message.length * ANNOUNCEMENT_TIMING.perCharacterMs);
