"use client";
import Link from "next/link";
import ConsoleLink from "@/components/auth/console-link";
import { QUIET_LINK } from "@/lib/auth/constants";
import { loginRoute, postLoadRoute } from "@/lib/constants";
import { ESTIMATOR_COPY } from "@/lib/data/quotes/estimator";
import { useSaveEstimate } from "@/lib/hooks/use-save-estimate";
import type { LaneQuery, RateEstimate } from "@/lib/types";
import { queryString } from "@/lib/utils/query-string";

interface Props {
    lane: LaneQuery;
    estimate: RateEstimate;
    signedIn: boolean;
}

const { actions, result } = ESTIMATOR_COPY;

export default function EstimateActions({ lane, estimate, signedIn }: Props) {
    const save = useSaveEstimate();
    const carried = queryString(lane).slice(1);
    const through = (href: string) => (signedIn ? href : loginRoute(href));
    const saved = save.data?.ok === true;
    const failed = save.isError || save.data?.ok === false;

    return (
        <div className="flex flex-col gap-4">
            <ConsoleLink href={through(postLoadRoute(carried))} label={actions.post} />
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
                {estimate.confidence === "low" ? (
                    <Link href={through(postLoadRoute(carried, "custom"))} className={QUIET_LINK}>
                        {actions.custom}
                    </Link>
                ) : null}
                {signedIn ? (
                    <button
                        type="button"
                        disabled={save.isPending || saved}
                        onClick={() => save.mutate({ lane, rate: estimate.rate })}
                        className={`${QUIET_LINK} cursor-pointer disabled:cursor-default`}
                    >
                        {save.isPending ? actions.saving : saved ? actions.saved : actions.save}
                    </button>
                ) : null}
                <span aria-live="polite" className="text-error text-xs empty:hidden">
                    {failed ? actions.saveFailed : ""}
                </span>
            </div>
            <p className="text-text-muted text-xs">{result.notQuote}</p>
        </div>
    );
}
