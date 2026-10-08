import type { AuthSignal } from "@/lib/types";

interface Flow {
    done: boolean;
    pending: boolean;
    first: boolean;
    held: boolean;
}

export const flowSignal = ({ done, pending, first, held }: Flow): AuthSignal =>
    done ? "arrived" : pending ? "pending" : first ? "origin" : held ? "held" : "midway";
