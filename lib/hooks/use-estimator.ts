import { useState, type FormEvent } from "react";
import { issuesToProblems } from "@/lib/auth/problems";
import { RATE_ESTIMATOR_ROUTE } from "@/lib/constants";
import { ESTIMATOR_COPY } from "@/lib/data/quotes/estimator";
import { useFormProblems } from "@/lib/hooks/use-form-problems";
import { useLaneTrend } from "@/lib/hooks/use-lane-trend";
import { useRateEstimate } from "@/lib/hooks/use-rate-estimate";
import { useSlow } from "@/lib/hooks/use-slow";
import { EQUIPMENT_TYPES, ESTIMATE_TIMING } from "@/lib/quotes/constants";
import { estimateFailure } from "@/lib/quotes/failure";
import type { FormProblem, LaneEntry, LaneField } from "@/lib/types";
import { todayValue } from "@/lib/utils/date-formatter";
import { queryString } from "@/lib/utils/query-string";
import { laneQuerySchema } from "@/lib/validations/lane";

const { errors } = ESTIMATOR_COPY;

const entryFrom = (params: Partial<LaneEntry>): LaneEntry => ({
    origin: params.origin ?? "",
    destination: params.destination ?? "",
    equipment: params.equipment ?? EQUIPMENT_TYPES[0],
    date: params.date ?? todayValue(),
});

const opened = (params: Partial<LaneEntry>) => {
    const parsed = laneQuerySchema.safeParse(entryFrom(params));
    return params.origin && params.destination && parsed.success ? parsed.data : null;
};

export function useEstimator(params: Partial<LaneEntry>) {
    const checks = useFormProblems<LaneField>();
    const [entry, setEntry] = useState(() => entryFrom(params));
    const [lane, setLane] = useState(() => opened(params));
    const [dismissed, setDismissed] = useState(0);
    const estimate = useRateEstimate(lane);
    const trend = useLaneTrend(lane);
    const slow = useSlow(estimate.isFetching, ESTIMATE_TIMING.slowMs);
    const failure = estimate.isError ? estimateFailure(estimate.error) : null;
    const unresolved = failure?.kind === "unresolved" && estimate.errorUpdatedAt !== dismissed ? failure.field : null;
    const problems: FormProblem<LaneField>[] = unresolved
        ? [...checks.problems, { field: unresolved, message: errors[unresolved].unresolved }]
        : checks.problems;

    const update = (field: LaneField) => (value: string) => {
        setEntry((current) => ({ ...current, [field]: value }));
        checks.clear(field);
        if (field === unresolved) setDismissed(estimate.errorUpdatedAt);
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        const parsed = laneQuerySchema.safeParse(entry);
        if (!parsed.success) return checks.fail(issuesToProblems<LaneField>(parsed.error.issues, errors));
        checks.reset();
        window.history.replaceState(null, "", `${RATE_ESTIMATOR_ROUTE}${queryString(parsed.data)}`);
        if (lane && queryString(lane) === queryString(parsed.data)) estimate.refetch();
        else setLane(parsed.data);
    };

    return {
        entry,
        lane,
        estimate,
        trend,
        failure,
        slow,
        problems,
        attempt: checks.attempt + estimate.errorUpdateCount,
        errorFor: (field: LaneField) => problems.find((problem) => problem.field === field)?.message,
        update,
        submit,
    };
}
