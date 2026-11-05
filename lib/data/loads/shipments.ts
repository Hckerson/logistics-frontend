import type { LoadSummaryDto } from "@/lib/contract/schemas";
import type { ShipmentStage } from "@/lib/types";

export const SHIPMENTS_COPY = {
    meta: { title: "Shipments" },
    title: "Shipments",
    post: "Post a load",
    caption: "Loads",
    stagesLabel: "Load stage",
    filters: "Filter loads",
    stages: {
        all: "All",
        moving: "Moving",
        waiting: "Waiting",
        attention: "Needs attention",
        done: "Delivered",
        ended: "Ended",
    } satisfies Record<ShipmentStage, string>,
    search: { label: "Find a load", placeholder: "Load, PO, carrier or city" },
    equipment: { label: "Equipment", any: "Any equipment" },
    lateOnly: "Late only",
    columns: { load: "Load", lane: "Lane", status: "Status", pickup: "Pickup", delivery: "Delivery", carrier: "Carrier", seen: "Last seen" },
    notBooked: "Not booked",
    eta: "ETA {time}",
    noPosition: "No position yet",
    moment: "{day} · {time}",
    seen: "{place} · {age}",
    menu: { open: "Open load", copy: "Copy reference" },
    preview: {
        pickup: "Pickup window",
        delivery: "Delivery window",
        eta: "Estimated arrival",
        seen: "Last position",
        carrier: "Carrier",
        equipment: "Equipment",
        remaining: "{miles} mi to go",
        confidence: { high: "high confidence", medium: "medium confidence", low: "low confidence" } satisfies Record<
            NonNullable<LoadSummaryDto["eta"]>["confidence"],
            string
        >,
        open: "Open load",
    },
    results: { one: "{count} load shown", other: "{count} loads shown" },
    empty: {
        none: "No loads yet. Get a price and post your first load.",
        start: "Get a quote",
        filtered: { one: "No loads match. {count} filter is on.", other: "No loads match. {count} filters are on." },
        clear: "Clear filters",
    },
} as const;
