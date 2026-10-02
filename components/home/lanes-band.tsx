"use client";
import { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform } from "motion/react";
import LaneCard from "@/components/home/lane-card";
import { useSceneProgress } from "@/lib/hooks/use-scene-progress";
import { LANES_COPY, LANE_SAMPLES } from "@/lib/data/home/lanes";

export default function LanesBand() {
    const { ref, progress, reduced } = useSceneProgress<HTMLElement>();
    const rowRef = useRef<HTMLUListElement>(null);
    const overflow = useMotionValue(0);
    const x = useTransform([progress, overflow], ([share, distance]: number[]) => -share * distance);

    useEffect(() => {
        const row = rowRef.current;
        if (!row) return;
        const measure = () => overflow.set(Math.max(row.scrollWidth - row.clientWidth, 0));
        const observer = new ResizeObserver(measure);
        observer.observe(row);
        measure();
        return () => observer.disconnect();
    }, [overflow]);

    return (
        <section ref={ref} aria-labelledby="lanes-title" className="haulr-pan-track bg-background-alt">
            <div className="haulr-stage flex flex-col justify-center gap-12 py-(--haulr-header)">
                <header className="haulr-shell flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="flex flex-col gap-4">
                        <p className="haulr-label text-accent-dark">{LANES_COPY.label}</p>
                        <h2 id="lanes-title" className="haulr-title text-text max-w-2xl">
                            {LANES_COPY.title}
                        </h2>
                    </div>
                    <p className="haulr-label text-text-muted max-w-xs lg:text-right">{LANES_COPY.note}</p>
                </header>
                <div className="haulr-shell">
                    <motion.ul
                        ref={rowRef}
                        style={reduced ? undefined : { x }}
                        className="flex gap-5 motion-reduce:overflow-x-auto motion-reduce:pb-4"
                    >
                        {LANE_SAMPLES.map((lane, index) => (
                            <LaneCard key={lane.id} lane={lane} featured={index === 0} />
                        ))}
                    </motion.ul>
                </div>
                <div aria-hidden className="haulr-shell motion-reduce:hidden">
                    <div className="bg-border relative h-px">
                        <motion.span style={{ scaleX: progress }} className="bg-accent absolute inset-0 origin-left" />
                    </div>
                </div>
            </div>
        </section>
    );
}
