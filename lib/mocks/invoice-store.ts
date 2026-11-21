import { TIME_MS } from "@/lib/constants";
import type { InvoiceDto, InvoiceLineDto, InvoicePaymentDto, InvoicePaymentResultDto } from "@/lib/contract/schemas";
import { invoiceIdOf } from "@/lib/billing/constants";
import { MOCK_FACILITIES } from "@/lib/data/mocks/facilities";
import { MOCK_INVOICE_ACCESSORIALS, MOCK_INVOICING, MOCK_PAYMENT_METHODS } from "@/lib/data/mocks/invoices";
import { MOCK_ORGANISATIONS } from "@/lib/data/mocks/team";
import { CURRENCY } from "@/lib/loads/constants";
import { freightStore } from "@/lib/mocks/freight-store";
import type { MockCharge, MockDocument, MockInvoicePayment, MockLoad } from "@/lib/types";
import { fillTemplate } from "@/lib/utils/fill-template";

type Evidence = "pod" | "rateConfirmation" | "lumperReceipt";
type LineCharge = MockCharge & { kind: InvoiceLineDto["kind"] };

const LINE_KINDS: readonly InvoiceLineDto["kind"][] = ["linehaul", "fuel", "accessorial", "fee", "deduction"];
const billable = (charge: MockCharge): charge is LineCharge => charge.party === "shipper" && charge.status === "agreed" && LINE_KINDS.some((kind) => kind === charge.kind);

const holder = globalThis as typeof globalThis & { haulrInvoicePayments?: Map<string, MockInvoicePayment>; haulrPaymentResults?: Map<string, InvoicePaymentResultDto> };

export const invoicePayments = () => (holder.haulrInvoicePayments ??= new Map<string, MockInvoicePayment>());
export const paymentResults = () => (holder.haulrPaymentResults ??= new Map<string, InvoicePaymentResultDto>());

const PAID_STATUSES = new Set(["Paid", "Closed"]);
const iso = (moment: number) => new Date(moment).toISOString();
const placeOf = (facility: string) => `${MOCK_FACILITIES[facility].city}, ${MOCK_FACILITIES[facility].region}`;
const deliveredAt = (load: MockLoad) => load.stops[load.stops.length - 1].departedAt ?? load.stops[load.stops.length - 1].arrivedAt;
const issuedAt = (load: MockLoad) => Date.parse(deliveredAt(load) ?? load.updatedAt) + MOCK_INVOICING.issueAfterHours * TIME_MS.hour;

const documentOf = (load: MockLoad, type: Evidence) => [...freightStore().documents.values()].find((document) => document.loadId === load.id && document.type === type);

const ensureDocument = (load: MockLoad, type: Evidence) => {
    const found = documentOf(load, type);
    if (found) return found;
    const document: MockDocument = {
        id: `doc_${type}_${load.id}`,
        loadId: load.id,
        type,
        fileName: fillTemplate(MOCK_INVOICING.documentNames[type], { load: load.id }),
        contentType: "application/pdf",
        sizeBytes: MOCK_INVOICING.documentBytes,
        scanStatus: "clean",
        version: 1,
        uploadedByName: load.carrier ? MOCK_ORGANISATIONS[load.carrier].name : MOCK_ORGANISATIONS[load.shipper].name,
        createdAt: iso(issuedAt(load) - TIME_MS.hour),
    };
    freightStore().documents.set(document.id, document);
    return document;
};

const withAccessorial = (load: MockLoad) => {
    const extra = MOCK_INVOICE_ACCESSORIALS[load.id];
    if (!extra || load.charges.some((charge) => charge.party === "shipper" && charge.kind === "accessorial")) return;
    load.charges = [...load.charges, { party: "shipper", kind: "accessorial", amountCents: extra.amountCents, status: "agreed" }];
};

const lineOf = (load: MockLoad, charge: LineCharge, index: number): InvoiceLineDto => {
    const evidence = ensureDocument(load, charge.kind === "accessorial" ? "lumperReceipt" : "rateConfirmation");
    const description =
        charge.kind === "linehaul"
            ? `${placeOf(load.stops[0].facility)} to ${placeOf(load.stops[load.stops.length - 1].facility)}`
            : charge.kind === "accessorial"
              ? (MOCK_INVOICE_ACCESSORIALS[load.id]?.description ?? MOCK_INVOICING.lineNames.accessorial)
              : MOCK_INVOICING.lineNames[charge.kind];
    return { id: `${load.id}-${index + 1}`, kind: charge.kind, description, amountCents: charge.amountCents, evidence: { documentId: evidence.id, label: evidence.fileName } };
};

export const paymentOf = (payment: MockInvoicePayment, invoiceId: string): InvoicePaymentDto => ({
    id: payment.id,
    reference: payment.reference,
    amountCents: payment.amounts[invoiceId] ?? 0,
    methodLabel: payment.methodLabel,
    methodType: payment.methodType,
    paidAt: iso(payment.paidAt),
    paidByName: payment.paidByName,
});

export const recordPayment = (payment: MockInvoicePayment) => invoicePayments().set(payment.id, payment);

const seedPayment = (load: MockLoad, invoiceId: string, total: number) => {
    if ([...invoicePayments().values()].some((payment) => payment.invoiceIds.includes(invoiceId))) return;
    const method = MOCK_PAYMENT_METHODS.find((candidate) => candidate.id === MOCK_INVOICING.seededMethod);
    recordPayment({
        id: `pay_seed_${load.id}`,
        reference: `PAY-${load.id.slice(-6)}`,
        invoiceIds: [invoiceId],
        amounts: { [invoiceId]: total },
        methodId: MOCK_INVOICING.seededMethod,
        methodLabel: method ? `${method.label} ••${method.last4}` : MOCK_INVOICING.seededMethod,
        methodType: "ach",
        paidAt: Math.max(issuedAt(load), Math.min(issuedAt(load) + MOCK_INVOICING.paidAfterDays * TIME_MS.day, Date.parse(load.updatedAt))),
        paidByName: MOCK_INVOICING.seededPayer,
        idempotencyKey: null,
    });
};

export const invoiceOf = (load: MockLoad): InvoiceDto => {
    withAccessorial(load);
    ensureDocument(load, "pod");
    const id = invoiceIdOf(load.id);
    const lines = load.charges.filter(billable).map((charge, index) => lineOf(load, charge, index));
    const total = lines.reduce((sum, line) => sum + line.amountCents, 0);
    if (PAID_STATUSES.has(load.status)) seedPayment(load, id, total);
    const payments = [...invoicePayments().values()].filter((payment) => payment.invoiceIds.includes(id)).sort((first, second) => first.paidAt - second.paidAt);
    const paid = payments.reduce((sum, payment) => sum + (payment.amounts[id] ?? 0), 0);
    const issued = issuedAt(load);
    return {
        id,
        number: id,
        loadId: load.id,
        status: paid >= total ? "paid" : "open",
        shipper: { id: load.shipper, name: MOCK_ORGANISATIONS[load.shipper].name },
        carrier: load.carrier ? { id: load.carrier, name: MOCK_ORGANISATIONS[load.carrier].name } : null,
        lane: { origin: placeOf(load.stops[0].facility), destination: placeOf(load.stops[load.stops.length - 1].facility), deliveredAt: deliveredAt(load) },
        issuedAt: iso(issued),
        dueAt: iso(issued + MOCK_INVOICING.termsDays * TIME_MS.day),
        termsDays: MOCK_INVOICING.termsDays,
        currency: CURRENCY,
        lines,
        totalCents: total,
        paidCents: paid,
        disputedCents: 0,
        balanceCents: Math.max(0, total - paid),
        agreedRateCents: lines.find((line) => line.kind === "linehaul")?.amountCents ?? 0,
        rateConfirmationVersion: documentOf(load, "rateConfirmation")?.version ?? null,
        brokerMc: MOCK_INVOICING.brokerMc,
        payments: payments.map((payment) => paymentOf(payment, id)),
        version: 1 + payments.length,
    };
};
