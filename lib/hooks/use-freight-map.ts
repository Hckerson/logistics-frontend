import { useEffect, type RefObject } from "react";
import { Deck, MapView } from "@deck.gl/core";
import type { MotionValue } from "motion/react";
import roadData from "@/lib/data/home/roads.json";
import { DPR_MAX, MOBILE_WIDTH, TRIPS } from "@/lib/home/constants";
import { flightAt } from "@/lib/home/flight";
import { mapLayers } from "@/lib/home/map-layers";
import { paletteOf } from "@/lib/home/palette";
import { buildTrips } from "@/lib/home/trips";
import type { LonLat } from "@/lib/types";

interface Options {
    progress: MotionValue<number>;
    intro: MotionValue<number>;
    still: boolean;
    onReady: () => void;
}

const ROADS = roadData as LonLat[][];
const MILLISECONDS = 1000;

export function useFreightMap(canvasRef: RefObject<HTMLCanvasElement | null>, { progress, intro, still, onReady }: Options) {
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const palette = paletteOf(canvas);
        const trips = buildTrips(ROADS);
        const mobile = () => canvas.clientWidth < MOBILE_WIDTH;
        let visible = true;
        let frameId = 0;

        const deck = new Deck({
            canvas,
            width: "100%",
            height: "100%",
            controller: false,
            useDevicePixels: Math.min(window.devicePixelRatio, DPR_MAX),
            views: new MapView({ repeat: false }),
            viewState: flightAt(progress.get(), mobile()),
            parameters: { depthCompare: "always" },
            layers: [],
            onLoad: onReady,
        });

        const draw = (now: number) => {
            frameId = requestAnimationFrame(draw);
            if (!visible || document.hidden) return;
            const current = progress.get();
            deck.setProps({
                viewState: flightAt(current, mobile()),
                layers: mapLayers(ROADS, trips, palette, {
                    intro: intro.get(),
                    progress: current,
                    time: still ? TRIPS.loop / 2 : ((now / MILLISECONDS) * TRIPS.rate) % TRIPS.loop,
                }),
            });
        };

        const watcher = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
        });
        watcher.observe(canvas);
        frameId = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(frameId);
            watcher.disconnect();
            deck.finalize();
        };
    }, [canvasRef, progress, intro, still, onReady]);
}
