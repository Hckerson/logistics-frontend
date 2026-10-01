"use client";
import { motion, useTransform, type MotionValue } from "motion/react";
import LaneRule from "@/components/home/lane-rule";
import { DELIVER_SCENE } from "@/lib/data/home/scenes";
import { SCENES } from "@/lib/home/constants";

interface Props {
    progress: MotionValue<number>;
    reduced: boolean;
}

export default function DeliverScene({ progress, reduced }: Props) {
    const visibility = useTransform(progress, (value) => (value >= SCENES.cut ? "visible" : "hidden"));

    return (
        <motion.div
            style={reduced ? undefined : { visibility }}
            className="bg-text text-text-inverse absolute inset-0 flex items-center motion-reduce:static motion-reduce:py-16"
        >
            <div className="haulr-shell flex flex-col items-center gap-10 text-center">
                <p className="haulr-label text-accent">{DELIVER_SCENE.label}</p>
                <h2 className="haulr-title max-w-4xl">{DELIVER_SCENE.title}</h2>
                <LaneRule state="settled" still className="w-full max-w-xl" />
                <dl className="grid w-full max-w-4xl gap-6 text-left sm:grid-cols-3">
                    {DELIVER_SCENE.receipt.map((line) => (
                        <div key={line.id} className="border-text-inverse/25 flex flex-col gap-2 border-t pt-4">
                            <dt className="haulr-label text-text-inverse/60">{line.label}</dt>
                            <dd className="text-lg">{line.value}</dd>
                        </div>
                    ))}
                </dl>
                <p className="haulr-label text-text-inverse/60">{DELIVER_SCENE.note}</p>
            </div>
        </motion.div>
    );
}
