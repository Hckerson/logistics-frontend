"use client";
import { useRef, type RefObject } from "react";
import type { MotionValue } from "motion/react";
import { useDampedPointer } from "@/lib/hooks/use-damped-pointer";
import { useNetworkCanvas } from "@/lib/hooks/use-network-canvas";

interface Props {
    progress: MotionValue<number>;
    intro: MotionValue<number>;
    price: RefObject<HTMLElement | null>;
    truck: RefObject<HTMLElement | null>;
}

export default function NetworkCanvas({ progress, intro, price, truck }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pointer = useDampedPointer();

    useNetworkCanvas(canvasRef, { progress, intro, pointer, price, truck });

    return (
        <canvas
            ref={canvasRef}
            aria-hidden
            className="absolute inset-0 size-full font-mono motion-reduce:relative motion-reduce:h-[70svh]"
        />
    );
}
