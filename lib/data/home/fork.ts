import type { Door } from "@/lib/types";
import { registerRoute } from "@/lib/constants";

export const FORK_COPY = {
    label: "Two sides, one load",
    title: "Whichever end of the lane you're on.",
} as const;

export const DOORS: readonly Door[] = [
    {
        side: "ship",
        label: "For shippers",
        title: "Price it, book it, watch it land.",
        points: [
            "Instant quotes with a confidence range",
            "Your preferred carriers first, then the open market",
            "One invoice with the documents attached",
        ],
        cta: { label: "Start shipping", href: registerRoute("shipper") },
    },
    {
        side: "haul",
        label: "For carriers",
        title: "Book real loads. Get paid fast.",
        points: [
            "Every load priced and bookable, no phantom posts",
            "Take the posted rate or counter if you choose",
            "Paid three days after verified delivery",
        ],
        cta: { label: "Start hauling", href: registerRoute("carrier") },
    },
];
