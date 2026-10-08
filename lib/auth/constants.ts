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
    duration: 20,
    delay: 2.6,
    repeatDelay: 1.4,
    parked: 0.62,
    trail: 0.18,
    core: 0.045,
    fade: [0, 0.03, 0.94, 1],
} as const;

export const AUTH_COLUMNS = "lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16 xl:gap-24";
