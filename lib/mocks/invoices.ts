import { can } from "@/lib/auth/capabilities";
import { INVOICED_STATUSES, invoiceIdOf } from "@/lib/billing/constants";
import { HTTP_STATUS, TIME_MS } from "@/lib/constants";
import { MOCK_INVOICING, MOCK_PAYMENT_METHODS } from "@/lib/data/mocks/invoices";
import { withCaller, type MockCaller } from "@/lib/mocks/freight-access";
import { freightStore } from "@/lib/mocks/freight-store";
import { fail, ok } from "@/lib/mocks/http";
import { invoiceOf, invoicePayments } from "@/lib/mocks/invoice-store";
import { csvLine } from "@/lib/utils/csv";
import { fillTemplate } from "@/lib/utils/fill-template";

const CENTS = 100;

export const invoiceLoad = (caller: MockCaller, invoiceId: string) => {
    if (!can(caller.user.roles, "payInvoices")) return null;
    const load = [...freightStore().loads.values()].find((candidate) => invoiceIdOf(candidate.id) === invoiceId);
    return load && load.shipper === caller.organisation && INVOICED_STATUSES.includes(load.status) ? load : null;
};

export const methodsOf = (organisation: string | null) => MOCK_PAYMENT_METHODS.filter((method) => method.organisation === organisation);

export const missingInvoice = (path: string) => fail(HTTP_STATUS.notFound, MOCK_INVOICING.messages.missing, path);

export const findInvoice = withCaller(({ path }, { invoiceId }, caller) => {
    const load = invoiceLoad(caller, invoiceId);
    return load ? ok(HTTP_STATUS.ok, invoiceOf(load)) : missingInvoice(path);
});

export const listPaymentMethods = withCaller((_request, _params, caller) =>
    ok(
        HTTP_STATUS.ok,
        (can(caller.user.roles, "payInvoices") ? methodsOf(caller.organisation) : []).map(({ id, type, label, last4, brand, status, isDefault }) => ({ id, type, label, last4, brand, status, isDefault })),
    ),
);

const ownPayment = (caller: MockCaller, paymentId: string) => {
    const payment = invoicePayments().get(paymentId);
    return payment && payment.invoiceIds.some((invoiceId) => invoiceLoad(caller, invoiceId)) ? payment : null;
};

export const invoiceRemittance = withCaller(({ path }, { paymentId }, caller) => {
    const payment = ownPayment(caller, paymentId);
    if (!payment) return missingInvoice(path);
    return ok(HTTP_STATUS.ok, { url: `${MOCK_INVOICING.remittancePath}/${payment.id}`, expiresAt: new Date(new Date().getTime() + MOCK_INVOICING.linkMinutes * TIME_MS.minute).toISOString() });
});

export const remittanceFile = (paymentId: string) => {
    const payment = invoicePayments().get(paymentId);
    if (!payment) return null;
    const rows = payment.invoiceIds.map((invoiceId) =>
        csvLine([
            payment.reference,
            invoiceId,
            invoiceId.replace("INV-", "HL-"),
            ((payment.amounts[invoiceId] ?? 0) / CENTS).toFixed(2),
            payment.methodLabel,
            new Date(payment.paidAt).toISOString(),
            payment.paidByName,
        ]),
    );
    return { fileName: fillTemplate(MOCK_INVOICING.remittanceFile, { reference: payment.reference }), body: [csvLine(MOCK_INVOICING.remittanceColumns), ...rows].join("\n") };
};
