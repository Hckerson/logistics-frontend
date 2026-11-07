import { useState } from "react";
import { LOAD_FILTER_LIMITS } from "@/lib/loads/shipments";

export function useShipmentSelection(rowIds: readonly string[]) {
    const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
    const [matching, setMatching] = useState(false);
    const picked: ReadonlySet<string> = new Set(rowIds.filter((id) => selected.has(id)));

    return {
        picked,
        matching,
        select: (next: ReadonlySet<string>) => {
            setMatching(false);
            if (next.size <= LOAD_FILTER_LIMITS.exportIds) setSelected(next);
        },
        selectMatching: () => {
            setSelected(new Set(rowIds));
            setMatching(true);
        },
        release: () => setMatching(false),
    };
}
