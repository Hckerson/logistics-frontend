"use client";
import type { MotionValue } from "motion/react";
import DeliverSteps from "@/components/home/deliver-steps";
import PodDocument from "@/components/home/pod-document";
import SceneBlock from "@/components/home/scene-block";
import { DELIVER_SCENE } from "@/lib/data/home/scenes";
import { SCENES } from "@/lib/home/constants";

interface Props {
    progress: MotionValue<number>;
    reduced: boolean;
}

export default function DeliverScene({ progress, reduced }: Props) {
    return (
        <SceneBlock
            progress={progress}
            range={SCENES.deliver}
            hold="end"
            reduced={reduced}
            className="flex-col gap-8 pt-[calc(var(--haulr-header)+2rem)] lg:flex-row lg:items-center lg:justify-between lg:pt-(--haulr-header)"
        >
            <div className="flex max-w-xl flex-col gap-8 lg:max-w-[40%] lg:gap-10">
                <div className="flex flex-col gap-4 lg:gap-6">
                    <p className="haulr-label text-accent">{DELIVER_SCENE.label}</p>
                    <h2 className="haulr-title text-text">{DELIVER_SCENE.title}</h2>
                </div>
                <DeliverSteps progress={progress} reduced={reduced} />
            </div>
            <PodDocument progress={progress} reduced={reduced} />
        </SceneBlock>
    );
}
