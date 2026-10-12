import BoardReadout from "@/components/common/board-readout";
import EstimateLane from "@/components/estimator/estimate-lane";
import RateRange from "@/components/estimator/rate-range";
import { ESTIMATOR_COPY } from "@/lib/data/quotes/estimator";
import { count, money, perMileRate, pickupDay } from "@/lib/quotes/format";
import type { LaneQuery, RateEstimate } from "@/lib/types";
import { queryString } from "@/lib/utils/query-string";

interface Props {
    lane: LaneQuery;
    estimate: RateEstimate;
}

const { result, equipment } = ESTIMATOR_COPY;

export default function EstimateFigures({ lane, estimate }: Props) {
    const kind = equipment.find((option) => option.value === lane.equipment)?.label ?? lane.equipment;
    const rate = money(estimate.rate);
    const fill = (text: string) =>
        text
            .replace("{origin}", estimate.origin.name)
            .replace("{destination}", estimate.destination.name)
            .replace("{low}", money(estimate.low))
            .replace("{high}", money(estimate.high))
            .replace("{samples}", count(estimate.samples))
            .replace("{equipment}", kind.toLowerCase());

    return (
        <div className="flex flex-col gap-6">
            <EstimateLane estimate={estimate} sweep={queryString(lane)} />
            <div className="flex flex-col gap-3">
                <p className="sr-only">{fill(result.lane)}</p>
                <BoardReadout key={rate} value={rate} />
                <p className="haulr-label text-text-muted flex flex-wrap gap-x-3 gap-y-1">
                    <span className="text-text font-mono">{result.perMile.replace("{rate}", perMileRate(estimate.perMile))}</span>
                    <span>{kind}</span>
                    <span>{pickupDay(lane.date)}</span>
                </p>
            </div>
            <RateRange estimate={estimate} />
            <p aria-live="polite" className="sr-only">
                {fill(result.announce)}
            </p>
            <div className="flex flex-col gap-2">
                <p className="text-text-secondary text-sm">{fill(result.basis)}</p>
                {estimate.confidence === "low" ? <p className="text-text-muted text-xs">{result.thin}</p> : null}
                <details className="text-sm">
                    <summary className="text-text-muted hover:text-text cursor-pointer text-xs transition-colors">{result.how}</summary>
                    <p className="text-text-secondary mt-2">{result.howBody}</p>
                </details>
            </div>
        </div>
    );
}
