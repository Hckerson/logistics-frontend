"use client";
import { useState } from "react";
import clsx from "clsx";
import { AnimatePresence, motion, useMotionValueEvent } from "motion/react";
import DriverPhone from "@/components/home/driver-phone";
import RecordLink from "@/components/home/record-link";
import ShipperConsole from "@/components/home/shipper-console";
import { RECORD_BEATS } from "@/lib/data/home/products";
import { ARRIVE } from "@/lib/home/constants";
import { useSceneProgress } from "@/lib/hooks/use-scene-progress";
import { useSide } from "@/lib/hooks/use-side";

const FOCUS = "transition-[opacity,scale] duration-700 ease-(--haulr-ease)";
const DIMMED = "scale-[0.98] opacity-75";

const beatAt = (progress: number) => Math.min(RECORD_BEATS.length - 1, Math.floor(progress * RECORD_BEATS.length));

export default function RecordScene() {
    const { ref, progress, reduced } = useSceneProgress<HTMLDivElement>();
    const { side } = useSide();
    const [beat, setBeat] = useState(() => beatAt(progress.get()));
    const current = RECORD_BEATS[reduced ? RECORD_BEATS.length - 1 : beat];

    useMotionValueEvent(progress, "change", (value) => setBeat(beatAt(value)));

    return (
        <div ref={ref} className="haulr-record-track">
            <div className="flex flex-col justify-center gap-10 pb-(--haulr-section) lg:sticky lg:top-0 lg:h-svh lg:pt-(--haulr-header) lg:pb-0 motion-reduce:static motion-reduce:h-auto motion-reduce:pb-(--haulr-section)">
                <div className="haulr-shell flex flex-col gap-10 lg:flex-row lg:gap-0">
                    <div className={clsx("min-w-0 flex-1 self-center", FOCUS, side === "haul" && DIMMED)}>
                        <ShipperConsole beat={current} />
                    </div>
                    <RecordLink beat={beat} reduced={reduced} />
                    <div className={clsx("self-center lg:w-80", FOCUS, side === "ship" && DIMMED)}>
                        <DriverPhone beat={current} />
                    </div>
                </div>
                <div className="haulr-shell min-h-16" aria-live="polite">
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.p
                            key={current.id}
                            {...ARRIVE}
                            exit={{ opacity: 0 }}
                            className="text-text-secondary max-w-2xl text-(length:--haulr-lead)"
                        >
                            {current.caption}
                        </motion.p>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
