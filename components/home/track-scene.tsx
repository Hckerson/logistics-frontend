"use client";
import type { MotionValue } from "motion/react";
import SceneBlock from "@/components/home/scene-block";
import SceneHeader from "@/components/home/scene-header";
import TrackReadout from "@/components/home/track-readout";
import { TRACK_SCENE } from "@/lib/data/home/scenes";
import { SCENES } from "@/lib/home/constants";

interface Props {
    progress: MotionValue<number>;
    reduced: boolean;
}

const { readouts, confidence, miles } = TRACK_SCENE;

export default function TrackScene({ progress, reduced }: Props) {
    return (
        <SceneBlock
            progress={progress}
            range={SCENES.track}
            reduced={reduced}
            className="flex-col justify-start gap-6 pt-[calc(var(--haulr-header)+2rem)] lg:justify-center lg:gap-10 lg:pt-(--haulr-header)"
        >
            <SceneHeader
                label={TRACK_SCENE.label}
                title={TRACK_SCENE.title}
                body={TRACK_SCENE.body}
                className="max-w-xl lg:max-w-[38%]"
            />
            <dl className="border-border-dark grid max-w-md grid-cols-2 border-t">
                <TrackReadout
                    progress={progress}
                    label={readouts.eta.label}
                    from={confidence.from}
                    to={confidence.to}
                    prefix={readouts.eta.prefix}
                    unit={readouts.eta.unit}
                />
                <TrackReadout
                    progress={progress}
                    label={readouts.remaining.label}
                    from={miles.from}
                    to={miles.to}
                    unit={readouts.remaining.unit}
                />
            </dl>
        </SceneBlock>
    );
}
