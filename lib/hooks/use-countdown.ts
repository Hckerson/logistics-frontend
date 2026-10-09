import { useEffect, useState } from "react";

const SECOND = 1000;

export function useCountdown(endsAt: number) {
    const [now, setNow] = useState(() => performance.now());

    useEffect(() => {
        const tick = setInterval(() => setNow(performance.now()), SECOND);
        return () => clearInterval(tick);
    }, []);

    return Math.max(0, endsAt - now);
}
