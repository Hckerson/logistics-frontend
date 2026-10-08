import { useEffect, useRef, type RefObject } from "react";
import { Deck, MapView } from "@deck.gl/core";
import roadData from "@/lib/data/home/roads.json";
import { DPR_MAX, MAP_DEVICE, QUOTE_MAP, TRIPS } from "@/lib/home/map-constants";
import { glowsOf } from "@/lib/home/glow";
import { lerp } from "@/lib/home/math";
import { paletteOf } from "@/lib/home/palette";
import { quoteLayers } from "@/lib/home/quote-layers";
import { quoteView } from "@/lib/home/quote-map";
import { pinLabels, viewportOf } from "@/lib/home/screen";
import { buildTrips } from "@/lib/home/trips";
import type { FlightView, LonLat, QuoteLane } from "@/lib/types";

interface Options {
    lane: QuoteLane | null;
    still: boolean;
    onReady: () => void;
    labelsRef: RefObject<HTMLElement | null>;
}

const ROADS = roadData as LonLat[][];
const MILLISECONDS = 1000;
const KEYS = ["longitude", "latitude", "zoom", "pitch", "bearing"] as const;

export function useQuoteMap(
    canvasRef: RefObject<HTMLCanvasElement | null>,
    { lane, still, onReady, labelsRef }: Options,
) {
    const laneRef = useRef(lane);

    useEffect(() => {
        laneRef.current = lane;
    }, [lane]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const palette = paletteOf(canvas);
        const glows = glowsOf(palette);
        const trips = buildTrips(ROADS, QUOTE_MAP.trips);
        const view: FlightView = quoteView(laneRef.current, canvas.clientWidth);
        let shown = laneRef.current;
        let drawn = shown ? 1 : 0;
        let visible = true;
        let frameId = 0;

        const deck = new Deck({
            canvas,
            width: "100%",
            height: "100%",
            controller: false,
            deviceProps: MAP_DEVICE,
            useDevicePixels: Math.min(window.devicePixelRatio, DPR_MAX),
            views: new MapView({ repeat: false }),
            viewState: view,
            parameters: { depthCompare: "always" },
            layers: [],
            onLoad: onReady,
        });

        const draw = (now: number) => {
            frameId = requestAnimationFrame(draw);
            if (!visible || document.hidden) return;
            if (laneRef.current !== shown) {
                shown = laneRef.current;
                drawn = 0;
            }
            const target = quoteView(shown, canvas.clientWidth);
            const ease = still ? 1 : QUOTE_MAP.ease;
            for (const key of KEYS) view[key] = lerp(view[key], target[key], ease);
            drawn = shown ? lerp(drawn, 1, still ? 1 : QUOTE_MAP.drawEase) : 0;

            deck.setProps({
                viewState: { ...view },
                layers: quoteLayers(
                    trips,
                    palette,
                    {
                        time: still ? TRIPS.loop / 2 : ((now / MILLISECONDS) * TRIPS.rate) % TRIPS.loop,
                        lane: shown,
                        drawn,
                    },
                    glows,
                ),
            });
            pinLabels(labelsRef.current, viewportOf(view, canvas), 1);
        };

        const watcher = new IntersectionObserver(
            ([entry]) => {
                visible = entry.isIntersecting;
            },
            { rootMargin: QUOTE_MAP.warmMargin },
        );
        watcher.observe(canvas);
        frameId = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(frameId);
            watcher.disconnect();
            deck.finalize();
        };
    }, [canvasRef, still, onReady, labelsRef]);
}
