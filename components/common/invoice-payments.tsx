"use client";
import { Download } from "@carbon/icons-react";
import Button from "@/components/ui/button";
import type { InvoiceDto } from "@/lib/contract/schemas";
import { INVOICE_COPY } from "@/lib/data/billing/invoice-copy";
import { invoiceDay, invoiceMoney } from "@/lib/billing/invoice-view";
import { useRemittance } from "@/lib/hooks/use-invoice";
import { LABEL_TEXT } from "@/lib/ui/constants";
import { errorMessage, failureFrom } from "@/lib/utils/action-result";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    invoice: InvoiceDto;
}

const { applied: copy } = INVOICE_COPY;

export default function InvoicePayments({ invoice }: Props) {
    const remittance = useRemittance();
    const failure = remittance.isError ? failureFrom(remittance.error) : null;

    return (
        <div className="flex flex-col gap-2">
            <p className={LABEL_TEXT}>{copy.label}</p>
            {invoice.payments.length === 0 ? <p className="text-text-muted text-xs">{copy.none}</p> : null}
            <ul className="flex flex-col">
                {invoice.payments.map((payment) => (
                    <li key={payment.id} className="border-border-light flex flex-col gap-1 border-t py-2.5 text-xs first:border-t-0 first:pt-0">
                        <p className="text-text tabular-nums">{fillTemplate(copy.row, { amount: invoiceMoney(payment.amountCents, invoice), method: payment.methodLabel })}</p>
                        <p className="text-text-secondary">{fillTemplate(copy.by, { date: invoiceDay(payment.paidAt), name: payment.paidByName })}</p>
                        <p className="text-text-muted font-mono">{fillTemplate(copy.reference, { reference: payment.reference })}</p>
                        <Button
                            tone="link"
                            size="inline"
                            icon={Download}
                            className="self-start"
                            pending={remittance.isPending && remittance.variables === payment.id}
                            onPress={() => remittance.mutate(payment.id, { onSuccess: ({ url }) => window.location.assign(url) })}
                        >
                            {fillTemplate(copy.remittance, { reference: payment.reference })}
                        </Button>
                    </li>
                ))}
            </ul>
            {failure ? (
                <p role="alert" className="text-error text-xs">
                    {errorMessage(failure)}
                </p>
            ) : null}
        </div>
    );
}
