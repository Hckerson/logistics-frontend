import { nanoid } from "nanoid";
import { HTTP_STATUS, TIME_MS } from "@/lib/constants";
import type { InvoicePaymentResultDto } from "@/lib/contract/schemas";
import { MOCK_INVOICING } from "@/lib/data/mocks/invoices";
import { FREIGHT_MESSAGES, recordEvent, withCaller, type MockCaller } from "@/lib/mocks/freight-access";
import { fail, ok } from "@/lib/mocks/http";
import { invoiceOf, paymentOf, paymentResults, recordPayment } from "@/lib/mocks/invoice-store";
import { invoiceLoad, methodsOf } from "@/lib/mocks/invoices";
import type { MockLoad, MockPaymentMethod } from "@/lib/types";
import { payInvoicesSchema } from "@/lib/validations/billing";

const { messages } = MOCK_INVOICING;
const referenceOf = () => `PAY-${nanoid(8).toUpperCase().replace(/[^A-Z0-9]/g, "7")}`;

const settle = (load: MockLoad, caller: MockCaller | null, byName: string, at: number) => {
    if (load.status !== "Invoiced") return;
    Object.assign(load, { status: "Paid", version: load.version + 1, updatedAt: new Date(at).toISOString(), updatedBy: byName });
    if (caller) recordEvent(load.id, caller, { type: "statusChanged", category: "status", fromStatus: "Invoiced", toStatus: "Paid" });
};

const payElsewhere = (load: MockLoad, method: MockPaymentMethod) => {
    const at = new Date().getTime() - MOCK_INVOICING.contestedMinutesAgo * TIME_MS.minute;
    const invoice = invoiceOf(load);
    recordPayment({
        id: `pay_${nanoid()}`,
        reference: referenceOf(),
        invoiceIds: [invoice.id],
        amounts: { [invoice.id]: invoice.balanceCents },
        methodId: method.id,
        methodLabel: `${method.label} ••${method.last4}`,
        methodType: method.type,
        paidAt: at,
        paidByName: MOCK_INVOICING.seededPayer,
        idempotencyKey: null,
    });
    settle(load, null, MOCK_INVOICING.seededPayer, at);
};

export const payInvoices = withCaller(({ path, body }, _params, caller) => {
    const input = payInvoicesSchema.safeParse(body);
    if (!input.success) return fail(HTTP_STATUS.badRequest, FREIGHT_MESSAGES.invalid, path);
    const remembered = paymentResults().get(input.data.idempotencyKey);
    if (remembered) return ok(HTTP_STATUS.ok, remembered);

    const method = methodsOf(caller.organisation).find((candidate) => candidate.id === input.data.methodId);
    if (!method) return fail(HTTP_STATUS.unprocessable, messages.method, path);
    if (method.outage) return fail(HTTP_STATUS.serviceUnavailable, messages.outage, path);

    const loads = input.data.items.map((item) => ({ item, load: invoiceLoad(caller, item.invoiceId) }));
    if (loads.some(({ load }) => !load)) return fail(HTTP_STATUS.notFound, messages.missing, path);
    for (const { item, load } of loads) {
        if (!load) continue;
        if (load.id === MOCK_INVOICING.contested && load.status === "Invoiced") payElsewhere(load, methodsOf(caller.organisation).at(0) ?? method);
        const invoice = invoiceOf(load);
        if (invoice.status !== "open") return fail(HTTP_STATUS.conflict, messages.paid, path);
        if (invoice.version !== item.version) return fail(HTTP_STATUS.preconditionFailed, messages.stale, path);
        if (invoice.balanceCents !== item.amountCents) return fail(HTTP_STATUS.unprocessable, messages.amount, path);
    }

    const refusal = method.status === "pendingVerification" ? "verificationRequired" : method.status === "failed" ? "declined" : null;
    if (refusal) {
        const result: InvoicePaymentResultDto = { status: refusal, payment: null, reason: refusal === "declined" ? messages.failed : messages.verification };
        paymentResults().set(input.data.idempotencyKey, result);
        return ok(HTTP_STATUS.ok, result);
    }

    const now = new Date().getTime();
    const payment = {
        id: `pay_${nanoid()}`,
        reference: referenceOf(),
        invoiceIds: input.data.items.map((item) => item.invoiceId),
        amounts: Object.fromEntries(input.data.items.map((item) => [item.invoiceId, item.amountCents])),
        methodId: method.id,
        methodLabel: `${method.label} ••${method.last4}`,
        methodType: method.type,
        paidAt: now,
        paidByName: caller.user.name,
        idempotencyKey: input.data.idempotencyKey,
    };
    recordPayment(payment);
    loads.forEach(({ load }) => load && settle(load, caller, caller.user.name, now));
    const result: InvoicePaymentResultDto = { status: "succeeded", payment: paymentOf(payment, input.data.items[0].invoiceId), reason: null };
    paymentResults().set(input.data.idempotencyKey, result);
    return ok(HTTP_STATUS.ok, result);
});
