import type { ConsoleLoad, DriverStep } from "@/lib/types";

export const PRODUCTS_COPY = {
    label: "Two screens, one load",
    title: "The shipper's desk and the driver's cab read the same record.",
    lead: "No status calls, no retyped numbers. A change on one screen is the truth on the other.",
    console: { label: "Shipper console", summary: "Sample shipper console listing four loads with status, lane, arrival and rate." },
    phone: { label: "Driver view", summary: "Sample driver view for the current stop with arrival, loading and proof of delivery steps." },
    note: "Sample data",
} as const;

export const CONSOLE_COLUMNS = { load: "Load", lane: "Lane", status: "Status", eta: "Arrival", rate: "Rate" } as const;

export const CONSOLE_LOADS: readonly ConsoleLoad[] = [
    { id: "HL-48213", lane: "CHI → DAL", status: "In transit", tone: "live", eta: "Thu 14:20 ± 12 min", rate: "$2,340", progress: 62 },
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
    action: "I've arrived",
    steps: [
        { id: "arrive", label: "Arrive at the dock", done: true },
        { id: "unload", label: "Unloaded, 22 pallets", done: true },
        { id: "pod", label: "Photograph the signed delivery receipt", done: false },
    ] satisfies DriverStep[],
    pod: "Take photo",
    pay: "Pay due Monday · $2,060",
} as const;
