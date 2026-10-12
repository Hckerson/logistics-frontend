"use client";
import { useId, type FormEvent } from "react";
import AuthSubmit from "@/components/auth/auth-submit";
import ChoiceGrid from "@/components/common/choice-grid";
import ErrorSummary from "@/components/common/error-summary";
import FieldError, { fieldErrorId } from "@/components/common/field-error";
import FieldLabel from "@/components/common/field-label";
import HudPanel from "@/components/common/hud-panel";
import LocationField from "@/components/estimator/location-field";
import { problemCount } from "@/lib/auth/problems";
import { ESTIMATOR_COPY } from "@/lib/data/quotes/estimator";
import { EQUIPMENT_TYPES } from "@/lib/quotes/constants";
import type { FormProblem, LaneEntry, LaneField } from "@/lib/types";
import { todayValue } from "@/lib/utils/date-formatter";

interface Props {
    entry: LaneEntry;
    problems: readonly FormProblem<LaneField>[];
    attempt: number;
    pending: boolean;
    errorFor: (field: LaneField) => string | undefined;
    onChange: (field: LaneField) => (value: string) => void;
    onSubmit: (event: FormEvent) => void;
}

const { query, fields, summary } = ESTIMATOR_COPY;

export default function LaneQueryForm({ entry, problems, attempt, pending, errorFor, onChange, onSubmit }: Props) {
    const baseId = useId();
    const idOf = (field: LaneField) => `${baseId}-${field}`;
    const equipment = EQUIPMENT_TYPES.find((type) => type === entry.equipment) ?? null;
    const dateError = errorFor("date");

    return (
        <HudPanel
            label={query.label}
            status={pending ? query.pending : problems.length ? query.held : query.ready}
            alert={problems.length > 0}
            note={ESTIMATOR_COPY.note}
        >
            <form onSubmit={onSubmit} noValidate aria-busy={pending} className="flex flex-col gap-5">
                <ErrorSummary<LaneField>
                    problems={problems}
                    attempt={attempt}
                    heading={summary.heading}
                    count={problemCount(problems.length)}
                    fieldId={idOf}
                />
                <LocationField id={idOf("origin")} {...fields.origin} value={entry.origin} error={errorFor("origin")} onChange={onChange("origin")} />
                <LocationField
                    id={idOf("destination")}
                    {...fields.destination}
                    value={entry.destination}
                    error={errorFor("destination")}
                    onChange={onChange("destination")}
                />
                <ChoiceGrid
                    id={idOf("equipment")}
                    name="equipment"
                    legend={fields.equipment.legend}
                    index={fields.equipment.index}
                    options={ESTIMATOR_COPY.equipment}
                    value={equipment}
                    columns={3}
                    error={errorFor("equipment")}
                    onChange={onChange("equipment")}
                />
                <div className="group/field flex flex-col">
                    <FieldLabel
                        htmlFor={idOf("date")}
                        label={fields.date.label}
                        index={fields.date.index}
                        error={Boolean(dateError)}
                        aside={<span className="haulr-label text-text-muted">{fields.date.hint}</span>}
                    />
                    <input
                        id={idOf("date")}
                        type="date"
                        min={todayValue()}
                        value={entry.date}
                        onChange={(event) => onChange("date")(event.target.value)}
                        aria-invalid={dateError ? true : undefined}
                        aria-describedby={dateError ? fieldErrorId(idOf("date")) : undefined}
                        className="bg-background-muted text-text focus-visible:outline-accent h-10 w-full px-3 font-mono text-sm [color-scheme:dark] focus-visible:outline-1"
                    />
                    {dateError ? (
                        <div className="mt-2">
                            <FieldError id={idOf("date")} message={dateError} />
                        </div>
                    ) : null}
                </div>
                <AuthSubmit label={ESTIMATOR_COPY.submit} pendingLabel={ESTIMATOR_COPY.pending} pending={pending} />
            </form>
        </HudPanel>
    );
}
