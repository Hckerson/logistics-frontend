import type { GlowName, GlowProfile } from "@/lib/types";

export const DPR_MAX = 1.5;

export const MOBILE_WIDTH = 768;

export const CONTIGUOUS_STATE_MAX = 56;

export const EXCLUDED_STATES = ["02", "15"];

export const LANE = { draw: 0.08 } as const;

export const TRIPS = {
    count: 2600,
    loop: 1200,
    duration: [220, 420],
    trail: 100,
    speed: 0.02,
    rate: 42,
    stride: 3,
    minPoints: 5,
    accentShare: 0.14,
    seed: 20261001,
} as const;

export const ARCS = { count: 22, height: 0.18, seed: 7 } as const;

export const CARRIERS = { count: 14, spread: 1.6, chosen: 5 } as const;

export const BEAM = { metres: 120000, narrowing: 0.85, samples: 24, alpha: 120 } as const;

export const FLIGHT = {
    desktop: [
        { at: 0, longitude: -104, latitude: 37, zoom: 3.6, pitch: 42, bearing: -6 },
        { at: 0.14, longitude: -92, latitude: 37.2, zoom: 5, pitch: 50, bearing: 12 },
        { at: 0.28, longitude: -89.2, latitude: 40.9, zoom: 6, pitch: 54, bearing: 16 },
        { at: 0.42, longitude: -88.4, latitude: 40.2, zoom: 6.4, pitch: 60, bearing: 100 },
        { at: 0.72, longitude: -96, latitude: 33, zoom: 6.8, pitch: 62, bearing: 245 },
        { at: 0.86, longitude: -96.4, latitude: 32.9, zoom: 7, pitch: 52, bearing: 250 },
    ],
    mobile: [
        { at: 0, longitude: -97, latitude: 38, zoom: 2.35, pitch: 30, bearing: 0 },
        { at: 0.14, longitude: -92, latitude: 37.2, zoom: 3.9, pitch: 42, bearing: 10 },
        { at: 0.28, longitude: -88.6, latitude: 40.2, zoom: 4.6, pitch: 46, bearing: 16 },
        { at: 0.42, longitude: -88.4, latitude: 40.2, zoom: 5.4, pitch: 54, bearing: 100 },
        { at: 0.72, longitude: -96, latitude: 33, zoom: 5.8, pitch: 56, bearing: 245 },
        { at: 0.86, longitude: -97.5, latitude: 32.55, zoom: 6.2, pitch: 46, bearing: 250 },
    ],
    follow: 0.75,
    release: [0.72, 0.84],
    followWindow: [0.4, 0.46],
    chase: { window: [0.38, 0.47], lookAhead: 0.05, smoothing: 0.1 },
} as const;

export const MAP_WIDTH = { road: 1, border: 1, trip: 7, lane: 18, travelled: 9, arc: 4 } as const;

export const MAP_DOT = { terminal: 16, truck: 30, carrier: 13, chosen: 18, hub: 8 } as const;

export const MAP_ALPHA = { road: 150, arc: 70, hub: 150 } as const;

export const MAP_DEVICE = { webgl: { antialias: false } } as const;

export const ADDITIVE_BLEND = {
    blendColorSrcFactor: "src-alpha",
    blendColorDstFactor: "one",
    blendAlphaSrcFactor: "one",
    blendAlphaDstFactor: "one",
} as const;

export const GLOW = {
    line: { shape: "line", core: 1, halo: 0, spread: 1, heat: 0 },
    trail: { shape: "line", core: 0.3, halo: 0.42, spread: 3.2, heat: 0.8, tip: 0.05 },
    lane: { shape: "line", core: 0.2, halo: 0.5, spread: 3, heat: 0.5, tip: 0.04 },
    arc: { shape: "line", core: 0.2, halo: 0.5, spread: 3, heat: 0.5 },
    travelled: { shape: "line", core: 0.36, halo: 0.2, spread: 4, heat: 0.5, tip: 0.02 },
    dot: { shape: "dot", core: 0.3, halo: 0.55, spread: 3.2, heat: 0.75 },
    hub: { shape: "dot", core: 0.28, halo: 0.3, spread: 4.5, heat: 0.35 },
    beam: { shape: "line", core: 0.02, halo: 1, spread: 2.6, heat: 0, taper: 0.8 },
} as const satisfies Record<GlowName, GlowProfile>;

export const ARC_PATH = { samples: 48, metresPerDegree: 111320 } as const;
