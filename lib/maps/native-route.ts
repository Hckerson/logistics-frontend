import { GeoJSONSource, type ExpressionSpecification, type LineLayerSpecification, type Map as MapLibreMap } from "maplibre-gl";
import { ROUTE_LINES, ROUTE_MOTION } from "@/lib/maps/constants";
import type { LonLat, MapMotion, MapPalette, MapRoute, Rgb } from "@/lib/types";

type Stop = readonly [number, string];

const SOURCES = { route: "haulr-route", track: "haulr-track" } as const;
const LAYERS = {
    trackGlow: "haulr-track-glow",
    track: "haulr-track",
    glow: "haulr-route-glow",
    lane: "haulr-route-lane",
    travelledGlow: "haulr-route-travelled-glow",
    travelled: "haulr-route-travelled",
    pulse: "haulr-route-pulse",
} as const;
const LAYOUT: LineLayerSpecification["layout"] = { "line-cap": "round", "line-join": "round" };
const PULSE_EDGE = 0.002;
const BEYOND = 2;

const rgba = ([red, green, blue]: Rgb, alpha: number) => `rgba(${red}, ${green}, ${blue}, ${alpha})`;

const reveal = (colour: string, upto: number): ExpressionSpecification => [
    "step",
    ["line-progress"],
    colour,
    upto >= 1 ? BEYOND : Math.max(upto, 0),
    rgba([0, 0, 0], 0),
];

const ramp = (stops: readonly Stop[]): ExpressionSpecification => {
    const kept: Stop[] = [];
    for (const stop of stops) if (stop[0] >= 0 && stop[0] <= 1 && (kept.length === 0 || stop[0] > kept[kept.length - 1][0])) kept.push(stop);
    return ["interpolate", ["linear"], ["line-progress"], ...kept.flat()];
};

const line = (id: string, source: string, paint: LineLayerSpecification["paint"]): LineLayerSpecification => ({ id, type: "line", source, layout: LAYOUT, paint });

export function mountRoute(map: MapLibreMap, palette: MapPalette, beforeId: string | undefined) {
    const hidden = reveal(rgba(palette.accent, 0), 0);
    map.addSource(SOURCES.track, { type: "geojson", data: { type: "FeatureCollection", features: [] } });
    map.addSource(SOURCES.route, { type: "geojson", lineMetrics: true, data: { type: "FeatureCollection", features: [] } });
    const { trackGlow, track, glow, lane, travelledGlow, travelled, pulse } = ROUTE_LINES;
    const layers = [
        line(LAYERS.trackGlow, SOURCES.track, { "line-color": rgba(palette.accent, trackGlow.alpha), "line-width": trackGlow.width, "line-blur": trackGlow.blur }),
        line(LAYERS.track, SOURCES.track, { "line-color": rgba(palette.accent, track.alpha), "line-width": track.width }),
        line(LAYERS.glow, SOURCES.route, { "line-width": glow.width, "line-blur": glow.blur, "line-gradient": hidden }),
        line(LAYERS.lane, SOURCES.route, { "line-width": lane.width, "line-gradient": hidden }),
        line(LAYERS.travelledGlow, SOURCES.route, { "line-width": travelledGlow.width, "line-blur": travelledGlow.blur, "line-gradient": hidden }),
        line(LAYERS.travelled, SOURCES.route, { "line-width": travelled.width, "line-gradient": hidden }),
        line(LAYERS.pulse, SOURCES.route, { "line-width": pulse.width, "line-blur": pulse.blur, "line-gradient": hidden }),
    ];
    for (const layer of layers) map.addLayer(layer, beforeId);
}

export function setRouteData(map: MapLibreMap, route: MapRoute | null, track: readonly LonLat[] | undefined) {
    const routeSource = map.getSource(SOURCES.route);
    const trackSource = map.getSource(SOURCES.track);
    if (routeSource instanceof GeoJSONSource) {
        void routeSource.setData({
            type: "FeatureCollection",
            features: route ? [{ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: route.path } }] : [],
        });
    }
    if (trackSource instanceof GeoJSONSource) {
        void trackSource.setData({
            type: "FeatureCollection",
            features: track && track.length > 1 ? [{ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [...track] } }] : [],
        });
    }
}

export function paintRoute(map: MapLibreMap, route: MapRoute | null, motion: MapMotion, palette: MapPalette) {
    if (!map.getLayer(LAYERS.pulse)) return;
    const travelled = route ? Math.min(route.travelled, motion.drawn) : 0;
    const head = route?.live && motion.pulse > 0 ? travelled * motion.pulse : 0;
    const tail = head - travelled * ROUTE_MOTION.trail;
    const { glow, lane, travelledGlow, travelled: driven } = ROUTE_LINES;
    const clear = rgba(palette.hot, 0);

    map.setPaintProperty(LAYERS.glow, "line-gradient", reveal(rgba(palette.accent, glow.alpha), motion.drawn));
    map.setPaintProperty(LAYERS.lane, "line-gradient", reveal(rgba(palette.accent, lane.alpha), motion.drawn));
    map.setPaintProperty(LAYERS.travelledGlow, "line-gradient", reveal(rgba(palette.headlight, travelledGlow.alpha), travelled));
    map.setPaintProperty(LAYERS.travelled, "line-gradient", reveal(rgba(palette.headlight, driven.alpha), travelled));
    map.setPaintProperty(
        LAYERS.pulse,
        "line-gradient",
        head > 0 ? ramp([[0, clear], [tail, clear], [head, rgba(palette.hot, 1)], [head + PULSE_EDGE, clear], [1, clear]]) : reveal(clear, 0),
    );
}
