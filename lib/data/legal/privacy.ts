import type { LegalClause, LegalDocument } from "@/lib/types";
import { revise } from "@/lib/legal/revise";

const CLAUSES: readonly LegalClause[] = [
    {
        id: "collect",
        title: "What we collect",
        body: [
            "Account details you give us: your name, work email, company and role.",
            "Load records you create or book, including stops, documents and messages, and the position updates a carrier's device sends while a load is in transit.",
        ],
    },
    {
        id: "use",
        title: "How we use it",
        body: [
            "To run the marketplace: matching loads, tracking them, invoicing and paying.",
            "To keep Haulr secure, meet our obligations as a broker, and improve the product from aggregate figures that identify no one.",
        ],
    },
    {
        id: "location",
        title: "Driver location",
        body: [
            "A driver's precise position is shared only with the parties to that load, and only while the load is in transit.",
            "Public tracking links show position at city level, never the exact point.",
        ],
    },
    {
        id: "sharing",
        title: "Who we share it with",
        body: [
            "The other party to a load sees what they need to move it. We never sell personal data.",
            "We use the service providers listed below. Each receives only the data in its row, for that purpose only.",
        ],
    },
    {
        id: "retention",
        title: "How long we keep it",
        body: [
            "Load records and signed documents are kept for seven years, as transport and tax rules require.",
            "Position history is reduced to city level after 90 days. Unsent support drafts on your device expire after 30 days.",
        ],
    },
    {
        id: "rights",
        title: "Your choices",
        body: [
            "You can ask for a copy of your data, a correction, or deletion of anything we are not required to keep. Requests are answered within 30 days.",
            "Organisation admins can export their organisation's records from settings.",
        ],
    },
    {
        id: "contact",
        title: "Contact",
        body: ["Privacy questions and requests go to Haulr support. Quote the version number at the top of this page."],
    },
];

export const PRIVACY: LegalDocument = {
    key: "privacy",
    title: "Privacy policy",
    summary: "What Haulr collects, why, who sees it and how long it stays.",
    versions: [
        {
            version: "1.1",
            effective: "2026-10-01",
            changes: [
                "Added section 3, Driver location: precise position stays with the parties to a load, and public links show city level only.",
                "Section 4 now lists every service provider and the data each one receives.",
                "Section 5 now states when position history is reduced to city level.",
            ],
            clauses: CLAUSES,
        },
        {
            version: "1.0",
            effective: "2026-03-02",
            changes: ["First published version."],
            clauses: revise(CLAUSES, {
                drop: ["location"],
                replace: {
                    sharing: ["The other party to a load sees what they need to move it. We never sell personal data, and we use service providers under contract."],
                    retention: ["Load records and signed documents are kept for seven years, as transport and tax rules require."],
                },
            }),
        },
    ],
    subProcessors: [
        { name: "Meridian Maps", purpose: "Map tiles and address lookup", data: "Stop addresses, city-level positions", location: "United States" },
        { name: "Ledgerline Payments", purpose: "Card and bank payments", data: "Payer name, payment details", location: "United States" },
        { name: "Quillsign", purpose: "Electronic signatures", data: "Signer name, email, signed documents", location: "United States" },
        { name: "Courier SMS", purpose: "Tracking and sign-in text messages", data: "Phone number, message text", location: "United States" },
        { name: "Lettermill", purpose: "Account and load email", data: "Email address, message text", location: "European Union" },
        { name: "Faultline", purpose: "Error reporting", data: "Error details, release, page", location: "United States" },
        { name: "Tally Analytics", purpose: "Product analytics", data: "Pseudonymous usage events", location: "European Union" },
    ],
};
