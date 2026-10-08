import type { ConsoleLoad, DriverStep, RecordBeat } from "@/lib/types";

export const PRODUCTS_COPY = {
    label: "Two screens, one load",
    title: "The shipper's desk and the driver's cab read the same record.",
    lead: "No status calls, no retyped numbers. A change on one screen is the truth on the other.",
    console: { label: "Shipper console", summary: "Sample shipper console listing four loads with status, lane, arrival and rate." },
    phone: { label: "Driver view", summary: "Sample driver view for the current stop with arrival, loading and proof of delivery steps." },
    note: "Sample data",
} as const;

export const RECORD_BEATS: readonly RecordBeat[] = [
    {
        id: "transit",
        status: "In transit",
        tone: "live",
        eta: "Thu 14:20 ± 12 min",
        done: 0,
        action: "I've arrived",
        pod: "Take photo",
        document: null,
        caption: "In transit. The desk and the cab read the same location, from the truck's logging device.",
    },
    {
        id: "arrived",
        status: "At the dock",
        tone: "live",
        eta: "Arrived Thu 14:08",
        done: 2,
        action: "Send proof of delivery",
        pod: "Take photo",
        document: null,
        caption: "The driver taps I've arrived. The shipper sees it the same second, with nobody on the phone.",
    },
    {
        id: "delivered",
        status: "Delivered",
        tone: "done",
        eta: "Delivered Thu 14:31",
        done: 3,
        action: "Delivered",
        pod: "Photo attached",
        document: "Proof of delivery",
        caption: "Proof of delivery leaves the cab and lands on the desk, attached to the invoice.",
    },
];

export const CONSOLE_COLUMNS = { load: "Load", lane: "Lane", status: "Status", eta: "Arrival", rate: "Rate" } as const;

export const CONSOLE_LOADS: readonly ConsoleLoad[] = [
    { id: "HL-48213", lane: "CHI → DAL", status: RECORD_BEATS[0].status, tone: RECORD_BEATS[0].tone, eta: RECORD_BEATS[0].eta, rate: "$2,340", progress: 62 },
    { id: "HL-48207", lane: "ATL → CLT", status: "Delivered", tone: "done", eta: "Wed 09:12", rate: "$690", progress: 100 },
    { id: "HL-48219", lane: "LAX → PHX", status: "Booked", tone: "idle", eta: "Pickup Fri 08:00", rate: "$1,180", progress: 0 },
    { id: "HL-48224", lane: "SEA → SLC", status: "Posted", tone: "idle", eta: "38 carriers viewing", rate: "$2,760", progress: 0 },
];

export const CONSOLE_DETAIL = {
    title: "HL-48213 · Chicago to Dallas",
    carrier: "Northline Haulage · Truck 114",
    source: "ELD · updated 4 min ago",
    documents: ["Rate confirmation", "Bill of lading"],
} as const;

export const DRIVER_VIEW = {
    stop: "Stop 2 of 2 · Delivery",
    place: "Dallas, TX",
    window: "Appointment Thu 14:00 to 16:00",
    steps: [
        { id: "arrive", label: "Arrive at the dock" },
        { id: "unload", label: "Unloaded, 22 pallets" },
        { id: "pod", label: "Photograph the signed delivery receipt" },
    ] satisfies DriverStep[],
    pay: "Pay due Monday · $2,060",
} as const;
