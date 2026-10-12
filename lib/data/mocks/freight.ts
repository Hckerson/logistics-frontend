import type { DocumentDto, NotificationDto } from "@/lib/contract/schemas";
import type { MockScenario } from "@/lib/types";

interface LinkSeed {
    token: string;
    load: string;
    by: string;
    ageHours: number;
    revokedHoursAgo?: number;
}

interface DocumentSeed {
    load: string;
    type: DocumentDto["type"];
    fileName: string;
    sizeBytes: number;
    scanStatus: DocumentDto["scanStatus"];
    by: string;
    ageHours: number;
}

interface NotificationSeed {
    user: string;
    event: NotificationDto["event"];
    load: string;
    ageHours: number;
    read: boolean;
}

const dana = "Dana Okafor";
const ray = "Ray Okoro";
const ana = "Ana Ruiz";

export const MOCK_TRACKING_LINKS: readonly LinkSeed[] = [
    { token: "trk_7K2M9QXA", load: "HL-7K2M9QXA", by: dana, ageHours: 8 },
    { token: "trk_4MC9RD7K", load: "HL-4MC9RD7K", by: dana, ageHours: 9 },
    { token: "trk_2GL4YN7S", load: "HL-2GL4YN7S", by: dana, ageHours: 60 },
    { token: "trk_5RT8VK3M", load: "HL-5RT8VK3M", by: dana, ageHours: 230 },
    { token: "trk_3RW8REVK", load: "HL-3RW8TNPE", by: dana, ageHours: 20, revokedHoursAgo: 18 },
];

export const MOCK_TRACKING_SCENARIOS: Record<string, MockScenario> = {
    trk_busy: { kind: "rate-limited", retryAfter: 60 },
    trk_down: { kind: "unavailable" },
};

const pdf = (load: string, type: DocumentDto["type"], fileName: string, by: string, ageHours: number, sizeBytes = 184_000) =>
    ({ load, type, fileName, sizeBytes, scanStatus: "clean", by, ageHours }) as const;

export const MOCK_DOCUMENTS: readonly DocumentSeed[] = [
    pdf("HL-7K2M9QXA", "rateConfirmation", "rate-confirmation-HL-7K2M9QXA.pdf", ray, 40),
    pdf("HL-7K2M9QXA", "bol", "bol-55120.pdf", ana, 9.5),
    pdf("HL-3RW8TNPE", "rateConfirmation", "rate-confirmation-HL-3RW8TNPE.pdf", ray, 26),
    pdf("HL-9DQ4ZB2M", "rateConfirmation", "rate-confirmation-HL-9DQ4ZB2M.pdf", dana, 30),
    pdf("HL-2PV7MW4R", "rateConfirmation", "rate-confirmation-HL-2PV7MW4R.pdf", ray, 30),
    pdf("HL-2PV7MW4R", "bol", "bol-55188.pdf", ana, 8),
    { load: "HL-2PV7MW4R", type: "lumperReceipt", fileName: "lumper-receipt.jpg", sizeBytes: 912_000, scanStatus: "pending", by: ana, ageHours: 0.2 },
    { load: "HL-2PV7MW4R", type: "damagePhoto", fileName: "pallet-corner.png", sizeBytes: 2_400_000, scanStatus: "rejected", by: ana, ageHours: 0.3 },
    pdf("HL-4MC9RD7K", "rateConfirmation", "rate-confirmation-HL-4MC9RD7K.pdf", ray, 30),
    pdf("HL-4MC9RD7K", "bol", "bol-chicago.pdf", ana, 9.4),
    pdf("HL-6NX2HV9T", "rateConfirmation", "rate-confirmation-HL-6NX2HV9T.pdf", dana, 16),
    pdf("HL-2GL4YN7S", "rateConfirmation", "rate-confirmation-HL-2GL4YN7S.pdf", ray, 70),
    pdf("HL-2GL4YN7S", "bol", "bol-55102.pdf", ana, 50),
    pdf("HL-2GL4YN7S", "pod", "pod-nashville.pdf", ana, 44, 642_000),
    pdf("HL-5RT8VK3M", "rateConfirmation", "rate-confirmation-HL-5RT8VK3M.pdf", ray, 236),
    pdf("HL-5RT8VK3M", "pod", "pod-chicago.pdf", ana, 216, 598_000),
    pdf("HL-5RT8VK3M", "invoice", "invoice-INV-7H3K2M.pdf", dana, 200, 96_000),
];

export const MOCK_NOTIFICATIONS: readonly NotificationSeed[] = [
    { user: "usr_dispatch", event: "trackingStale", load: "HL-9DQ4ZB2M", ageHours: 0.3, read: false },
    { user: "usr_dispatch", event: "etaChanged", load: "HL-9DQ4ZB2M", ageHours: 1.1, read: false },
    { user: "usr_dispatch", event: "loadBooked", load: "HL-6NX2HV9T", ageHours: 16, read: true },
    { user: "usr_dispatch", event: "invoiceDue", load: "HL-5RT8VK3M", ageHours: 30, read: true },
    { user: "usr_carrier", event: "checkCallRequested", load: "HL-3RW8TNPE", ageHours: 0.1, read: false },
    { user: "usr_carrier", event: "loadBooked", load: "HL-8TB3QF6N", ageHours: 19, read: true },
    { user: "usr_driver", event: "checkCallRequested", load: "HL-3RW8TNPE", ageHours: 0.1, read: false },
    { user: "usr_ops", event: "trackingStale", load: "HL-9DQ4ZB2M", ageHours: 0.3, read: false },
];

export const MOCK_SAMPLE_TYPE = "application/pdf";

export const MOCK_SAMPLE_PDF =
    "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n";
