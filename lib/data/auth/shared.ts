import type { AuthLink, LaneTag } from "@/lib/types";
import { HELP_ROUTE, HOME_ROUTE, LOGIN_ROUTE, PASSWORD_MIN_LENGTH, SUPPORT_ROUTE } from "@/lib/constants";
import { HERO_LANE, HUBS } from "@/lib/data/home/hubs";

const cityOf = (code: string) => HUBS.find((hub) => hub.code === code)?.name.split(",")[0] ?? code;

const help = { id: "help", label: "Get help", href: HELP_ROUTE } satisfies AuthLink;

export const AUTH_COPY = {
    note: "Design study",
    reveal: "Show password",
    capsLock: "Caps Lock is on",
    password: { rule: `At least ${PASSWORD_MIN_LENGTH} characters`, short: `Use at least ${PASSWORD_MIN_LENGTH} characters.` },
    enter: "Enter",
    link: { expired: ["Link", "expired."], dead: "Link no longer works" },
    recovery: {
        label: "Other options",
        links: [{ id: "sign-in", label: "Back to sign in", href: LOGIN_ROUTE }, help] satisfies AuthLink[],
    },
    links: {
        home: { id: "home", label: "Back to home", href: HOME_ROUTE } satisfies AuthLink,
        help,
        support: { id: "support", label: "Contact support", href: SUPPORT_ROUTE } satisfies AuthLink,
    },
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
