"use client";
import type { MotionValue } from "motion/react";
import SceneBlock from "@/components/home/scene-block";
import SceneHeader from "@/components/home/scene-header";
import TrackPanel from "@/components/home/track-panel";
import { TRACK_SCENE } from "@/lib/data/home/scenes";
import { SCENES } from "@/lib/home/constants";

interface Props {
    progress: MotionValue<number>;
    reduced: boolean;
}

export default function TrackScene({ progress, reduced }: Props) {
    return (
        <SceneBlock
            progress={progress}
            range={SCENES.track}
            reduced={reduced}
            className="flex-col gap-8 pt-[calc(var(--haulr-header)+2rem)] lg:flex-row lg:items-center lg:justify-between lg:pt-(--haulr-header)"
        >
            <SceneHeader
                label={TRACK_SCENE.label}
                title={TRACK_SCENE.title}
                body={TRACK_SCENE.body}
                className="max-w-xl lg:max-w-[34%]"
            />
            <TrackPanel progress={progress} />
        </SceneBlock>
    );
}
