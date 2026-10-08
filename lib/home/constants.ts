export const HAULR_THEME_CLASS = "theme-haulr";

export const HAULR_THEME_COLOR = "#0a0b0d";

export const SCENES = {
    hero: [0, 0.07],
    quote: [0.05, 0.2],
    book: [0.19, 0.36],
    track: [0.36, 0.55],
    eta: [0.54, 0.72],
    deliver: [0.72, 1],
} as const;

export const RIDE = [SCENES.track[0], SCENES.eta[1]] as const;

export const DELIVERY = { steps: [0.76, 0.94], signature: [0.78, 0.88], stamp: [0.88, 0.92] } as const;

export const SCENE_FADE = 0.03;

export const SCRIM_LIFT = 0.35;

export const PEAK_PROGRESS = 0.56;

export const INTRO = { seconds: 2.8, laneStart: 0.45 } as const;

export const REVEAL_EASE = [0.16, 1, 0.3, 1] as const;

export const SCROLL_SPRING = { stiffness: 70, damping: 24, restDelta: 0.0005 } as const;

export const POINTER_SPRING = { stiffness: 60, damping: 20, mass: 0.8 } as const;

export const HEADLINE_STAGGER = 0.09;

export const LANE_DRAW_SECONDS = 1.6;

export const PAN_SPRING = { stiffness: 80, damping: 26, restDelta: 0.001 } as const;

export const DEFAULT_SIDE = "ship";

export const SIDE_PARAM = { ship: "shipper", haul: "carrier" } as const;

export const SIDE_CHANGE_EVENT = "haulr:side";

export const LANE_RULE = { load: 38, spread: 16 } as const;

export const FOOTER_ROUTE = { from: -130, to: 430, streak: 0.25 } as const;

export const TRAIL_RULE = { offset: ["start end", "start start"], travel: ["-100%", "200%"] } as const;

export const FORK_LANE = {
    rail: 8,
    drop: 52,
    dot: 5,
    exits: { ship: [0.004, 0.594], haul: [0.004, 0.424] },
} as const;

export const PRICE_SECTION_ID = "price";

export const PRICE_ANCHOR = `/#${PRICE_SECTION_ID}`;

export const COUNT_SECONDS = 1.8;

export const REVEAL_VIEWPORT = { once: true, margin: "-10% 0px" } as const;

export const ARRIVE = {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: REVEAL_EASE },
} as const;

export const WORDMARK = { width: 1000, height: 200, baseline: 196, size: 262 } as const;

export const SIGNATURE_PATH =
    "M6 34 C 14 6, 24 6, 26 24 S 36 46, 42 22 S 54 4, 60 26 S 72 42, 82 18 S 98 10, 106 28 C 112 38, 124 30, 154 24";
