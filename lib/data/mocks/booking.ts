import { MOCK_FREIGHT } from "@/lib/data/mocks/loads";
import { CANCELLATION } from "@/lib/loads/constants";

export const MOCK_BOOKING = {
    offeredShare: 0.85,
    insuranceMinCents: 75_000_000,
    rateConfirmationVersion: 1,
    signerIp: "203.0.113.24",
    takenBy: "granite",
    terms: {
        detentionFreeHours: 2,
        detentionCentsPerHour: 7_500,
        layoverCentsPerDay: 30_000,
        tonuCents: MOCK_FREIGHT.tonuCents,
        cancellationNoticeHours: CANCELLATION.tonuHours,
    },
} as const;

export const MOCK_CARGO_COVER: Readonly<Record<string, number>> = {
    ridgeway: 100_000_000,
    blueMesa: 100_000_000,
    granite: 50_000_000,
};

export const MOCK_INSURANCE_MINIMUMS: Readonly<Record<string, number>> = {
    "HL-4KR8YP3D": 200_000_000,
};

export const MOCK_TAKEN_LOADS: ReadonlySet<string> = new Set(["HL-2JS6WD9H"]);

export const MOCK_RATE_CONFIRMATION = {
    fileName: "rate-confirmation-{load}-v{version}.pdf",
    parties: { heading: "Parties", body: "Shipper: {shipper}. Carrier: {carrier}. Broker of record: Haulr Logistics Inc., MC-918274." },
    freight: { heading: "Equipment and freight", body: "{equipment}. {commodity}, {weight} lb{pallets}{temperature}{hazmat}." },
    stops: { heading: "Stops", body: "{stops}" },
    stop: "{sequence}. {type} at {name}, {address}, {window}{reference}.",
    pay: { heading: "Carrier pay", body: "{pay} all-in linehaul and fuel for {miles} miles, paid net 30 after a clean proof of delivery." },
    accessorials: {
        heading: "Accessorials",
        body: "Detention after {free} free hours at each stop, {detention} per hour. Layover {layover} per day. Truck ordered, not used (TONU) {tonu} when the shipper cancels within {notice} hours of pickup.",
    },
    cancellation: {
        heading: "Cancellation",
        body: "If the carrier releases the load after booking, it returns to the board and the release counts against the carrier's reliability for 90 days.",
    },
    acceptance: {
        heading: "Acceptance",
        body: "Accepting this rate confirmation electronically binds the carrier to these terms as if signed on paper. Haulr records the signer, time, IP address and document version.",
    },
} as const;
