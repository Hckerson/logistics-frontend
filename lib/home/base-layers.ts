import type { Layer } from "@deck.gl/core";
import { GeoJsonLayer, ScatterplotLayer } from "@deck.gl/layers";
import type { Glows, LonLat, MapPalette, NetworkHub, Rgba, Route, Trip } from "@/lib/types";
import roadData from "@/lib/data/home/roads.json";
import { ADDITIVE_BLEND, MAP_ALPHA, MAP_DOT, MAP_WIDTH, TRIPS } from "@/lib/home/map-constants";
import { GlowTripsLayer } from "@/lib/home/glow";
import { OPAQUE, tint } from "@/lib/home/palette";
import { staticRoutes } from "@/lib/home/routes";
import { CONTIGUOUS_STATES, STATE_BORDERS } from "@/lib/home/states";
import { NETWORK_HUBS } from "@/lib/home/trips";

interface Fade {
    land: number;
    network: number;
    traffic: number;
}

const ROADS = staticRoutes(roadData as LonLat[][]);
const BORDERS = staticRoutes(STATE_BORDERS);

const lines = (id: string, data: Route[], colour: Rgba, width: number, glows: Glows, opacity: number) =>
    new GlowTripsLayer<Route>({
        id,
        data,
        getPath: (line) => line.path,
        getTimestamps: (line) => line.timestamps,
        getColor: colour,
        currentTime: 1,
        trailLength: 1,
        fadeTrail: false,
        widthMinPixels: width,
        opacity,
        extensions: [glows.line],
    });

export function baseLayers(
    prefix: string,
    trips: Trip[],
    palette: MapPalette,
    time: number,
    glows: Glows,
    fade: Fade,
): Layer[] {
    return [
        new GeoJsonLayer({
            id: `${prefix}states`,
            data: CONTIGUOUS_STATES,
            filled: true,
            stroked: false,
            getFillColor: tint(palette.land, OPAQUE),
            opacity: fade.land,
        }),
        lines(`${prefix}borders`, BORDERS, tint(palette.stateLine, OPAQUE), MAP_WIDTH.border, glows, fade.land),
        lines(`${prefix}roads`, ROADS, tint(palette.road, MAP_ALPHA.road), MAP_WIDTH.road, glows, fade.network),
        new ScatterplotLayer<NetworkHub>({
            id: `${prefix}hubs`,
            data: NETWORK_HUBS,
            getPosition: (hub) => hub.position,
            getRadius: MAP_DOT.hub,
            getFillColor: tint(palette.headlight, MAP_ALPHA.hub),
            radiusUnits: "pixels",
            billboard: true,
            opacity: fade.network,
            parameters: ADDITIVE_BLEND,
            extensions: [glows.hub],
        }),
        new GlowTripsLayer<Trip>({
            id: `${prefix}trips`,
            data: trips,
            getPath: (trip) => trip.path,
            getTimestamps: (trip) => trip.timestamps,
            getColor: (trip) => (trip.accent ? palette.accent : palette.headlight),
            currentTime: time,
            trailLength: TRIPS.trail,
            fadeTrail: true,
            widthMinPixels: MAP_WIDTH.trip,
            opacity: fade.traffic,
            parameters: ADDITIVE_BLEND,
            extensions: [glows.trail],
        }),
    ];
}
