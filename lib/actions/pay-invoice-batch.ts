"use server";
import { routes } from "@/lib/contract/routes";
import type { InvoicePaymentRequestDto } from "@/lib/contract/schemas";
import { invalidInput } from "@/lib/utils/action-result";
import { backendMutation } from "@/lib/utils/backend-mutation";
import { withSessionAction } from "@/lib/utils/with-action";
import { payInvoicesSchema, paymentResultEnvelopeSchema } from "@/lib/validations/billing";

export const payInvoiceBatch = withSessionAction(async (_context, input: InvoicePaymentRequestDto) => {
    const parsed = payInvoicesSchema.safeParse(input);
    return parsed.success ? backendMutation(routes.invoicesPay(), parsed.data, paymentResultEnvelopeSchema) : invalidInput();
});
