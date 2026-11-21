import type { MockPaymentMethod } from "@/lib/types";

export const MOCK_INVOICING = {
    termsDays: 30,
    brokerMc: "MC 1000001",
    issueAfterHours: 20,
    paidAfterDays: 18,
    seededPayer: "Mara Lindqvist",
    seededMethod: "pm_ach_ops",
    contested: "HL-LDHKZFWC",
    contestedMinutesAgo: 3,
    documentNames: { pod: "POD {load}.pdf", rateConfirmation: "Rate confirmation {load}.pdf", lumperReceipt: "Lumper receipt {load}.pdf" },
    documentBytes: 184_320,
    lineNames: { fuel: "Fuel surcharge", fee: "Fee", deduction: "Deduction", accessorial: "Accessorial" },
    remittancePath: "/api/mock-storage/remittance",
    remittanceFile: "Remittance {reference}.csv",
    remittanceColumns: ["Payment reference", "Invoice", "Load", "Amount (USD)", "Method", "Paid at", "Paid by"],
    linkMinutes: 5,
    messages: {
        missing: "Invoice not found",
        method: "Payment method not found",
        paid: "This invoice was already paid",
        stale: "The invoice changed since you opened it",
        amount: "Pay the full open balance",
        outage: "The payment processor is unavailable. Nothing was charged.",
        failed: "This card's last charge failed, so the issuer declined this payment.",
        verification: "This bank account isn't verified yet.",
    },
};

export const MOCK_INVOICE_ACCESSORIALS: Partial<Record<string, { amountCents: number; description: string }>> = {
    "HL-WC33HXDU": { amountCents: 18_500, description: "Lumper at delivery" },
};

export const MOCK_PAYMENT_METHODS: readonly MockPaymentMethod[] = [
    { id: "pm_ach_ops", organisation: "northline", type: "ach", label: "Operating account", last4: "6789", brand: null, status: "verified", isDefault: true },
    { id: "pm_card_corp", organisation: "northline", type: "card", label: "Corporate card", last4: "4242", brand: "Visa", status: "verified", isDefault: false },
    { id: "pm_card_travel", organisation: "northline", type: "card", label: "Travel card", last4: "0002", brand: "Visa", status: "failed", isDefault: false },
    { id: "pm_ach_reserve", organisation: "northline", type: "ach", label: "Reserve account", last4: "1180", brand: null, status: "pendingVerification", isDefault: false },
    { id: "pm_card_amex", organisation: "northline", type: "card", label: "Purchasing card", last4: "1005", brand: "Amex", status: "verified", isDefault: false, outage: true },
];
