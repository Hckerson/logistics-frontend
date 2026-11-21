"use client";
import { createContext, useContext, useEffect, type ReactNode } from "react";
import { onlineManager } from "@tanstack/react-query";
import { DRIVER_COPY } from "@/lib/data/driver/copy";
import { DRIVER_QUEUE } from "@/lib/driver/constants";
import { useQueueReplay } from "@/lib/hooks/use-queue-replay";
import { offlineQueue } from "@/lib/utils/offline-queue";

interface Props {
    owner: string;
    children: ReactNode;
}

const ReplayContext = createContext<() => Promise<void>>(async () => undefined);

export const useReplay = () => useContext(ReplayContext);

export default function OfflineQueueProvider({ owner, children }: Props) {
    const replay = useQueueReplay(owner);

    useEffect(() => {
        offlineQueue
            .load(owner)
            .then(replay)
            .catch(() => offlineQueue.status({ failure: DRIVER_COPY.sync.failed }));
        const stop = onlineManager.subscribe((online) => {
            if (online) void replay();
        });
        const retry = setInterval(() => {
            if (offlineQueue.snapshot().entries.some((entry) => !entry.failure)) void replay();
        }, DRIVER_QUEUE.retryMs);
        return () => {
            stop();
            clearInterval(retry);
        };
    }, [owner, replay]);

    return <ReplayContext value={replay}>{children}</ReplayContext>;
}
