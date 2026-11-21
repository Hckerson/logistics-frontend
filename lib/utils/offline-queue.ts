import { z } from "zod";
import { DRIVER_QUEUE } from "@/lib/driver/constants";
import type { CachedValue, QueueEntry, QueueState } from "@/lib/types";
import { queueEntrySchema } from "@/lib/validations/driver";

const { stores } = DRIVER_QUEUE;
const OWNER_INDEX = "owner";
const CIPHER = "AES-GCM";
const IV_BYTES = 12;

const EMPTY: QueueState = { owner: null, entries: [], syncing: false, lastSyncAt: null, failure: null, notices: [] };
const sealedSchema = z.object({ iv: z.instanceof(Uint8Array), data: z.instanceof(ArrayBuffer) });
const keySchema = z.object({ key: z.instanceof(CryptoKey) });
const cachedSchema = sealedSchema.extend({ savedAt: z.number() });

let state = EMPTY;
let database: Promise<IDBDatabase> | null = null;
const listeners = new Set<() => void>();
const keys = new Map<string, Promise<CryptoKey>>();

const publish = (next: Partial<QueueState>) => {
    state = { ...state, ...next };
    listeners.forEach((listener) => listener());
};

const settle = <T>(request: IDBRequest<T>) =>
    new Promise<T>((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });

const connect = () =>
    (database ??= new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(DRIVER_QUEUE.database, DRIVER_QUEUE.version);
        request.onupgradeneeded = () => {
            const db = request.result;
            db.createObjectStore(stores.queue, { keyPath: "id" }).createIndex(OWNER_INDEX, OWNER_INDEX);
            db.createObjectStore(stores.keys, { keyPath: OWNER_INDEX });
            db.createObjectStore(stores.cache, { keyPath: "key" }).createIndex(OWNER_INDEX, OWNER_INDEX);
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    }));

const objects = async (name: string, mode: IDBTransactionMode = "readonly") => (await connect()).transaction(name, mode).objectStore(name);

const createKey = async (owner: string) => {
    const stored = keySchema.safeParse(await settle((await objects(stores.keys)).get(owner)));
    if (stored.success) return stored.data.key;
    const key = await crypto.subtle.generateKey({ name: CIPHER, length: 256 }, false, ["encrypt", "decrypt"]);
    await settle((await objects(stores.keys, "readwrite")).put({ owner, key }));
    return key;
};

const keyFor = (owner: string) => {
    const known = keys.get(owner) ?? createKey(owner);
    keys.set(owner, known);
    return known;
};

const seal = async (owner: string, bytes: Uint8Array<ArrayBuffer>) => {
    const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
    return { iv, data: await crypto.subtle.encrypt({ name: CIPHER, iv }, await keyFor(owner), bytes) };
};

const unseal = async (owner: string, record: unknown) => {
    const sealed = sealedSchema.safeParse(record);
    if (!sealed.success) return null;
    const iv = new Uint8Array(sealed.data.iv);
    return new Uint8Array(await crypto.subtle.decrypt({ name: CIPHER, iv }, await keyFor(owner), sealed.data.data));
};

const byAge = (first: QueueEntry, second: QueueEntry) => first.createdAt - second.createdAt;

export const encodeJson = (value: unknown) => new TextEncoder().encode(JSON.stringify(value));

export const decodeJson = (bytes: Uint8Array): unknown => JSON.parse(new TextDecoder().decode(bytes));

export const offlineQueue = {
    subscribe: (listener: () => void) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },
    snapshot: () => state,
    serverSnapshot: () => EMPTY,

    load: async (owner: string) => {
        const records = await settle((await objects(stores.queue)).index(OWNER_INDEX).getAll(owner));
        const entries = records.flatMap((record: unknown) => {
            const parsed = queueEntrySchema.safeParse(record);
            return parsed.success ? [parsed.data] : [];
        });
        publish({ owner, entries: entries.sort(byAge) });
    },

    add: async (entry: QueueEntry, payload: Uint8Array<ArrayBuffer>) => {
        const sealed = await seal(entry.owner, payload);
        await settle((await objects(stores.queue, "readwrite")).put({ ...entry, ...sealed }));
        publish({ entries: [...state.entries.filter((known) => known.id !== entry.id), entry].sort(byAge) });
    },

    payload: async (entry: QueueEntry) => unseal(entry.owner, await settle((await objects(stores.queue)).get(entry.id))),

    remove: async (id: string) => {
        await settle((await objects(stores.queue, "readwrite")).delete(id));
        publish({ entries: state.entries.filter((entry) => entry.id !== id) });
    },

    fail: async (entry: QueueEntry, reason: string) => {
        const store = await objects(stores.queue, "readwrite");
        const record: unknown = await settle(store.get(entry.id));
        if (record instanceof Object) await settle(store.put({ ...record, failure: reason }));
        publish({ entries: state.entries.map((known) => (known.id === entry.id ? { ...known, failure: reason } : known)) });
    },

    discard: async (owner: string) => {
        const store = await objects(stores.queue, "readwrite");
        const ids = await settle(store.index(OWNER_INDEX).getAllKeys(owner));
        await Promise.all(ids.map((id) => settle(store.delete(id))));
        publish({ entries: state.entries.filter((entry) => entry.owner !== owner) });
    },

    status: (next: Partial<Pick<QueueState, "syncing" | "lastSyncAt" | "failure">>) => publish(next),
    notice: (message: string) => publish({ notices: [...state.notices, message] }),
    dismiss: () => publish({ notices: [] }),

    readCache: async <T>(owner: string, key: string, schema: z.ZodType<T>): Promise<CachedValue<T> | null> => {
        const record: unknown = await settle((await objects(stores.cache)).get(`${owner}:${key}`));
        const cached = cachedSchema.safeParse(record);
        const bytes = cached.success ? await unseal(owner, record) : null;
        const value = bytes && cached.success ? schema.safeParse(decodeJson(bytes)) : null;
        return value?.success && cached.success ? { data: value.data, savedAt: cached.data.savedAt } : null;
    },

    writeCache: async (owner: string, key: string, value: unknown) => {
        const sealed = await seal(owner, encodeJson(value));
        await settle((await objects(stores.cache, "readwrite")).put({ key: `${owner}:${key}`, owner, savedAt: new Date().getTime(), ...sealed }));
    },

    dropCache: async (owner: string, key: string) => {
        await settle((await objects(stores.cache, "readwrite")).delete(`${owner}:${key}`));
    },

    clearCache: async (owner: string) => {
        const store = await objects(stores.cache, "readwrite");
        const ids = await settle(store.index(OWNER_INDEX).getAllKeys(owner));
        await Promise.all(ids.map((id) => settle(store.delete(id))));
    },
};
