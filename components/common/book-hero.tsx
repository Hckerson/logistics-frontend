import Breadcrumbs from "@/components/common/breadcrumbs";
import LaneLine from "@/components/common/lane-line";
import StatusLabel from "@/components/ui/status-label";
import type { LoadBookingDto } from "@/lib/contract/schemas";
import { BOOKING_COPY } from "@/lib/data/load-board/booking";
import { DRIVER_COPY } from "@/lib/data/driver/copy";
import { loadStatusDisplay } from "@/lib/loads/status";
import type { Crumb } from "@/lib/types";
import { formatMoney } from "@/lib/utils/currency";
import { fillTemplate } from "@/lib/utils/fill-template";
import { grouped } from "@/lib/utils/format-number";

interface Props {
    booking: LoadBookingDto;
    trail: readonly Crumb[];
}

const { hero: copy } = BOOKING_COPY;

export default function BookHero({ booking, trail }: Props) {
    const first = booking.stops[0].facility;
    const last = booking.stops[booking.stops.length - 1].facility;
    const { currency } = booking.carrierPay;

    return (
        <header className="flex flex-col gap-4">
            <Breadcrumbs trail={trail} current={BOOKING_COPY.crumb} />
            <div className="flex items-center justify-between gap-3">
                <h1 className="text-text font-mono text-sm tracking-tight">{booking.loadId}</h1>
                <StatusLabel {...loadStatusDisplay(booking.status === "Posted" ? "Posted" : "Booked")} />
            </div>
            <LaneLine origin={first.city} destination={last.city} progress={0} label={fillTemplate(DRIVER_COPY.trip.lane, { origin: first.city, destination: last.city })} />
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
                <p className="text-text-secondary text-xs">
                    {booking.shipperName} · {booking.commodity}
                </p>
                <div className="flex flex-col items-end gap-0.5">
                    <p className="haulr-label text-text-muted">{copy.pay}</p>
                    <p className="text-text font-mono text-3xl tracking-tight tabular-nums">{formatMoney(booking.carrierPay.totalCents, currency)}</p>
                    <p className="text-accent font-mono text-xs tabular-nums">
                        {fillTemplate(copy.perMile, { rpm: formatMoney(booking.ratePerMileCents, currency), miles: grouped(booking.miles) })}
                    </p>
                </div>
            </div>
        </header>
    );
}
