import { TIME_MS } from "@/lib/constants";
import { POSTING } from "@/lib/loads/posting";
import type { PostDraft } from "@/lib/types";
import { storage } from "@/lib/utils/local-storage";
import { storedDraftSchema } from "@/lib/validations/post-draft";

export type StoredDraft = { kind: "none" } | { kind: "corrupt" } | { kind: "found"; draft: PostDraft };

const NONE: StoredDraft = { kind: "none" };
const CORRUPT: StoredDraft = { kind: "corrupt" };
const listeners = new Set<() => void>();
let cache: { key: string; raw: string | null; stored: StoredDraft } | null = null;

const keyOf = (userId: string) => `${POSTING.storageKey}:${userId}`;

const parse = (raw: string | null): StoredDraft => {
    if (!raw) return NONE;
    try {
        const draft = storedDraftSchema.parse(JSON.parse(raw));
        return Date.now() - draft.savedAt > POSTING.draftDays * TIME_MS.day ? NONE : { kind: "found", draft };
    } catch {
        return CORRUPT;
    }
};

const emit = () => listeners.forEach((listener) => listener());

export const postDraftStore = {
    subscribe: (listener: () => void) => {
        listeners.add(listener);
        window.addEventListener("storage", listener);
        return () => {
            listeners.delete(listener);
            window.removeEventListener("storage", listener);
        };
    },
    snapshot: (userId: string): StoredDraft => {
        const key = keyOf(userId);
        const raw = storage.getItem(key) ?? null;
        if (cache?.key !== key || cache.raw !== raw) cache = { key, raw, stored: parse(raw) };
        return cache.stored;
    },
    server: (): StoredDraft => NONE,
    save: (userId: string, draft: PostDraft) => {
        storage.setItem(keyOf(userId), JSON.stringify({ ...draft, savedAt: Date.now() }));
    },
    clear: (userId: string) => {
        storage.removeItem(keyOf(userId));
        cache = null;
        emit();
    },
};
