import type { LegalDocument } from "@/lib/types";

export const CARRIER_AGREEMENT: LegalDocument = {
    key: "carrier-agreement",
    title: "Carrier agreement",
    summary: "What a carrier agrees to when booking and hauling loads through Haulr.",
    versions: [
        {
            version: "1.0",
            effective: "2026-03-02",
            changes: ["First published version."],
            clauses: [
                {
                    id: "scope",
                    title: "Scope",
                    body: ["This agreement applies to every load your company books through Haulr, alongside the terms of service."],
                },
                {
                    id: "authority",
                    title: "Authority and insurance",
                    body: [
                        "Keep active operating authority and the insurance minimums shown during onboarding for as long as you book loads.",
                        "Tell Haulr within one business day if your authority, insurance or safety rating changes.",
                    ],
                },
                {
                    id: "booking",
                    title: "Booking",
                    body: [
                        "Accepting a rate confirmation books the load. You haul it yourself, with your own drivers and equipment.",
                        "Re-brokering, co-brokering or handing a load to another carrier is not allowed.",
                    ],
                },
                {
                    id: "hauling",
                    title: "Hauling the load",
                    body: [
                        "Keep tracking on from pickup to delivery, and record arrival and departure at every stop.",
                        "Capture proof of delivery with the receiver's signature and photos before you leave the last stop.",
                    ],
                },
                {
                    id: "payment",
                    title: "Getting paid",
                    body: [
                        "Haulr pays each load on the settlement terms you chose, counted from the day a complete proof of delivery is received.",
                        "Quick pay is available on any load for the fee shown before you request it.",
                    ],
                },
                {
                    id: "claims",
                    title: "Cargo claims",
                    body: [
                        "You are responsible for loss or damage between pickup and delivery, as federal transport law sets out.",
                        "Respond to a claim within 30 days and cooperate with Haulr and your insurer until it closes.",
                    ],
                },
                {
                    id: "ending",
                    title: "Ending the agreement",
                    body: [
                        "Either side can end this agreement with notice. Loads already booked are completed and paid on the agreed terms.",
                    ],
                },
            ],
        },
    ],
};
