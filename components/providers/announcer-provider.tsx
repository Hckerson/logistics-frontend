"use client";
import { createContext, useCallback, useContext, useEffect, useReducer, type ReactNode } from "react";
import { nanoid } from "nanoid";
import StatusToast from "@/components/common/status-toast";
import type { Announcement, AnnouncementInput, AnnouncementQueue } from "@/lib/types";
import { advance, EMPTY_QUEUE, enqueue, shownFor } from "@/lib/utils/announcement-queue";

type QueueEvent = { type: "add"; announcement: Announcement } | { type: "next" };

const reduce = (queue: AnnouncementQueue, event: QueueEvent) => (event.type === "add" ? enqueue(queue, event.announcement) : advance(queue));

const AnnouncerContext = createContext<(input: AnnouncementInput) => void>(() => undefined);

export const useAnnounce = () => useContext(AnnouncerContext);

export default function AnnouncerProvider({ children }: { children: ReactNode }) {
    const [queue, dispatch] = useReducer(reduce, EMPTY_QUEUE);
    const announce = useCallback(
        (input: AnnouncementInput) => dispatch({ type: "add", announcement: { ...input, id: nanoid(), tone: input.tone ?? "polite" } }),
        [],
    );
    const dismiss = useCallback(() => dispatch({ type: "next" }), []);
    const { current } = queue;

    useEffect(() => {
        const duration = current ? shownFor(current) : null;
        if (duration === null) return;
        const timer = setTimeout(dismiss, duration);
        return () => clearTimeout(timer);
    }, [current, dismiss]);

    return (
        <AnnouncerContext value={announce}>
            {children}
            <StatusToast announcement={current} onDismiss={dismiss} />
        </AnnouncerContext>
    );
}
