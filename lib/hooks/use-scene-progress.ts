import { useRef } from "react";
import { useMotionValue, useScroll, useSpring } from "motion/react";
import { useReduced } from "@/lib/hooks/use-reduced";
import { PEAK_PROGRESS, SCROLL_SPRING } from "@/lib/home/constants";

export function useSceneProgress<TElement extends HTMLElement>() {
    const ref = useRef<TElement>(null);
    const reduced = useReduced();
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end end"],
    });
    const spring = useSpring(scrollYProgress, SCROLL_SPRING);
    const still = useMotionValue(PEAK_PROGRESS);

    return { ref, progress: reduced ? still : spring, reduced };
}
