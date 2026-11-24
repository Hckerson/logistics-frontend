"use client";
import Breadcrumbs from "@/components/common/breadcrumbs";
import InvoiceEvidence from "@/components/common/invoice-evidence";
import InvoiceFacts from "@/components/common/invoice-facts";
import InvoiceLines from "@/components/common/invoice-lines";
import InvoicePayment from "@/components/common/invoice-payment";
import WorkspaceHeading from "@/components/common/workspace-heading";
import StatusLabel from "@/components/ui/status-label";
import type { InvoiceDto } from "@/lib/contract/schemas";
import { INVOICE_COPY } from "@/lib/data/billing/invoice-copy";
import { useInvoice } from "@/lib/hooks/use-invoice";
import type { Crumb } from "@/lib/types";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    initial: InvoiceDto;
    trail: readonly Crumb[];
}

export default function InvoiceDetail({ initial, trail }: Props) {
    const { data: invoice } = useInvoice(initial.id, initial);

    return (
        <div className="flex flex-col gap-4">
            <Breadcrumbs trail={trail} current={invoice.number} mono />
            <WorkspaceHeading title={fillTemplate(INVOICE_COPY.title, { number: invoice.number })}>
                <StatusLabel {...INVOICE_COPY.statuses[invoice.status]} />
            </WorkspaceHeading>
            <InvoiceFacts invoice={invoice} />
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
                <div className="flex min-w-0 flex-col gap-4">
                    <InvoiceLines invoice={invoice} />
                    <InvoiceEvidence loadId={invoice.loadId} />
                </div>
                <div className="lg:sticky lg:top-[calc(var(--sticky-top)+1rem)]">
                    <InvoicePayment invoice={invoice} />
                </div>
            </div>
        </div>
    );
}
