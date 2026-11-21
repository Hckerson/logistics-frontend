import type { FLAG_KEYS } from "@/lib/flags";

export type FlagKey = (typeof FLAG_KEYS)[number];

export interface FlagSpec {
    default: boolean;
    owner: string;
    removeBy: string;
    purpose: string;
}

export type Flags = Record<FlagKey, boolean>;
