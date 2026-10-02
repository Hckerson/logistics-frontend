"use client";
import type { MotionValue } from "motion/react";
import BookPanel from "@/components/home/book-panel";
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
            className="flex-col gap-8 pt-[calc(var(--haulr-header)+2rem)] lg:flex-row lg:items-center lg:justify-between lg:pt-(--haulr-header)"
        >
            <SceneHeader
                label={BOOK_SCENE.label}
                title={BOOK_SCENE.title}
                body={BOOK_SCENE.body}
                className="max-w-xl lg:max-w-[34%]"
            />
            <BookPanel />
        </SceneBlock>
    );
}
