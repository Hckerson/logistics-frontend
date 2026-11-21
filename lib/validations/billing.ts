import { z } from "zod";
import {
    invoiceDtoSchema,
    invoicePaymentItemDtoSchema,
    invoicePaymentRequestDtoSchema,
    invoicePaymentResultDtoSchema,
    organisationStandingDtoSchema,
    paymentMethodDtoSchema,
} from "@/lib/contract/schemas";
import { PAYMENT_LIMITS } from "@/lib/billing/constants";
import { enveloped } from "@/lib/validations/freight";

export const standingEnvelopeSchema = enveloped(organisationStandingDtoSchema);
export const invoiceEnvelopeSchema = enveloped(invoiceDtoSchema);
export const paymentMethodsEnvelopeSchema = enveloped(z.array(paymentMethodDtoSchema));
export const paymentResultEnvelopeSchema = enveloped(invoicePaymentResultDtoSchema);

export const payInvoicesSchema = invoicePaymentRequestDtoSchema.extend({
    items: z.array(invoicePaymentItemDtoSchema.extend({ invoiceId: z.string().min(1).max(PAYMENT_LIMITS.idMax), amountCents: z.number().int().positive() })).min(1).max(PAYMENT_LIMITS.items),
    methodId: z.string().min(1).max(PAYMENT_LIMITS.idMax),
    idempotencyKey: z.string().min(1).max(PAYMENT_LIMITS.idMax),
});
