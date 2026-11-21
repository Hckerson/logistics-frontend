import { useSyncExternalStore } from "react";
import { offlineQueue } from "@/lib/utils/offline-queue";

export const useOfflineQueue = () => useSyncExternalStore(offlineQueue.subscribe, offlineQueue.snapshot, offlineQueue.serverSnapshot);
