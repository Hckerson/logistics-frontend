"use client";
import type { MotionValue } from "motion/react";
import SceneBlock from "@/components/home/scene-block";
import SceneHeader from "@/components/home/scene-header";
import { QUOTE_SCENE } from "@/lib/data/home/scenes";
import { SCENES } from "@/lib/home/constants";

interface Props {
    progress: MotionValue<number>;
    reduced: boolean;
}

export default function QuoteScene({ progress, reduced }: Props) {
    return (
        <SceneBlock
            progress={progress}
            range={SCENES.quote}
            reduced={reduced}
            className="items-start pt-[calc(var(--haulr-header)+2rem)] lg:items-center lg:justify-end lg:pt-(--haulr-header)"
        >
            <SceneHeader
                label={QUOTE_SCENE.label}
                title={QUOTE_SCENE.title}
                body={QUOTE_SCENE.body}
                className="max-w-xl lg:max-w-[36%]"
            />
        </SceneBlock>
    );
}
