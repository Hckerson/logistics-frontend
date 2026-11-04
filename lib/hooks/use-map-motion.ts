"use client";
import { useEffect, useRef } from "react";
import { ROUTE_MOTION } from "@/lib/maps/constants";
import type { MapMotion } from "@/lib/types";

interface Options {
    animate: boolean;
    loop: boolean;
    restart: string;
}

export function useMapMotion(paint: (motion: MapMotion) => void, { animate, loop, restart }: Options) {
    const painter = useRef(paint);
    const origin = useRef<{ key: string; at: number } | null>(null);

    useEffect(() => {
        painter.current = paint;
    }, [paint]);

    useEffect(() => {
        if (!animate) {
            painter.current(ROUTE_MOTION.still);
            return;
        }
        let frame = 0;
        const tick = (now: number) => {
            const at = origin.current?.key === restart ? origin.current.at : now;
            origin.current = { key: restart, at };
            const elapsed = now - at;
            const drawn = Math.min(1, elapsed / ROUTE_MOTION.drawMs);
            painter.current({ drawn, pulse: loop ? (elapsed % ROUTE_MOTION.pulseMs) / ROUTE_MOTION.pulseMs : 0 });
            if (drawn < 1 || loop) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [animate, loop, restart]);
}
