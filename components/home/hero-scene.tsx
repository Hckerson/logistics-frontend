"use client";
import type { MotionValue } from "motion/react";
import { ArrowRight } from "@carbon/icons-react";
import HaulrButton from "@/components/home/haulr-button";
import HeroHeadline from "@/components/home/hero-headline";
import SceneBlock from "@/components/home/scene-block";
import { useSide } from "@/lib/hooks/use-side";
import { HERO_COPY, HERO_LANE_LABEL } from "@/lib/data/home/hero";
import { SCENES } from "@/lib/home/constants";

interface Props {
    progress: MotionValue<number>;
    reduced: boolean;
}

export default function HeroScene({ progress, reduced }: Props) {
    const { side } = useSide();
    const copy = HERO_COPY[side];

    return (
        <SceneBlock
            progress={progress}
            range={SCENES.hero}
            hold="start"
            reduced={reduced}
            className="items-start pt-[calc(var(--haulr-header)+2rem)] lg:items-center lg:pt-(--haulr-header)"
        >
            <div className="flex max-w-xl flex-col gap-6 lg:max-w-[50%] lg:gap-8">
                <p className="haulr-label text-accent-dark">{HERO_LANE_LABEL}</p>
                <HeroHeadline id={side} lines={copy.headline} />
                <p className="text-text-secondary max-w-md text-(length:--haulr-lead)">{copy.lead}</p>
                <div className="flex flex-wrap items-center gap-5">
                    <HaulrButton href={copy.primary.href}>
                        {copy.primary.label}
                        <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </HaulrButton>
                    <HaulrButton href={copy.secondary.href} tone="ghost">
                        {copy.secondary.label}
                    </HaulrButton>
                </div>
            </div>
        </SceneBlock>
    );
}
