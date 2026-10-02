import type { SceneReadout } from "@/lib/types";

export const PANEL_NOTE = "Sample data";

export const QUOTE_PANEL = {
    label: "Lane price",
    status: "Instant quote",
    summary: "Sample quote: Chicago to Dallas, dry van, 2,340 dollars, plus or minus 4 percent.",
    from: "Chicago, IL",
    to: "Dallas, TX",
    facts: [
        { id: "equipment", label: "Equipment", value: "53' dry van" },
        { id: "distance", label: "Distance", value: "925 mi" },
        { id: "pickup", label: "Pickup", value: "Wed 16:00 to 18:00" },
    ] satisfies SceneReadout[],
    rate: "$2,340",
    perMile: "$2.53 per mile",
    range: { label: "Confidence range", low: "$2,250", high: "$2,430", marker: 50 },
    action: "Book this rate",
    validity: "Rate held for 30 minutes",
} as const;

export const BOOK_PANEL = {
    label: "Rate confirmation",
    status: "Booked",
    summary: "Sample booking: a vetted carrier booked the load six minutes after it was posted.",
    carrier: { name: "Northline Haulage", detail: "Sample carrier · 42 trucks" },
    checks: [
        { id: "authority", label: "Operating authority", value: "Active" },
        { id: "insurance", label: "Insurance", value: "Verified" },
        { id: "on-time", label: "On time, last 90 days", value: "97%" },
    ] satisfies SceneReadout[],
    timeline: [
        { id: "posted", label: "Posted", value: "09:02" },
        { id: "seen", label: "Seen by 38 vetted carriers", value: "09:05" },
        { id: "booked", label: "Booked at $2,340", value: "09:08" },
    ] satisfies SceneReadout[],
} as const;

export const TRACK_PANEL = {
    label: "Live tracking",
    status: "In transit",
    summary: "Sample tracking: the load is in transit with a live arrival estimate and its location source.",
    eta: { label: "Estimated arrival", value: "Thu 14:20", prefix: "± ", unit: "min" },
    remaining: { label: "Remaining", unit: "mi" },
    confidence: { from: 38, to: 6 },
    miles: { from: 925, to: 0 },
    stops: [
        { id: "pickup", label: "Chicago, IL", value: "Picked up Wed 16:40" },
        { id: "delivery", label: "Dallas, TX", value: "Appointment Thu 14:00 to 16:00" },
    ] satisfies SceneReadout[],
    source: "ELD · updated 4 min ago",
    shared: "Shared with the receiver, no account needed",
} as const;
