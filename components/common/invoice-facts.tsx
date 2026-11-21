"use client";
import Link from "next/link";
import { appRoutes } from "@/lib/app-routes";
import type { InvoiceDto } from "@/lib/contract/schemas";
import { INVOICE_COPY } from "@/lib/data/billing/invoice-copy";
import { dueText, invoiceDay } from "@/lib/billing/invoice-view";
import { useNow } from "@/lib/hooks/use-now";
import { LABEL_TEXT, RECORD_LINK } from "@/lib/ui/constants";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    invoice: InvoiceDto;
}

const { facts } = INVOICE_COPY;

export default function InvoiceFacts({ invoice }: Props) {
    const now = useNow();
    const rows = [
        { id: "load", label: facts.load, value: <Link href={appRoutes.load(invoice.loadId)} className={RECORD_LINK}>{invoice.loadId}</Link> },
        { id: "lane", label: facts.lane, value: fillTemplate(INVOICE_COPY.lane, { from: invoice.lane.origin, to: invoice.lane.destination }) },
        { id: "carrier", label: facts.carrier, value: invoice.carrier?.name ?? "" },
        { id: "issued", label: facts.issued, value: invoiceDay(invoice.issuedAt) },
        { id: "due", label: facts.due, value: dueText(invoice, now) },
        { id: "terms", label: facts.terms, value: fillTemplate(INVOICE_COPY.terms, { days: String(invoice.termsDays) }) },
        { id: "broker", label: facts.broker, value: invoice.brokerMc },
    ];

    return (
        <dl className="grid gap-x-4 gap-y-3 text-xs sm:grid-cols-3 lg:grid-cols-4">
            {rows.map((row) => (
                <div key={row.id} className="flex min-w-0 flex-col gap-1">
                    <dt className={LABEL_TEXT}>{row.label}</dt>
                    <dd className="text-text truncate">{row.value}</dd>
                </div>
            ))}
        </dl>
    );
}
