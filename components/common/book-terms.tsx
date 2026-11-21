import clsx from "clsx";
import Disclosure from "@/components/ui/disclosure";
import Panel from "@/components/ui/panel";
import type { LoadBookingDto } from "@/lib/contract/schemas";
import { BOOKING_COPY } from "@/lib/data/load-board/booking";
import { DRIVER_COPY } from "@/lib/data/driver/copy";
import { LOAD_COPY } from "@/lib/data/loads/copy";
import { stopWindow } from "@/lib/loads/view";
import { formatMoney } from "@/lib/utils/currency";
import { fillTemplate } from "@/lib/utils/fill-template";
import { grouped } from "@/lib/utils/format-number";

interface Props {
    booking: LoadBookingDto;
}

const { terms: copy } = BOOKING_COPY;
const HEADING = "haulr-label text-text-muted";

export default function BookTerms({ booking }: Props) {
    const money = (cents: number) => formatMoney(cents, booking.carrierPay.currency);
    const { terms } = booking;
    const freight = [fillTemplate(copy.weight, { weight: grouped(booking.weightLb) }), booking.pallets ? fillTemplate(copy.pallets, { count: String(booking.pallets) }) : ""].filter(Boolean).join(" · ");
    const requirements: [string, string][] = [
        [copy.equipment, LOAD_COPY.equipment[booking.equipment]],
        [copy.freight, freight],
        [copy.insurance, fillTemplate(copy.insuranceValue, { amount: money(booking.insuranceMinCents) })],
    ];
    if (booking.tempMinF !== null && booking.tempMaxF !== null) {
        requirements.push([copy.temperatureLabel, fillTemplate(copy.temperature, { min: String(booking.tempMinF), max: String(booking.tempMaxF) })]);
    }
    if (booking.hazmat) requirements.push([copy.hazmat, copy.hazmatValue]);
    const accessorials = [
        { term: copy.detention, value: fillTemplate(copy.detentionValue, { rate: money(terms.detentionCentsPerHour), hours: String(terms.detentionFreeHours) }), why: copy.detentionWhy },
        { term: copy.layover, value: fillTemplate(copy.layoverValue, { rate: money(terms.layoverCentsPerDay) }), why: copy.layoverWhy },
        { term: copy.tonu, value: fillTemplate(copy.tonuValue, { rate: money(terms.tonuCents), hours: String(terms.cancellationNoticeHours) }), why: copy.tonuWhy },
    ];

    return (
        <Panel label={copy.label}>
            <section className="flex flex-col gap-2">
                <h3 className={HEADING}>{copy.stops}</h3>
                <ol className="relative flex flex-col pl-6">
                    <span aria-hidden className="bg-border-dark absolute top-3 bottom-3 left-[5px] w-px" />
                    {booking.stops.map((stop, index) => (
                        <li key={stop.id} className="relative flex flex-col gap-0.5 py-2">
                            <span aria-hidden className={clsx("absolute top-3.5 -left-6 block size-[11px] rounded-full border", index === 0 ? "border-accent bg-accent" : "border-border-dark bg-background")} />
                            <span className="haulr-label text-text">
                                {DRIVER_COPY.stopTypes[stop.type]} · {stop.sequence}
                            </span>
                            <span className="text-text text-sm">{stop.facility.name}</span>
                            <span className="text-text-muted text-xs">
                                {stop.facility.line1}, {stop.facility.city}, {stop.facility.region} · {stopWindow(stop)}
                            </span>
                        </li>
                    ))}
                </ol>
            </section>
            <section className="border-border flex flex-col gap-2 border-t pt-4">
                <h3 className={HEADING}>{copy.requirements}</h3>
                <dl className="flex flex-col gap-1.5 text-xs">
                    {requirements.map(([term, value]) => (
                        <div key={`${term}${value}`} className="flex flex-wrap justify-between gap-x-4">
                            <dt className="text-text-muted">{term}</dt>
                            <dd className="text-text">{value}</dd>
                        </div>
                    ))}
                </dl>
            </section>
            <section className="border-border flex flex-col border-t pt-4">
                <h3 className={HEADING}>{copy.accessorials}</h3>
                {accessorials.map(({ term, value, why }) => (
                    <Disclosure key={term} title={`${term}: ${value}`} level={4}>
                        <p className="text-text-secondary pb-3 text-xs">{why}</p>
                    </Disclosure>
                ))}
            </section>
            <section className="flex flex-col gap-1">
                <h3 className={HEADING}>{copy.releaseLabel}</h3>
                <p className="text-text-secondary text-xs">{copy.release}</p>
            </section>
        </Panel>
    );
}
