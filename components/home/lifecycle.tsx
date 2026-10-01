"use client";
import { useEffect, useRef } from "react";
import { animate, useMotionValue } from "motion/react";
import BookScene from "@/components/home/book-scene";
import DeliverScene from "@/components/home/deliver-scene";
import HeroScene from "@/components/home/hero-scene";
import LaneTag from "@/components/home/lane-tag";
import NetworkCanvas from "@/components/home/network-canvas";
import QuoteScene from "@/components/home/quote-scene";
import TrackScene from "@/components/home/track-scene";
import { useSceneProgress } from "@/lib/hooks/use-scene-progress";
import { QUOTE_SCENE, TRACK_SCENE } from "@/lib/data/home/scenes";
import { INTRO, SCENES } from "@/lib/home/constants";

const PRICE_RANGE = [SCENES.quote[0] + 0.04, SCENES.book[1]] as const;

export default function Lifecycle() {
    const { ref, progress, reduced } = useSceneProgress<HTMLElement>();
    const intro = useMotionValue(0);
    const price = useRef<HTMLDivElement>(null);
    const truck = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (reduced) {
            intro.set(1);
            return;
        }
        const controls = animate(intro, 1, { duration: INTRO.seconds, ease: "linear" });
        return () => controls.stop();
    }, [intro, reduced]);

    return (
        <section ref={ref} className="haulr-track">
            <div className="haulr-stage">
                <NetworkCanvas progress={progress} intro={intro} price={price} truck={truck} />
                <HeroScene progress={progress} reduced={reduced} />
                <QuoteScene progress={progress} reduced={reduced} />
                <BookScene progress={progress} reduced={reduced} />
                <TrackScene progress={progress} reduced={reduced} />
                <LaneTag anchor={price} progress={progress} range={PRICE_RANGE}>
                    <span className="text-text-muted">{QUOTE_SCENE.tag.lane}</span>
                    <span className="text-base">
                        {QUOTE_SCENE.tag.rate} <span className="text-accent-dark">{QUOTE_SCENE.tag.range}</span>
                    </span>
                </LaneTag>
                <LaneTag anchor={truck} progress={progress} range={SCENES.track}>
                    <span className="text-text-muted">{TRACK_SCENE.readouts.source.label}</span>
                    <span>{TRACK_SCENE.readouts.source.value}</span>
                </LaneTag>
                <DeliverScene progress={progress} reduced={reduced} />
            </div>
        </section>
    );
}
