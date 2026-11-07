import { useSyncExternalStore } from "react";
import { onlineManager } from "@tanstack/react-query";
import { CONNECTIVITY_BACK_MS } from "@/lib/constants";
import type { Connectivity } from "@/lib/types";

const ONLINE: Connectivity = { state: "online", since: null };
const listeners = new Set<() => void>();
let current = ONLINE;
let settle: ReturnType<typeof setTimeout> | undefined;
let detach: (() => void) | null = null;

const publish = (next: Connectivity) => {
    current = next;
    listeners.forEach((listener) => listener());
};

const follow = (online: boolean) => {
    clearTimeout(settle);
    if (!online) {
        publish({ state: "offline", since: new Date().getTime() });
        return;
    }
    if (current.state !== "offline") return;
    publish({ state: "back", since: null });
    settle = setTimeout(() => publish(ONLINE), CONNECTIVITY_BACK_MS);
};

const subscribe = (listener: () => void) => {
    listeners.add(listener);
    if (!detach) {
        if (!onlineManager.isOnline()) follow(false);
        detach = onlineManager.subscribe(follow);
    }
    return () => {
        listeners.delete(listener);
        if (listeners.size > 0 || !detach) return;
        detach();
        detach = null;
    };
};

export const useConnectivity = () =>
    useSyncExternalStore(
        subscribe,
        () => current,
        () => ONLINE,
    );
