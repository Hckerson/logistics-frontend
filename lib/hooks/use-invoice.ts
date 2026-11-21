import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { payInvoiceBatch } from "@/lib/actions/pay-invoice-batch";
import { local } from "@/lib/api-client";
import { apiRoutes } from "@/lib/api-routes";
import type { InvoiceDto, InvoicePaymentRequestDto } from "@/lib/contract/schemas";
import { organizationKeys } from "@/lib/hooks/use-account-standing";
import { loadKeys } from "@/lib/hooks/use-loads";
import { READ_RETRY, unwrap } from "@/lib/utils/action-result";
import { invoiceEnvelopeSchema, paymentMethodsEnvelopeSchema } from "@/lib/validations/billing";
import { downloadLinkEnvelopeSchema } from "@/lib/validations/freight";

export const invoiceKeys = {
    detail: (invoiceId: string) => ["invoices", "detail", invoiceId] as const,
    methods: () => ["payment-methods"] as const,
};

export const useInvoice = (invoiceId: string, initial: InvoiceDto) =>
    useQuery({
        queryKey: invoiceKeys.detail(invoiceId),
        queryFn: async ({ signal }) => invoiceEnvelopeSchema.parse(await local.get(apiRoutes.invoice(invoiceId), { signal })).data,
        initialData: initial,
        refetchOnWindowFocus: true,
        ...READ_RETRY,
    });

export const usePaymentMethods = () =>
    useQuery({
        queryKey: invoiceKeys.methods(),
        queryFn: async ({ signal }) => paymentMethodsEnvelopeSchema.parse(await local.get(apiRoutes.paymentMethods(), { signal })).data,
        ...READ_RETRY,
    });

export const usePayInvoices = (invoiceId: string) => {
    const client = useQueryClient();
    return useMutation({
        mutationFn: async (input: InvoicePaymentRequestDto) => unwrap(await payInvoiceBatch(input)),
        onSettled: () => {
            void client.invalidateQueries({ queryKey: invoiceKeys.detail(invoiceId) });
            void client.invalidateQueries({ queryKey: loadKeys.all });
            void client.invalidateQueries({ queryKey: organizationKeys.standing() });
        },
    });
};

export const useRemittance = () =>
    useMutation({
        mutationFn: async (paymentId: string) => downloadLinkEnvelopeSchema.parse(await local.get(apiRoutes.remittance(paymentId))).data,
    });
