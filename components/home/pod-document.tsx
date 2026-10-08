"use client";
import { motion, useTransform, type MotionValue } from "motion/react";
import { DELIVER_SCENE } from "@/lib/data/home/scenes";
import { DELIVERY, SIGNATURE_PATH } from "@/lib/home/constants";

interface Props {
    progress: MotionValue<number>;
    reduced: boolean;
}

const DOC = DELIVER_SCENE.document;

export default function PodDocument({ progress, reduced }: Props) {
    const signed = useTransform(progress, [...DELIVERY.signature], [0, 1], { clamp: true });
    const stampOpacity = useTransform(progress, [...DELIVERY.stamp], [0, 1], { clamp: true });
    const stampScale = useTransform(progress, [...DELIVERY.stamp], [1.7, 1], { clamp: true });

    return (
        <div
            role="img"
            aria-label={DOC.summary}
            className="bg-text text-text-inverse hidden w-full max-w-sm shrink-0 -rotate-2 rounded-sm shadow-2xl md:block motion-reduce:block motion-reduce:rotate-0"
        >
            <div aria-hidden className="relative flex flex-col gap-5 p-6">
                <div className="border-text-inverse/20 flex items-baseline justify-between border-b pb-4">
                    <p className="haulr-label">{DOC.label}</p>
                    <p className="font-mono text-sm">{DOC.load}</p>
                </div>
                <dl className="flex flex-col gap-3">
                    {DOC.rows.map((row) => (
                        <div key={row.id} className="flex flex-col">
                            <dt className="haulr-label text-text-inverse/55">{row.label}</dt>
                            <dd className="text-lg">{row.value}</dd>
                        </div>
                    ))}
                </dl>
                <ul className="grid grid-cols-2 gap-3">
                    {DOC.photos.map((photo) => (
                        <li
                            key={photo}
                            className="haulr-label text-text-inverse/55 flex h-16 items-end rounded-xs bg-[repeating-linear-gradient(135deg,transparent_0_6px,rgb(0_0_0/0.07)_6px_7px)] p-2 outline outline-1 outline-black/15"
                        >
                            {photo}
                        </li>
                    ))}
                </ul>
                <div className="border-text-inverse/30 flex flex-col gap-1 border-b pb-1">
                    <svg viewBox="0 0 160 48" className="h-12 w-40">
                        <motion.path
                            d={SIGNATURE_PATH}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.6}
                            strokeLinecap="round"
                            style={{ pathLength: reduced ? 1 : signed }}
                        />
                    </svg>
                </div>
                <p className="haulr-label text-text-inverse/55 flex justify-between">
                    <span>{DOC.signature}</span>
                    <span>{DOC.note}</span>
                </p>
                <motion.div
                    style={reduced ? { opacity: 1, scale: 1 } : { opacity: stampOpacity, scale: stampScale }}
                    className="border-accent text-accent absolute top-16 right-5 flex size-28 rotate-12 flex-col items-center justify-center rounded-full border-[3px]"
                >
                    <span className="haulr-label font-semibold">{DOC.stamp[0]}</span>
                    <span className="font-mono text-xs">{DOC.stamp[1]}</span>
                </motion.div>
            </div>
        </div>
    );
}
