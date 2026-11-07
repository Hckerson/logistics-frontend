import { useState } from "react";
import { useRowLoad } from "@/lib/hooks/use-row-load";
import { nextActions } from "@/lib/loads/next-actions";
import type { LoadAction, RoleKey } from "@/lib/types";

export const stepKey = ({ kind, to }: LoadAction) => `step-${kind}-${to}`;

export function useRowSteps(roles: readonly RoleKey[]) {
    const [menuFor, setMenuFor] = useState<string | null>(null);
    const [chosen, setChosen] = useState<LoadAction | null>(null);
    const full = useRowLoad(menuFor);
    const loaded = full.data && full.data.id === menuFor ? full.data : null;
    const steps = loaded ? nextActions(loaded, roles, null) : [];

    return {
        menuFor,
        loaded,
        steps,
        chosen,
        open: (loadId: string) => setMenuFor(loadId),
        choose: (id: string) => setChosen(steps.find((step) => stepKey(step) === id) ?? null),
        dismiss: () => setChosen(null),
    };
}
