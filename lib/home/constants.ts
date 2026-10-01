export const HAULR_THEME_CLASS = "theme-haulr";

export const HAULR_THEME_COLOR = "#f3f2ee";

export const SCENES = {
    hero: [0, 0.07],
    quote: [0.05, 0.2],
    book: [0.19, 0.36],
    track: [0.36, 0.72],
    cut: 0.74,
} as const;

export const SCENE_FADE = 0.03;

export const PEAK_PROGRESS = 0.56;

export const INTRO = { seconds: 2.6, laneStart: 0.55 } as const;

export const REVEAL_EASE = [0.16, 1, 0.3, 1] as const;

export const SCROLL_SPRING = { stiffness: 70, damping: 24, restDelta: 0.0005 } as const;

export const POINTER_SPRING = { stiffness: 60, damping: 20, mass: 0.8 } as const;

export const DPR_MAX = 1.5;

export const MOBILE_WIDTH = 768;

export const PROJECTION_LAT = 39;

export const NETWORK = {
    neighbours: 3,
    bend: 0.06,
    heroBend: 0.14,
    samples: 18,
    pointerRadius: 0.1,
} as const;

export const CARRIERS = { count: 14, spread: 0.11, chosen: 5 } as const;

export const BAND = { width: 0.06, narrowing: 0.85 } as const;

export const FRAMES = {
    desktop: { hero: 0.73, quote: 0.33, book: 0.64, track: 0.66, width: 0.52, top: 0.14, bottom: 0.9 },
    mobile: { x: 0.5, width: 1.3, top: 0.5, bottom: 0.96, bias: 0.75 },
} as const;

export const ZOOM = { hero: 1, lane: 1.55, track: 1.85 } as const;

export const HEADLINE_STAGGER = 0.09;

export const LANE_DRAW_SECONDS = 1.6;

export const PAN_SPRING = { stiffness: 80, damping: 26, restDelta: 0.001 } as const;

export const DEFAULT_SIDE = "ship";

export const SIDE_PARAM = { ship: "shipper", haul: "carrier" } as const;

export const SIDE_CHANGE_EVENT = "haulr:side";

export const LANE_RULE = { load: 38, spread: 16 } as const;

export const VEIL = { solid: 0.3, fade: 0.18, mobile: 0.1, flip: [0.46, 0.56] } as const;

export const FORK_LANE = {
    width: 1200,
    height: 112,
    stem: 28,
    dot: 5,
    targets: { ship: [7 / 24, 19 / 24], haul: [5 / 24, 17 / 24] },
} as const;

export const PRICE_SECTION_ID = "price";

export const PRICE_ANCHOR = `/#${PRICE_SECTION_ID}`;
