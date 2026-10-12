import { MAP_ORIGINS } from "@/lib/security/headers";
import type { LonLat } from "@/lib/types";

export const MAP_KEY = process.env.NEXT_PUBLIC_PROTOMAPS_KEY ?? "";

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

export const MAP_MARKS = {
    trackGlow: 10,
    track: 2.5,
    stop: 6,
    ring: 2,
    vehicle: 6,
    halo: 18,
    cityRadiusM: 22_000,
    alpha: { glow: 70, halo: 70, area: 26, areaLine: 110 },
} as const;
