import type { Layer } from "@deck.gl/core";
import { TripsLayer } from "@deck.gl/geo-layers";
import { GeoJsonLayer, PathLayer, ScatterplotLayer, TextLayer } from "@deck.gl/layers";
import type { LonLat, LonLatAlt, MapPalette, NetworkHub, QuoteLane, Rgb, Trip } from "@/lib/types";
import { MAP_ALPHA, MAP_DOT, MAP_LABEL_SIZE, MAP_WIDTH, TRIPS } from "@/lib/home/constants";
import { arcPath } from "@/lib/home/quote-map";
import { CONTIGUOUS_STATES } from "@/lib/home/states";
import { NETWORK_HUBS } from "@/lib/home/trips";

interface Frame {
    time: number;
    lane: QuoteLane | null;
    drawn: number;
}

const OPAQUE = 255;
const ADDITIVE = {
    blendColorSrcFactor: "src-alpha",
    blendColorDstFactor: "one",
    blendAlphaSrcFactor: "one",
    blendAlphaDstFactor: "one",
} as const;

const tint = (colour: Rgb, alpha: number): [number, number, number, number] => [...colour, Math.round(alpha)];

export function quoteLayers(roads: LonLat[][], trips: Trip[], palette: MapPalette, frame: Frame): Layer[] {
    const { lane, drawn } = frame;
    const ends = lane ? [lane.from, lane.to] : [];
    const arc = lane ? [arcPath(lane, drawn)] : [];

    return [
        new GeoJsonLayer({
            id: "quote-states",
            data: CONTIGUOUS_STATES,
            filled: true,
            stroked: true,
            getFillColor: tint(palette.land, OPAQUE),
            getLineColor: tint(palette.stateLine, OPAQUE),
            lineWidthMinPixels: 1,
        }),
        new PathLayer<LonLat[]>({
            id: "quote-roads",
            data: roads,
            getPath: (road) => road,
            getColor: tint(palette.road, MAP_ALPHA.road),
            widthMinPixels: MAP_WIDTH.road,
        }),
        new TripsLayer<Trip>({
            id: "quote-trips",
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
            parameters: ADDITIVE,
        }),
        new ScatterplotLayer<NetworkHub>({
            id: "quote-hubs",
            data: NETWORK_HUBS,
            getPosition: (hub) => hub.position,
            getRadius: MAP_DOT.hub,
            getFillColor: tint(palette.muted, OPAQUE),
            radiusUnits: "pixels",
            billboard: true,
        }),
        new PathLayer<LonLatAlt[]>({
            id: "quote-arc-glow",
            data: arc,
            getPath: (path) => path,
            getColor: tint(palette.accent, MAP_ALPHA.laneGlow),
            widthMinPixels: MAP_WIDTH.laneGlow,
            capRounded: true,
            jointRounded: true,
            billboard: true,
        }),
        new PathLayer<LonLatAlt[]>({
            id: "quote-arc",
            data: arc,
            getPath: (path) => path,
            getColor: tint(palette.accent, OPAQUE),
            widthMinPixels: MAP_WIDTH.lane,
            capRounded: true,
            jointRounded: true,
            billboard: true,
        }),
        new ScatterplotLayer<NetworkHub>({
            id: "quote-ends",
            data: ends,
            getPosition: (hub) => hub.position,
            getRadius: MAP_DOT.terminal,
            getFillColor: tint(palette.accent, OPAQUE),
            radiusUnits: "pixels",
            billboard: true,
        }),
        new TextLayer<NetworkHub>({
            id: "quote-labels",
            data: ends,
            getPosition: (hub) => hub.position,
            getText: (hub) => hub.code,
            getSize: MAP_LABEL_SIZE + 2,
            getColor: tint(palette.headlight, OPAQUE),
            getPixelOffset: [14, 0],
            getTextAnchor: "start",
            getAlignmentBaseline: "center",
            fontFamily: palette.font,
        }),
    ];
}
