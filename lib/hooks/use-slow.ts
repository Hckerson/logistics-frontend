import { useEffect, useState } from "react";

export function useSlow(active: boolean, after: number) {
    const [slow, setSlow] = useState(false);

    useEffect(() => {
        if (!active) return;
        const timer = setTimeout(() => setSlow(true), after);
        return () => {
            clearTimeout(timer);
            setSlow(false);
        };
    }, [active, after]);

    return active && slow;
}
