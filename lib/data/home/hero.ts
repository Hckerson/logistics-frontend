import type { Side, SideCopy } from "@/lib/types";
import { HELP_ROUTE, registerRoute } from "@/lib/constants";
import { PRICE_ANCHOR } from "@/lib/home/constants";

export const HERO_COPY: Record<Side, SideCopy> = {
    ship: {
        headline: ["Freight you", "can see move."],
        lead: "Price a lane in seconds, book a vetted carrier in minutes, and watch the same load everyone else on it is watching.",
        primary: { label: "Get a price", href: PRICE_ANCHOR },
        secondary: { label: "Ship with Haulr", href: registerRoute("shipper") },
    },
    haul: {
        headline: ["Real loads,", "real rates."],
        lead: "Every load on Haulr is priced and bookable. Take it at the posted rate, run it, and get paid three days after delivery.",
        primary: { label: "Find loads", href: registerRoute("carrier") },
        secondary: { label: "How pay works", href: HELP_ROUTE },
    },
};

export const HERO_LANE_LABEL = "Chicago to Dallas, one lane";
