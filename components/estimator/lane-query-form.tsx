"use client";
import { useId, type FormEvent } from "react";
import AuthSubmit from "@/components/auth/auth-submit";
import ErrorSummary from "@/components/common/error-summary";
import HudPanel from "@/components/common/hud-panel";
import LocationField from "@/components/estimator/location-field";
import DateField from "@/components/ui/date-field";
import Field from "@/components/ui/field";
import RadioGroup from "@/components/ui/radio-group";
import { problemCount } from "@/lib/auth/problems";
import { ESTIMATOR_COPY } from "@/lib/data/quotes/estimator";
import { EQUIPMENT_TYPES } from "@/lib/enums/equipment-type";
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
                <RadioGroup
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
                <Field
                    id={idOf("date")}
                    label={fields.date.label}
                    index={fields.date.index}
                    error={errorFor("date")}
                    aside={<span className="haulr-label text-text-muted">{fields.date.hint}</span>}
                >
                    {(control) => (
                        <DateField {...control} min={todayValue()} value={entry.date || null} onChange={(date) => onChange("date")(date ?? "")} />
                    )}
                </Field>
                <AuthSubmit label={ESTIMATOR_COPY.submit} pendingLabel={ESTIMATOR_COPY.pending} pending={pending} />
            </form>
        </HudPanel>
    );
}
