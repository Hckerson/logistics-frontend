import RateRange from "@/components/estimator/rate-range";
import { ESTIMATOR_COPY } from "@/lib/data/quotes/estimator";
import { count, money, perMileRate, pickupDay } from "@/lib/quotes/format";
import type { LaneQuery, RateEstimate } from "@/lib/types";

interface Props {
    lane: LaneQuery;
    estimate: RateEstimate;
}

const { result, equipment } = ESTIMATOR_COPY;

export default function EstimateFigures({ lane, estimate }: Props) {
    const kind = equipment.find((option) => option.value === lane.equipment)?.label ?? lane.equipment;
    const fill = (text: string) =>
        text
            .replace("{low}", money(estimate.low))
            .replace("{high}", money(estimate.high))
            .replace("{samples}", count(estimate.samples))
            .replace("{equipment}", kind.toLowerCase());

    return (
        <div className="flex flex-col gap-5">
            <p className="haulr-label text-text-muted flex flex-wrap gap-x-3">
                <span className="text-text">
                    {estimate.origin.code} → {estimate.destination.code}
                </span>
                <span>{kind}</span>
                <span>{pickupDay(lane.date)}</span>
            </p>
            <div className="flex items-end justify-between gap-4">
                <p className="text-text text-5xl leading-none font-light tracking-tight tabular-nums" style={{ fontStretch: "var(--haulr-wide)" }}>
                    {money(estimate.rate)}
                </p>
                <div className="flex flex-col items-end gap-1 pb-1 text-xs">
                    <span className="text-text font-mono tabular-nums">
                        {result.perMile.replace("{rate}", perMileRate(estimate.perMile))}
                    </span>
                    <span className="text-text-muted font-mono tabular-nums">{result.miles.replace("{miles}", count(estimate.miles))}</span>
                </div>
            </div>
            <RateRange estimate={estimate} />
            <p aria-live="polite" className="sr-only">
                {fill(result.announce)}
            </p>
            <p className="text-text-secondary text-sm">{fill(result.basis)}</p>
            {estimate.confidence === "low" ? <p className="text-text-muted text-xs">{result.thin}</p> : null}
            <details className="group text-sm">
                <summary className="text-text-muted hover:text-text cursor-pointer text-xs transition-colors">{result.how}</summary>
                <p className="text-text-secondary mt-2">{result.howBody}</p>
            </details>
        </div>
    );
}
