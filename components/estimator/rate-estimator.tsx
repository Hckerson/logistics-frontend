"use client";
import EstimatePanel from "@/components/estimator/estimate-panel";
import LaneQueryForm from "@/components/estimator/lane-query-form";
import TrendPanel from "@/components/estimator/trend-panel";
import { useEstimator } from "@/lib/hooks/use-estimator";
import type { LaneEntry } from "@/lib/types";

interface Props {
    params: Partial<LaneEntry>;
    signedIn: boolean;
}

export default function RateEstimator({ params, signedIn }: Props) {
    const flow = useEstimator(params);

    return (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] lg:items-start lg:gap-12 xl:gap-16">
            <LaneQueryForm
                entry={flow.entry}
                problems={flow.problems}
                attempt={flow.attempt}
                pending={flow.estimate.isFetching}
                errorFor={flow.errorFor}
                onChange={flow.update}
                onSubmit={flow.submit}
            />
            <div className="flex min-w-0 flex-col gap-8">
                <EstimatePanel query={flow.estimate} failure={flow.failure} slow={flow.slow} signedIn={signedIn} />
                {flow.lane ? <TrendPanel query={flow.trend} /> : null}
            </div>
        </div>
    );
}
