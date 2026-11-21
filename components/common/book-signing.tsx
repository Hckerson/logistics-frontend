"use client";
import { useId, useState } from "react";
import { ArrowRight } from "@carbon/icons-react";
import Button from "@/components/ui/button";
import Checkbox from "@/components/ui/checkbox";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import Field from "@/components/ui/field";
import Input from "@/components/ui/input";
import Panel from "@/components/ui/panel";
import type { LoadBookingDto } from "@/lib/contract/schemas";
import { BOOKING_COPY } from "@/lib/data/load-board/booking";
import { LOAD_BOARD } from "@/lib/load-board/constants";
import { stopWindow } from "@/lib/loads/view";
import { longDate } from "@/lib/tracking/view";
import { formatMoney } from "@/lib/utils/currency";
import { fillTemplate } from "@/lib/utils/fill-template";

interface Props {
    booking: LoadBookingDto;
    pending: boolean;
    problem: string | null;
    nameRejected: boolean;
    onBook: (signerName: string) => void;
}

const { confirmation: copy } = BOOKING_COPY;

export default function BookSigning({ booking, pending, problem, nameRejected, onBook }: Props) {
    const docId = useId();
    const nameId = useId();
    const [attested, setAttested] = useState(false);
    const [name, setName] = useState("");
    const [checked, setChecked] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const document = booking.rateConfirmation;
    const pay = formatMoney(booking.carrierPay.totalCents, booking.carrierPay.currency);
    const zone = booking.stops[0].facility.timeZone;
    const label = fillTemplate(copy.book, { pay });

    const start = () => {
        setChecked(true);
        if (attested && name.trim()) setConfirming(true);
    };

    return (
        <Panel label={copy.label} aside={<span className="haulr-label text-text-muted">{fillTemplate(copy.version, { version: String(document.version), date: longDate(document.issuedAt, zone) })}</span>}>
            <article id={docId} aria-label={copy.label} tabIndex={0} className="border-border bg-background-muted/40 focus-visible:outline-text flex max-h-72 flex-col gap-3 overflow-y-auto border p-3 text-xs outline-none focus-visible:outline-2">
                {document.sections.map(({ heading, body }) => (
                    <section key={heading} className="flex flex-col gap-1">
                        <h3 className="haulr-label text-text">{heading}</h3>
                        <p className="text-text-secondary leading-relaxed">{body}</p>
                    </section>
                ))}
            </article>
            <Checkbox isSelected={attested} onChange={setAttested} invalid={checked && !attested} aria-describedby={docId} isDisabled={pending}>
                {fillTemplate(copy.attest, { version: String(document.version) })}
            </Checkbox>
            {checked && !attested ? <p className="text-error text-xs">{copy.attestMissing}</p> : null}
            <Field id={nameId} label={copy.name} hint={copy.nameHint} error={nameRejected ? copy.nameMismatch : checked && !name.trim() ? copy.nameMissing : undefined}>
                {(control) => <Input {...control} value={name} maxLength={LOAD_BOARD.signerMax} autoComplete="name" disabled={pending} onChange={(event) => setName(event.target.value)} />}
            </Field>
            {problem ? (
                <p role="alert" className="text-error text-xs">
                    {problem}
                </p>
            ) : null}
            <Button size="wide" trailing={ArrowRight} pending={pending} pendingLabel={copy.booking} disabledReason={booking.bookable ? undefined : copy.blocked} onPress={start} className="min-h-14 text-base">
                {label}
            </Button>
            <ConfirmDialog
                isOpen={confirming}
                onOpenChange={setConfirming}
                kicker={booking.loadId}
                title={fillTemplate(copy.confirmTitle, { reference: booking.loadId })}
                consequence={fillTemplate(copy.confirmBody, { pay, pickup: stopWindow(booking.stops[0]) })}
                confirmLabel={copy.confirm}
                cancelLabel={copy.keep}
                pending={pending}
                onConfirm={() => {
                    setConfirming(false);
                    onBook(name);
                }}
            />
        </Panel>
    );
}
