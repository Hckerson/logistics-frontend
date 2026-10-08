import type { Layer } from "@deck.gl/core";
import type { Glows, MapFrame, MapPalette, Route, Trip } from "@/lib/types";
import { INTRO, SCENES } from "@/lib/home/constants";
import { ARCS, MAP_ALPHA, MAP_WIDTH } from "@/lib/home/map-constants";
import { baseLayers } from "@/lib/home/base-layers";
import { GlowTripsLayer } from "@/lib/home/glow";
import { loadLayers } from "@/lib/home/load-layers";
import { ramp, smootherstep } from "@/lib/home/math";
import { tint } from "@/lib/home/palette";
import { arcRoute } from "@/lib/home/routes";
import { HUB_ARCS } from "@/lib/home/trips";

const ARC_ROUTES = HUB_ARCS.map((arc) => arcRoute(arc.from, arc.to, 1, ARCS.height));

const fade = (value: number, start: number, end: number) => smootherstep(ramp(value, start, end));

export const introFades = (intro: number) => ({
    land: fade(intro, 0, 0.3),
    network: fade(intro, 0.1, 0.5),
    traffic: fade(intro, 0.25, 0.8),
});

export function mapLayers(trips: Trip[], palette: MapPalette, frame: MapFrame, glows: Glows): Layer[] {
    const arcs = fade(frame.intro, INTRO.laneStart, 1) * (1 - fade(frame.progress, SCENES.hero[0], SCENES.quote[0] + 0.07));

    return [
        ...baseLayers(trips, palette, frame.time, glows, introFades(frame.intro)),
        new GlowTripsLayer<Route>({
            id: "arcs",
            data: ARC_ROUTES,
            getPath: (arc) => arc.path,
            getTimestamps: (arc) => arc.timestamps,
            getColor: tint(palette.accent, MAP_ALPHA.arc),
            currentTime: 1,
            trailLength: 1,
            fadeTrail: true,
            widthMinPixels: MAP_WIDTH.arc,
            billboard: true,
            opacity: arcs,
            extensions: [glows.arc],
        }),
        ...loadLayers(palette, frame, glows),
    ];
}
