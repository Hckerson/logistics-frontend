import { useCallback, useSyncExternalStore } from "react";
import { SIDE_QUERY } from "@/lib/data/home/brand";
import { DEFAULT_SIDE, SIDE_CHANGE_EVENT, SIDE_PARAM } from "@/lib/home/constants";
import type { Side } from "@/lib/types";

const fromParam = (value: string | null): Side =>
    value === SIDE_PARAM.haul ? "haul" : DEFAULT_SIDE;

const subscribe = (onChange: () => void) => {
    window.addEventListener("popstate", onChange);
    window.addEventListener(SIDE_CHANGE_EVENT, onChange);
    return () => {
        window.removeEventListener("popstate", onChange);
        window.removeEventListener(SIDE_CHANGE_EVENT, onChange);
    };
};

const snapshot = () =>
    fromParam(new URLSearchParams(window.location.search).get(SIDE_QUERY));

const serverSnapshot = (): Side => DEFAULT_SIDE;

export function useSide() {
    const side = useSyncExternalStore(subscribe, snapshot, serverSnapshot);

    const setSide = useCallback((next: Side) => {
        const url = new URL(window.location.href);
        url.searchParams.set(SIDE_QUERY, SIDE_PARAM[next]);
        window.history.replaceState(window.history.state, "", url);
        window.dispatchEvent(new Event(SIDE_CHANGE_EVENT));
    }, []);

    return { side, setSide };
}
