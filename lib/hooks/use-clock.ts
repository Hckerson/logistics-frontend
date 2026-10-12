import { useSyncExternalStore } from "react";
import { CLOCK_TICK_MS } from "@/lib/tracking/constants";

const subscribe = (notify: () => void) => {
    const timer = setInterval(notify, CLOCK_TICK_MS);
    return () => clearInterval(timer);
};

const snapshot = () => Math.floor(new Date().getTime() / CLOCK_TICK_MS) * CLOCK_TICK_MS;

const serverSnapshot = () => null;

export const useClock = () => useSyncExternalStore(subscribe, snapshot, serverSnapshot);
