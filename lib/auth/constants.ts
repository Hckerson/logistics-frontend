import type { Metadata } from "next";
import type { ManifestField } from "@/lib/types";

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

export const ENTRY = {
    delay: 0.1,
    sweep: 1.4,
    rise: 0.25,
    catch: 0.95,
    rewrite: 0.12,
    ignite: 1.2,
    draw: 2.6,
    settle: 2.4,
} as const;

export const SCRAMBLE = { glyphs: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", frames: 12, interval: 38 } as const;

export const ASSEMBLY = {
    unit: 0.06,
    trace: { top: 2, right: 4, bottom: 6, left: 8 },
    shutter: 5,
    header: 6,
    codes: 8,
    line: 9,
    perforation: 10,
    notch: 11,
    content: 11,
    footer: 15,
    note: 16,
} as const;

export const BOARD = { cells: 22, mask: "•", more: "…", readoutRem: 2.6 } as const;

export const TRUCK_RUN = {
    delay: ENTRY.ignite + ENTRY.draw * 0.45,
    trail: 0.18,
    core: 0.045,
    seconds: 4,
    creep: 0.88,
    creepSeconds: 7,
} as const;

export const STEP_SLIDE = { seconds: 0.18 } as const;

export const METER_AT = { origin: 0, midway: 0.5, held: 0.5, pending: 0.9, arrived: 1 } as const;

export const LEG = { meter: 0.3, truck: 0.55 } as const;

export const MANIFEST: readonly ManifestField[] = ["fullName", "email", "password"];

export const FIELD_FLIP = 0.04;

export const AUTH_COLUMNS = "lg:grid-cols-[minmax(0,1fr)_minmax(0,var(--haulr-auth-form))] lg:gap-16 xl:gap-24";

export const CONSOLE_ACTION =
    "group bg-text text-text-inverse hover:bg-text-secondary focus-visible:outline-text relative flex h-12 w-full cursor-pointer items-center justify-between overflow-hidden px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2";

export const QUIET_LINK =
    "text-text-muted hover:text-text focus-visible:outline-text text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-4";

export const LINK_PAGE_METADATA: Metadata = { referrer: "no-referrer" };
