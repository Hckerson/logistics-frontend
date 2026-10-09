import { useState } from "react";
import { MANIFEST } from "@/lib/auth/constants";
import type { ManifestField } from "@/lib/types";

export function useManifest() {
    const [cursor, setCursor] = useState(0);
    const [moved, setMoved] = useState(false);
    const field: ManifestField = MANIFEST[cursor];

    const advance = () => {
        setMoved(true);
        setCursor((current) => Math.min(current + 1, MANIFEST.length - 1));
    };

    const edit = (target: ManifestField) => {
        setMoved(true);
        setCursor(MANIFEST.indexOf(target));
    };

    return {
        cursor,
        field,
        moved,
        last: cursor === MANIFEST.length - 1,
        done: MANIFEST.slice(0, cursor),
        leg: cursor / MANIFEST.length,
        advance,
        edit,
    };
}
