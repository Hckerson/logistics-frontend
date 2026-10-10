import type { LegalClause, LegalDocument } from "@/lib/types";
import { revise } from "@/lib/legal/revise";

const CLAUSES: readonly LegalClause[] = [
    {
        id: "about",
        title: "About these terms",
        body: [
            "Haulr runs a freight marketplace where shippers post loads and carriers book them. These terms cover your use of the Haulr website and apps.",
            "Haulr arranges transport as a licensed property broker. It does not haul freight itself.",
        ],
    },
    {
        id: "account",
        title: "Your account",
        body: [
            "Give accurate details when you register, and keep them current. Each login belongs to one person.",
            "Keep your password and any two-step sign-in device to yourself. Tell us straight away if you think someone else has used your account.",
        ],
    },
    {
        id: "marketplace",
        title: "Using the marketplace",
        body: [
            "A posted load is an offer to book. A booking binds both sides only when the carrier accepts the rate confirmation.",
            "Rates, stops, equipment and accessorial terms in the accepted confirmation govern the load. Any later change needs an amendment that the carrier accepts.",
        ],
    },
    {
        id: "payments",
        title: "Payments and fees",
        body: [
            "Shippers pay the invoice for each delivered load on the terms shown before booking. Carriers are paid through settlements on the terms in the carrier agreement.",
            "Every Haulr fee is shown before you commit. We never add a fee after booking.",
        ],
    },
    {
        id: "conduct",
        title: "Acceptable use",
        body: [
            "Don't misrepresent who you are, re-broker a load you booked, or arrange loads off the platform to avoid fees.",
            "Don't scrape, overload or probe Haulr's systems, or use another member's data for anything but the load it belongs to.",
        ],
    },
    {
        id: "records",
        title: "Electronic records",
        body: [
            "You agree to receive agreements, rate confirmations and notices electronically, and to sign them electronically.",
            "Every record you sign is kept unchanged, and you can download a copy at any time.",
        ],
    },
    {
        id: "liability",
        title: "Liability",
        body: [
            "Haulr is responsible for running the marketplace with reasonable care. Cargo loss and damage are handled under the shipper terms and the carrier agreement.",
            "Nothing in these terms limits liability that the law does not allow us to limit.",
        ],
    },
    {
        id: "changes",
        title: "Changes to these terms",
        body: [
            "When these terms change, we publish a new version with its effective date and a summary of what changed, and we tell account holders in advance.",
            "Every earlier version stays available at its own address, so you can always read the terms you agreed to.",
        ],
    },
    {
        id: "contact",
        title: "Contact",
        body: ["Questions about these terms go to Haulr support. Quote the version number at the top of this page."],
    },
];

export const TERMS: LegalDocument = {
    key: "terms",
    title: "Terms of service",
    summary: "The rules for using Haulr, for shippers and carriers alike.",
    versions: [
        {
            version: "1.1",
            effective: "2026-10-01",
            changes: [
                "Added section 6, Electronic records: you can sign electronically and download any record you signed.",
                "Section 3 now states that a booking binds only once the carrier accepts the rate confirmation.",
                "Section 8 now promises that every earlier version stays available at its own address.",
            ],
            clauses: CLAUSES,
        },
        {
            version: "1.0",
            effective: "2026-03-02",
            changes: ["First published version."],
            clauses: revise(CLAUSES, {
                drop: ["records"],
                replace: {
                    marketplace: ["A posted load is an offer to book. Booked loads follow the rate confirmation issued for them."],
                    changes: ["When these terms change, we publish a new version with its effective date and tell account holders in advance."],
                },
            }),
        },
    ],
};
