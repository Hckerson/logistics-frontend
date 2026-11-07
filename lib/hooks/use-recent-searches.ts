import { useCallback, useMemo, useSyncExternalStore } from "react";
import { z } from "zod";
import { QUICK_FIND } from "@/lib/loads/constants";
import { storage } from "@/lib/utils/local-storage";

const EMPTY = "[]";
const recentSchema = z.array(z.string());
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
    listeners.add(listener);
    window.addEventListener("storage", listener);
    return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", listener);
    };
};

const parse = (raw: string): string[] => {
    try {
        const parsed = recentSchema.safeParse(JSON.parse(raw));
        return parsed.success ? parsed.data : [];
    } catch {
        return [];
    }
};

export function useRecentSearches(owner: string) {
    const key = `${QUICK_FIND.storageKey}.${owner}`;
    const raw = useSyncExternalStore(
        subscribe,
        () => storage.getItem(key) ?? EMPTY,
        () => EMPTY,
    );
    const recent = useMemo(() => parse(raw), [raw]);

    const remember = useCallback(
        (term: string) => {
            const next = [term, ...recent.filter((entry) => entry !== term)].slice(0, QUICK_FIND.recentLimit);
            storage.setItem(key, JSON.stringify(next));
            listeners.forEach((listener) => listener());
        },
        [key, recent],
    );

    return { recent, remember };
}
