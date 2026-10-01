import type { SceneReadout } from "@/lib/types";

export const QUOTE_SCENE = {
    label: "Price",
    title: "A price before the phone rings.",
    body: "Enter a lane and get an instant rate with an honest confidence range, not a callback.",
    tag: { lane: "CHI → DAL · Dry van", rate: "$2,340", range: "±4%" },
} as const;

export const BOOK_SCENE = {
    label: "Book",
    title: "Booked at the posted rate.",
    body: "Carriers with active authority and insurance see the load and take it outright. Bidding is there if they want it.",
    steps: [
        { id: "posted", label: "Posted", value: "09:02" },
        { id: "seen", label: "Seen by vetted carriers", value: "38" },
        { id: "booked", label: "Booked", value: "09:08" },
    ] satisfies SceneReadout[],
    note: "Sample timeline",
} as const;

export const TRACK_SCENE = {
    label: "Track",
    title: "Everyone sees the same truck.",
    body: "Location comes from the truck's logging device, the driver's phone or a check call, and always says which one and how old it is.",
    readouts: {
        source: { label: "Source", value: "ELD · updated 4 min ago" },
        eta: { label: "ETA Thu 14:20", prefix: "± ", unit: "min" },
        remaining: { label: "Remaining", unit: "mi" },
    },
    confidence: { from: 38, to: 6 },
    miles: { from: 925, to: 0 },
} as const;

export const DELIVER_SCENE = {
    label: "Delivered",
    title: "Delivered. Paid in three days.",
    receipt: [
        { id: "pod", label: "Proof of delivery", value: "Captured at the dock, Thu 14:08" },
        { id: "invoice", label: "Invoice", value: "Sent with the documents attached" },
        { id: "pay", label: "Carrier pay", value: "Monday, three days after POD" },
    ] satisfies SceneReadout[],
    note: "Sample load",
} as const;
