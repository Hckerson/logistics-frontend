export const HAULR_THEME_CLASS = "theme-haulr";

export const HAULR_THEME_COLOR = "#0a0b0d";

export const SCENES = {
    hero: [0, 0.07],
    quote: [0.05, 0.2],
    book: [0.19, 0.36],
    track: [0.36, 0.72],
    deliver: [0.72, 1],
} as const;

export const DELIVERY = { steps: [0.76, 0.94], signature: [0.78, 0.88], stamp: [0.88, 0.92] } as const;

export const SCENE_FADE = 0.03;

export const PEAK_PROGRESS = 0.56;

export const INTRO = { seconds: 2.8, laneStart: 0.45 } as const;

export const REVEAL_EASE = [0.16, 1, 0.3, 1] as const;

export const SCROLL_SPRING = { stiffness: 70, damping: 24, restDelta: 0.0005 } as const;

export const POINTER_SPRING = { stiffness: 60, damping: 20, mass: 0.8 } as const;

export const DPR_MAX = 1.5;

export const MOBILE_WIDTH = 768;

export const CONTIGUOUS_STATE_MAX = 56;

export const EXCLUDED_STATES = ["02", "15"];

export const LANE = { bend: 0.1, samples: 64 } as const;

export const TRIPS = {
    count: 2600,
    loop: 1800,
    duration: [320, 620],
    trail: 70,
    speed: 0.02,
    rate: 42,
    minPoints: 12,
    accentShare: 0.14,
    seed: 20261001,
} as const;

export const ARCS = { count: 22, height: 0.35, seed: 7 } as const;

export const CARRIERS = { count: 14, spread: 1.6, chosen: 5 } as const;

export const BEAM = { degrees: 0.9, narrowing: 0.85, samples: 24, power: 0.8 } as const;

export const FLIGHT = {
    desktop: [
        { at: 0, longitude: -104, latitude: 37, zoom: 3.6, pitch: 42, bearing: -6 },
        { at: 0.14, longitude: -92.2, latitude: 37.3, zoom: 5, pitch: 50, bearing: 14 },
        { at: 0.28, longitude: -86.2, latitude: 41.2, zoom: 6, pitch: 54, bearing: -12 },
        { at: 0.42, longitude: -89, latitude: 40.6, zoom: 6.2, pitch: 58, bearing: 24 },
        { at: 0.72, longitude: -96.4, latitude: 33.2, zoom: 6.6, pitch: 58, bearing: 8 },
        { at: 0.86, longitude: -97.3, latitude: 33.1, zoom: 6.9, pitch: 50, bearing: -8 },
    ],
    mobile: [
        { at: 0, longitude: -97, latitude: 38, zoom: 2.35, pitch: 30, bearing: 0 },
        { at: 0.14, longitude: -92.2, latitude: 37.3, zoom: 3.9, pitch: 42, bearing: 10 },
        { at: 0.28, longitude: -91.4, latitude: 38.6, zoom: 4.3, pitch: 46, bearing: -10 },
        { at: 0.42, longitude: -89, latitude: 40.6, zoom: 5, pitch: 50, bearing: 18 },
        { at: 0.72, longitude: -96.4, latitude: 33.2, zoom: 5.4, pitch: 50, bearing: 6 },
        { at: 0.86, longitude: -96.8, latitude: 32.8, zoom: 6.2, pitch: 44, bearing: -6 },
    ],
    follow: 0.75,
    release: [0.72, 0.84],
    followWindow: [0.4, 0.46],
} as const;

export const MAP_WIDTH = { road: 1, trip: 2.2, lane: 3.2, laneGlow: 14, travelled: 5 } as const;

export const MAP_DOT = { terminal: 6, truck: 8, halo: 22, carrier: 5, chosen: 7, hub: 2.5 } as const;

export const MAP_ALPHA = { road: 150, laneGlow: 55, beam: 46, halo: 60, arc: 70, label: 200 } as const;

export const MAP_LABEL_SIZE = 11;

export const HEADLINE_STAGGER = 0.09;

export const LANE_DRAW_SECONDS = 1.6;

export const PAN_SPRING = { stiffness: 80, damping: 26, restDelta: 0.001 } as const;

export const DEFAULT_SIDE = "ship";

export const SIDE_PARAM = { ship: "shipper", haul: "carrier" } as const;

export const SIDE_CHANGE_EVENT = "haulr:side";

export const LANE_RULE = { load: 38, spread: 16 } as const;

export const FORK_LANE = {
    width: 1200,
    height: 112,
    stem: 28,
    dot: 5,
    targets: { ship: [7 / 24, 19 / 24], haul: [5 / 24, 17 / 24] },
} as const;

export const PRICE_SECTION_ID = "price";

export const PRICE_ANCHOR = `/#${PRICE_SECTION_ID}`;

export const COUNT_SECONDS = 1.8;

export const WORDMARK = { width: 1000, height: 200, baseline: 196, size: 262 } as const;

export const QUOTE_MAP = {
    home: { longitude: -96.5, latitude: 38.2, span: 62, pitch: 32, bearing: 0 },
    lane: { margin: 9, latitudeWeight: 1.7, pitch: 48, bearing: 12 },
    trips: 900,
    ease: 0.06,
    drawEase: 0.045,
    arcHeight: 0.16,
    samples: 48,
    tile: 512,
    metresPerDegree: 111320,
} as const;

export const SIGNATURE_PATH =
    "M6 34 C 14 6, 24 6, 26 24 S 36 46, 42 22 S 54 4, 60 26 S 72 42, 82 18 S 98 10, 106 28 C 112 38, 124 30, 154 24";
