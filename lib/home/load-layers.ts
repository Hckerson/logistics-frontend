import type { Layer } from "@deck.gl/core";
import { PathLayer, ScatterplotLayer, SolidPolygonLayer } from "@deck.gl/layers";
import type { LonLat, MapFrame, MapPalette, Rgb } from "@/lib/types";
import { beamPolygon } from "@/lib/home/beam";
import { CARRIERS, INTRO, MAP_ALPHA, MAP_DOT, MAP_WIDTH, SCENES } from "@/lib/home/constants";
import { LANE_DESTINATION, LANE_ORIGIN, lanePoint, laneSlice, truckAt } from "@/lib/home/lane";
import { lerp, ramp, smootherstep } from "@/lib/home/math";
import { CARRIER_POINTS, NETWORK_HUBS } from "@/lib/home/trips";

interface Dot {
    position: LonLat;
    radius: number;
    colour: [number, number, number, number];
}

const OPAQUE = 255;
const BOOK_TAIL = 0.04;
const TRACK_FADE = { before: 0.02, after: 0.03 };
const FULL_LANE = laneSlice(0, 1);

const tint = (colour: Rgb, alpha: number): [number, number, number, number] => [...colour, Math.round(alpha)];

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

export function loadLayers(palette: MapPalette, frame: MapFrame): Layer[] {
    const drawn = smootherstep(ramp(frame.intro, INTRO.laneStart, 1));
    const travelled = truckAt(frame.progress);
    const tracking = ramp(
        frame.progress,
        SCENES.track[0] - TRACK_FADE.before,
        SCENES.track[0] + TRACK_FADE.after,
    );
    const lane = drawn >= 1 ? FULL_LANE : laneSlice(0, drawn);
    const truck = lanePoint(travelled);

    const dots: Dot[] = [
        ...NETWORK_HUBS.map((hub) => ({
            position: hub.position,
            radius: MAP_DOT.hub,
            colour: tint(palette.muted, OPAQUE * drawn),
        })),
        ...carrierDots(palette, frame.progress),
        { position: LANE_ORIGIN, radius: MAP_DOT.terminal, colour: tint(palette.accent, OPAQUE * drawn) },
        {
            position: LANE_DESTINATION,
            radius: MAP_DOT.terminal,
            colour: tint(palette.accent, drawn >= 1 ? OPAQUE : 0),
        },
        { position: truck, radius: MAP_DOT.halo, colour: tint(palette.accent, MAP_ALPHA.halo * tracking) },
        { position: truck, radius: MAP_DOT.truck, colour: tint(palette.headlight, OPAQUE * tracking) },
    ];

    return [
        new SolidPolygonLayer<LonLat[]>({
            id: "beam",
            data: [beamPolygon(travelled)],
            getPolygon: (polygon) => polygon,
            getFillColor: tint(palette.accent, MAP_ALPHA.beam * tracking),
            visible: tracking > 0,
        }),
        new PathLayer<LonLat[]>({
            id: "lane-glow",
            data: [lane],
            getPath: (path) => path,
            getColor: tint(palette.accent, MAP_ALPHA.laneGlow),
            widthMinPixels: MAP_WIDTH.laneGlow,
            capRounded: true,
            jointRounded: true,
            visible: drawn > 0,
        }),
        new PathLayer<LonLat[]>({
            id: "lane",
            data: [lane],
            getPath: (path) => path,
            getColor: tint(palette.accent, OPAQUE),
            widthMinPixels: MAP_WIDTH.lane,
            capRounded: true,
            jointRounded: true,
            visible: drawn > 0,
        }),
        new PathLayer<LonLat[]>({
            id: "travelled",
            data: [laneSlice(0, travelled)],
            getPath: (path) => path,
            getColor: tint(palette.headlight, OPAQUE * tracking),
            widthMinPixels: MAP_WIDTH.travelled,
            capRounded: true,
            jointRounded: true,
            visible: tracking > 0 && travelled > 0,
        }),
        new ScatterplotLayer<Dot>({
            id: "dots",
            data: dots,
            getPosition: (dot) => dot.position,
            getRadius: (dot) => dot.radius,
            getFillColor: (dot) => dot.colour,
            radiusUnits: "pixels",
            billboard: true,
        }),
    ];
}
