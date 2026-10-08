export const LANE_GEOMETRY = {
    width: 480,
    pad: 36,
    margin: { lon: 2.4, lat: 1.6 },
    field: { lon: 20, lat: 10 },
    reach: 0.35,
    step: 3,
    traffic: 9,
    speed: 26,
    trail: 46,
    stagger: 0.618,
} as const;

export const LANE_STOPS: readonly string[] = ["CHI", "MEM", "DAL"];

export const TRUCK_RUN = {
    delay: 2.4,
    trail: 0.18,
    core: 0.045,
    seconds: 4,
    creep: 0.88,
    creepSeconds: 7,
} as const;

export const STEP_SLIDE = { distance: 20, seconds: 0.35 } as const;

export const METER_AT = { origin: 0, midway: 0.5, held: 0.5, pending: 0.9, arrived: 1 } as const;

export const AUTH_COLUMNS = "lg:grid-cols-[minmax(0,1fr)_minmax(0,var(--haulr-auth-form))] lg:gap-16 xl:gap-24";

export const QUIET_LINK =
    "text-text-muted hover:text-text focus-visible:outline-text text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-4";
