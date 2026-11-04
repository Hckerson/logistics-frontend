import type { LayersList } from "@deck.gl/core";
import { PathLayer, ScatterplotLayer } from "@deck.gl/layers";
import { OPAQUE, tint } from "@/lib/home/palette";
import { MAP_MARKS, ROUTE_MARKS } from "@/lib/maps/constants";
import { routeLayers } from "@/lib/maps/route-layers";
import type { Glows, LonLat, MapMotion, MapPalette, MapPrecision, MapRoute, MapStop, MapVehicle } from "@/lib/types";

interface Scene {
    stops: readonly MapStop[];
    route: MapRoute | null;
    track?: readonly LonLat[];
    vehicle: MapVehicle | null;
    precision: MapPrecision;
    palette: MapPalette;
    glows: Glows;
    motion: MapMotion;
}

const { alpha } = MAP_MARKS;
const pathOf = (path: readonly LonLat[]) => [...path];

export function freightLayers({ stops, route, track, vehicle, precision, palette, glows, motion }: Scene): LayersList {
    const tone = vehicle?.stale ? palette.muted : palette.accent;
    const history = track && track.length > 1 ? [track] : [];
    const vehicles = vehicle ? [vehicle] : [];

    return [
        ...(route ? routeLayers(route, palette, glows, motion) : []),
        new PathLayer({
            id: "track-glow",
            data: history,
            getPath: pathOf,
            getColor: tint(palette.accent, alpha.glow),
            getWidth: MAP_MARKS.trackGlow,
            widthUnits: "pixels",
            capRounded: true,
            jointRounded: true,
        }),
        new PathLayer({
            id: "track",
            data: history,
            getPath: pathOf,
            getColor: tint(palette.accent, OPAQUE),
            getWidth: MAP_MARKS.track,
            widthUnits: "pixels",
            capRounded: true,
            jointRounded: true,
        }),
        new ScatterplotLayer<MapStop>({
            id: "stops",
            data: [...stops],
            getPosition: (stop) => stop.position,
            getRadius: (stop) => (stop.done ? ROUTE_MARKS.terminal : ROUTE_MARKS.upcoming),
            getFillColor: (stop) => tint(palette.accent, stop.done ? OPAQUE : ROUTE_MARKS.alpha.upcoming),
            radiusUnits: "pixels",
            billboard: true,
            opacity: motion.drawn,
            extensions: [glows.dot],
        }),
        new ScatterplotLayer<MapVehicle>({
            id: "vehicle-area",
            data: precision === "city" ? vehicles : [],
            getPosition: (item) => item.position,
            getRadius: MAP_MARKS.cityRadiusM,
            radiusUnits: "meters",
            stroked: true,
            getFillColor: tint(tone, alpha.area),
            getLineColor: tint(tone, alpha.areaLine),
            getLineWidth: 1,
            lineWidthUnits: "pixels",
        }),
        new ScatterplotLayer<MapVehicle>({
            id: "vehicle-glow",
            data: vehicles,
            getPosition: (item) => item.position,
            getRadius: ROUTE_MARKS.truck,
            getFillColor: tint(tone, vehicle?.stale ? ROUTE_MARKS.alpha.stale : OPAQUE),
            radiusUnits: "pixels",
            billboard: true,
            extensions: [glows.dot],
        }),
        new ScatterplotLayer<MapVehicle>({
            id: "vehicle",
            data: vehicles,
            getPosition: (item) => item.position,
            getRadius: ROUTE_MARKS.core,
            getFillColor: tint(palette.hot, OPAQUE),
            radiusUnits: "pixels",
            billboard: true,
        }),
    ];
}
