"use client";
import type { RefObject } from "react";
import { motion, type MotionValue } from "motion/react";
import MapTag from "@/components/home/map-tag";
import { HERO_LANE } from "@/lib/data/home/hubs";
import { BOOK_PANEL } from "@/lib/data/home/panels";
import { BOOK_SCENE, QUOTE_SCENE, TRACK_SCENE } from "@/lib/data/home/scenes";
import { SCENES } from "@/lib/home/constants";
import { useTruckReadouts } from "@/lib/hooks/use-truck-readouts";

interface Props {
    tagsRef: RefObject<HTMLDivElement | null>;
    progress: MotionValue<number>;
}

const VALUE = "text-text font-mono text-sm whitespace-nowrap tabular-nums";
const BOOKED = BOOK_SCENE.steps[BOOK_SCENE.steps.length - 1];

export default function MapTags({ tagsRef, progress }: Props) {
    const { eta, remaining } = useTruckReadouts(progress);

    return (
        <div ref={tagsRef} aria-hidden className="pointer-events-none absolute inset-0">
            <MapTag id="quote" range={SCENES.quote} progress={progress} title={QUOTE_SCENE.tag.lane}>
                <p className={VALUE}>
                    {QUOTE_SCENE.tag.rate} <span className="text-accent">{QUOTE_SCENE.tag.range}</span>
                </p>
            </MapTag>
            <MapTag id="book" range={SCENES.book} progress={progress} title={`${BOOKED.label} ${BOOKED.value}`}>
                <p className={VALUE}>{BOOK_PANEL.carrier.name}</p>
            </MapTag>
            <MapTag id="truck" range={SCENES.eta} progress={progress} title={HERO_LANE.load}>
                <p className={VALUE}>
                    {TRACK_SCENE.readouts.eta.label} <motion.span className="text-accent">{eta}</motion.span>
                </p>
                <p className="text-text-secondary font-mono text-xs whitespace-nowrap tabular-nums">
                    <motion.span>{remaining}</motion.span> {TRACK_SCENE.readouts.remaining.label.toLowerCase()}
                </p>
            </MapTag>
        </div>
    );
}
