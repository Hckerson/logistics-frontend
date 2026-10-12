import { useSyncExternalStore } from "react";

const VISIBILITY_EVENT = "visibilitychange";

const subscribe = (notify: () => void) => {
    document.addEventListener(VISIBILITY_EVENT, notify);
    return () => document.removeEventListener(VISIBILITY_EVENT, notify);
};

export const usePageVisible = () =>
    useSyncExternalStore(
        subscribe,
        () => document.visibilityState === "visible",
        () => true,
    );
