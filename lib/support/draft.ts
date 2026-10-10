import { differenceInDays } from "date-fns";
import { nanoid } from "nanoid";
import { TICKET_DRAFT } from "@/lib/support/constants";
import type { TicketDraft } from "@/lib/types";
import { storage } from "@/lib/utils/local-storage";
import { ticketDraftSchema } from "@/lib/validations/support";

const listeners = new Set<() => void>();
const blank = (key: string): TicketDraft => ({
    key,
    savedAt: "",
    category: null,
    urgency: null,
    subject: "",
    description: "",
    load: "",
    email: "",
});
const SERVER_DRAFT = blank("server");
let cache: { raw: string | null; draft: TicketDraft } | null = null;

const parse = (raw: string | null): TicketDraft => {
    if (!raw) return blank(nanoid());
    try {
        const draft = ticketDraftSchema.parse(JSON.parse(raw));
        return differenceInDays(new Date(), new Date(draft.savedAt)) > TICKET_DRAFT.maxAgeDays ? blank(nanoid()) : draft;
    } catch {
        return blank(nanoid());
    }
};

const emit = () => listeners.forEach((listener) => listener());

export const draftStore = {
    subscribe: (listener: () => void) => {
        listeners.add(listener);
        window.addEventListener("storage", listener);
        return () => {
            listeners.delete(listener);
            window.removeEventListener("storage", listener);
        };
    },
    snapshot: (): TicketDraft => {
        const raw = storage.getItem(TICKET_DRAFT.key) ?? null;
        if (cache?.raw !== raw) cache = { raw, draft: parse(raw) };
        return cache.draft;
    },
    server: () => SERVER_DRAFT,
    save: (draft: TicketDraft) => {
        storage.setItem(TICKET_DRAFT.key, JSON.stringify({ ...draft, savedAt: new Date().toISOString() }));
        emit();
    },
    clear: () => {
        storage.removeItem(TICKET_DRAFT.key);
        cache = null;
        emit();
    },
};
