import { useSyncExternalStore } from "react";

const QUERY = "(min-width: 64rem)";

const subscribe = (onChange: () => void) => {
    const media = window.matchMedia(QUERY);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
};

const snapshot = () => window.matchMedia(QUERY).matches;

const serverSnapshot = () => false;

export function useWide() {
    return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}
