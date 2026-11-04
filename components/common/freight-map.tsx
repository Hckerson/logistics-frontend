"use client";
import "maplibre-gl/dist/maplibre-gl.css";
import clsx from "clsx";
import { useCallback, useEffect, useRef } from "react";
import { CenterToFit } from "@carbon/icons-react";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { LngLatBounds, Map as MapLibreMap, NavigationControl, setWorkerUrl } from "maplibre-gl";
import IconButton from "@/components/ui/icon-button";
import { glowsOf } from "@/lib/home/glow";
import { paletteOf } from "@/lib/home/palette";
import { useMapMotion } from "@/lib/hooks/use-map-motion";
import { useReduced } from "@/lib/hooks/use-reduced";
import { basemapStyle } from "@/lib/maps/basemap";
import { MAP_CENTER, MAP_VIEW, ROUTE_MOTION } from "@/lib/maps/constants";
import { freightLayers } from "@/lib/maps/layers";
import type { Glows, LonLat, MapMotion, MapPalette, MapPrecision, MapRoute, MapStop, MapVehicle } from "@/lib/types";

interface Props {
    label: string;
    recentreLabel: string;
    precision: MapPrecision;
    stops?: readonly MapStop[];
    route?: MapRoute | null;
    track?: readonly LonLat[];
    vehicle?: MapVehicle | null;
    className?: string;
}

setWorkerUrl(new URL("maplibre-gl/dist/maplibre-gl-worker.mjs", import.meta.url).href);

const NO_STOPS: readonly MapStop[] = [];
const CONTROLS = [
    "font-body! [&_.maplibregl-cooperative-gesture-screen]:hidden!",
    "[&_.maplibregl-ctrl-group]:border [&_.maplibregl-ctrl-group]:border-border-dark [&_.maplibregl-ctrl-group]:bg-background/90! [&_.maplibregl-ctrl-group]:rounded-none! [&_.maplibregl-ctrl-group]:shadow-none!",
    "[&_.maplibregl-ctrl-group_button+button]:border-border-dark! [&_.maplibregl-ctrl-icon]:invert [&_.maplibregl-ctrl-attrib-button]:invert",
    "[&_.maplibregl-ctrl-attrib]:bg-background/80! [&_.maplibregl-ctrl-attrib]:text-text-muted! [&_.maplibregl-ctrl-attrib]:rounded-none! [&_.maplibregl-ctrl-attrib_a]:text-text-muted!",
];

export default function FreightMap(props: Props) {
    const { label, recentreLabel, precision, stops = NO_STOPS, route = null, track, vehicle = null, className } = props;
    const host = useRef<HTMLDivElement>(null);
    const map = useRef<MapLibreMap | null>(null);
    const overlay = useRef<MapboxOverlay | null>(null);
    const look = useRef<{ palette: MapPalette; glows: Glows } | null>(null);
    const motion = useRef<MapMotion>(ROUTE_MOTION.still);
    const framed = useRef<string | null>(null);
    const reduced = useReduced();
    const place = [...stops.map((stop) => stop.position.join(",")), route?.path.length ?? 0].join(";");

    useEffect(() => {
        const element = host.current;
        if (!element) return;
        const palette = paletteOf(element);
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
        look.current = { palette, glows: glowsOf(palette) };
        return () => {
            instance.remove();
            map.current = null;
            overlay.current = null;
            framed.current = null;
        };
    }, []);

    const paint = useCallback(
        (next: MapMotion) => {
            motion.current = next;
            if (!overlay.current || !look.current) return;
            overlay.current.setProps({ layers: freightLayers({ stops, route, track, vehicle, precision, motion: next, ...look.current }) });
        },
        [stops, route, track, vehicle, precision],
    );

    const frame = useCallback(() => {
        const instance = map.current;
        const points: LonLat[] = [...stops.map((stop) => stop.position), ...(route?.path ?? []), ...(track ?? []), ...(vehicle ? [vehicle.position] : [])];
        if (!instance || points.length === 0) return;
        const bounds = points.reduce((box, point) => box.extend(point), new LngLatBounds(points[0], points[0]));
        instance.fitBounds(bounds, { padding: MAP_VIEW.padding, maxZoom: MAP_VIEW.maxZoom[precision], duration: reduced ? 0 : MAP_VIEW.ease });
    }, [stops, route, track, vehicle, precision, reduced]);

    useEffect(() => {
        paint(motion.current);
        if (framed.current === place) return;
        framed.current = place;
        frame();
    }, [paint, frame, place]);

    useMapMotion(paint, { animate: !reduced && route !== null, loop: Boolean(route?.live), restart: place });

    return (
        <div className={clsx("relative size-full", className)}>
            <div ref={host} role="group" aria-label={label} className={clsx("size-full overflow-hidden", CONTROLS)} />
            <div className="absolute top-2.5 left-2.5">
                <IconButton label={recentreLabel} icon={CenterToFit} tone="quiet" size="sm" onPress={frame} className="border-border-dark border" />
            </div>
        </div>
    );
}
