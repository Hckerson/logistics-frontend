import type { QuickFindItemDto } from "@/lib/contract/schemas";

export type QuickFindType = QuickFindItemDto["type"];

export type ConnectivityState = "online" | "offline" | "back";

export interface Connectivity {
    state: ConnectivityState;
    since: number | null;
}

export type SessionPhase = "active" | "warning" | "expired";
