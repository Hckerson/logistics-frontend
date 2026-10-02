import type { Layer } from "@deck.gl/core";
import { TripsLayer } from "@deck.gl/geo-layers";
import { ArcLayer, GeoJsonLayer, PathLayer, TextLayer } from "@deck.gl/layers";
import type { LonLat, MapFrame, MapPalette, NetworkHub, Rgb, Trip } from "@/lib/types";
import { ARCS, INTRO, MAP_ALPHA, MAP_LABEL_SIZE, MAP_WIDTH, SCENES, TRIPS } from "@/lib/home/constants";
import { loadLayers } from "@/lib/home/load-layers";
import { ramp, smootherstep } from "@/lib/home/math";
import { CONTIGUOUS_STATES } from "@/lib/home/states";
import { HUB_ARCS, MAJOR_HUBS } from "@/lib/home/trips";

const OPAQUE = 255;
const ADDITIVE = {
    blendColorSrcFactor: "src-alpha",
    blendColorDstFactor: "one",
    blendAlphaSrcFactor: "one",
    blendAlphaDstFactor: "one",
} as const;

const tint = (colour: Rgb, alpha: number): [number, number, number, number] => [...colour, Math.round(alpha)];
const fade = (value: number, start: number, end: number) => smootherstep(ramp(value, start, end));

export function mapLayers(roads: LonLat[][], trips: Trip[], palette: MapPalette, frame: MapFrame): Layer[] {
    const land = fade(frame.intro, 0, 0.3);
    const network = fade(frame.intro, 0.1, 0.5);
    const traffic = fade(frame.intro, 0.25, 0.8);
    const arcs = fade(frame.intro, INTRO.laneStart, 1) * (1 - fade(frame.progress, SCENES.hero[0], SCENES.quote[0] + 0.07));

    return [
        new GeoJsonLayer({
            id: "states",
            data: CONTIGUOUS_STATES,
            filled: true,
            stroked: true,
            getFillColor: tint(palette.land, OPAQUE),
            getLineColor: tint(palette.stateLine, OPAQUE),
            lineWidthMinPixels: 1,
            opacity: land,
        }),
        new PathLayer<LonLat[]>({
            id: "roads",
            data: roads,
            getPath: (road) => road,
            getColor: tint(palette.road, MAP_ALPHA.road),
            widthMinPixels: MAP_WIDTH.road,
            opacity: network,
        }),
        new TripsLayer<Trip>({
            id: "trips",
            data: trips,
            getPath: (trip) => trip.path,
            getTimestamps: (trip) => trip.timestamps,
            getColor: (trip) => (trip.accent ? palette.accent : palette.headlight),
            currentTime: frame.time,
            trailLength: TRIPS.trail,
            fadeTrail: true,
            capRounded: true,
            jointRounded: true,
            widthMinPixels: MAP_WIDTH.trip,
            opacity: traffic,
            parameters: ADDITIVE,
        }),
        new ArcLayer({
            id: "arcs",
            data: HUB_ARCS,
            getSourcePosition: (arc) => arc.from,
            getTargetPosition: (arc) => arc.to,
            getSourceColor: tint(palette.accent, 0),
            getTargetColor: tint(palette.accent, MAP_ALPHA.arc),
            getHeight: ARCS.height,
            getWidth: 1.5,
            opacity: arcs,
            visible: arcs > 0,
        }),
        ...loadLayers(palette, frame),
        new TextLayer<NetworkHub>({
            id: "labels",
            data: MAJOR_HUBS,
            getPosition: (hub) => hub.position,
            getText: (hub) => hub.code,
            getSize: MAP_LABEL_SIZE,
            getColor: tint(palette.muted, MAP_ALPHA.label),
            getPixelOffset: [12, 0],
            getTextAnchor: "start",
            getAlignmentBaseline: "center",
            fontFamily: palette.font,
            opacity: network,
        }),
    ];
}
