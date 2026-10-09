import { useEffect, useRef, useState } from "react";
import { SCRAMBLE } from "@/lib/auth/constants";
import { useReduced } from "@/lib/hooks/use-reduced";

const glyph = () => SCRAMBLE.glyphs[Math.floor(Math.random() * SCRAMBLE.glyphs.length)];

export function useBoardNoise(cells: number, delay: number) {
    const reduced = useReduced();
    const [noise, setNoise] = useState<string[] | null>(null);
    const wait = useRef(delay);

    useEffect(() => {
        if (reduced) return;
        let frame = 0;
        let ticker: ReturnType<typeof setInterval> | undefined;
        const start = setTimeout(() => {
            ticker = setInterval(() => {
                frame += 1;
                const settled = Math.floor((frame / SCRAMBLE.frames) * cells);
                const done = frame >= SCRAMBLE.frames;
                setNoise(done ? null : Array.from({ length: cells }, (_, index) => (index < settled ? "" : glyph())));
                if (done) clearInterval(ticker);
            }, SCRAMBLE.interval);
        }, wait.current * 1000);
        return () => {
            clearTimeout(start);
            clearInterval(ticker);
        };
    }, [cells, reduced]);

    return noise;
}
