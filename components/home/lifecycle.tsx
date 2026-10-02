"use client";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { animate, useMotionValue } from "motion/react";
import BookScene from "@/components/home/book-scene";
import DeliverScene from "@/components/home/deliver-scene";
import HeroScene from "@/components/home/hero-scene";
import MapScrims from "@/components/home/map-scrims";
import QuoteScene from "@/components/home/quote-scene";
import TrackScene from "@/components/home/track-scene";
import { useSceneProgress } from "@/lib/hooks/use-scene-progress";
import { INTRO } from "@/lib/home/constants";

const FreightMap = dynamic(() => import("@/components/home/freight-map"), { ssr: false });

export default function Lifecycle() {
    const { ref, progress, reduced } = useSceneProgress<HTMLElement>();
    const intro = useMotionValue(0);

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
                <div className="absolute inset-x-0 top-[40%] bottom-0 lg:inset-0 motion-reduce:relative motion-reduce:top-0 motion-reduce:h-[70svh]">
                    <FreightMap progress={progress} intro={intro} still={reduced} />
                </div>
                <MapScrims progress={progress} />
                <HeroScene progress={progress} reduced={reduced} />
                <QuoteScene progress={progress} reduced={reduced} />
                <BookScene progress={progress} reduced={reduced} />
                <TrackScene progress={progress} reduced={reduced} />
                <DeliverScene progress={progress} reduced={reduced} />
            </div>
        </section>
    );
}
