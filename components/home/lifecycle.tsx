"use client";
import dynamic from "next/dynamic";
import { useRef } from "react";
import BookScene from "@/components/home/book-scene";
import DeliverScene from "@/components/home/deliver-scene";
import EtaScene from "@/components/home/eta-scene";
import HeroScene from "@/components/home/hero-scene";
import MapLabels from "@/components/home/map-labels";
import MapScrims from "@/components/home/map-scrims";
import QuoteScene from "@/components/home/quote-scene";
import TrackScene from "@/components/home/track-scene";
import TruckTag from "@/components/home/truck-tag";
import { MAJOR_CODES } from "@/lib/home/trips";
import { useSceneProgress } from "@/lib/hooks/use-scene-progress";

const FreightMap = dynamic(() => import("@/components/home/freight-map"), { ssr: false });

export default function Lifecycle() {
    const { ref, progress, reduced } = useSceneProgress<HTMLElement>();
    const tagRef = useRef<HTMLDivElement>(null);
    const labelsRef = useRef<HTMLDivElement>(null);

    return (
        <section ref={ref} className="haulr-track">
            <div className="haulr-stage">
                <div className="absolute inset-x-0 top-[40%] bottom-0 lg:inset-0 motion-reduce:relative motion-reduce:top-0 motion-reduce:h-[70svh]">
                    <FreightMap progress={progress} still={reduced} tagRef={tagRef} labelsRef={labelsRef} />
                    <MapLabels labelsRef={labelsRef} codes={MAJOR_CODES} className="text-text-muted" />
                    <TruckTag tagRef={tagRef} progress={progress} />
                </div>
                <MapScrims progress={progress} />
                <HeroScene progress={progress} reduced={reduced} />
                <QuoteScene progress={progress} reduced={reduced} />
                <BookScene progress={progress} reduced={reduced} />
                <TrackScene progress={progress} reduced={reduced} />
                <EtaScene progress={progress} reduced={reduced} />
                <DeliverScene progress={progress} reduced={reduced} />
            </div>
        </section>
    );
}
