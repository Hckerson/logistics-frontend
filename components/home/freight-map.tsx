"use client";
import { useCallback, useRef, useState, type RefObject } from "react";
import clsx from "clsx";
import type { MotionValue } from "motion/react";
import { useFreightMap } from "@/lib/hooks/use-freight-map";

interface Props {
    progress: MotionValue<number>;
    still: boolean;
    tagsRef: RefObject<HTMLDivElement | null>;
    labelsRef: RefObject<HTMLDivElement | null>;
}

export default function FreightMap({ progress, still, tagsRef, labelsRef }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [ready, setReady] = useState(false);
    const onReady = useCallback(() => setReady(true), []);

    useFreightMap(canvasRef, { progress, still, onReady, tagsRef, labelsRef });

    return (
        <canvas
            ref={canvasRef}
            aria-hidden
            className={clsx("absolute inset-0 size-full font-mono", ready ? "opacity-100" : "opacity-0")}
        />
    );
}
