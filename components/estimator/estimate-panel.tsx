"use client";
import clsx from "clsx";
import ProgressLine from "@/components/auth/progress-line";
import HudPanel from "@/components/common/hud-panel";
import EstimateActions from "@/components/estimator/estimate-actions";
import EstimateFigures from "@/components/estimator/estimate-figures";
import EstimateNotice from "@/components/estimator/estimate-notice";
import { ESTIMATOR_COPY } from "@/lib/data/quotes/estimator";
import type { useRateEstimate } from "@/lib/hooks/use-rate-estimate";
import type { EstimateFailure } from "@/lib/types";
import { queryString } from "@/lib/utils/query-string";

interface Props {
    query: ReturnType<typeof useRateEstimate>;
    failure: EstimateFailure | null;
    slow: boolean;
    signedIn: boolean;
}

const { result, query: steps } = ESTIMATOR_COPY;

export default function EstimatePanel({ query, failure, slow, signedIn }: Props) {
    const shown = query.data;
    const notice = failure && failure.kind !== "unresolved" ? failure : null;
    const status = query.isFetching
        ? steps.pending
        : notice
          ? steps.held
          : shown
            ? result.confidence[shown.estimate.confidence]
            : result.idle;

    return (
        <HudPanel label={result.label} status={status} alert={Boolean(notice)} note={ESTIMATOR_COPY.note}>
            {notice ? (
                <EstimateNotice key={query.errorUpdatedAt} failure={notice} onRetry={() => query.refetch()} />
            ) : shown ? (
                <div className={clsx("flex flex-col gap-6 transition-opacity duration-300", query.isPlaceholderData && "opacity-50")}>
                    <EstimateFigures lane={shown.lane} estimate={shown.estimate} />
                    <EstimateActions key={queryString(shown.lane)} lane={shown.lane} estimate={shown.estimate} signedIn={signedIn} />
                </div>
            ) : query.isFetching ? (
                <div className="flex flex-col gap-3">
                    <p role="status" className="text-text-secondary text-sm">
                        {slow ? result.slow : ESTIMATOR_COPY.pending}
                    </p>
                    <ProgressLine className="bg-border" />
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    <p className="text-text text-sm">{result.emptyTitle}</p>
                    <p className="text-text-secondary text-sm">{result.emptyBody}</p>
                </div>
            )}
            {shown && query.isFetching && slow ? (
                <p role="status" className="text-text-muted text-xs">
                    {result.slow}
                </p>
            ) : null}
        </HudPanel>
    );
}
