"use client";
import clsx from "clsx";
import TicketRule from "@/components/home/ticket-rule";
import { ESTIMATOR_COPY } from "@/lib/data/quotes/estimator";
import { laneBetween } from "@/lib/home/quote-map";
import { useReduced } from "@/lib/hooks/use-reduced";
import { count } from "@/lib/quotes/format";
import type { RateEstimate } from "@/lib/types";

interface Props {
    estimate: RateEstimate | null;
    sweep: string | null;
}

const { fields, result } = ESTIMATOR_COPY;
const GHOST = laneBetween(fields.origin.placeholder, fields.destination.placeholder);
const CODE = "text-3xl leading-none font-light tracking-tight transition-colors duration-500 sm:text-4xl";
const STRETCH = { fontStretch: "var(--haulr-wide)" };

export default function EstimateLane({ estimate, sweep }: Props) {
    const reduced = useReduced();
    const from = estimate?.origin ?? GHOST?.from;
    const to = estimate?.destination ?? GHOST?.to;
    const tone = estimate ? "text-text" : "text-border-dark";

    return (
        <div aria-hidden className="flex flex-col gap-2.5">
            <div className="flex items-center gap-4">
                <span className={clsx(CODE, tone)} style={STRETCH}>
                    {from?.code}
                </span>
                <TicketRule from={Boolean(estimate)} to={Boolean(estimate)} sweep={sweep} reduced={reduced} />
                <span className={clsx(CODE, tone)} style={STRETCH}>
                    {to?.code}
                </span>
            </div>
            <div className="haulr-label text-text-muted flex items-baseline justify-between gap-4">
                <span className="truncate">{from?.name}</span>
                {estimate ? <span className="text-text-secondary shrink-0 font-mono">{result.miles.replace("{miles}", count(estimate.miles))}</span> : null}
                <span className="truncate text-right">{to?.name}</span>
            </div>
        </div>
    );
}
