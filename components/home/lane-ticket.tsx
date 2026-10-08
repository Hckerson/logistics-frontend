"use client";
import TicketEnd from "@/components/home/ticket-end";
import TicketRule from "@/components/home/ticket-rule";
import { CLOSE_COPY } from "@/lib/data/home/close";
import { laneBetween, milesBetween } from "@/lib/home/quote-map";
import { useReduced } from "@/lib/hooks/use-reduced";
import type { NetworkHub, QuoteLane } from "@/lib/types";

interface Props {
    from: NetworkHub | undefined;
    to: NetworkHub | undefined;
    lane: QuoteLane | null;
}

const { fields, ticket } = CLOSE_COPY;
const GHOST = laneBetween(fields.origin.placeholder, fields.destination.placeholder);

export default function LaneTicket({ from, to, lane }: Props) {
    const reduced = useReduced();

    return (
        <div className="border-border flex flex-col gap-10 border-y py-10 sm:py-14">
            <div className="flex items-baseline justify-between gap-4">
                <p className="haulr-label text-accent">{ticket.label}</p>
                <p className="haulr-label text-text-muted">{ticket.note}</p>
            </div>
            <div className="flex items-center gap-4 sm:gap-8">
                <TicketEnd label={fields.origin.label} hub={from} ghost={GHOST?.from} align="start" />
                <TicketRule
                    from={Boolean(from)}
                    to={Boolean(to)}
                    sweep={lane ? `${lane.from.code}-${lane.to.code}` : null}
                    reduced={reduced}
                />
                <TicketEnd label={fields.destination.label} hub={to} ghost={GHOST?.to} align="end" />
            </div>
            <p aria-live="polite" className="text-text-secondary text-(length:--haulr-lead)">
                {lane ? `${milesBetween(lane).toLocaleString("en-US")} ${ticket.unit}` : ticket.idle}
            </p>
        </div>
    );
}
