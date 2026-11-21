import { useCallback, useMemo, useSyncExternalStore } from "react";
import { z } from "zod";
import { STANDING } from "@/lib/billing/constants";
import { sessionStore } from "@/lib/utils/local-storage";

const EMPTY = "[]";
const idsSchema = z.array(z.string());
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

const parse = (raw: string): string[] => {
    try {
        const parsed = idsSchema.safeParse(JSON.parse(raw));
        return parsed.success ? parsed.data : [];
    } catch {
        return [];
    }
};

export function useStandingDismissals(owner: string) {
    const key = `${STANDING.dismissKey}.${owner}`;
    const raw = useSyncExternalStore(subscribe, () => sessionStore.getItem(key) ?? EMPTY, () => EMPTY);
    const dismissed = useMemo(() => new Set(parse(raw)), [raw]);

    const dismiss = useCallback(
        (id: string) => {
            sessionStore.setItem(key, JSON.stringify([...dismissed, id]));
            listeners.forEach((listener) => listener());
        },
        [key, dismissed],
    );

    return { dismissed, dismiss };
}
