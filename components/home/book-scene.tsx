"use client";
import type { MotionValue } from "motion/react";
import SceneBlock from "@/components/home/scene-block";
import SceneHeader from "@/components/home/scene-header";
import { BOOK_SCENE } from "@/lib/data/home/scenes";
import { SCENES } from "@/lib/home/constants";

interface Props {
    progress: MotionValue<number>;
    reduced: boolean;
}

export default function BookScene({ progress, reduced }: Props) {
    return (
        <SceneBlock
            progress={progress}
            range={SCENES.book}
            reduced={reduced}
            className="flex-col justify-start gap-6 pt-[calc(var(--haulr-header)+2rem)] lg:justify-between lg:pt-[calc(var(--haulr-header)+4rem)] lg:pb-14"
        >
            <SceneHeader
                label={BOOK_SCENE.label}
                title={BOOK_SCENE.title}
                body={BOOK_SCENE.body}
                className="max-w-xl lg:max-w-[38%]"
            />
            <div className="flex flex-col gap-3">
                <dl className="border-border-dark grid max-w-2xl grid-cols-3 border-t">
                    {BOOK_SCENE.steps.map((step) => (
                        <div key={step.id} className="flex flex-col-reverse justify-end gap-1 pt-3 pr-4">
                            <dt className="text-text-muted text-xs sm:text-sm">{step.label}</dt>
                            <dd className="text-text font-mono text-lg sm:text-2xl">{step.value}</dd>
                        </div>
                    ))}
                </dl>
                <p className="haulr-label text-text-muted">{BOOK_SCENE.note}</p>
            </div>
        </SceneBlock>
    );
}
