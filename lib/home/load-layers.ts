import type { Layer } from "@deck.gl/core";
import { ScatterplotLayer } from "@deck.gl/layers";
import type { Glows, LonLat, MapFrame, MapPalette, Rgb, Rgba, Route } from "@/lib/types";
import { beamRoute, beamWidth } from "@/lib/home/beam";
import { INTRO, SCENES } from "@/lib/home/constants";
import { BEAM, CARRIERS, LANE, MAP_DOT, MAP_WIDTH } from "@/lib/home/map-constants";
import { GlowTripsLayer } from "@/lib/home/glow";
import { LANE_DESTINATION, LANE_ORIGIN, LANE_PATH, LANE_TIMES, lanePoint, truckAt } from "@/lib/home/lane";
import { lerp, ramp, smootherstep } from "@/lib/home/math";
import { OPAQUE, tint } from "@/lib/home/palette";
import { CARRIER_POINTS } from "@/lib/home/trips";

interface Dot {
    position: LonLat;
    radius: number;
    colour: Rgba;
}

interface RouteStyle {
    colour: Rgba;
    width: number;
    metres?: boolean;
    glow: Glows[keyof Glows];
    time: number;
    opacity: number;
}

const BOOK_TAIL = 0.04;
const TRACK_FADE = { before: 0.02, after: 0.03 };
const LANE_ROUTE: Route[] = [{ path: LANE_PATH, timestamps: LANE_TIMES }];

function carrierDots(palette: MapPalette, progress: number): Dot[] {
    const book = ramp(progress, SCENES.book[0], SCENES.book[1] - BOOK_TAIL);
    if (book <= 0 || book >= 1) return [];
    const settle = smootherstep(book);
    return CARRIER_POINTS.map((point, index) => {
        const chosen = index === CARRIERS.chosen;
        return {
            position: chosen
                ? [lerp(point[0], LANE_ORIGIN[0], settle), lerp(point[1], LANE_ORIGIN[1], settle)]
                : point,
            radius: chosen ? MAP_DOT.chosen : MAP_DOT.carrier,
            colour: chosen
                ? tint(palette.accent, OPAQUE)
                : tint(palette.headlight, OPAQUE * Math.sin(Math.PI * book)),
        };
    });
}

const route = (id: string, data: Route[], style: RouteStyle) =>
    new GlowTripsLayer<Route>({
        id,
        data,
        getPath: (lane) => lane.path,
        getTimestamps: (lane) => lane.timestamps,
        getColor: style.colour,
        getWidth: style.metres ? style.width : 1,
        widthUnits: style.metres ? "meters" : "pixels",
        widthMinPixels: style.metres ? 0 : style.width,
        currentTime: style.time,
        trailLength: LANE.draw,
        fadeTrail: false,
        capRounded: !style.metres,
        jointRounded: true,
        opacity: style.opacity,
        extensions: [style.glow],
    });

const solid = (colour: Rgb) => tint(colour, OPAQUE);

export function loadLayers(palette: MapPalette, frame: MapFrame, glows: Glows): Layer[] {
    const drawn = smootherstep(ramp(frame.intro, INTRO.laneStart, 1));
    const travelled = truckAt(frame.progress);
    const tracking = ramp(frame.progress, SCENES.track[0] - TRACK_FADE.before, SCENES.track[0] + TRACK_FADE.after);

    const dots: Dot[] = [
        ...carrierDots(palette, frame.progress),
        { position: LANE_ORIGIN, radius: MAP_DOT.terminal, colour: tint(palette.accent, OPAQUE * drawn) },
        { position: LANE_DESTINATION, radius: MAP_DOT.terminal, colour: tint(palette.accent, drawn >= 1 ? OPAQUE : 0) },
        { position: lanePoint(travelled), radius: MAP_DOT.truck, colour: tint(palette.accent, OPAQUE * tracking) },
    ];

    return [
        route("beam", beamRoute(travelled), {
            colour: tint(palette.accent, BEAM.alpha),
            width: beamWidth(travelled),
            metres: true,
            glow: glows.beam,
            time: 1,
            opacity: tracking,
        }),
        route("lane", LANE_ROUTE, {
            colour: solid(palette.accent),
            width: MAP_WIDTH.lane,
            glow: glows.lane,
            time: drawn * (1 + LANE.draw),
            opacity: 1,
        }),
        route("travelled", LANE_ROUTE, {
            colour: solid(palette.headlight),
            width: MAP_WIDTH.travelled,
            glow: glows.travelled,
            time: travelled,
            opacity: tracking,
        }),
        new ScatterplotLayer<Dot>({
            id: "dots",
            data: dots,
            getPosition: (dot) => dot.position,
            getRadius: (dot) => dot.radius,
            getFillColor: (dot) => dot.colour,
            radiusUnits: "pixels",
            billboard: true,
            extensions: [glows.dot],
        }),
    ];
}
