import clsx from "clsx";
import Panel from "@/components/ui/panel";
import type { InvoiceDto } from "@/lib/contract/schemas";
import { INVOICE_COPY } from "@/lib/data/billing/invoice-copy";
import { evidenceAnchor, invoiceMoney } from "@/lib/billing/invoice-view";
import { RECORD_LINK, TABLE_HEAD } from "@/lib/ui/constants";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    invoice: InvoiceDto;
}

const { lines: copy } = INVOICE_COPY;
const CELL = "px-3 py-2.5 align-top first:pl-4 last:pr-4";
const HEADINGS = [copy.columns.charge, copy.columns.description, copy.columns.evidence];

export default function InvoiceLines({ invoice }: Props) {
    const money = (cents: number) => invoiceMoney(cents, invoice);
    const totals = [
        { label: copy.total, value: invoice.totalCents, strong: false },
        { label: copy.paid, value: invoice.paidCents, strong: false },
        { label: copy.balance, value: invoice.balanceCents, strong: true },
    ];
    const agreed = invoice.rateConfirmationVersion === null ? copy.agreedNoVersion : copy.agreed;

    return (
        <Panel label={copy.label} flush footer={<p className="text-text-muted text-xs">{fillTemplate(agreed, { amount: money(invoice.agreedRateCents), version: String(invoice.rateConfirmationVersion ?? "") })}</p>}>
            <div className="overflow-x-auto">
                <table className="w-full min-w-[32rem] text-left text-xs">
                    <caption className="sr-only">{fillTemplate(copy.caption, { number: invoice.number })}</caption>
                    <thead>
                        <tr className="border-border border-b">
                            {HEADINGS.map((heading) => (
                                <th key={heading} scope="col" className={TABLE_HEAD}>
                                    {heading}
                                </th>
                            ))}
                            <th scope="col" className={clsx(TABLE_HEAD, "text-right")}>
                                {copy.columns.amount}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="text-text-secondary">
                        {invoice.lines.map((line) => (
                            <tr key={line.id} className="border-border-light border-b">
                                <th scope="row" className={clsx(CELL, "text-text font-normal")}>
                                    {copy.kinds[line.kind]}
                                </th>
                                <td className={CELL}>{line.description}</td>
                                <td className={CELL}>
                                    {line.evidence ? (
                                        <a href={`#${evidenceAnchor(line.evidence.documentId)}`} className={clsx(RECORD_LINK, "font-sans")}>
                                            {line.evidence.label}
                                        </a>
                                    ) : (
                                        <span className="text-text-muted">{copy.none}</span>
                                    )}
                                </td>
                                <td className={clsx(CELL, "text-text text-right font-mono tabular-nums")}>{money(line.amountCents)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        {totals.map(({ label, value, strong }) => (
                            <tr key={label}>
                                <th scope="row" colSpan={3} className={clsx(CELL, "text-right font-normal", strong ? "text-text" : "text-text-muted")}>
                                    {label}
                                </th>
                                <td className={clsx(CELL, "text-right font-mono tabular-nums", strong ? "text-text text-sm" : "text-text-secondary")}>{money(value)}</td>
                            </tr>
                        ))}
                    </tfoot>
                </table>
            </div>
        </Panel>
    );
}
