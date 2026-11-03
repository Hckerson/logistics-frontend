import { useSyncExternalStore } from "react";
import { TIME_MS } from "@/lib/constants";

const subscribe = (notify: () => void) => {
    const timer = setInterval(notify, TIME_MS.second);
    return () => clearInterval(timer);
};

const snapshot = () => Math.floor(new Date().getTime() / TIME_MS.second) * TIME_MS.second;

const serverSnapshot = () => null;

export const useNow = () => useSyncExternalStore(subscribe, snapshot, serverSnapshot);
