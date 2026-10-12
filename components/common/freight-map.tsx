"use client";
import "maplibre-gl/dist/maplibre-gl.css";
import clsx from "clsx";
import { useEffect, useRef } from "react";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { LngLatBounds, Map as MapLibreMap, NavigationControl, setWorkerUrl } from "maplibre-gl";
import { paletteOf } from "@/lib/home/palette";
import { useReduced } from "@/lib/hooks/use-reduced";
import { basemapStyle } from "@/lib/maps/basemap";
import { MAP_CENTER, MAP_VIEW } from "@/lib/maps/constants";
import { freightLayers } from "@/lib/maps/layers";
import type { LonLat, MapPrecision, MapStop, MapVehicle } from "@/lib/types";

interface Props {
    label: string;
    precision: MapPrecision;
    stops?: readonly MapStop[];
    track?: readonly LonLat[];
    vehicle?: MapVehicle | null;
    className?: string;
}

setWorkerUrl(new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).href);

const NO_STOPS: readonly MapStop[] = [];
const CONTROLS = [
    "font-body!",
    "[&_.maplibregl-ctrl-group]:border [&_.maplibregl-ctrl-group]:border-border-dark [&_.maplibregl-ctrl-group]:bg-background/90! [&_.maplibregl-ctrl-group]:rounded-none! [&_.maplibregl-ctrl-group]:shadow-none!",
    "[&_.maplibregl-ctrl-group_button+button]:border-border-dark! [&_.maplibregl-ctrl-icon]:invert [&_.maplibregl-ctrl-attrib-button]:invert",
    "[&_.maplibregl-ctrl-attrib]:bg-background/80! [&_.maplibregl-ctrl-attrib]:text-text-muted! [&_.maplibregl-ctrl-attrib]:rounded-none! [&_.maplibregl-ctrl-attrib_a]:text-text-muted!",
];

export default function FreightMap({ label, precision, stops = NO_STOPS, track, vehicle = null, className }: Props) {
    const host = useRef<HTMLDivElement>(null);
    const map = useRef<MapLibreMap | null>(null);
    const overlay = useRef<MapboxOverlay | null>(null);
    const reduced = useReduced();

    useEffect(() => {
        const element = host.current;
        if (!element) return;
        const instance = new MapLibreMap({
            container: element,
            style: basemapStyle(element),
            center: MAP_CENTER,
            zoom: MAP_VIEW.zoom,
            attributionControl: { compact: true },
            cooperativeGestures: true,
            dragRotate: false,
            pitchWithRotate: false,
        });
        const deck = new MapboxOverlay({ interleaved: false, layers: [] });
        instance.addControl(new NavigationControl({ showCompass: false }), "top-right");
        instance.addControl(deck);
        map.current = instance;
        overlay.current = deck;
        return () => {
            instance.remove();
            map.current = null;
            overlay.current = null;
        };
    }, []);

    useEffect(() => {
        const instance = map.current;
        const element = host.current;
        if (!instance || !overlay.current || !element) return;
        overlay.current.setProps({ layers: freightLayers({ stops, track, vehicle, precision, palette: paletteOf(element) }) });
        const points: LonLat[] = [...stops.map((stop) => stop.position), ...(track ?? []), ...(vehicle ? [vehicle.position] : [])];
        if (points.length === 0) return;
        const bounds = points.reduce((box, point) => box.extend(point), new LngLatBounds(points[0], points[0]));
        instance.fitBounds(bounds, { padding: MAP_VIEW.padding, maxZoom: MAP_VIEW.maxZoom[precision], duration: reduced ? 0 : MAP_VIEW.ease });
    }, [stops, track, vehicle, precision, reduced]);

    return <div ref={host} role="group" aria-label={label} className={clsx("relative size-full overflow-hidden", CONTROLS, className)} />;
}
