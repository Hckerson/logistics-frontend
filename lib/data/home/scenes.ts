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
    miles: { from: 955, to: 0 },
} as const;

export const ETA_SCENE = {
    label: "Arrive",
    title: "Every mile tightens the window.",
    body: "The arrival estimate starts wide and narrows as the truck closes in, so the receiving dock knows when to be ready.",
} as const;

export const DELIVER_SCENE = {
    label: "Delivered",
    title: "Delivered. Paid in three days.",
    steps: [
        { id: "delivered", label: "Delivered at the dock", value: "Thu 14:08" },
        { id: "verified", label: "Proof of delivery verified", value: "Thu 14:31" },
        { id: "invoiced", label: "Invoice sent with the documents attached", value: "Thu 14:32" },
        { id: "paid", label: "Carrier paid $2,060", value: "Mon 09:00" },
    ] satisfies SceneReadout[],
    document: {
        label: "Proof of delivery",
        load: "HL-48213",
        summary: "Sample proof of delivery for load HL-48213, signed at the Dallas dock on Thursday at 14:08.",
        rows: [
            { id: "place", label: "Delivered to", value: "Dallas distribution center" },
            { id: "freight", label: "Received", value: "22 pallets, no exceptions" },
            { id: "signer", label: "Signed by", value: "R. Alvarez, receiving" },
        ] satisfies SceneReadout[],
        photos: ["Dock photo", "Seal photo"],
        signature: "Signature",
        stamp: ["Delivered", "Thu 14:08"],
        note: "Sample load",
    },
} as const;
