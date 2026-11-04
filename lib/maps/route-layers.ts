import type { Layer } from "@deck.gl/core";
import { GlowTripsLayer } from "@/lib/home/glow";
import { ADDITIVE_BLEND, LANE } from "@/lib/home/map-constants";
import { OPAQUE, tint } from "@/lib/home/palette";
import { ROUTE_MARKS, ROUTE_MOTION } from "@/lib/maps/constants";
import type { Glows, MapMotion, MapPalette, MapRoute, Rgba, RouteLine } from "@/lib/types";

interface Stroke {
    colour: Rgba;
    width: number;
    glow: Glows[keyof Glows];
    time: number;
    trail: number;
    fade: boolean;
    additive?: boolean;
}

const stroke = (id: string, route: RouteLine, style: Stroke) =>
    new GlowTripsLayer<RouteLine>({
        id,
        data: [route],
        getPath: (line) => line.path,
        getTimestamps: (line) => line.timestamps,
        getColor: style.colour,
        widthMinPixels: style.width,
        currentTime: style.time,
        trailLength: style.trail,
        fadeTrail: style.fade,
        capRounded: true,
        jointRounded: true,
        extensions: [style.glow],
        ...(style.additive ? { parameters: ADDITIVE_BLEND } : {}),
    });

export function routeLayers(route: MapRoute, palette: MapPalette, glows: Glows, motion: MapMotion): Layer[] {
    const travelled = Math.min(route.travelled, motion.drawn);
    const layers: Layer[] = [
        stroke("route-lane", route, {
            colour: tint(palette.accent, ROUTE_MARKS.alpha.lane),
            width: ROUTE_MARKS.lane,
            glow: glows.lane,
            time: motion.drawn * (1 + LANE.draw),
            trail: LANE.draw,
            fade: false,
        }),
        stroke("route-travelled", route, {
            colour: tint(palette.headlight, OPAQUE),
            width: ROUTE_MARKS.travelled,
            glow: glows.travelled,
            time: travelled,
            trail: LANE.draw,
            fade: false,
        }),
    ];

    if (!route.live || travelled <= 0 || motion.pulse <= 0) return layers;

    return [
        ...layers,
        stroke("route-pulse", route, {
            colour: tint(palette.hot, OPAQUE),
            width: ROUTE_MARKS.pulse,
            glow: glows.trail,
            time: travelled * motion.pulse,
            trail: travelled * ROUTE_MOTION.trail,
            fade: true,
            additive: true,
        }),
    ];
}
