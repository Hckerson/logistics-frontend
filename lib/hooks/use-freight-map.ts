import { useEffect, type RefObject } from "react";
import { Deck, MapView } from "@deck.gl/core";
import type { MotionValue } from "motion/react";
import roadData from "@/lib/data/home/roads.json";
import { INTRO } from "@/lib/home/constants";
import { DPR_MAX, MAP_DEVICE, MOBILE_WIDTH, TRIPS } from "@/lib/home/map-constants";
import { flightAt } from "@/lib/home/flight";
import { glowsOf } from "@/lib/home/glow";
import { lanePoint, truckAt } from "@/lib/home/lane";
import { introFades, mapLayers } from "@/lib/home/map-layers";
import { clamp } from "@/lib/home/math";
import { paletteOf } from "@/lib/home/palette";
import { pin, pinLabels, viewportOf } from "@/lib/home/screen";
import { buildTrips } from "@/lib/home/trips";
import type { LonLat } from "@/lib/types";

interface Options {
    progress: MotionValue<number>;
    still: boolean;
    onReady: () => void;
    tagRef: RefObject<HTMLElement | null>;
    labelsRef: RefObject<HTMLElement | null>;
}

const ROADS = roadData as LonLat[][];
const MILLISECONDS = 1000;

export function useFreightMap(
    canvasRef: RefObject<HTMLCanvasElement | null>,
    { progress, still, onReady, tagRef, labelsRef }: Options,
) {
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const palette = paletteOf(canvas);
        const glows = glowsOf(palette);
        const trips = buildTrips(ROADS, TRIPS.count);
        const mobile = () => canvas.clientWidth < MOBILE_WIDTH;
        let visible = true;
        let frameId = 0;
        let submitted = false;
        let firstFrame = 0;

        const deck = new Deck({
            canvas,
            width: "100%",
            height: "100%",
            controller: false,
            deviceProps: MAP_DEVICE,
            useDevicePixels: Math.min(window.devicePixelRatio, DPR_MAX),
            views: new MapView({ repeat: false }),
            viewState: flightAt(progress.get(), mobile()),
            parameters: { depthCompare: "always" },
            layers: [],
            onLoad: onReady,
            onAfterRender: () => {
                if (submitted) firstFrame ||= performance.now();
            },
        });

        const draw = (now: number) => {
            frameId = requestAnimationFrame(draw);
            if (!visible || document.hidden) return;
            const current = progress.get();
            const view = flightAt(current, mobile());
            const elapsed = firstFrame ? clamp((now - firstFrame) / (INTRO.seconds * MILLISECONDS)) : 0;
            const intro = still ? 1 : elapsed;
            deck.setProps({
                viewState: view,
                layers: mapLayers(
                    trips,
                    palette,
                    {
                        intro,
                        progress: current,
                        time: still ? TRIPS.loop / 2 : ((now / MILLISECONDS) * TRIPS.rate) % TRIPS.loop,
                    },
                    glows,
                ),
            });
            submitted = true;
            const viewport = viewportOf(view, canvas);
            pinLabels(labelsRef.current, viewport, introFades(intro).network);
            if (tagRef.current) pin(tagRef.current, viewport, lanePoint(truckAt(current)), 1);
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
    }, [canvasRef, progress, still, onReady, tagRef, labelsRef]);
}
