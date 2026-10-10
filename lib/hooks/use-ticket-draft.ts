import { useSyncExternalStore } from "react";
import { draftStore } from "@/lib/support/draft";

export const useTicketDraft = () => useSyncExternalStore(draftStore.subscribe, draftStore.snapshot, draftStore.server);
