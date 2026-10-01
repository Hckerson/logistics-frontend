import { useEffect } from "react";
import { useMotionValue, useSpring } from "motion/react";
import { POINTER_SPRING } from "@/lib/home/constants";
import type { DampedPointer } from "@/lib/types";

export function useDampedPointer(): DampedPointer {
    const rawX = useMotionValue(0);
    const rawY = useMotionValue(0);
    const rawPresence = useMotionValue(0);
    const x = useSpring(rawX, POINTER_SPRING);
    const y = useSpring(rawY, POINTER_SPRING);
    const presence = useSpring(rawPresence, POINTER_SPRING);

    useEffect(() => {
        const move = (event: PointerEvent) => {
            if (event.pointerType !== "mouse") return;
            rawX.set((event.clientX / window.innerWidth) * 2 - 1);
            rawY.set((event.clientY / window.innerHeight) * 2 - 1);
            rawPresence.set(1);
        };
        const leave = () => rawPresence.set(0);

        window.addEventListener("pointermove", move, { passive: true });
        document.documentElement.addEventListener("pointerleave", leave);

        return () => {
            window.removeEventListener("pointermove", move);
            document.documentElement.removeEventListener("pointerleave", leave);
        };
    }, [rawX, rawY, rawPresence]);

    return { x, y, presence };
}
