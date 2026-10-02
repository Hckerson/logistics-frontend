"use client";
import { useCallback, useRef, useState } from "react";
import clsx from "clsx";
import type { MotionValue } from "motion/react";
import { useFreightMap } from "@/lib/hooks/use-freight-map";

interface Props {
    progress: MotionValue<number>;
    intro: MotionValue<number>;
    still: boolean;
}

export default function FreightMap({ progress, intro, still }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [ready, setReady] = useState(false);
    const onReady = useCallback(() => setReady(true), []);

    useFreightMap(canvasRef, { progress, intro, still, onReady });

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
