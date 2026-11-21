import { TIME_MS } from "@/lib/constants";
import type { InvoiceDto, PaymentMethodDto } from "@/lib/contract/schemas";
import { INVOICE_COPY } from "@/lib/data/billing/invoice-copy";
import { UI_LOCALE } from "@/lib/ui/constants";
import { formatMoney } from "@/lib/utils/currency";
import { fillTemplate } from "@/lib/utils/fill-template";

const dayFormat = new Intl.DateTimeFormat(UI_LOCALE, { month: "short", day: "numeric", year: "numeric" });

export const evidenceAnchor = (documentId: string) => `evidence-${documentId}`;

export const invoiceDay = (iso: string) => dayFormat.format(Date.parse(iso));

export const invoiceMoney = (cents: number, invoice: Pick<InvoiceDto, "currency">) => formatMoney(cents, invoice.currency);

export const methodName = ({ label, last4 }: Pick<PaymentMethodDto, "label" | "last4">) => `${label} ••${last4}`;

export const dueText = (invoice: InvoiceDto, now: number | null) => {
    const date = invoiceDay(invoice.dueAt);
    if (invoice.status === "paid") return fillTemplate(INVOICE_COPY.due.paid, { date });
    if (now === null) return date;
    const days = Math.ceil((Date.parse(invoice.dueAt) - now) / TIME_MS.day);
    if (days === 0) return fillTemplate(INVOICE_COPY.due.today, { date });
    return days > 0 ? fillTemplate(INVOICE_COPY.due.left, { date, days: String(days) }) : fillTemplate(INVOICE_COPY.due.overdue, { date, days: String(-days) });
};
