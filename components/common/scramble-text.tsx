"use client";
import { useEffect, useRef, useState } from "react";
import { SCRAMBLE } from "@/lib/auth/constants";
import { useReduced } from "@/lib/hooks/use-reduced";

interface Props {
    text: string;
    delay?: number;
}

const glyph = () => SCRAMBLE.glyphs[Math.floor(Math.random() * SCRAMBLE.glyphs.length)];

const scrambled = (text: string, settled: number) =>
    [...text].map((char, index) => (index < settled || char === " " ? char : glyph())).join("");

export default function ScrambleText({ text, delay = 0 }: Props) {
    const reduced = useReduced();
    const [shown, setShown] = useState(text);
    const wait = useRef(delay);

    useEffect(() => {
        if (reduced) return;
        let frame = 0;
        let ticker: ReturnType<typeof setInterval> | undefined;
        const start = setTimeout(() => {
            ticker = setInterval(() => {
                frame += 1;
                const done = frame >= SCRAMBLE.frames;
                setShown(done ? text : scrambled(text, Math.floor((frame / SCRAMBLE.frames) * text.length)));
                if (done) clearInterval(ticker);
            }, SCRAMBLE.interval);
        }, wait.current * 1000);
        wait.current = 0;
        return () => {
            clearTimeout(start);
            clearInterval(ticker);
        };
    }, [text, reduced]);

    return (
        <>
            <span aria-hidden>{reduced ? text : shown}</span>
            <span className="sr-only">{text}</span>
        </>
    );
}
