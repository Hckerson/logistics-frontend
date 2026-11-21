"use client";
import clsx from "clsx";
import { nanoid } from "nanoid";
import { useRef, useState } from "react";
import InvoicePayments from "@/components/common/invoice-payments";
import Button from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import Panel from "@/components/ui/panel";
import RadioGroup from "@/components/ui/radio-group";
import Skeleton from "@/components/ui/skeleton";
import { useAnnounce } from "@/components/providers/announcer-provider";
import { PAYMENT_LIMITS } from "@/lib/billing/constants";
import { invoiceDay, invoiceMoney, methodName } from "@/lib/billing/invoice-view";
import type { InvoiceDto } from "@/lib/contract/schemas";
import { INVOICE_COPY } from "@/lib/data/billing/invoice-copy";
import { usePayInvoices, usePaymentMethods } from "@/lib/hooks/use-invoice";
import { useNow } from "@/lib/hooks/use-now";
import { useSlow } from "@/lib/hooks/use-slow";
import { LABEL_TEXT } from "@/lib/ui/constants";
import { errorMessage, failureFrom } from "@/lib/utils/action-result";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    invoice: InvoiceDto;
}

interface Outcome {
    tone: "success" | "error";
    text: string;
}

const copy = INVOICE_COPY.payment;
const REFRESHED = ["conflict", "precondition"];

export default function InvoicePayment({ invoice }: Props) {
    const methods = usePaymentMethods();
    const pay = usePayInvoices(invoice.id);
    const announce = useAnnounce();
    const now = useNow();
    const slow = useSlow(pay.isPending, PAYMENT_LIMITS.slowMs);
    const key = useRef("");
    const [chosen, setChosen] = useState<string | null>(null);
    const [asking, setAsking] = useState(false);
    const [outcome, setOutcome] = useState<Outcome | null>(null);
    const list = methods.data ?? [];
    const fallback = list.find((method) => method.isDefault && method.status !== "pendingVerification") ?? list.find((method) => method.status === "verified");
    const method = list.find((candidate) => candidate.id === (chosen ?? fallback?.id)) ?? null;
    const amount = invoiceMoney(invoice.balanceCents, invoice);
    const failure = pay.isError ? failureFrom(pay.error) : null;
    const refreshed = failure !== null && REFRESHED.includes(failure.errorClass);
    const latest = invoice.payments.at(-1);

    const options = list.map((option) => ({
        value: option.id,
        label: methodName(option),
        detail: [copy.types[option.type], option.isDefault ? copy.default : null, option.status === "failed" ? copy.failed : null, option.status === "pendingVerification" ? copy.pending : null]
            .filter(Boolean)
            .join(" · "),
        disabledReason: option.status === "pendingVerification" ? copy.verifyFirst : undefined,
    }));

    const tell = (next: Outcome) => {
        setOutcome(next);
        announce({ message: next.text });
    };

    const open = () => {
        key.current = nanoid();
        pay.reset();
        setOutcome(null);
        setAsking(true);
    };

    const confirm = () => {
        if (!method) return;
        const item = { invoiceId: invoice.id, version: invoice.version, amountCents: invoice.balanceCents };
        pay.mutate(
            { items: [item], methodId: method.id, idempotencyKey: key.current },
            {
                onSuccess: (result) => {
                    setAsking(false);
                    if (result.status === "succeeded" && result.payment) return tell({ tone: "success", text: fillTemplate(copy.paidNow, { amount, reference: result.payment.reference }) });
                    tell({ tone: "error", text: fillTemplate(result.status === "declined" ? copy.declined : copy.verification, { reason: result.reason ?? "" }) });
                },
                onError: (error) => {
                    if (REFRESHED.includes(failureFrom(error)?.errorClass ?? "")) setAsking(false);
                },
            },
        );
    };

    const dialogError = failure && !refreshed ? (failure.errorClass === "unavailable" ? copy.outage : errorMessage(failure)) : undefined;
    const inline =
        failure?.errorClass === "conflict" && latest
            ? fillTemplate(copy.conflict, { name: latest.paidByName, date: invoiceDay(latest.paidAt), reference: latest.reference })
            : failure?.errorClass === "precondition"
              ? copy.stale
              : null;

    return (
        <Panel label={copy.label}>
            <div className="flex flex-col gap-4">
                {invoice.status === "open" ? (
                    <>
                        <div className="flex items-baseline justify-between gap-3">
                            <span className={LABEL_TEXT}>{copy.amount}</span>
                            <span className="text-text font-mono text-sm tabular-nums">{amount}</span>
                        </div>
                        {methods.isPending ? <Skeleton lines={3} /> : null}
                        {!methods.isPending && list.length === 0 ? <p className="text-text-secondary text-xs">{copy.noMethods}</p> : null}
                        {list.length > 0 ? <RadioGroup legend={copy.method} options={options} value={method?.id ?? null} onChange={setChosen} /> : null}
                        <Button tone="ink" disabledReason={method ? undefined : copy.noMethods} onPress={open}>
                            {fillTemplate(copy.pay, { amount })}
                        </Button>
                    </>
                ) : (
                    <p className="text-text-secondary text-xs">{copy.closed}</p>
                )}
                {outcome ? (
                    <p role={outcome.tone === "error" ? "alert" : "status"} className={clsx("text-xs", outcome.tone === "error" ? "text-error" : "text-signal-success")}>
                        {outcome.text}
                    </p>
                ) : null}
                {inline ? (
                    <p role="alert" className="text-signal-warning text-xs">
                        {inline}
                    </p>
                ) : null}
                <InvoicePayments invoice={invoice} />
            </div>
            <ConfirmDialog
                isOpen={asking}
                onOpenChange={setAsking}
                title={fillTemplate(copy.confirmTitle, { number: invoice.number })}
                consequence={fillTemplate(copy.consequence, { amount, method: method ? methodName(method) : "", date: now === null ? "" : invoiceDay(new Date(now).toISOString()) })}
                confirmLabel={fillTemplate(copy.pay, { amount })}
                cancelLabel={copy.cancel}
                onConfirm={confirm}
                pending={pay.isPending}
                error={dialogError}
            >
                {pay.isPending ? (
                    <p role="status" className="text-text-secondary text-xs">
                        {slow ? copy.slow : copy.processing}
                    </p>
                ) : null}
            </ConfirmDialog>
        </Panel>
    );
}
