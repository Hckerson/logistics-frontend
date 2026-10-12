"use client";
import clsx from "clsx";
import ProgressLine from "@/components/auth/progress-line";
import HudPanel from "@/components/common/hud-panel";
import TrendChart from "@/components/estimator/trend-chart";
import TrendTable from "@/components/estimator/trend-table";
import { ESTIMATOR_COPY } from "@/lib/data/quotes/estimator";
import type { useLaneTrend } from "@/lib/hooks/use-lane-trend";
import { TREND } from "@/lib/quotes/constants";
import { percent } from "@/lib/quotes/format";
import { trendDirection } from "@/lib/quotes/trend";

interface Props {
    query: ReturnType<typeof useLaneTrend>;
}

const { trend, query: steps } = ESTIMATOR_COPY;

export default function TrendPanel({ query }: Props) {
    const points = query.data ?? [];
    const enough = points.length >= TREND.minimumDays;
    const { direction, change } = trendDirection(points);
    const words = trend[direction].replace("{change}", percent(change)).replace("{days}", String(points.length));

    return (
        <HudPanel
            label={trend.label}
            status={query.isFetching ? steps.pending : enough ? trend.status[direction] : steps.held}
            alert={query.isError}
            note={ESTIMATOR_COPY.note}
        >
            {query.isError ? (
                <p className="text-text-secondary text-sm">{trend.failed}</p>
            ) : !query.data ? (
                <ProgressLine className="bg-border" />
            ) : enough ? (
                <div className={clsx("flex flex-col gap-4 transition-opacity", query.isPlaceholderData && "opacity-50")}>
                    <p className="text-text text-sm">{words}</p>
                    <div className="hidden sm:block">
                        <TrendChart points={points} summary={trend.chart.replace("{days}", String(points.length)).replace("{direction}", words)} />
                    </div>
                    <TrendTable points={points} />
                </div>
            ) : (
                <p className="text-text-secondary text-sm">{trend.thin.replace("{days}", String(points.length))}</p>
            )}
        </HudPanel>
    );
}
