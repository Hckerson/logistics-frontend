import type { LayersList } from "@deck.gl/core";
import { PathLayer, ScatterplotLayer } from "@deck.gl/layers";
import { OPAQUE, tint } from "@/lib/home/palette";
import { MAP_MARKS } from "@/lib/maps/constants";
import type { LonLat, MapPalette, MapPrecision, MapStop, MapVehicle } from "@/lib/types";

interface Scene {
    stops: readonly MapStop[];
    track?: readonly LonLat[];
    vehicle: MapVehicle | null;
    precision: MapPrecision;
    palette: MapPalette;
}

const { alpha } = MAP_MARKS;
const pathOf = (path: readonly LonLat[]) => [...path];

export function freightLayers({ stops, track, vehicle, precision, palette }: Scene): LayersList {
    const tone = vehicle?.stale ? palette.muted : palette.accent;
    const route = track && track.length > 1 ? [track] : [];
    const vehicles = vehicle ? [vehicle] : [];

    return [
        new PathLayer({
            id: "track-glow",
            data: route,
            getPath: pathOf,
            getColor: tint(palette.accent, alpha.glow),
            getWidth: MAP_MARKS.trackGlow,
            widthUnits: "pixels",
            capRounded: true,
            jointRounded: true,
        }),
        new PathLayer({
            id: "track",
            data: route,
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
            getRadius: MAP_MARKS.stop,
            radiusUnits: "pixels",
            stroked: true,
            getFillColor: (stop) => tint(stop.done ? palette.accent : palette.land, OPAQUE),
            getLineColor: tint(palette.accent, OPAQUE),
            getLineWidth: MAP_MARKS.ring,
            lineWidthUnits: "pixels",
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
            id: "vehicle-halo",
            data: vehicles,
            getPosition: (item) => item.position,
            getRadius: MAP_MARKS.halo,
            radiusUnits: "pixels",
            getFillColor: tint(tone, alpha.halo),
        }),
        new ScatterplotLayer<MapVehicle>({
            id: "vehicle",
            data: vehicles,
            getPosition: (item) => item.position,
            getRadius: MAP_MARKS.vehicle,
            radiusUnits: "pixels",
            stroked: true,
            getFillColor: tint(palette.hot, OPAQUE),
            getLineColor: tint(tone, OPAQUE),
            getLineWidth: MAP_MARKS.ring,
            lineWidthUnits: "pixels",
        }),
    ];
}
