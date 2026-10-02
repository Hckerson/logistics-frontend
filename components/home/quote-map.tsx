"use client";
import { useCallback, useRef, useState } from "react";
import clsx from "clsx";
import { useQuoteMap } from "@/lib/hooks/use-quote-map";
import { useReduced } from "@/lib/hooks/use-reduced";
import type { QuoteLane } from "@/lib/types";

interface Props {
    lane: QuoteLane | null;
}

export default function QuoteMap({ lane }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const still = useReduced();
    const [ready, setReady] = useState(false);
    const onReady = useCallback(() => setReady(true), []);

    useQuoteMap(canvasRef, { lane, still, onReady });

    return (
        <canvas
            ref={canvasRef}
            aria-hidden
            className={clsx(
                "absolute inset-0 size-full font-mono transition-opacity duration-1000",
                ready ? "opacity-100" : "opacity-0",
            )}
        />
    );
}
