import { TIME_MS } from "@/lib/constants";
import type { LoadStatus, StandingFix } from "@/lib/types";

export const STANDING = {
    staleMs: TIME_MS.minute,
    dismissKey: "haulr.standing.dismissed",
    seenKey: "haulr.standing.seen",
} as const;

export const BUILT_FIXES: Partial<Record<StandingFix, string>> = {};

export const INVOICED_STATUSES: readonly LoadStatus[] = ["Invoiced", "Paid", "Closed"];

export const invoiceIdOf = (loadId: string) => `INV-${loadId.replace(/^HL-/, "")}`;

export const PAYMENT_LIMITS = { items: 100, idMax: 64, slowMs: 30 * TIME_MS.second } as const;
