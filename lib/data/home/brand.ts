import type { Side } from "@/lib/types";
import { HOME_ROUTE, LOGIN_ROUTE } from "@/lib/constants";
import { PRICE_ANCHOR } from "@/lib/home/constants";

export const HAULR_BRAND = {
    name: "Haulr",
    home: HOME_ROUTE,
    navLabel: "Account",
    tag: "Design study · placeholder freight marketplace",
    signIn: { label: "Sign in", href: LOGIN_ROUTE },
    price: { label: "Get a price", href: PRICE_ANCHOR },
    metaTitle: "Haulr · Placeholder freight marketplace",
    metaDescription:
        "A design study: road freight priced, booked, tracked and paid on one shared record.",
} as const;

export const SIDE_SWITCH = {
    label: "I am here to",
    options: [
        { side: "ship", label: "Ship" },
        { side: "haul", label: "Haul" },
    ] satisfies { side: Side; label: string }[],
} as const;

export const SIDE_QUERY = "side";
