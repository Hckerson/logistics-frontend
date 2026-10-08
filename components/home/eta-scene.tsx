"use client";
import type { MotionValue } from "motion/react";
import SceneBlock from "@/components/home/scene-block";
import SceneHeader from "@/components/home/scene-header";
import { ETA_SCENE } from "@/lib/data/home/scenes";
import { SCENES } from "@/lib/home/constants";

interface Props {
    progress: MotionValue<number>;
    reduced: boolean;
}

export default function EtaScene({ progress, reduced }: Props) {
    return (
        <SceneBlock
            progress={progress}
            range={SCENES.eta}
            reduced={reduced}
            className="flex-col pt-[calc(var(--haulr-header)+2rem)] lg:items-end lg:pt-[calc(var(--haulr-header)+4rem)]"
        >
            <SceneHeader
                label={ETA_SCENE.label}
                title={ETA_SCENE.title}
                body={ETA_SCENE.body}
                className="max-w-xl lg:max-w-[34%]"
            />
        </SceneBlock>
    );
}
