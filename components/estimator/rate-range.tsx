import { ESTIMATOR_COPY } from "@/lib/data/quotes/estimator";
import { money } from "@/lib/quotes/format";
import type { RateEstimate } from "@/lib/types";

interface Props {
    estimate: RateEstimate;
}

export default function RateRange({ estimate }: Props) {
    const { low, high, rate } = estimate;
    const at = high > low ? ((rate - low) / (high - low)) * 100 : 50;

    return (
        <div aria-hidden className="flex flex-col gap-2">
            <p className="haulr-label text-text-muted">{ESTIMATOR_COPY.result.range}</p>
            <div className="relative h-3">
                <span className="bg-text-secondary/25 absolute inset-x-0 top-1/2 h-1 -translate-y-1/2" />
                <span className="bg-text-muted absolute top-0 left-0 h-full w-px" />
                <span className="bg-text-muted absolute top-0 right-0 h-full w-px" />
                <span
                    className="absolute top-1/2 size-3 -translate-1/2 rounded-full bg-(--haulr-hot) shadow-[0_0_12px_2px_var(--colors-accent)]"
                    style={{ left: `${at}%` }}
                />
            </div>
            <div className="text-text-secondary flex justify-between font-mono text-xs tabular-nums">
                <span>{money(low)}</span>
                <span>{money(high)}</span>
            </div>
        </div>
    );
}
