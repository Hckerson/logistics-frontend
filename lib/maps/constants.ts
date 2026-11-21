import { MAP_ORIGINS } from "@/lib/security/headers";
import type { LonLat } from "@/lib/types";
import { publicEnv } from "@/lib/validations/env";

export const MAP_KEY = publicEnv.NEXT_PUBLIC_PROTOMAPS_KEY ?? "";

export const BASEMAP = {
    source: "protomaps",
    tiles: `${MAP_ORIGINS.tiles}/tiles/v4.json`,
    glyphs: `${MAP_ORIGINS.assets}/basemaps-assets/fonts/{fontstack}/{range}.pbf`,
    sprite: `${MAP_ORIGINS.assets}/basemaps-assets/sprites/v4/dark`,
    attribution: '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · <a href="https://protomaps.com">Protomaps</a>',
    lang: "en",
} as const;

export const MAP_CENTER: LonLat = [-96, 38.5];

export const MAP_VIEW = {
    zoom: 3.4,
    padding: 72,
    maxZoom: { city: 6.5, street: 13 },
    ease: 900,
} as const;

export const ROUTE_MARKS = {
    terminal: 13,
    upcoming: 9,
    truck: 26,
    core: 3,
    fleet: 18,
    alpha: { upcoming: 150, stale: 160 },
} as const;

export const ROUTE_LINES = {
    glow: { width: 14, blur: 10, alpha: 0.4 },
    lane: { width: 2.5, alpha: 0.85 },
    travelledGlow: { width: 10, blur: 7, alpha: 0.45 },
    travelled: { width: 3.5, alpha: 1 },
    pulse: { width: 5, blur: 2, alpha: 1 },
    trackGlow: { width: 10, blur: 6, alpha: 0.27 },
    track: { width: 2.5, alpha: 1 },
} as const;

export const ROUTE_MOTION = {
    drawMs: 1400,
    pulseMs: 3600,
    trail: 0.35,
    still: { drawn: 1, pulse: 0 },
} as const;

export const MAP_MARKS = {
    cityRadiusM: 22_000,
    alpha: { area: 26, areaLine: 110 },
} as const;
