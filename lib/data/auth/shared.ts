import type { LaneTag } from "@/lib/types";
import { HERO_LANE, HUBS } from "@/lib/data/home/hubs";

const cityOf = (code: string) => HUBS.find((hub) => hub.code === code)?.name.split(",")[0] ?? code;

export const AUTH_COPY = {
    note: "Design study",
    reveal: "Show password",
    capsLock: "Caps Lock is on",
    enter: "Enter",
    ticket: {
        from: { code: HERO_LANE.from, city: cityOf(HERO_LANE.from) },
        to: { code: HERO_LANE.to, city: cityOf(HERO_LANE.to) },
        load: HERO_LANE.load,
    },
    summary: { heading: "There's a problem", one: "1 problem", other: "{count} problems" },
    errors: {
        rateLimit: "Too many attempts. Try again in {minutes} min.",
        rateLimitUnknown: "Too many attempts. Wait a few minutes, then try again.",
        network: "We couldn't reach Haulr. Check your connection, then try again.",
    },
    tag: {
        title: HERO_LANE.load,
        route: `${HERO_LANE.from} → ${HERO_LANE.to}`,
        status: {
            origin: "Waiting at Chicago",
            midway: "Checked in at Memphis",
            pending: "Running to Dallas",
            arrived: "Delivered to Dallas",
            held: "Held at Memphis",
        },
        rolling: "Rolling toward Dallas",
    } satisfies LaneTag,
} as const;
