import type { LegalDocument } from "@/lib/types";

export const SHIPPER_TERMS: LegalDocument = {
    key: "shipper-terms",
    title: "Shipper terms",
    summary: "What a shipper agrees to when posting and booking loads on Haulr.",
    versions: [
        {
            version: "1.0",
            effective: "2026-03-02",
            changes: ["First published version."],
            clauses: [
                {
                    id: "scope",
                    title: "Scope",
                    body: ["These terms apply to every load your organisation posts on Haulr, alongside the terms of service."],
                },
                {
                    id: "posting",
                    title: "Posting a load",
                    body: [
                        "Describe each load accurately: commodity, weight, equipment, stops and appointment windows.",
                        "Declare hazardous materials and temperature needs when posting. Undeclared requirements can void the booking.",
                    ],
                },
                {
                    id: "booking",
                    title: "Booking",
                    body: [
                        "A load is booked once the carrier accepts the rate confirmation. The confirmation states the rate, stops and accessorial terms that apply.",
                    ],
                },
                {
                    id: "tracking",
                    title: "Tracking and arrival estimates",
                    body: [
                        "Arrival estimates come with a confidence range. They help you plan, and they are not a delivery guarantee.",
                    ],
                },
                {
                    id: "accessorials",
                    title: "Detention and other charges",
                    body: [
                        "Detention, layover and similar charges apply only as set out in the rate confirmation, and only with the supporting stop times.",
                    ],
                },
                {
                    id: "invoicing",
                    title: "Invoices and payment",
                    body: [
                        "Haulr invoices each load after proof of delivery is received. Invoices are due within the terms shown at booking.",
                        "Dispute a line within 30 days of the invoice date. The rest of the invoice stays payable.",
                    ],
                },
                {
                    id: "claims",
                    title: "Cargo claims",
                    body: [
                        "Report loss or damage on the delivery receipt where you can, and file a claim within nine months of delivery.",
                        "Haulr manages the claim with the carrier and its insurer and keeps you updated until it closes.",
                    ],
                },
                {
                    id: "cancellation",
                    title: "Cancelling a load",
                    body: [
                        "Cancel free of charge before a carrier books. After booking, the cancellation fee in the rate confirmation applies.",
                    ],
                },
            ],
        },
    ],
};
