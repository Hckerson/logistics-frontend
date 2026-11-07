import type { LayersList } from "@deck.gl/core";
import { ScatterplotLayer } from "@deck.gl/layers";
import { OPAQUE, tint } from "@/lib/home/palette";
import { MAP_MARKS, ROUTE_MARKS } from "@/lib/maps/constants";
import type { CollectionVehicle, Glows, MapPalette, MapPrecision, MapStop, MapVehicle } from "@/lib/types";

interface Scene {
    stops: readonly MapStop[];
    vehicle: MapVehicle | null;
    vehicles: readonly CollectionVehicle[];
    precision: MapPrecision;
    palette: MapPalette;
    glows: Glows;
    drawn: number;
    onSelect?: (id: string) => void;
}

const { alpha } = MAP_MARKS;

const fleetTone = (palette: MapPalette, item: CollectionVehicle) =>
    item.stale ? tint(palette.muted, ROUTE_MARKS.alpha.stale) : tint(item.late ? palette.warning : palette.accent, OPAQUE);

export function freightLayers({ stops, vehicle, vehicles, precision, palette, glows, drawn, onSelect }: Scene): LayersList {
    const tone = vehicle?.stale ? palette.muted : palette.accent;
    const single = vehicle ? [vehicle] : [];

    return [
        new ScatterplotLayer<MapStop>({
            id: "stops",
            data: [...stops],
            getPosition: (stop) => stop.position,
            getRadius: (stop) => (stop.done ? ROUTE_MARKS.terminal : ROUTE_MARKS.upcoming),
            getFillColor: (stop) => tint(palette.accent, stop.done ? OPAQUE : ROUTE_MARKS.alpha.upcoming),
            radiusUnits: "pixels",
            billboard: true,
            opacity: drawn,
            extensions: [glows.dot],
        }),
        new ScatterplotLayer<MapVehicle>({
            id: "vehicle-area",
            data: precision === "city" ? single : [],
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
            data: single,
            getPosition: (item) => item.position,
            getRadius: ROUTE_MARKS.truck,
            getFillColor: tint(tone, vehicle?.stale ? ROUTE_MARKS.alpha.stale : OPAQUE),
            radiusUnits: "pixels",
            billboard: true,
            extensions: [glows.dot],
        }),
        new ScatterplotLayer<CollectionVehicle>({
            id: "fleet-glow",
            data: [...vehicles],
            getPosition: (item) => item.position,
            getRadius: ROUTE_MARKS.fleet,
            getFillColor: (item) => fleetTone(palette, item),
            radiusUnits: "pixels",
            billboard: true,
            pickable: Boolean(onSelect),
            onClick: ({ object }) => {
                if (object) onSelect?.(object.id);
            },
            extensions: [glows.dot],
        }),
        new ScatterplotLayer<MapVehicle | CollectionVehicle>({
            id: "vehicle",
            data: [...single, ...vehicles],
            getPosition: (item) => item.position,
            getRadius: ROUTE_MARKS.core,
            getFillColor: tint(palette.hot, OPAQUE),
            radiusUnits: "pixels",
            billboard: true,
        }),
    ];
}
